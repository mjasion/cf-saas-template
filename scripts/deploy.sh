#!/usr/bin/env bash
# Deploy to a Cloudflare environment
# Usage: ./scripts/deploy.sh [environment]
# If no environment specified, uses current git branch name

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# shellcheck source=lib/utils.sh
source "$SCRIPT_DIR/lib/utils.sh"

# Global variables for worker metrics
BACKEND_GZIP_SIZE="N/A"
BACKEND_STARTUP_TIME="N/A"
FRONTEND_GZIP_SIZE="N/A"
FRONTEND_STARTUP_TIME="N/A"

# =============================================================================
# Deployment Functions
# =============================================================================

check_env_exists() {
  local env="$1"
  local config_file="$PROJECT_ROOT/backend/wrangler.jsonc"

  if ! CONFIG_FILE="$config_file" ENV_NAME="$env" node << 'NODESCRIPT'
const fs = require('fs');

function parseJsonc(text) {
  let result = '';
  let inString = false;
  let escape = false;
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    const next = text[i + 1];
    if (escape) { result += ch; escape = false; i++; continue; }
    if (ch === '\\' && inString) { result += ch; escape = true; i++; continue; }
    if (ch === '"') { inString = !inString; result += ch; i++; continue; }
    if (!inString) {
      if (ch === '/' && next === '/') { while (i < text.length && text[i] !== '\n') i++; continue; }
      if (ch === '/' && next === '*') { i += 2; while (i < text.length && !(text[i] === '*' && text[i+1] === '/')) i++; i += 2; continue; }
    }
    result += ch;
    i++;
  }
  result = result.replace(/,(\s*[}\]])/g, '$1');
  return JSON.parse(result);
}

const content = fs.readFileSync(process.env.CONFIG_FILE, 'utf8');
const config = parseJsonc(content);

if (!config.env || !config.env[process.env.ENV_NAME]) {
  process.exit(1);
}
NODESCRIPT
  then
    log_error "Environment '$env' not found in backend/wrangler.jsonc"
    log_error "Run ./scripts/setup-env.sh $env first"
    exit 1
  fi
}

run_migrations() {
  local env="$1"

  log_info "Running database migrations for environment: $env"

  cd "$PROJECT_ROOT/backend"

  if $WRANGLER d1 migrations apply DB --remote --env "$env"; then
    log_success "Migrations applied successfully"
  else
    log_error "Migration failed"
    exit 1
  fi

  cd "$PROJECT_ROOT"
}

generate_version_file() {
  local version="${APP_VERSION:-dev}"
  echo "// This file is overwritten during CI/CD deployment with the actual version
export const APP_VERSION = '$version';" > "$PROJECT_ROOT/frontend/src/version.ts"
  log_info "Version file generated: $version"
}

build_backend() {
  log_info "Building backend..."

  cd "$PROJECT_ROOT/backend"
  pnpm build

  log_success "Backend built successfully"
  cd "$PROJECT_ROOT"
}

build_frontend() {
  local env="$1"

  log_info "Building frontend..."

  cd "$PROJECT_ROOT/frontend"
  pnpm build

  # Patch the generated wrangler.json with environment-specific config
  if [[ "$env" != "local" ]]; then
    log_info "Patching frontend config for environment: $env"
    local frontend_worker_name
    local api_worker_name
    local app_url
    local domain

    frontend_worker_name=$(get_worker_frontend_name "$env")
    api_worker_name=$(get_worker_api_name "$env")
    app_url=$(get_app_url "$env")
    domain=$(get_env_domain "$env")

    ENV_NAME="$env" DOMAIN="$domain" WORKER_NAME="$frontend_worker_name" API_WORKER="$api_worker_name" APP_URL_VAL="$app_url" node -e "
      const fs = require('fs');

      // Read env-specific overrides from the source wrangler.jsonc
      function parseJsonc(text) {
        let result = '', inString = false, escape = false, i = 0;
        while (i < text.length) {
          const ch = text[i], next = text[i + 1];
          if (escape) { result += ch; escape = false; i++; continue; }
          if (ch === '\\\\' && inString) { result += ch; escape = true; i++; continue; }
          if (ch === '\"') { inString = !inString; result += ch; i++; continue; }
          if (!inString) {
            if (ch === '/' && next === '/') { while (i < text.length && text[i] !== '\n') i++; continue; }
            if (ch === '/' && next === '*') { i += 2; while (i < text.length && !(text[i] === '*' && text[i+1] === '/')) i++; i += 2; continue; }
          }
          result += ch; i++;
        }
        return JSON.parse(result.replace(/,(\s*[}\]])/g, '\$1'));
      }
      const source = parseJsonc(fs.readFileSync('wrangler.jsonc', 'utf8'));
      const envConfig = source.env && source.env[process.env.ENV_NAME] || {};

      // Patch the generated config
      const config = JSON.parse(fs.readFileSync('dist/server/wrangler.json', 'utf8'));
      config.name = process.env.WORKER_NAME;
      config.services = [{ binding: 'API', service: process.env.API_WORKER }];
      config.vars = config.vars || {};
      config.vars.APP_URL = process.env.APP_URL_VAL;
      config.routes = [{ pattern: process.env.DOMAIN, custom_domain: true }];
      if (envConfig.kv_namespaces) config.kv_namespaces = envConfig.kv_namespaces;
      fs.writeFileSync('dist/server/wrangler.json', JSON.stringify(config, null, 2));
    "
  fi

  log_success "Frontend built successfully"
  cd "$PROJECT_ROOT"
}

deploy_backend() {
  local env="$1"

  log_info "Deploying backend to environment: $env"

  cd "$PROJECT_ROOT/backend"

  local output
  local version="${APP_VERSION:-dev}"
  if output=$($WRANGLER deploy --env "$env" --var APP_VERSION:"$version" 2>&1); then
    echo "$output"

    BACKEND_GZIP_SIZE=$(echo "$output" | grep -oE 'gzip: [0-9.]+ [A-Za-z]+' | tail -1 | sed 's/gzip: //' || echo "N/A")
    BACKEND_STARTUP_TIME=$(echo "$output" | grep -oE 'Worker Startup Time: [0-9]+ ms' | tail -1 | sed 's/Worker Startup Time: //' || echo "N/A")

    log_success "Backend deployed successfully"
  else
    echo "$output"
    log_error "Backend deployment failed"
    exit 1
  fi

  cd "$PROJECT_ROOT"
}

deploy_frontend() {
  local env="$1"

  log_info "Deploying frontend to environment: $env"

  cd "$PROJECT_ROOT/frontend"

  local output
  if output=$($WRANGLER deploy --env "$env" 2>&1); then
    echo "$output"

    FRONTEND_GZIP_SIZE=$(echo "$output" | grep -oE 'gzip: [0-9.]+ [A-Za-z]+' | tail -1 | sed 's/gzip: //' || echo "N/A")
    FRONTEND_STARTUP_TIME=$(echo "$output" | grep -oE 'Worker Startup Time: [0-9]+ ms' | tail -1 | sed 's/Worker Startup Time: //' || echo "N/A")

    log_success "Frontend deployed successfully"
  else
    echo "$output"
    log_error "Frontend deployment failed"
    exit 1
  fi

  cd "$PROJECT_ROOT"
}

# =============================================================================
# Main
# =============================================================================

main() {
  local env
  env=$(get_env_name "${1:-}")

  local skip_migrations=false
  local skip_build=false

  shift || true
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --skip-migrations)
        skip_migrations=true
        shift
        ;;
      --skip-build)
        skip_build=true
        shift
        ;;
      *)
        log_error "Unknown option: $1"
        exit 1
        ;;
    esac
  done

  echo ""
  echo "========================================"
  echo "  Deploying to: $env"
  echo "========================================"
  echo ""

  validate_env_name "$env"
  require_command wrangler
  require_command pnpm
  require_wrangler_auth

  check_env_exists "$env"

  local app_url api_url
  app_url=$(get_app_url "$env")
  api_url=$(get_api_url "$env")

  log_info "Environment: $env"
  log_info "App URL: $app_url"
  log_info "API URL: $api_url"
  echo ""

  generate_version_file

  if [[ "$skip_build" == "false" ]]; then
    build_backend
    echo ""
    build_frontend "$env"
    echo ""
  else
    log_warn "Skipping build (--skip-build flag)"
    echo ""
  fi

  if [[ "$skip_migrations" == "false" ]]; then
    run_migrations "$env"
    echo ""
  else
    log_warn "Skipping migrations (--skip-migrations flag)"
    echo ""
  fi

  deploy_backend "$env"
  echo ""
  deploy_frontend "$env"
  echo ""

  echo "========================================"
  echo "  Deployment Complete!"
  echo "========================================"
  echo ""
  echo "Your application is now live at:"
  echo ""
  echo "  Frontend: $app_url"
  echo "  API:      $api_url"
  echo ""

  echo "::group::Worker Metrics"
  echo "DEPLOY_METRICS_START"
  echo "BACKEND_GZIP_SIZE=$BACKEND_GZIP_SIZE"
  echo "BACKEND_STARTUP_TIME=$BACKEND_STARTUP_TIME"
  echo "FRONTEND_GZIP_SIZE=$FRONTEND_GZIP_SIZE"
  echo "FRONTEND_STARTUP_TIME=$FRONTEND_STARTUP_TIME"
  echo "DEPLOY_METRICS_END"
  echo "::endgroup::"
}

main "$@"
