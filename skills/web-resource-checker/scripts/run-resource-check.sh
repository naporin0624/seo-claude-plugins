#!/bin/bash
set -e

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_DIR="$(dirname "$SCRIPT_DIR")"

# Install dependencies if needed
if [ ! -d "$SKILL_DIR/node_modules" ]; then
    echo "Installing dependencies..." >&2
    (cd "$SKILL_DIR" && npm install --silent)
fi

# Parse arguments
TARGET=""
JSON_FLAG=""
ONLY_FLAG=""

for arg in "$@"; do
    case $arg in
        --json)
            JSON_FLAG="--json"
            ;;
        --only=*)
            ONLY_FLAG="$arg"
            ;;
        --help|-h)
            node "$SCRIPT_DIR/analyze-web-resources.js" --help
            exit 0
            ;;
        *)
            if [ -z "$TARGET" ]; then
                TARGET="$arg"
            fi
            ;;
    esac
done

# Validate target
if [ -z "$TARGET" ]; then
    echo "Error: Target URL or path is required" >&2
    echo "Usage: $0 <target> [--json] [--only=sitemap,robots,...]" >&2
    exit 1
fi

# Run analyzer
node "$SCRIPT_DIR/analyze-web-resources.js" "$TARGET" $JSON_FLAG $ONLY_FLAG
