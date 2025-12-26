#!/bin/bash

# HTML Lint Runner wrapper script
# Usage: lint-html.sh <file> [--json]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_DIR="$(dirname "$SCRIPT_DIR")"
ROOT_DIR="$(dirname "$(dirname "$SKILL_DIR")")"

# Auto-setup function: checks for node_modules and dist, runs pnpm install if needed
ensure_setup() {
    if [ ! -d "$SKILL_DIR/node_modules" ] || [ ! -d "$SKILL_DIR/dist" ] || [ ! -f "$SKILL_DIR/dist/index.js" ]; then
        echo "Setting up html-lint-runner (installing dependencies and building)..." >&2

        # Check if pnpm is available
        if ! command -v pnpm &> /dev/null; then
            echo "Error: pnpm is not installed. Please install pnpm first:" >&2
            echo "  npm install -g pnpm" >&2
            exit 1
        fi

        # Run pnpm install from root to leverage workspace
        (cd "$ROOT_DIR" && pnpm install --filter html-lint-runner)

        echo "Setup complete." >&2
    fi
}

ensure_setup

# Validate at least one argument
if [ $# -eq 0 ]; then
    echo "Usage: lint-html.sh <file> [options]" >&2
    echo "" >&2
    echo "Options:" >&2
    echo "  --json                 Output in JSON format" >&2
    echo "" >&2
    echo "Examples:" >&2
    echo "  lint-html.sh index.html" >&2
    echo "  lint-html.sh path/to/page.html --json" >&2
    exit 1
fi

# Pass all arguments to the built CLI
node "$SKILL_DIR/dist/index.js" "$@"
