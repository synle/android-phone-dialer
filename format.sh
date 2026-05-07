#!/usr/bin/env bash
# Format JS/TS sources with Prettier (uses repo's existing .prettierrc).
set -euo pipefail
cd "$(dirname "$0")"
npx --yes prettier@3.3.3 --write \
  'src/**/*.{ts,tsx,js,jsx,json}' \
  '*.{json,md,js}'
