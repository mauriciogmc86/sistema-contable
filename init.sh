#!/usr/bin/env bash
# Verificación única que ejecutan implementer y reviewer.
# typecheck + lint + build (+ tests si existen). Falla al primer error.
set -euo pipefail

cd "$(dirname "$0")"

echo "▶ typecheck"
npm run typecheck

echo "▶ lint"
npm run lint

echo "▶ tests"
if npm run | grep -qE '^[[:space:]]+test'; then
  npm test --silent || { echo "✗ tests fallaron"; exit 1; }
else
  echo "  (sin script de test definido — omitido)"
fi

echo "▶ build"
npm run build

echo "✓ init.sh OK"
