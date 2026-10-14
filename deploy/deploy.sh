#!/usr/bin/env bash
# =============================================================================
# LumiSchool — Blue/Green Zero-Downtime Deploy Script
#
# Usage:
#   bash deploy/deploy.sh              # deploy both backend + frontend
#   bash deploy/deploy.sh backend      # deploy backend only
#   bash deploy/deploy.sh frontend     # deploy frontend only
#   bash deploy/deploy.sh rollback     # revert to previously-running stack
# =============================================================================
set -euo pipefail

# ─── Config ──────────────────────────────────────────────────────────────────
PROJECT_DIR="/opt/lumischool"
DEPLOY_DIR="$PROJECT_DIR/deploy"

BACKEND_STATE="$PROJECT_DIR/.active_backend_color"
FRONTEND_STATE="$PROJECT_DIR/.active_frontend_color"

NGINX_UPSTREAM="/etc/nginx/conf.d/lumischool-upstream.conf"

BACKEND_BLUE_PORT=9001
BACKEND_GREEN_PORT=9002
FRONTEND_BLUE_PORT=9021
FRONTEND_GREEN_PORT=9022

HEALTH_RETRIES=30
HEALTH_INTERVAL=5

TARGET="${1:-both}"

# ─── Helpers ─────────────────────────────────────────────────────────────────
log()  { echo "[$(date '+%H:%M:%S')] $*"; }
err()  { echo "[$(date '+%H:%M:%S')] ERROR: $*" >&2; }
die()  { err "$*"; exit 1; }

active_backend()  { [ -f "$BACKEND_STATE"  ] && cat "$BACKEND_STATE"  || echo "green"; }
active_frontend() { [ -f "$FRONTEND_STATE" ] && cat "$FRONTEND_STATE" || echo "green"; }

flip_color() { [ "$1" = "blue" ] && echo "green" || echo "blue"; }

backend_port()  { [ "$1" = "blue" ] && echo "$BACKEND_BLUE_PORT"  || echo "$BACKEND_GREEN_PORT";  }
frontend_port() { [ "$1" = "blue" ] && echo "$FRONTEND_BLUE_PORT" || echo "$FRONTEND_GREEN_PORT"; }

compose_file() { echo "$DEPLOY_DIR/docker-compose.${1}.yml"; }

# ─── Health check ────────────────────────────────────────────────────────────
wait_healthy() {
    local url="$1"
    local label="$2"
    log "Waiting for $label to become healthy at $url ..."
    for i in $(seq 1 "$HEALTH_RETRIES"); do
        local code
        code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$url" 2>/dev/null || echo "000")
        if [ "$code" != "000" ]; then
            log "$label is healthy (HTTP $code) after $i attempt(s)."
            return 0
        fi
        log "  [$i/$HEALTH_RETRIES] not ready — retrying in ${HEALTH_INTERVAL}s..."
        sleep "$HEALTH_INTERVAL"
    done
    err "$label did not become healthy after $((HEALTH_RETRIES * HEALTH_INTERVAL))s."
    return 1
}

# ─── Nginx upstream switch ───────────────────────────────────────────────────
write_upstream() {
    local b_port="$1"
    local f_port="$2"
    log "Switching nginx upstream → backend:$b_port  frontend:$f_port"
    cat > "$NGINX_UPSTREAM" <<EOF
# Auto-managed by deploy.sh — do NOT edit manually.
upstream lumischool_backend {
    server 127.0.0.1:${b_port};
}
upstream lumischool_frontend {
    server 127.0.0.1:${f_port};
}
EOF
    nginx -t 2>/dev/null || die "nginx config test failed — upstream NOT switched."
    nginx -s reload
    log "nginx reloaded."
}

# ─── Rollback ────────────────────────────────────────────────────────────────
do_rollback() {
    log "═══ ROLLBACK ═══"

    local cur_b cur_f prev_b prev_f
    cur_b=$(active_backend)
    cur_f=$(active_frontend)
    prev_b=$(flip_color "$cur_b")
    prev_f=$(flip_color "$cur_f")

    log "backend:  $cur_b → $prev_b"
    log "frontend: $cur_f → $prev_f"

    # Start old containers (they must already exist — rollback requires previous images)
    docker compose -f "$(compose_file "$prev_b")" up -d --no-build "backend-$prev_b"  || die "Cannot start backend-$prev_b (no image?). Rollback failed."
    docker compose -f "$(compose_file "$prev_f")" up -d --no-build "frontend-$prev_f" || die "Cannot start frontend-$prev_f (no image?). Rollback failed."

    wait_healthy "http://localhost:$(backend_port  "$prev_b")/" "backend-$prev_b"  || die "Rolled-back backend is not healthy."
    wait_healthy "http://localhost:$(frontend_port "$prev_f")/" "frontend-$prev_f" || die "Rolled-back frontend is not healthy."

    write_upstream "$(backend_port "$prev_b")" "$(frontend_port "$prev_f")"

    docker compose -f "$(compose_file "$cur_b")" stop "backend-$cur_b"  2>/dev/null || true
    docker compose -f "$(compose_file "$cur_f")" stop "frontend-$cur_f" 2>/dev/null || true

    echo "$prev_b" > "$BACKEND_STATE"
    echo "$prev_f" > "$FRONTEND_STATE"

    log "═══ ROLLBACK COMPLETE — backend=$prev_b  frontend=$prev_f ═══"
}

# ─── Deploy ──────────────────────────────────────────────────────────────────
do_deploy() {
    log "═══ DEPLOY — target=$TARGET ═══"

    # Pull latest code
    cd "$PROJECT_DIR"
    log "git pull origin main..."
    git pull origin main

    local cur_b cur_f new_b new_f
    cur_b=$(active_backend)
    cur_f=$(active_frontend)
    new_b="$cur_b"
    new_f="$cur_f"

    [ "$TARGET" = "both"     ] || [ "$TARGET" = "backend"  ] && new_b=$(flip_color "$cur_b")
    [ "$TARGET" = "both"     ] || [ "$TARGET" = "frontend" ] && new_f=$(flip_color "$cur_f")

    local nb_port nf_port
    nb_port=$(backend_port  "$new_b")
    nf_port=$(frontend_port "$new_f")

    # ── Ensure shared network & Redis infra ─────────────────
    docker network inspect lumischool-net >/dev/null 2>&1 || {
        log "Creating docker network lumischool-net..."
        docker network create lumischool-net
    }

    log "Ensuring shared infrastructure (Redis) is running..."
    docker compose -f "$DEPLOY_DIR/docker-compose.infra.yml" up -d

    # ── Deploy backend ──────────────────────────────────────
    if [ "$TARGET" = "both" ] || [ "$TARGET" = "backend" ]; then
        log "Pulling pre-built backend image for backend-$new_b..."
        docker compose -f "$(compose_file "$new_b")" pull "backend-$new_b"

        # Clean up any leftover containers from a previous failed attempt
        docker compose -f "$(compose_file "$new_b")" rm -sf "backend-$new_b" 2>/dev/null || true

        log "Starting backend-$new_b..."
        docker compose -f "$(compose_file "$new_b")" up -d --no-build "backend-$new_b"

        if ! wait_healthy "http://localhost:$nb_port/" "backend-$new_b"; then
            docker compose -f "$(compose_file "$new_b")" stop "backend-$new_b" 2>/dev/null || true
            die "Backend deploy failed. Old stack is still running."
        fi
    fi

    # ── Deploy frontend ─────────────────────────────────────
    if [ "$TARGET" = "both" ] || [ "$TARGET" = "frontend" ]; then
        log "Pulling pre-built frontend image for frontend-$new_f..."
        docker compose -f "$(compose_file "$new_f")" pull "frontend-$new_f"

        docker compose -f "$(compose_file "$new_f")" rm -sf "frontend-$new_f" 2>/dev/null || true

        log "Starting frontend-$new_f..."
        docker compose -f "$(compose_file "$new_f")" up -d --no-build "frontend-$new_f"

        if ! wait_healthy "http://localhost:$nf_port/" "frontend-$new_f"; then
            docker compose -f "$(compose_file "$new_f")" stop "frontend-$new_f" 2>/dev/null || true
            # If backend was also deployed in this run, stop it too for consistency
            if [ "$TARGET" = "both" ]; then
                docker compose -f "$(compose_file "$new_b")" stop "backend-$new_b" 2>/dev/null || true
            fi
            die "Frontend deploy failed. Old stack is still running."
        fi
    fi

    # ── Switch nginx upstream ────────────────────────────────
    # For partial deploys, keep the non-deployed service on its current port
    local nginx_b_port nginx_f_port
    if   [ "$TARGET" = "backend"  ]; then
        nginx_b_port=$nb_port
        nginx_f_port=$(frontend_port "$cur_f")
    elif [ "$TARGET" = "frontend" ]; then
        nginx_b_port=$(backend_port "$cur_b")
        nginx_f_port=$nf_port
    else
        nginx_b_port=$nb_port
        nginx_f_port=$nf_port
    fi

    write_upstream "$nginx_b_port" "$nginx_f_port"

    # ── Stop old containers ──────────────────────────────────
    if [ "$TARGET" = "both" ] || [ "$TARGET" = "backend" ]; then
        log "Stopping old backend-$cur_b..."
        docker compose -f "$(compose_file "$cur_b")" stop "backend-$cur_b" 2>/dev/null || true
        echo "$new_b" > "$BACKEND_STATE"
    fi

    if [ "$TARGET" = "both" ] || [ "$TARGET" = "frontend" ]; then
        log "Stopping old frontend-$cur_f..."
        docker compose -f "$(compose_file "$cur_f")" stop "frontend-$cur_f" 2>/dev/null || true
        echo "$new_f" > "$FRONTEND_STATE"
    fi

    log "═══ DEPLOY COMPLETE ═══"
    log "  Backend:  https://edapi.lumina360.tech  (container: backend-$new_b, host-port: $nb_port)"
    log "  Frontend: https://ed.lumina360.tech     (container: frontend-$new_f, host-port: $nf_port)"
}

# ─── Entry point ─────────────────────────────────────────────────────────────
case "$TARGET" in
    rollback)           do_rollback ;;
    both|backend|frontend) do_deploy ;;
    *)
        err "Unknown target: $TARGET"
        echo "Usage: $0 [both|backend|frontend|rollback]" >&2
        exit 1
        ;;
esac
