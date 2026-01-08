# Get Correct Connection String from Supabase

## The Issue

The pooler connection string format was incorrect. We need to get the **exact** connection string from your Supabase dashboard.

## Steps to Get Correct Connection String

### Option 1: Direct Connection (Recommended to try first)

1. Go to: https://supabase.com/dashboard/project/xyxvgmzqzrogqzoaqjfd/settings/database
2. Scroll to **Connection string**
3. Select **URI** tab
4. Copy the connection string
5. It should look like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xyxvgmzqzrogqzoaqjfd.supabase.co:5432/postgres
   ```
6. Replace `[YOUR-PASSWORD]` with your password, but URL-encode `$` as `%24`
7. Add `?sslmode=require` at the end

**Final format:**
```
postgresql://postgres:Plaid2090%2490@db.xyxvgmzqzrogqzoaqjfd.supabase.co:5432/postgres?sslmode=require
```

### Option 2: Connection Pooler (If direct doesn't work)

1. Go to: https://supabase.com/dashboard/project/xyxvgmzqzrogqzoaqjfd/settings/database
2. Scroll to **Connection string**
3. Select **Connection pooling** tab
4. Select **Session mode**
5. Copy the connection string
6. It should look like:
   ```
   postgresql://postgres.xyxvgmzqzrogqzoaqjfd:[PASSWORD]@[POOLER-HOST]:6543/postgres
   ```
7. Replace `[PASSWORD]` with URL-encoded password: `Plaid2090%2490`

**Important:** The pooler host will be specific to your project and region. It's NOT `aws-0-us-east-1.pooler.supabase.com` - it will be different!

## What I Just Did

I've switched back to direct connection with SSL mode required. Test the app now:
- https://dash-crm.vercel.app

## If Still Not Working

Please:
1. Go to Supabase dashboard → Settings → Database
2. Copy the **exact** connection string from the **URI** tab
3. Share it with me (you can mask the password part)
4. I'll update it correctly

Or you can update it yourself in Vercel:
- Go to Vercel Dashboard → Settings → Environment Variables
- Update `DATABASE_URL` with the exact string from Supabase
- Redeploy

