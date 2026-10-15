#!/usr/bin/env bash
set -e

echo "=== 1. Setting up Expo App Dependencies at Root ==="
cd /workspaces/recovery
npm install

echo "=== 2. Ensuring Antigravity CLI is on PATH ==="
if [ -d "$HOME/.local/bin" ]; then
  export PATH="$HOME/.local/bin:$PATH"
fi

echo "=== Environment Ready! ==="
