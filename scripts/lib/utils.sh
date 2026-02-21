#!/usr/bin/env bash
# Shared utility functions for deployment scripts

set -euo pipefail

# Wrangler command (can be overridden via WRANGLER env var)
WRANGLER="${WRANGLER:-pnpm exec wrangler}"

# =============================================================================
# Colors and Logging
# =============================================================================

if [[ -t 1 ]]; then
  RED='\033[0;31m'
  GREEN='\033[0;32m'
  YELLOW='\033[0;33m'
  BLUE='\033[0;34m'
  NC='\033[0m'
else
  RED=''
  GREEN=''
  YELLOW=''
  BLUE=''
  NC=''
fi

log_info() {
  echo -e "${BLUE}[INFO]${NC} $*"
}

log_success() {
  echo -e "${GREEN}[OK]${NC} $*"
}

log_warn() {
  echo -e "${YELLOW}[WARN]${NC} $*"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $*" >&2
}

# =============================================================================
# Environment Name Utilities
# =============================================================================

sanitize_env_name() {
  local name="$1"
  echo "$name" | \
    tr '[:upper:]' '[:lower:]' | \
    sed 's|/|-|g' | \
    sed 's/[^a-z0-9-]//g' | \
    sed 's/--*/-/g' | \
    sed 's/^-//' | \
    sed 's/-$//' | \
    cut -c1-32
}

get_current_branch() {
  git rev-parse --abbrev-ref HEAD 2>/dev/null || echo ""
}

get_env_name() {
  local arg="${1:-}"
  local branch
  branch=$(get_current_branch)

  if [[ -n "$arg" ]]; then
    if [[ "${CI:-}" == "true" ]]; then
      sanitize_env_name "$arg"
    elif [[ "$arg" == "production" ]]; then
      echo "production"
    else
      log_error "Only 'production' can be explicitly specified"
      log_error "For other environments, switch to the appropriate branch"
      exit 1
    fi
  else
    if [[ -z "$branch" ]]; then
      log_error "Not in a git repository and no environment specified"
      exit 1
    fi
    sanitize_env_name "$branch"
  fi
}

# =============================================================================
# Resource Naming Convention
# =============================================================================

APP_NAME="cf-saas-template"

get_d1_name() {
  local env="$1"
  echo "${APP_NAME}-db-${env}"
}

get_kv_sessions_name() {
  local env="$1"
  echo "${APP_NAME}-sessions-${env}"
}

get_worker_api_name() {
  local env="$1"
  if [[ "$env" == "production" ]]; then
    echo "${APP_NAME}-api"
  else
    echo "${APP_NAME}-api-${env}"
  fi
}

get_worker_frontend_name() {
  local env="$1"
  if [[ "$env" == "production" ]]; then
    echo "${APP_NAME}"
  else
    echo "${APP_NAME}-${env}"
  fi
}

# =============================================================================
# Domain Utilities
# =============================================================================

BASE_DOMAIN="${BASE_DOMAIN:-example.com}"

get_env_domain() {
  local env="$1"
  if [[ "$env" == "production" ]]; then
    echo "${APP_NAME}.${BASE_DOMAIN}"
  else
    echo "${APP_NAME}-${env}.${BASE_DOMAIN}"
  fi
}

get_zone_name() {
  echo "$BASE_DOMAIN"
}

get_app_url() {
  local env="$1"
  echo "https://$(get_env_domain "$env")"
}

get_api_url() {
  local env="$1"
  echo "https://$(get_env_domain "$env")/a"
}

# =============================================================================
# Wrangler Output Parsing
# =============================================================================

parse_wrangler_d1_id() {
  grep -oE '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}' | head -1
}

parse_wrangler_kv_id() {
  grep -oE '[0-9a-f]{32}' | head -1
}

# =============================================================================
# Resource Existence Checks
# =============================================================================

d1_exists() {
  local name="$1"
  $WRANGLER d1 list --json 2>/dev/null | jq -e --arg name "$name" '.[] | select(.name == $name)' >/dev/null 2>&1
}

get_d1_id() {
  local name="$1"
  $WRANGLER d1 list --json 2>/dev/null | jq -r --arg name "$name" '.[] | select(.name == $name) | .uuid'
}

kv_exists() {
  local name="$1"
  $WRANGLER kv namespace list 2>/dev/null | jq -e --arg name "$name" '.[] | select(.title == $name)' >/dev/null 2>&1
}

get_kv_id() {
  local name="$1"
  $WRANGLER kv namespace list 2>/dev/null | jq -r --arg name "$name" '.[] | select(.title == $name) | .id'
}

# =============================================================================
# Validation
# =============================================================================

require_command() {
  local cmd="$1"
  if ! command -v "$cmd" &>/dev/null; then
    log_error "Required command not found: $cmd"
    exit 1
  fi
}

require_wrangler_auth() {
  if ! $WRANGLER whoami &>/dev/null; then
    log_error "Not authenticated with Cloudflare. Run: wrangler login"
    exit 1
  fi
}

require_account_id() {
  if [[ -z "${CLOUDFLARE_ACCOUNT_ID:-}" ]]; then
    log_error "CLOUDFLARE_ACCOUNT_ID environment variable is not set"
    exit 1
  fi
}

validate_env_name() {
  local env="$1"
  if [[ -z "$env" ]]; then
    log_error "Environment name cannot be empty"
    exit 1
  fi
  if [[ ! "$env" =~ ^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$ ]]; then
    log_error "Invalid environment name: $env"
    exit 1
  fi
}

env_exists() {
  local env="$1"
  local config_file="${2:-backend/wrangler.jsonc}"

  CONFIG_FILE="$config_file" ENV_NAME="$env" node -e "
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
        if (ch === '\\\\' && inString) { result += ch; escape = true; i++; continue; }
        if (ch === '\"') { inString = !inString; result += ch; i++; continue; }
        if (!inString) {
          if (ch === '/' && next === '/') { while (i < text.length && text[i] !== '\\n') i++; continue; }
          if (ch === '/' && next === '*') { i += 2; while (i < text.length && !(text[i] === '*' && text[i+1] === '/')) i++; i += 2; continue; }
        }
        result += ch;
        i++;
      }
      result = result.replace(/,(\\s*[}\\]])/g, '\$1');
      return JSON.parse(result);
    }
    const content = fs.readFileSync(process.env.CONFIG_FILE, 'utf8');
    const config = parseJsonc(content);
    if (!config.env || !config.env[process.env.ENV_NAME]) {
      process.exit(1);
    }
  " 2>/dev/null
}
