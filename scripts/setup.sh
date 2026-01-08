#!/bin/bash

echo "🚀 Setting up Caravan Transport CRM..."

# Check if .env exists
if [ ! -f .env ]; then
  echo "📝 Creating .env file from .env.example..."
  cp .env.example .env
  echo "⚠️  Please update .env with your actual values!"
else
  echo "✅ .env file already exists"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
npm run db:generate

# Check if DATABASE_URL is set
if grep -q "DATABASE_URL=\"postgresql://user:password@localhost" .env; then
  echo "⚠️  Please update DATABASE_URL in .env with your actual database connection string"
  echo "   Then run: npm run db:push"
else
  echo "🗄️  Pushing database schema..."
  npm run db:push
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env with your database and Stripe credentials"
echo "2. Run 'npm run db:push' to create database tables"
echo "3. Run 'npm run dev' to start the development server"
echo ""

