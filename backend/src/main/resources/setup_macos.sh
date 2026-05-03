#!/bin/bash

# ================================================
# POSTGRESQL SETUP SCRIPT FOR macOS
# ================================================

echo "=========================================="
echo "PostgreSQL Setup for macOS"
echo "=========================================="

# ==================== FIND PSQL ====================
echo ""
echo "Step 1: Finding PostgreSQL..."

# Common PostgreSQL paths on macOS
POSSIBLE_PATHS=(
    "/Applications/Postgres.app/Contents/Versions/*/bin"
    "/Library/PostgreSQL/*/bin"
    "/usr/local/bin"
    "/opt/homebrew/bin"
    "/usr/local/opt/postgresql@*/bin"
    "/opt/homebrew/opt/postgresql@*/bin"
)

PSQL_PATH=""
for path_pattern in "${POSSIBLE_PATHS[@]}"; do
    for path in $path_pattern; do
        if [ -f "$path/psql" ]; then
            PSQL_PATH="$path/psql"
            break 2
        fi
    done
done

if [ -z "$PSQL_PATH" ]; then
    echo "❌ ERROR: PostgreSQL not found!"
    echo ""
    echo "Please install PostgreSQL first:"
    echo "  Option 1: Homebrew"
    echo "    brew install postgresql@16"
    echo "    brew services start postgresql@16"
    echo ""
    echo "  Option 2: Postgres.app"
    echo "    Download from https://postgresapp.com/"
    echo ""
    exit 1
fi

echo "✅ Found PostgreSQL: $PSQL_PATH"
"$PSQL_PATH" --version
echo ""

# ==================== ASK FOR PASSWORD ====================
echo "=========================================="
echo "Step 2: Database Configuration"
echo "=========================================="
echo ""
read -p "Enter PostgreSQL username [default: postgres]: " DB_USER
DB_USER=${DB_USER:-postgres}

read -sp "Enter PostgreSQL password: " DB_PASSWORD
echo ""
echo ""

# Set PGPASSWORD to avoid password prompts
export PGPASSWORD="$DB_PASSWORD"

# ==================== CREATE DATABASE ====================
echo "=========================================="
echo "Step 3: Creating database 'db'"
echo "=========================================="

"$PSQL_PATH" -U "$DB_USER" -c "DROP DATABASE IF EXISTS db;" 2>/dev/null
"$PSQL_PATH" -U "$DB_USER" -c "CREATE DATABASE db;"

if [ $? -eq 0 ]; then
    echo "✅ Database 'db' created successfully"
else
    echo "❌ Failed to create database"
    echo "Please check your credentials and try again"
    exit 1
fi

echo ""
echo "=========================================="
echo "Step 4: Running schema.sql"
echo "=========================================="

"$PSQL_PATH" -U "$DB_USER" -d db -f schema.sql

if [ $? -eq 0 ]; then
    echo "✅ Schema created successfully"
else
    echo "❌ Failed to create schema"
    exit 1
fi

echo ""
echo "=========================================="
echo "Step 5: Running data.sql (seed data)"
echo "=========================================="

"$PSQL_PATH" -U "$DB_USER" -d db -f data.sql

if [ $? -eq 0 ]; then
    echo "✅ Seed data inserted successfully"
else
    echo "❌ Failed to insert seed data"
    exit 1
fi

# ==================== RUN TEST QUERIES ====================
echo ""
echo "=========================================="
echo "Step 6: Testing queries"
echo "=========================================="

echo ""
echo "--- TEST 1: Select all users ---"
"$PSQL_PATH" -U "$DB_USER" -d db -c "SELECT id, name, email, role FROM users ORDER BY id;"

echo ""
echo "--- TEST 2: Find user by role (CUSTOMER) ---"
"$PSQL_PATH" -U "$DB_USER" -d db -c "SELECT id, name, email, role FROM users WHERE role = 'CUSTOMER';"

echo ""
echo "--- TEST 3: Find user by role (CS_STAFF) ---"
"$PSQL_PATH" -U "$DB_USER" -d db -c "SELECT id, name, email, role FROM users WHERE role = 'CS_STAFF';"

echo ""
echo "--- TEST 4: Get complaint with customer info ---"
"$PSQL_PATH" -U "$DB_USER" -d db -c "
SELECT 
    c.id,
    c.title,
    c.status,
    c.category,
    u.name as customer_name,
    u.email as customer_email
FROM complaints c
JOIN users u ON c.customer_id = u.id
ORDER BY c.id;
"

echo ""
echo "--- TEST 5: Get complaint with validator info ---"
"$PSQL_PATH" -U "$DB_USER" -d db -c "
SELECT 
    c.id,
    c.title,
    c.status,
    v.name as validated_by_name,
    v.email as validated_by_email
FROM complaints c
LEFT JOIN users v ON c.validated_by = v.id
ORDER BY c.id;
"

echo ""
echo "--- TEST 6: Get validation details ---"
"$PSQL_PATH" -U "$DB_USER" -d db -c "
SELECT 
    cv.id,
    cv.complaint_id,
    cv.validation_status,
    cv.is_information_complete,
    cv.is_within_scope,
    u.name as validated_by_name
FROM complaint_validations cv
JOIN users u ON cv.validated_by = u.id;
"

echo ""
echo "--- TEST 7: Get complaint status history ---"
"$PSQL_PATH" -U "$DB_USER" -d db -c "
SELECT 
    csh.id,
    csh.complaint_id,
    csh.old_status,
    csh.new_status,
    csh.reason,
    u.name as changed_by_name,
    csh.changed_at
FROM complaint_status_history csh
JOIN users u ON csh.changed_by = u.id
ORDER BY csh.complaint_id, csh.changed_at;
"

echo ""
echo "--- TEST 8: Get notifications ---"
"$PSQL_PATH" -U "$DB_USER" -d db -c "
SELECT 
    n.id,
    n.title,
    n.type,
    n.is_read,
    u.name as user_name,
    c.title as complaint_title
FROM notifications n
JOIN users u ON n.user_id = u.id
LEFT JOIN complaints c ON n.complaint_id = c.id
ORDER BY n.created_at DESC;
"

echo ""
echo "--- TEST 9: Get comments ---"
"$PSQL_PATH" -U "$DB_USER" -d db -c "
SELECT 
    cc.id,
    cc.complaint_id,
    cc.comment_text,
    cc.is_internal,
    u.name as commenter_name
FROM complaint_comments cc
JOIN users u ON cc.user_id = u.id
ORDER BY cc.created_at;
"

echo ""
echo "--- TEST 10: Count statistics ---"
"$PSQL_PATH" -U "$DB_USER" -d db -c "
SELECT 
    'Total Users' as metric, COUNT(*) as count FROM users
UNION ALL
SELECT 
    'Total Complaints', COUNT(*) FROM complaints
UNION ALL
SELECT 
    'Validated Complaints', COUNT(*) FROM complaints WHERE status = 'VALIDATED'
UNION ALL
SELECT 
    'Total Notifications', COUNT(*) FROM notifications
UNION ALL
SELECT 
    'Unread Notifications', COUNT(*) FROM notifications WHERE is_read = false;
"

# ==================== DONE ====================
echo ""
echo "=========================================="
echo "✅ DONE! Database is ready."
echo "=========================================="
echo ""
echo "📊 Database Info:"
echo "  Database: db"
echo "  User: $DB_USER"
echo "  Host: localhost"
echo "  Port: 5432"
echo ""
echo "🔑 Test Credentials:"
echo "  customer@test.com     - password123 (CUSTOMER)"
echo "  staff@test.com        - password123 (CS_STAFF)"
echo "  specialist@test.com   - password123 (SPECIALIST)"
echo "  manager@test.com      - password123 (MANAGEMENT)"
echo ""
echo "📝 Next steps:"
echo "  1. Update backend/src/main/resources/application.properties:"
echo "     spring.datasource.username=$DB_USER"
echo "     spring.datasource.password=<your_password>"
echo ""
echo "  2. Start Spring Boot:"
echo "     cd backend && mvn spring-boot:run"
echo ""
echo "  3. Test API:"
echo "     curl -X POST http://localhost:8080/api/auth/login \\"
echo "       -H 'Content-Type: application/json' \\"
echo "       -d '{\"email\":\"customer@test.com\",\"password\":\"password123\"}'"
echo ""

# Clean up
unset PGPASSWORD