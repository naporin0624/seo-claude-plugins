#!/bin/bash

# Playwright Security Runner - Shell wrapper
# Usage: bash run-security-test.sh --url <url> [options]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_DIR="$(dirname "$SCRIPT_DIR")"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed" >&2
    exit 1
fi

# Install dependencies if needed
if [ ! -d "$SKILL_DIR/node_modules" ]; then
    echo "Installing dependencies (including Playwright)..." >&2
    (cd "$SKILL_DIR" && npm install --silent)
fi

# Run the security test
node "$SCRIPT_DIR/run-security-test.js" "$@"
