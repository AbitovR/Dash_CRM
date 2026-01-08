# Database Setup Guide

## Recommended Database Options

### 🏆 **Best Choice: PostgreSQL**

**Why PostgreSQL?**
- ✅ Already configured in your Prisma schema
- ✅ Production-ready and highly reliable
- ✅ Excellent performance and scalability
- ✅ Full ACID compliance
- ✅ Rich feature set (JSON support, full-text search, etc.)
- ✅ Great for CRM applications with complex relationships
- ✅ Free tier available on many hosting platforms

**Setup Options:**

#### Option 1: **Supabase (Recommended for Easy Setup)**
- Free tier: 500MB database, 2GB bandwidth
- Built-in authentication, storage, and real-time features
- Easy PostgreSQL hosting
- **Setup:**
  1. Go to [supabase.com](https://supabase.com)
  2. Create a free account
  3. Create a new project
  4. Copy the connection string from Settings → Database
  5. Add to `.env`: `DATABASE_URL="postgresql://..."`

#### Option 2: **Neon (Serverless PostgreSQL)**
- Free tier: 0.5GB storage, unlimited projects
- Serverless, auto-scaling
- **Setup:**
  1. Go to [neon.tech](https://neon.tech)
  2. Sign up for free
  3. Create a project
  4. Copy connection string to `.env`

#### Option 3: **Railway**
- Free tier: $5 credit/month
- Easy deployment
- **Setup:**
  1. Go to [railway.app](https://railway.app)
  2. Create PostgreSQL database
  3. Copy connection string

#### Option 4: **Self-Hosted PostgreSQL**
- Full control
- Requires server management
- Use Docker or install directly

### 📦 **Current Setup: SQLite (Development Only)**

**Pros:**
- ✅ Zero configuration
- ✅ Perfect for local development
- ✅ No server needed
- ✅ Fast for small datasets

**Cons:**
- ❌ Not suitable for production
- ❌ Limited concurrent writes
- ❌ No user management
- ❌ File-based (can get corrupted)

**Current Status:** Your project is using SQLite for local development, which is perfect for testing!

## Migration Guide: SQLite → PostgreSQL

### Step 1: Choose a PostgreSQL Provider

I recommend **Supabase** for the easiest setup:

1. Visit https://supabase.com
2. Sign up (free)
3. Create a new project
4. Wait for database to initialize (~2 minutes)

### Step 2: Update Your Schema

Your schema is already configured for PostgreSQL! Just need to update the datasource:

```prisma
datasource db {
  provider = "postgresql"  // Already set!
  url      = env("DATABASE_URL")
}
```

### Step 3: Get Connection String

From Supabase dashboard:
- Go to Settings → Database
- Copy the "Connection string" (URI format)
- It looks like: `postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres`

### Step 4: Update Environment Variables

Create/update `.env`:

```env
# Replace with your Supabase connection string
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"
```

### Step 5: Run Migrations

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# Or create a migration (recommended for production)
npx prisma migrate dev --name init
```

## Database Comparison

| Feature | SQLite | PostgreSQL | MySQL |
|---------|--------|------------|-------|
| **Setup Complexity** | ⭐ Easy | ⭐⭐ Medium | ⭐⭐ Medium |
| **Production Ready** | ❌ No | ✅ Yes | ✅ Yes |
| **Concurrent Users** | Limited | Excellent | Good |
| **Free Hosting** | N/A | ✅ Yes (Supabase/Neon) | ✅ Yes |
| **Scalability** | Poor | Excellent | Good |
| **Best For** | Development | Production | Production |

## Recommended Setup

### Development (Local)
```env
DATABASE_URL="file:./dev.db"  # SQLite - current setup
```

### Production
```env
DATABASE_URL="postgresql://..."  # PostgreSQL from Supabase/Neon
```

## Quick Start with Supabase

1. **Sign up**: https://supabase.com
2. **Create project**: Click "New Project"
3. **Get connection string**: Settings → Database → Connection string
4. **Update `.env`**: Add the connection string
5. **Run migrations**: `npm run db:push`
6. **Done!** ✅

## Alternative: Keep SQLite for Now

If you want to keep it simple for now:
- SQLite works great for development and small deployments
- You can migrate to PostgreSQL later when you need:
  - Multiple users/connections
  - Better performance
  - Production deployment
  - Team collaboration

## Need Help?

- **Supabase Docs**: https://supabase.com/docs
- **Prisma + PostgreSQL**: https://www.prisma.io/docs/concepts/database-connectors/postgresql
- **Neon Docs**: https://neon.tech/docs

