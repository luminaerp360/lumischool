# LumiSchool — Deployment & Pre-built Container Guide

This guide explains how **LumiSchool** is deployed and how to build Docker images locally and push them to **GitHub Container Registry (`ghcr.io`)** so that your VPS never undergoes high CPU/RAM stress.

---

## 1. How LumiSchool Deployment Works

LumiSchool uses an automated **Blue/Green zero-downtime deployment** architecture on the VPS:
- **Shared Infrastructure**: Redis runs in `lumischool-net` via `deploy/docker-compose.infra.yml`.
- **Blue/Green Slots**:
  - **Blue**: Backend port `9001`, Frontend port `9021` (`deploy/docker-compose.blue.yml`)
  - **Green**: Backend port `9002`, Frontend port `9022` (`deploy/docker-compose.green.yml`)
- **Reverse Proxy**: Host Nginx proxies traffic from domains:
  - `edapi.lumina360.tech` → `http://lumischool_backend`
  - `ed.lumina360.tech` → `http://lumischool_frontend`
- **Zero-Downtime Switching**: When `deploy.sh` runs, it:
  1. Pulls the new Docker image into the *inactive* slot (e.g. green).
  2. Starts the new container slot.
  3. Waits for the container to become healthy.
  4. Rewrites `/etc/nginx/conf.d/lumischool-upstream.conf` to point to the new slot and reloads Nginx.
  5. Stops the old slot container. If anything fails, the old slot keeps serving without dropping user requests.

---

## 2. Why We Build Locally Instead of on the VPS

- **NestJS & Angular 17 builds are resource-intensive**: Compiling Angular with TypeScript, Tailwind, and Node on a 1GB/2GB VPS consumes up to 2GB+ RAM and 100% CPU, which can cause the VPS to crash (OOM Kill), freeze SSH, or take 10+ minutes.
- **Pre-built images eliminate VPS stress**: Your machine (or GitHub Actions) builds the production artifacts once. The VPS simply runs `docker compose pull` (fast network download, ~15-30 seconds) and starts the container with zero compilation overhead.

---

## 3. One-Time Setup: Authenticate with GitHub Container Registry (GHCR)

### A. Create a GitHub Personal Access Token (PAT)
1. On GitHub, go to **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)** (or [click here](https://github.com/settings/tokens)).
2. Click **Generate new token (classic)**.
3. Set Note: `ghcr-lumischool`.
4. Select Scopes:
   - `write:packages` (Upload packages to GitHub Package Registry)
   - `read:packages` (Download packages from GitHub Package Registry)
   - `repo` (Full control of private repositories)
5. Click **Generate token** and copy your token (starts with `ghp_...`).

### B. Authenticate Locally
In Windows PowerShell (make sure Docker Desktop is running):
```powershell
docker login ghcr.io -u YOUR_GITHUB_USERNAME
# When prompted for password, paste your GitHub PAT token
```

---

## 4. How to Build & Push Locally

We created dedicated scripts for both PowerShell and Bash that compile specifically for `--platform linux/amd64` (guaranteeing compatibility with your Linux VPS).

### Option A: Using PowerShell (Windows)
```powershell
# From the project root:

# Build and push BOTH backend and frontend:
.\deploy\build-and-push.ps1

# Or deploy backend only:
.\deploy\build-and-push.ps1 -Target backend

# Or deploy frontend only:
.\deploy\build-and-push.ps1 -Target frontend

# If your GitHub org/user is different:
.\deploy\build-and-push.ps1 -Org YOUR_GITHUB_USERNAME_OR_ORG
```

### Option B: Using Bash (Git Bash / WSL / macOS / Linux)
```bash
chmod +x ./deploy/build-and-push.sh

# Build & push both:
./deploy/build-and-push.sh

# Build & push backend only:
./deploy/build-and-push.sh backend

# Build & push frontend only:
./deploy/build-and-push.sh frontend
```

---

## 5. Setting Image Visibility on GitHub (Important!)

Once you push the images for the first time:
1. Go to your GitHub profile or organization page (`https://github.com/orgs/luminaerp360/packages` or `https://github.com/YOUR_USERNAME?tab=packages`).
2. You will see `lumischool-backend` and `lumischool-frontend`.
3. **If you set Package Visibility to Public**:
   - The VPS does not need any login or credentials! It can pull freely without authentication.
4. **If you keep Package Visibility as Private**:
   - On the VPS, run this once:
     ```bash
     echo "YOUR_GITHUB_PAT" | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
     ```

---

## 6. How to Deploy on the VPS

Now when you deploy on the VPS, it **will not compile anything**. It simply pulls the pre-built image from GHCR and performs the zero-downtime slot switch.

```bash
# 1. Connect to VPS
ssh root@YOUR_SERVER_IP

# 2. Go to project directory
cd /opt/lumischool

# 3. Pull latest code (deploy scripts, compose files)
git pull origin main

# 4. Run zero-downtime deploy
bash deploy/deploy.sh             # deploys both backend + frontend
# OR:
bash deploy/deploy.sh backend     # deploys backend only
bash deploy/deploy.sh frontend    # deploys frontend only
```

### If you ever need to rollback:
```bash
bash deploy/deploy.sh rollback
```
The script will instantly flip back to the previously active color slot without downloading or rebuilding anything.

---

## 7. Bonus: Automatic GitHub Actions CI/CD (Optional)

We also added `.github/workflows/docker-publish.yml`.
Whenever you `git push origin main` with changes to `LumiSchool-backend` or `LumiSchool-frontend`:
- GitHub Actions automatically builds the images in the cloud using GitHub's free runners.
- Pushes the updated images to GHCR tagged with `:latest` and the commit SHA.
- You don't even need to run local builds if you prefer pushing directly to GitHub!
