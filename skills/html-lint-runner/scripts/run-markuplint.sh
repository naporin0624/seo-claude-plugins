#!/bin/bash
# Run markuplint HTML/JSX/TSX check
# Usage: ./run-markuplint.sh <file.html|file.jsx|file.tsx>

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_DIR="$(dirname "$SCRIPT_DIR")"
CONFIG_DIR="$SKILL_DIR/configs"

# Install dependencies if needed
if [ ! -d "$SKILL_DIR/node_modules" ]; then
    echo "Installing dependencies..." >&2
    (cd "$SKILL_DIR" && npm install --silent)
fi

if [ -z "$1" ]; then
  echo "Usage: $0 <file>" >&2
  exit 1
fi

FILE="$1"

if [ ! -f "$FILE" ]; then
  echo "Error: File not found: $FILE" >&2
  exit 1
fi

# Use project config if exists, otherwise use bundled config
if [ -f ".markuplintrc" ]; then
  CONFIG=".markuplintrc"
elif [ -f ".markuplintrc.json" ]; then
  CONFIG=".markuplintrc.json"
elif [ -f "$CONFIG_DIR/markuplintrc.json" ]; then
  CONFIG="$CONFIG_DIR/markuplintrc.json"
else
  CONFIG=""
fi

# Run markuplint
if [ -n "$CONFIG" ]; then
  npx markuplint "$FILE" --format JSON --config "$CONFIG"
else
  npx markuplint "$FILE" --format JSON
fi

exit $?
