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

$ErrorActionPreference = "Stop"

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

# Verify Docker daemon is running
try {
    docker info > $null 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Err "Docker Desktop / daemon is not running! Please start Docker Desktop first."
        exit 1
    }
} catch {
    Write-Err "Docker is not installed or not in PATH."
    exit 1
}

# GHCR image names must be lowercased
$OrgLower = $Org.ToLower()
$BackendImage = "ghcr.io/$OrgLower/lumischool-backend"
$FrontendImage = "ghcr.io/$OrgLower/lumischool-frontend"

Write-Host "==========================================================" -ForegroundColor Magenta
Write-Host "  LumiSchool Local Build & Push to GHCR" -ForegroundColor Magenta
Write-Host "  Target : $Target"
Write-Host "  Org    : $OrgLower"
Write-Host "  Tag    : $Tag"
Write-Host "  Root   : $RepoRoot"
Write-Host "==========================================================" -ForegroundColor Magenta

# ── 1. Backend ─────────────────────────────────────────────────────────────
if ($Target -eq "both" -or $Target -eq "backend") {
    Write-Step "Building Backend image ($BackendImage:$Tag) for linux/amd64..."
    
    $tags = @("-t", "$BackendImage:$Tag")
    if ($Tag -ne "latest") {
        $tags += @("-t", "$BackendImage:latest")
    }

    $buildArgs = @(
        "build",
        "--platform", "linux/amd64"
    ) + $tags + @(
        "-f", "$RepoRoot\LumiSchool-backend\Dockerfile",
        "$RepoRoot\LumiSchool-backend"
    )

    & docker $buildArgs
    if ($LASTEXITCODE -ne 0) {
        Write-Err "Backend build failed!"
        exit 1
    }
    Write-Success "Backend built successfully."

    Write-Step "Pushing Backend image to GitHub Container Registry ($BackendImage)..."
    & docker push "$BackendImage:$Tag"
    if ($LASTEXITCODE -ne 0) {
        Write-Err "Failed to push $BackendImage:$Tag. Did you run 'docker login ghcr.io'?"
        exit 1
    }

    if ($Tag -ne "latest") {
        & docker push "$BackendImage:latest"
    }
    Write-Success "Backend pushed to GHCR."
}

# ── 2. Frontend ────────────────────────────────────────────────────────────
if ($Target -eq "both" -or $Target -eq "frontend") {
    Write-Step "Building Frontend image ($FrontendImage:$Tag) for linux/amd64..."

    $tags = @("-t", "$FrontendImage:$Tag")
    if ($Tag -ne "latest") {
        $tags += @("-t", "$FrontendImage:latest")
    }

    $buildArgs = @(
        "build",
        "--platform", "linux/amd64"
    ) + $tags + @(
        "-f", "$RepoRoot\LumiSchool-frontend\Dockerfile",
        "$RepoRoot\LumiSchool-frontend"
    )

    & docker $buildArgs
    if ($LASTEXITCODE -ne 0) {
        Write-Err "Frontend build failed!"
        exit 1
    }
    Write-Success "Frontend built successfully."

    Write-Step "Pushing Frontend image to GitHub Container Registry ($FrontendImage)..."
    & docker push "$FrontendImage:$Tag"
    if ($LASTEXITCODE -ne 0) {
        Write-Err "Failed to push $FrontendImage:$Tag. Did you run 'docker login ghcr.io'?"
        exit 1
    }

    if ($Tag -ne "latest") {
        & docker push "$FrontendImage:latest"
    }
    Write-Success "Frontend pushed to GHCR."
}

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Success "All target images built and pushed to GitHub Container Registry!"
Write-Host "Now to deploy on your VPS with zero build stress, run:" -ForegroundColor Yellow
Write-Host "  ssh root@your-vps-ip" -ForegroundColor Yellow
Write-Host "  cd /opt/lumischool && bash deploy/deploy.sh $Target" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Green
