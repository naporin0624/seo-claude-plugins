#!/bin/bash
# Run markuplint HTML/JSX/TSX check
# Usage: ./run-markuplint.sh <file.html|file.jsx|file.tsx>

set -e

if [ -z "$1" ]; then
  echo "Usage: $0 <file>" >&2
  exit 1
fi

FILE="$1"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CONFIG_DIR="$SCRIPT_DIR/../configs"

if [ ! -f "$FILE" ]; then
  echo "Error: File not found: $FILE" >&2
  exit 1
fi

# Get file extension
EXT="${FILE##*.}"

# Check if JSX/TSX and suggest installing parser
if [ "$EXT" = "jsx" ] || [ "$EXT" = "tsx" ]; then
  # Check if parser is available
  if ! npm list @markuplint/jsx-parser >/dev/null 2>&1; then
    echo "Note: For JSX/TSX support, install: npm install -D @markuplint/jsx-parser @markuplint/react-spec" >&2
  fi
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
