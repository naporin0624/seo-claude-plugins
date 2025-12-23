#!/bin/bash
#
# validate-with-axe.sh - WCAG 2.1 AA validation using axe-core CLI
#
# Usage:
#   ./validate-with-axe.sh <file-or-url>
#   ./validate-with-axe.sh path/to/file.html
#   ./validate-with-axe.sh https://example.com
#
# Requirements:
#   - Node.js (v14+)
#   - @axe-core/cli (installed globally or via npx)
#
# Install axe-core CLI:
#   npm install -g @axe-core/cli
#   # or use npx (no install needed)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if argument provided
if [ -z "$1" ]; then
  echo -e "${RED}Error: No file or URL provided${NC}"
  echo ""
  echo "Usage: $0 <file-or-url>"
  echo ""
  echo "Examples:"
  echo "  $0 index.html"
  echo "  $0 path/to/page.html"
  echo "  $0 https://example.com"
  exit 1
fi

TARGET="$1"

# Check if target is a file
if [ -f "$TARGET" ]; then
  # Convert to absolute path for file:// URL
  ABSOLUTE_PATH=$(cd "$(dirname "$TARGET")" && pwd)/$(basename "$TARGET")
  TARGET="file://$ABSOLUTE_PATH"
  echo -e "${GREEN}Validating file: $ABSOLUTE_PATH${NC}"
elif [[ "$TARGET" == http* ]]; then
  echo -e "${GREEN}Validating URL: $TARGET${NC}"
else
  echo -e "${RED}Error: File not found: $TARGET${NC}"
  exit 1
fi

echo ""
echo "Running WCAG 2.1 AA validation..."
echo "================================="
echo ""

# Run axe-core with WCAG 2.1 AA tags
# Using npx to avoid requiring global installation
npx --yes @axe-core/cli "$TARGET" \
  --tags wcag21aa,wcag2aa,wcag21a,wcag2a \
  --exit

# Exit code from axe-core:
# 0 = No violations found
# 1 = Violations found
# Other = Error

EXIT_CODE=$?

echo ""
if [ $EXIT_CODE -eq 0 ]; then
  echo -e "${GREEN}✓ WCAG 2.1 AA validation passed!${NC}"
else
  echo -e "${RED}✗ WCAG 2.1 AA violations found${NC}"
  echo ""
  echo "Fix the issues above and re-run validation."
fi

exit $EXIT_CODE
