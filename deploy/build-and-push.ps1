<#
.SYNOPSIS
    Builds LumiSchool Docker images locally with --platform linux/amd64 and pushes them to GitHub Container Registry (GHCR).

.DESCRIPTION
    Offloads heavy Angular/NestJS compilation from the VPS to your local workstation.
    Usage examples:
        .\deploy\build-and-push.ps1
        .\deploy\build-and-push.ps1 -Target backend
        .\deploy\build-and-push.ps1 -Target frontend
        .\deploy\build-and-push.ps1 -Org luminaerp360 -Tag v1.0.0
#>

[CmdletBinding()]
param (
    [Parameter(Position = 0)]
    [ValidateSet("both", "backend", "frontend")]
    [string]$Target = "both",

    [Parameter(Position = 1)]
    [string]$Org = "luminaerp360",

    [Parameter(Position = 2)]
    [string]$Tag = "latest"
)

# Do not stop on native tool progress messages (docker outputs progress to stderr)
$ErrorActionPreference = "Continue"

function Write-Step {
    param([string]$Message)
    Write-Host "`n[$(Get-Date -Format 'HH:mm:ss')] >>> $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] SUCCESS: $Message" -ForegroundColor Green
}

function Write-Err {
    param([string]$Message)
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] ERROR: $Message" -ForegroundColor Red
}

# Resolve root repo directory
$RepoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $RepoRoot

# 1. Check if Docker CLI is in PATH
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Err "Docker is not installed or not found in PATH."
    exit 1
}

# 2. Check if Docker daemon / engine is responding
$serverVersion = docker version --format "{{.Server.Version}}" 2>$null
if (-not $serverVersion) {
    Write-Err "Docker Desktop is starting or the Linux Engine is not ready. Please ensure Docker Desktop shows 'Engine running' in green."
    exit 1
}

# GHCR image names must be lowercased
$OrgLower = $Org.ToLower()
$BackendRepo = "ghcr.io/$OrgLower/lumischool-backend"
$FrontendRepo = "ghcr.io/$OrgLower/lumischool-frontend"

$BackendTagged = "${BackendRepo}:${Tag}"
$BackendLatest = "${BackendRepo}:latest"
$FrontendTagged = "${FrontendRepo}:${Tag}"
$FrontendLatest = "${FrontendRepo}:latest"

Write-Host "==========================================================" -ForegroundColor Magenta
Write-Host "  LumiSchool Local Build & Push to GHCR" -ForegroundColor Magenta
Write-Host "  Docker : v$serverVersion" -ForegroundColor Green
Write-Host "  Target : $Target"
Write-Host "  Org    : $OrgLower"
Write-Host "  Tag    : $Tag"
Write-Host "  Root   : $RepoRoot"
Write-Host "==========================================================" -ForegroundColor Magenta

# ── 1. Backend ─────────────────────────────────────────────────────────────
if ($Target -eq "both" -or $Target -eq "backend") {
    Write-Step "Building Backend image ($BackendTagged) for linux/amd64..."

    $tags = @("-t", $BackendTagged)
    if ($Tag -ne "latest") {
        $tags += @("-t", $BackendLatest)
    }

    $dockerfile = Join-Path $RepoRoot "LumiSchool-backend\Dockerfile"
    $context = Join-Path $RepoRoot "LumiSchool-backend"

    docker build --platform linux/amd64 @tags -f $dockerfile $context
    if ($LASTEXITCODE -ne 0) {
        Write-Err "Backend build failed!"
        exit 1
    }
    Write-Success "Backend built successfully."

    Write-Step "Pushing Backend image to GitHub Container Registry ($BackendTagged)..."
    docker push $BackendTagged
    if ($LASTEXITCODE -ne 0) {
        Write-Err "Failed to push $BackendTagged. Did you run 'docker login ghcr.io'?"
        exit 1
    }

    if ($Tag -ne "latest") {
        docker push $BackendLatest
    }
    Write-Success "Backend pushed to GHCR."
}

# ── 2. Frontend ────────────────────────────────────────────────────────────
if ($Target -eq "both" -or $Target -eq "frontend") {
    Write-Step "Building Frontend image ($FrontendTagged) for linux/amd64..."

    $tags = @("-t", $FrontendTagged)
    if ($Tag -ne "latest") {
        $tags += @("-t", $FrontendLatest)
    }

    $dockerfile = Join-Path $RepoRoot "LumiSchool-frontend\Dockerfile"
    $context = Join-Path $RepoRoot "LumiSchool-frontend"

    docker build --platform linux/amd64 @tags -f $dockerfile $context
    if ($LASTEXITCODE -ne 0) {
        Write-Err "Frontend build failed!"
        exit 1
    }
    Write-Success "Frontend built successfully."

    Write-Step "Pushing Frontend image to GitHub Container Registry ($FrontendTagged)..."
    docker push $FrontendTagged
    if ($LASTEXITCODE -ne 0) {
        Write-Err "Failed to push $FrontendTagged. Did you run 'docker login ghcr.io'?"
        exit 1
    }

    if ($Tag -ne "latest") {
        docker push $FrontendLatest
    }
    Write-Success "Frontend pushed to GHCR."
}

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Success "All target images built and pushed to GitHub Container Registry!"
Write-Host "Now deploy on your VPS with zero build stress:" -ForegroundColor Yellow
Write-Host "  ssh root@your-vps-ip" -ForegroundColor Yellow
Write-Host "  cd /opt/lumischool && bash deploy/deploy.sh $Target" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Green
