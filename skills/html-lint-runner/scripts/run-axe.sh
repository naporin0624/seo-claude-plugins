#!/bin/bash
# Run axe-core accessibility check
# Usage: ./run-axe.sh <file.html>

set -e

if [ -z "$1" ]; then
  echo "Usage: $0 <file.html>" >&2
  exit 1
fi

FILE="$1"

if [ ! -f "$FILE" ]; then
  echo "Error: File not found: $FILE" >&2
  exit 1
fi

# Get file extension
EXT="${FILE##*.}"

# axe-core requires HTML files (not JSX/TSX)
if [ "$EXT" != "html" ] && [ "$EXT" != "htm" ]; then
  echo "Warning: axe-core works best with HTML files. For JSX/TSX, build first or use markuplint." >&2
fi

# Run axe-core with WCAG 2.1 AA tags
npx @axe-core/cli "$FILE" --tags wcag21aa --stdout

exit $?
