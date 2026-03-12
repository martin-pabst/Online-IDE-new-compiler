#!/usr/bin/env bash
set -euo pipefail

# Usage: publish_image.sh <image-name:tag>
IMAGE=${1:-}
if [ -z "$IMAGE" ]; then
  echo "Usage: $0 <image-name:tag>"
  exit 2
fi

if [ -z "${IMAGE:-}" ]; then
  echo "Error: IMAGE argument is required" >&2
  exit 2
fi

echo "Pushing image $IMAGE..."
docker push "$IMAGE"

echo "Publish complete."
