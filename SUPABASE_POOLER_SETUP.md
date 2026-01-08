# Supabase Connection Pooler Setup

## The Problem

Vercel serverless functions often can't connect directly to Supabase databases due to:
- Connection limits
- Network restrictions
- Timeout issues

## Solution: Use Connection Pooler

The connection pooler is designed for serverless environments like Vercel.

## Get Pooler Connection String

1. **Go to Supabase Dashboard:**
   - https://supabase.com/dashboard/project/xyxvgmzqzrogqzoaqjfd/settings/database

2. **Find Connection Pooling:**
   - Scroll to **Connection string** section
   - Click **Connection pooling** tab (NOT "URI")
   - Select **Session mode** (recommended for Prisma)

3. **Copy the Connection String:**
   - It will look like:
     ```
     postgresql://postgres.xyxvgmzqzrogqzoaqjfd:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
     ```
   - The host will be specific to your project and region
   - Port is **6543** (not 5432)
   - Username format: `postgres.xyxvgmzqzrogqzoaqjfd` (with project ref)

4. **URL-encode the password:**
   - Replace `$` with `%24`
   - So `Plaid2090$90` becomes `Plaid2090%2490`

5. **Final connection string:**
   ```
   postgresql://postgres.xyxvgmzqzrogqzoaqjfd:Plaid2090%2490@[YOUR-POOLER-HOST]:6543/postgres
   ```

## Alternative: Check IP Restrictions

If pooler doesn't work, check:

1. **Supabase Dashboard → Settings → Database**
2. **Look for "Network Restrictions" or "IP Allowlist"**
3. **Make sure Vercel IPs are allowed** (usually allowed by default)
4. **Or set to "Allow all IPs"** for testing

## Update Vercel

Once you have the pooler connection string:

```bash
# Remove old
vercel env rm DATABASE_URL production --yes
vercel env rm DATABASE_URL preview --yes
vercel env rm DATABASE_URL development --yes

# Add pooler (replace with your actual pooler URL)
echo "postgresql://postgres.xyxvgmzqzrogqzoaqjfd:Plaid2090%2490@[POOLER-HOST]:6543/postgres" | vercel env add DATABASE_URL production
echo "postgresql://postgres.xyxvgmzqzrogqzoaqjfd:Plaid2090%2490@[POOLER-HOST]:6543/postgres" | vercel env add DATABASE_URL preview
echo "postgresql://postgres.xyxvgmzqzrogqzoaqjfd:Plaid2090%2490@[POOLER-HOST]:6543/postgres" | vercel env add DATABASE_URL development

# Redeploy
vercel --prod
```

## Why Pooler Works Better

- ✅ Designed for serverless functions
- ✅ Handles connection pooling automatically
- ✅ Better for high concurrency
- ✅ More reliable for Vercel deployments

