#!/bin/bash

# Form Security Analyzer - Shell wrapper
# Usage: bash analyze-form.sh <file> [options]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_DIR="$(dirname "$SCRIPT_DIR")"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed" >&2
    exit 1
fi

# Install dependencies if needed
if [ ! -d "$SKILL_DIR/node_modules" ]; then
    echo "Installing dependencies..." >&2
    (cd "$SKILL_DIR" && npm install --silent)
fi

# Run the analyzer
node "$SCRIPT_DIR/analyze-form.js" "$@"
