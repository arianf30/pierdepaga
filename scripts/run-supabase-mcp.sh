#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT/.env.local"

if [[ -f "$ENV_FILE" ]]; then
  while IFS= read -r line || [[ -n "$line" ]]; do
    [[ "$line" =~ ^[[:space:]]*# ]] && continue
    [[ -z "${line// }" ]] && continue
    if [[ "$line" == SUPABASE_ACCESS_TOKEN=* ]]; then
      export "${line?}"
    fi
  done < "$ENV_FILE"
fi

if [[ -z "${SUPABASE_ACCESS_TOKEN:-}" ]]; then
  echo "Falta SUPABASE_ACCESS_TOKEN en .env.local" >&2
  echo "Creala en: https://supabase.com/dashboard/account/tokens" >&2
  exit 1
fi

exec npx -y @supabase/mcp-server-supabase --project-ref uratileutrpwqxzwxejb
