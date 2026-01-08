#!/bin/bash

echo "🚀 Migrating from SQLite to PostgreSQL"
echo ""
echo "This script will help you migrate your database."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
  echo "❌ .env file not found. Please create one first."
  exit 1
fi

# Check current database
CURRENT_DB=$(grep DATABASE_URL .env | head -1)

if [[ $CURRENT_DB == *"file:"* ]]; then
  echo "📦 Current database: SQLite"
  echo ""
  echo "To migrate to PostgreSQL:"
  echo ""
  echo "1. Sign up for a free PostgreSQL database:"
  echo "   - Supabase: https://supabase.com (Recommended)"
  echo "   - Neon: https://neon.tech"
  echo "   - Railway: https://railway.app"
  echo ""
  echo "2. Get your connection string from the provider"
  echo ""
  echo "3. Update .env file:"
  echo "   DATABASE_URL=\"postgresql://user:password@host:5432/database\""
  echo ""
  echo "4. Run these commands:"
  echo "   npm run db:generate"
  echo "   npm run db:push"
  echo ""
  echo "5. (Optional) Migrate existing data:"
  echo "   npx prisma db pull  # Pull schema from SQLite"
  echo "   # Then manually export/import data if needed"
  echo ""
else
  echo "✅ Already using PostgreSQL or another database"
  echo "Current: $CURRENT_DB"
fi

