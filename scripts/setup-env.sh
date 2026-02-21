#!/usr/bin/env bash
# Setup Cloudflare resources for an environment
# Usage: ./scripts/setup-env.sh [environment]
# If no environment specified, uses current git branch name

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# shellcheck source=lib/utils.sh
source "$SCRIPT_DIR/lib/utils.sh"

# =============================================================================
# Main Setup Functions
# =============================================================================

setup_d1() {
  local env="$1"
  local db_name
  db_name=$(get_d1_name "$env")

  log_info "Setting up D1 database: $db_name" >&2

  if d1_exists "$db_name"; then
    log_success "D1 database already exists: $db_name" >&2
    get_d1_id "$db_name"
  else
    log_info "Creating D1 database: $db_name (jurisdiction: eu)" >&2
    local output
    output=$($WRANGLER d1 create "$db_name" --jurisdiction=eu 2>&1)
    local d1_id
    d1_id=$(echo "$output" | parse_wrangler_d1_id)

    if [[ -z "$d1_id" ]]; then
      log_error "Failed to create D1 database. Output:" >&2
      echo "$output" >&2
      exit 1
    fi
    log_success "Created D1 database: $db_name (ID: $d1_id)" >&2
    echo "$d1_id"
  fi
}

setup_kv() {
  local env="$1"
  local kv_name
  kv_name=$(get_kv_sessions_name "$env")

  log_info "Setting up KV namespace: $kv_name" >&2

  if kv_exists "$kv_name"; then
    log_success "KV namespace already exists: $kv_name" >&2
    get_kv_id "$kv_name"
  else
    log_info "Creating KV namespace: $kv_name" >&2
    local output
    output=$($WRANGLER kv namespace create "$kv_name" 2>&1)
    local kv_id
    kv_id=$(echo "$output" | parse_wrangler_kv_id)

    if [[ -z "$kv_id" ]]; then
      log_error "Failed to create KV namespace. Output:" >&2
      echo "$output" >&2
      exit 1
    fi
    log_success "Created KV namespace: $kv_name (ID: $kv_id)" >&2
    echo "$kv_id"
  fi
}

update_backend_config() {
  local env="$1"
  local d1_id="$2"
  local sessions_kv_id="$3"

  local config_file="$PROJECT_ROOT/backend/wrangler.jsonc"
  local db_name app_url domain api_worker_name

  db_name=$(get_d1_name "$env")
  app_url=$(get_app_url "$env")
  domain=$(get_env_domain "$env")
  api_worker_name=$(get_worker_api_name "$env")

  log_info "Updating backend wrangler.jsonc for environment: $env"

  CONFIG_FILE="$config_file" \
  ENV_NAME="$env" \
  D1_ID="$d1_id" \
  SESSIONS_KV_ID="$sessions_kv_id" \
  DB_NAME="$db_name" \
  APP_URL="$app_url" \
  API_WORKER_NAME="$api_worker_name" \
  DOMAIN="$domain" \
  ZONE_NAME="$(get_zone_name)" \
  node << 'NODESCRIPT'
const fs = require('fs');

const configFile = process.env.CONFIG_FILE;
const envName = process.env.ENV_NAME;
const d1Id = process.env.D1_ID;
const sessionsKvId = process.env.SESSIONS_KV_ID;
const dbName = process.env.DB_NAME;
const appUrl = process.env.APP_URL;
const apiWorkerName = process.env.API_WORKER_NAME;
const domain = process.env.DOMAIN;
const zoneName = process.env.ZONE_NAME;

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

const content = fs.readFileSync(configFile, 'utf8');
const config = parseJsonc(content);

if (!config.env) config.env = {};

config.env[envName] = {
  name: apiWorkerName,
  observability: {
    logs: {
      enabled: true,
      head_sampling_rate: 1,
      invocation_logs: true
    }
  },
  routes: [
    { pattern: `${domain}/a/*`, zone_name: zoneName }
  ],
  d1_databases: [
    {
      binding: 'DB',
      database_name: dbName,
      database_id: d1Id,
      migrations_dir: 'drizzle'
    }
  ],
  kv_namespaces: [
    { binding: 'SESSIONS', id: sessionsKvId }
  ]
};

fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
console.log('Updated backend config');
NODESCRIPT

  log_success "Backend wrangler.jsonc updated"
}

update_frontend_config() {
  local env="$1"
  local sessions_kv_id="$2"

  local config_file="$PROJECT_ROOT/frontend/wrangler.jsonc"
  local app_url api_worker_name frontend_worker_name

  api_worker_name=$(get_worker_api_name "$env")
  frontend_worker_name=$(get_worker_frontend_name "$env")
  app_url=$(get_app_url "$env")

  log_info "Updating frontend wrangler.jsonc for environment: $env"

  local domain
  domain=$(get_env_domain "$env")

  CONFIG_FILE="$config_file" \
  ENV_NAME="$env" \
  APP_URL="$app_url" \
  API_WORKER_NAME="$api_worker_name" \
  FRONTEND_WORKER_NAME="$frontend_worker_name" \
  SESSIONS_KV_ID="$sessions_kv_id" \
  DOMAIN="$domain" \
  node << 'NODESCRIPT'
const fs = require('fs');

const configFile = process.env.CONFIG_FILE;
const envName = process.env.ENV_NAME;
const appUrl = process.env.APP_URL;
const apiWorkerName = process.env.API_WORKER_NAME;
const frontendWorkerName = process.env.FRONTEND_WORKER_NAME;
const sessionsKvId = process.env.SESSIONS_KV_ID;
const domain = process.env.DOMAIN;

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

let config;
try {
  const content = fs.readFileSync(configFile, 'utf8');
  config = parseJsonc(content);
} catch {
  // If frontend wrangler.jsonc doesn't exist yet, start with empty config
  config = {};
}

if (!config.env) config.env = {};

config.env[envName] = {
  name: frontendWorkerName,
  observability: {
    logs: {
      enabled: true,
      head_sampling_rate: 1,
      invocation_logs: true
    }
  },
  vars: {
    APP_URL: appUrl
  },
  services: [{
    binding: 'API',
    service: apiWorkerName
  }],
  routes: [{
    pattern: domain,
    custom_domain: true
  }],
  kv_namespaces: [
    { binding: 'SESSIONS', id: sessionsKvId }
  ]
};

fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
console.log('Updated frontend config');
NODESCRIPT

  log_success "Frontend wrangler.jsonc updated"
}

prompt_secrets() {
  local env="$1"

  if [[ "${CI:-}" == "true" ]]; then
    return
  fi

  echo ""
  log_warn "Don't forget to set secrets for environment: $env"
  echo ""
  echo "Run the following commands to set secrets:"
  echo ""
  echo "  cd backend && wrangler secret put JWT_SECRET --env $env"
  echo ""
}

# =============================================================================
# Main
# =============================================================================

main() {
  local env
  env=$(get_env_name "${1:-}")

  echo ""
  echo "========================================"
  echo "  Setting up environment: $env"
  echo "========================================"
  echo ""

  validate_env_name "$env"
  require_command wrangler
  require_command node
  require_command jq
  require_wrangler_auth
  require_account_id

  log_info "Environment: $env"
  log_info "Domain: $(get_env_domain "$env")"
  log_info "App URL: $(get_app_url "$env")"
  echo ""

  D1_ID=$(setup_d1 "$env")
  echo ""

  SESSIONS_KV_ID=$(setup_kv "$env")
  echo ""

  update_backend_config "$env" "$D1_ID" "$SESSIONS_KV_ID"
  update_frontend_config "$env" "$SESSIONS_KV_ID"
  echo ""

  echo "========================================"
  echo "  Setup Complete!"
  echo "========================================"
  echo ""
  echo "Resources created:"
  echo "  D1 Database:   $(get_d1_name "$env") ($D1_ID)"
  echo "  KV (Sessions): $(get_kv_sessions_name "$env") ($SESSIONS_KV_ID)"
  echo ""
  echo "Config files updated:"
  echo "  backend/wrangler.jsonc"
  echo "  frontend/wrangler.jsonc"
  echo ""

  prompt_secrets "$env"

  if [[ "${CI:-}" != "true" ]]; then
    echo "Next steps:"
    echo "  1. Set secrets (see above)"
    echo "  2. Run migrations: pnpm --filter backend db:migrate --env $env"
    echo "  3. Deploy: ./scripts/deploy.sh $env"
    echo ""
  fi
}

main "$@"
