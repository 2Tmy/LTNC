#!/bin/bash

echo "=========================================="
echo "Finding PostgreSQL on macOS"
echo "=========================================="

# Common PostgreSQL installation paths on macOS
POSSIBLE_PATHS=(
    "/Applications/Postgres.app/Contents/Versions/*/bin"
    "/Library/PostgreSQL/*/bin"
    "/usr/local/bin"
    "/opt/homebrew/bin"
    "/usr/local/opt/postgresql@*/bin"
    "/opt/homebrew/opt/postgresql@*/bin"
)

echo ""
echo "Checking common installation locations..."
echo ""

for path_pattern in "${POSSIBLE_PATHS[@]}"; do
    for path in $path_pattern; do
        if [ -f "$path/psql" ]; then
            echo "✅ FOUND: $path/psql"
            echo ""
            echo "PostgreSQL version:"
            "$path/psql" --version
            echo ""
            echo "Add this to your PATH:"
            echo "export PATH=\"$path:\$PATH\""
            echo ""
            exit 0
        fi
    done
done

echo "❌ PostgreSQL not found in common locations."
echo ""
echo "Please install PostgreSQL:"
echo "  Option 1: Homebrew"
echo "    brew install postgresql@16"
echo ""
echo "  Option 2: Postgres.app"
echo "    Download from https://postgresapp.com/"
echo ""

exit 1