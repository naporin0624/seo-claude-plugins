#!/bin/bash
# Combined HTML linting with axe-core and markuplint
# Usage: ./lint-html.sh <file.html|file.jsx|file.tsx>

set -e

if [ -z "$1" ]; then
  echo "Usage: $0 <file>" >&2
  exit 1
fi

FILE="$1"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

if [ ! -f "$FILE" ]; then
  echo "Error: File not found: $FILE" >&2
  exit 1
fi

# Get file extension
EXT="${FILE##*.}"

# Temp files for results
AXE_RESULT=$(mktemp)
MARKUPLINT_RESULT=$(mktemp)
trap "rm -f $AXE_RESULT $MARKUPLINT_RESULT" EXIT

# Run axe-core (only for HTML files, skip for JSX/TSX as axe needs rendered HTML)
# Note: axe-core requires Chrome/ChromeDriver. If unavailable, skip with warning.
AXE_ERROR=""
if [ "$EXT" = "html" ] || [ "$EXT" = "htm" ]; then
  AXE_OUTPUT=$(npx @axe-core/cli "$FILE" --tags wcag21aa --stdout 2>&1) || true
  if echo "$AXE_OUTPUT" | grep -q "Error:"; then
    AXE_ERROR=$(echo "$AXE_OUTPUT" | grep "Error:" | head -1)
    echo '[]' > "$AXE_RESULT"
  else
    echo "$AXE_OUTPUT" > "$AXE_RESULT"
  fi
else
  echo '[]' > "$AXE_RESULT"
fi

# Run markuplint
npx markuplint "$FILE" --format JSON 2>/dev/null > "$MARKUPLINT_RESULT" || true

# Parse results and combine into JSON
AXE_VIOLATIONS=$(cat "$AXE_RESULT" | jq -r '[.[0].violations // []] | .[0] // []' 2>/dev/null || echo '[]')
AXE_PASSES=$(cat "$AXE_RESULT" | jq -r '[.[0].passes // []] | .[0] // []' 2>/dev/null || echo '[]')
AXE_INCOMPLETE=$(cat "$AXE_RESULT" | jq -r '[.[0].incomplete // []] | .[0] // []' 2>/dev/null || echo '[]')

MARKUPLINT_PROBLEMS=$(cat "$MARKUPLINT_RESULT" | jq -r '. // []' 2>/dev/null || echo '[]')

# Count issues
AXE_COUNT=$(echo "$AXE_VIOLATIONS" | jq 'length' 2>/dev/null || echo '0')
MARKUPLINT_COUNT=$(echo "$MARKUPLINT_PROBLEMS" | jq 'length' 2>/dev/null || echo '0')
TOTAL=$((AXE_COUNT + MARKUPLINT_COUNT))

# Output combined JSON
if [ -n "$AXE_ERROR" ]; then
  # Strip ANSI codes and escape for JSON
  AXE_ERROR_ESCAPED=$(echo "$AXE_ERROR" | sed 's/\x1b\[[0-9;]*m//g; s/\\/\\\\/g; s/"/\\"/g; s/\t/\\t/g' | tr -d '\n\r')
  AXE_ERROR_JSON=", \"error\": \"$AXE_ERROR_ESCAPED\""
else
  AXE_ERROR_JSON=""
fi

cat <<EOF
{
  "file": "$FILE",
  "timestamp": "$TIMESTAMP",
  "axe": {
    "violations": $AXE_VIOLATIONS,
    "passes": $AXE_PASSES,
    "incomplete": $AXE_INCOMPLETE$AXE_ERROR_JSON
  },
  "markuplint": {
    "problems": $MARKUPLINT_PROBLEMS
  },
  "summary": {
    "axe_violations": $AXE_COUNT,
    "markuplint_problems": $MARKUPLINT_COUNT,
    "total_issues": $TOTAL
  }
}
EOF
