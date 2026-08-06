#!/usr/bin/env bash
# Deploy Xianova website to Vercel and attach www.xianova.ai
set -euo pipefail
cd "$(dirname "$0")"

if ! npx vercel whoami >/dev/null 2>&1; then
  echo "Please login first: npx vercel login"
  exit 1
fi

echo ">>> Deploying production..."
npx vercel deploy --prod --yes

echo ">>> Attaching domains..."
npx vercel domains add www.xianova.ai --yes || true
npx vercel domains add xianova.ai --yes || true
npx vercel alias set "$(npx vercel ls --prod 2>/dev/null | awk 'NR==2{print $2}')" www.xianova.ai 2>/dev/null || true

echo ">>> Done. Check https://www.xianova.ai/"
