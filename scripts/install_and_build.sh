#!/usr/bin/env bash
set -euo pipefail

# Installs dependencies and runs the embedded build
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "Installing dependencies..."
if [ -f package-lock.json ]; then
  npm ci
else
  npm install
fi

echo "Running build-embedded..."
npm run build-embedded

echo "Build complete. Output: ./dist"
