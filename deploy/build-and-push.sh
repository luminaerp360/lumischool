#!/usr/bin/env bash
# =============================================================================
# LumiSchool — Local Docker Build & Push to GitHub Container Registry (GHCR)
#
# Builds with --platform linux/amd64 locally so the VPS only has to pull & run.
#
# Usage:
#   ./deploy/build-and-push.sh                 # build & push both backend & frontend
#   ./deploy/build-and-push.sh backend         # build & push backend only
#   ./deploy/build-and-push.sh frontend        # build & push frontend only
#   ./deploy/build-and-push.sh both myorg v1   # custom org & tag
# =============================================================================
set -euo pipefail

TARGET="${1:-both}"
ORG="${2:-luminaerp360}"
TAG="${3:-latest}"

ORG_LOWER=$(echo "$ORG" | tr '[:upper:]' '[:lower:]')
BACKEND_IMAGE="ghcr.io/$ORG_LOWER/lumischool-backend"
FRONTEND_IMAGE="ghcr.io/$ORG_LOWER/lumischool-frontend"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

log()  { echo -e "\n\033[1;36m[$(date '+%H:%M:%S')] >>> $*\033[0m"; }
succ() { echo -e "\033[1;32m[$(date '+%H:%M:%S')] SUCCESS: $*\033[0m"; }
err()  { echo -e "\033[1;31m[$(date '+%H:%M:%S')] ERROR: $*\033[0m" >&2; }
die()  { err "$*"; exit 1; }

docker info >/dev/null 2>&1 || die "Docker is not running! Please start Docker daemon/Desktop."

echo "=========================================================="
echo "  LumiSchool Local Build & Push to GHCR"
echo "  Target : $TARGET"
echo "  Org    : $ORG_LOWER"
echo "  Tag    : $TAG"
echo "  Root   : $REPO_ROOT"
echo "=========================================================="

cd "$REPO_ROOT"

# ── 1. Backend ─────────────────────────────────────────────────────────────
if [ "$TARGET" = "both" ] || [ "$TARGET" = "backend" ]; then
    log "Building Backend image ($BACKEND_IMAGE:$TAG) for linux/amd64..."
    
    TAG_ARGS=(-t "$BACKEND_IMAGE:$TAG")
    if [ "$TAG" != "latest" ]; then
        TAG_ARGS+=(-t "$BACKEND_IMAGE:latest")
    fi

    docker build \
        --platform linux/amd64 \
        "${TAG_ARGS[@]}" \
        -f "$REPO_ROOT/LumiSchool-backend/Dockerfile" \
        "$REPO_ROOT/LumiSchool-backend"

    succ "Backend built."

    log "Pushing Backend image to GitHub Container Registry ($BACKEND_IMAGE)..."
    docker push "$BACKEND_IMAGE:$TAG"
    if [ "$TAG" != "latest" ]; then
        docker push "$BACKEND_IMAGE:latest"
    fi
    succ "Backend pushed to GHCR."
fi

# ── 2. Frontend ────────────────────────────────────────────────────────────
if [ "$TARGET" = "both" ] || [ "$TARGET" = "frontend" ]; then
    log "Building Frontend image ($FRONTEND_IMAGE:$TAG) for linux/amd64..."

    TAG_ARGS=(-t "$FRONTEND_IMAGE:$TAG")
    if [ "$TAG" != "latest" ]; then
        TAG_ARGS+=(-t "$FRONTEND_IMAGE:latest")
    fi

    docker build \
        --platform linux/amd64 \
        "${TAG_ARGS[@]}" \
        -f "$REPO_ROOT/LumiSchool-frontend/Dockerfile" \
        "$REPO_ROOT/LumiSchool-frontend"

    succ "Frontend built."

    log "Pushing Frontend image to GitHub Container Registry ($FRONTEND_IMAGE)..."
    docker push "$FRONTEND_IMAGE:$TAG"
    if [ "$TAG" != "latest" ]; then
        docker push "$FRONTEND_IMAGE:latest"
    fi
    succ "Frontend pushed to GHCR."
fi

echo ""
succ "Target image(s) built and pushed to GitHub Container Registry!"
echo -e "\033[1;33mTo deploy on VPS without server stress:\033[0m"
echo -e "  ssh root@your-vps-ip"
echo -e "  cd /opt/lumischool && bash deploy/deploy.sh $TARGET"
echo "=========================================================="
