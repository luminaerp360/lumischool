#!/usr/bin/env bash
# =============================================================================
# LumiSchool — DigitalOcean Server Initial Setup
# Run this ONCE on a fresh Ubuntu 24.04 droplet as root.
# =============================================================================
set -euo pipefail

log() { echo -e "\n\033[1;32m>>> $*\033[0m"; }

# ─── 1. System packages ──────────────────────────────────────────────────────
log "Installing system packages..."
apt update && apt upgrade -y
apt install -y nginx certbot python3-certbot-nginx git curl ufw

# ─── 2. Docker ───────────────────────────────────────────────────────────────
log "Installing Docker..."
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker

# ─── 3. Firewall ─────────────────────────────────────────────────────────────
log "Configuring UFW firewall..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
ufw status

# ─── 4. Project directory ────────────────────────────────────────────────────
log "Creating project directory..."
mkdir -p /opt/lumischool
mkdir -p /var/www/html   # certbot webroot

# ─── 5. Deploy SSH key ───────────────────────────────────────────────────────
log "Generating deploy SSH key (ed25519)..."
ssh-keygen -t ed25519 -C "lumischool-deploy@$(hostname)" \
           -f ~/.ssh/lumischool_deploy -N "" -q

cat >> ~/.ssh/config <<'EOF'
Host github.com
  IdentityFile ~/.ssh/lumischool_deploy
  StrictHostKeyChecking no
EOF

echo ""
echo "================================================================"
echo "  PUBLIC KEY — add this to GitHub repo as a Deploy Key:"
echo "  https://github.com/shaphankirui/school-lms/settings/keys"
echo "================================================================"
cat ~/.ssh/lumischool_deploy.pub
echo "================================================================"
echo "  Press ENTER after you have added the key to GitHub..."
echo "================================================================"
read -r _

# ─── 6. Clone repo ───────────────────────────────────────────────────────────
log "Cloning repository..."
cd /opt
git clone git@github.com:shaphankirui/school-lms.git lumischool
cd /opt/lumischool

# ─── 7. Docker network ───────────────────────────────────────────────────────
log "Creating Docker network..."
docker network create lumischool-net || true

# ─── 8. Start Redis (shared infra) ───────────────────────────────────────────
log "Starting Redis..."
docker compose -f deploy/docker-compose.infra.yml up -d
docker compose -f deploy/docker-compose.infra.yml ps

# ─── 9. Nginx — minimal HTTP configs for certbot ─────────────────────────────
log "Configuring Nginx for certbot domain verification..."
rm -f /etc/nginx/sites-enabled/default

cat > /etc/nginx/sites-available/lumischool-backend <<'NGINXEOF'
server {
    listen 80;
    listen [::]:80;
    server_name edapi.lumina360.tech;
    root /var/www/html;
    location /.well-known/acme-challenge/ { root /var/www/html; }
    location / { return 200 "ok"; }
}
NGINXEOF

cat > /etc/nginx/sites-available/lumischool-frontend <<'NGINXEOF'
server {
    listen 80;
    listen [::]:80;
    server_name ed.lumina360.tech;
    root /var/www/html;
    location /.well-known/acme-challenge/ { root /var/www/html; }
    location / { return 200 "ok"; }
}
NGINXEOF

ln -sf /etc/nginx/sites-available/lumischool-backend  /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/lumischool-frontend /etc/nginx/sites-enabled/

nginx -t && systemctl reload nginx

# ─── 10. SSL certificates ────────────────────────────────────────────────────
log "Obtaining SSL certificates via Let's Encrypt..."
certbot certonly --nginx \
    -d edapi.lumina360.tech \
    --non-interactive --agree-tos \
    --email admin@lumina360.tech

certbot certonly --nginx \
    -d ed.lumina360.tech \
    --non-interactive --agree-tos \
    --email admin@lumina360.tech

# ─── 11. Production Nginx configs ────────────────────────────────────────────
log "Installing production Nginx configs..."

cp /opt/lumischool/deploy/nginx/backend.conf  /etc/nginx/sites-available/lumischool-backend
cp /opt/lumischool/deploy/nginx/frontend.conf /etc/nginx/sites-available/lumischool-frontend
cp /opt/lumischool/deploy/nginx/upstream.conf /etc/nginx/conf.d/lumischool-upstream.conf

nginx -t && systemctl reload nginx

# ─── 12. Create production .env ──────────────────────────────────────────────
log "Creating production .env ..."
cat > /opt/lumischool/LumiSchool-backend/.env <<'ENVEOF'
# ── MongoDB ──────────────────────────────────────────────────
MONGODB_URI=mongodb+srv://lumina:1nBaL5UpGzMV6ulb@cluster0.emjntdo.mongodb.net/lumischool?retryWrites=true&w=majority

# ── JWT  (CHANGE THESE!) ──────────────────────────────────────
JWT_ACCESS_SECRET=CHANGE_ME_strong_random_secret_1
JWT_REFRESH_SECRET=CHANGE_ME_strong_random_secret_2
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# ── Tenant Portal JWT ─────────────────────────────────────────
TENANT_PORTAL_JWT_SECRET=CHANGE_ME_strong_random_secret_3

# ── Google OAuth ─────────────────────────────────────────────
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://edapi.lumina360.tech/api/auth/google/callback

# ── SMTP ─────────────────────────────────────────────────────
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=kiprotichkirui301@gmail.com
SMTP_PASS=lrvc uyhr hdye wdoi

# ── URLs ─────────────────────────────────────────────────────
FRONTEND_URL=https://ed.lumina360.tech
PORT=3400

# ── Redis (Docker container name on lumischool-net) ──────────
REDIS_URL=redis://lumischool-redis:6379

# ── M-Pesa ───────────────────────────────────────────────────
MPESA_ENV=sandbox
MPESA_CONSUMER_KEY=your-mpesa-consumer-key
MPESA_CONSUMER_SECRET=your-mpesa-consumer-secret
MPESA_SHORTCODE=174379
MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
MPESA_CALLBACK_URL=https://edapi.lumina360.tech/api/mpesa/callback

# ── Africa's Talking SMS ──────────────────────────────────────
AFRICASTALKING_API_KEY=your-africastalking-api-key
AFRICASTALKING_USERNAME=sandbox

# ── AWS S3 / Cloudflare R2 ────────────────────────────────────
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET=lumischool-uploads
AWS_REGION=af-south-1

# ── SendGrid ──────────────────────────────────────────────────
SENDGRID_API_KEY=your-sendgrid-api-key
ENVEOF

echo ""
echo "================================================================"
echo "  IMPORTANT: Edit the .env file and replace CHANGE_ME_ values"
echo "  with strong secrets before running the first deploy:"
echo ""
echo "  nano /opt/lumischool/LumiSchool-backend/.env"
echo "================================================================"
echo ""
echo "  Then make the deploy script executable and run the first deploy:"
echo ""
echo "  chmod +x /opt/lumischool/deploy/deploy.sh"
echo "  bash /opt/lumischool/deploy/deploy.sh"
echo "================================================================"
