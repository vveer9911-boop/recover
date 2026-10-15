#!/usr/bin/env bash
set -e

echo "=== 1. Setting up Expo App Dependencies ==="
if [ -d "/workspaces/recovery/recover-app" ]; then
  cd /workspaces/recovery/recover-app
  npm install
fi

echo "=== 2. Installing Antigravity CLI ==="
curl -fsSL https://antigravity.google/cli/install.sh | bash

# Ensure agy is on PATH
if [ -d "$HOME/.local/bin" ]; then
  export PATH="$HOME/.local/bin:$PATH"
  echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
fi

echo "=== Environment Ready! ==="
