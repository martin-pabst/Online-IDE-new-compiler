#!/usr/bin/env bash
set -euo pipefail

# Usage: publish_image.sh <image-name:tag>
IMAGE=${1:-}
if [ -z "$IMAGE" ]; then
  echo "Usage: $0 <image-name:tag>"
  exit 2
fi

if [ -z "${GHCR_USERNAME:-}" ] || [ -z "${GHCR_TOKEN:-}" ]; then
  echo "Error: GHCR_USERNAME and GHCR_TOKEN environment variables must be set." >&2
  exit 3
fi

echo "Logging into ghcr.io as $GHCR_USERNAME..."
echo "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USERNAME" --password-stdin

echo "Pushing image $IMAGE to ghcr.io..."
docker push "$IMAGE"

echo "Publish complete."
