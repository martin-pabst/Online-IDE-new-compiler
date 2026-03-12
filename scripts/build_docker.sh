#!/usr/bin/env bash
set -euo pipefail

# Usage: build_docker.sh <image-name:tag>
IMAGE=${1:-}
if [ -z "$IMAGE" ]; then
  echo "Usage: $0 <image-name:tag>"
  exit 2
fi

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

if [ ! -d dist ]; then
  echo "Error: dist directory not found. Run build first." >&2
  exit 3
fi

echo "Building Docker image $IMAGE..."
docker build -t "$IMAGE" .

echo "Docker image built: $IMAGE"
