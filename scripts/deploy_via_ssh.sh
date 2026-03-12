#!/usr/bin/env bash
set -euo pipefail

# Usage: deploy_via_ssh.sh <image-name:tag> <remote-port> <container-name>
IMAGE=${1:-}
REMOTE_PORT=${2:-80}
CONTAINER_NAME=${3:-online-ide}

if [ -z "$IMAGE" ]; then
  echo "Usage: $0 <image-name:tag> [remote-port] [container-name]" >&2
  exit 2
fi

if [ -z "${SSH_HOST:-}" ] || [ -z "${SSH_USER:-}" ] || [ -z "${SSH_PRIVATE_KEY:-}" ]; then
  echo "Error: SSH_HOST, SSH_USER and SSH_PRIVATE_KEY environment variables must be set." >&2
  exit 3
fi

# Write private key to temporary file
KEY_FILE=$(mktemp)
chmod 600 "$KEY_FILE"
printf '%s' "$SSH_PRIVATE_KEY" > "$KEY_FILE"

REMOTE_CMD="docker pull $IMAGE && \
docker stop $CONTAINER_NAME 2>/dev/null || true && \
docker rm $CONTAINER_NAME 2>/dev/null || true && \
docker run -d -p $REMOTE_PORT:80 --name $CONTAINER_NAME --restart=always $IMAGE"

echo "Deploying $IMAGE to $SSH_USER@$SSH_HOST (port $REMOTE_PORT) as container '$CONTAINER_NAME'..."
ssh -o StrictHostKeyChecking=no -i "$KEY_FILE" "$SSH_USER@$SSH_HOST" "$REMOTE_CMD"

rm -f "$KEY_FILE"
echo "Deployment finished."
