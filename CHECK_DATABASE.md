# Database Connection Issue - Troubleshooting Steps

## Most Likely Issue: Database is Paused

Supabase free tier databases **automatically pause after 1 week of inactivity**.

### Check and Resume Database:

1. **Go to Supabase Dashboard:**
   - Visit: https://supabase.com/dashboard/project/xyxvgmzqzrogqzoaqjfd

2. **Check Project Status:**
   - Look for "Paused" or "Inactive" status
   - If you see a "Restore" or "Resume" button, click it

3. **Wait for Database to Start:**
   - After clicking "Restore", wait 1-2 minutes
   - The database needs time to wake up

4. **Verify It's Running:**
   - You should see "Active" status
   - Check the "Table Editor" to confirm database is accessible

## Alternative: Use Connection Pooler

If direct connection doesn't work, try using Supabase's connection pooler:

**Pooler Connection String:**
```
postgresql://postgres.xyxvgmzqzrogqzoaqjfd:Plaid2090%2490@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**Key Differences:**
- Port: `6543` (pooler) instead of `5432` (direct)
- Host: `aws-0-us-east-1.pooler.supabase.com` instead of `db.xyxvgmzqzrogqzoaqjfd.supabase.co`
- Username: `postgres.xyxvgmzqzrogqzoaqjfd` instead of `postgres`

## Update Vercel with Pooler Connection

If database is running but direct connection fails, update to pooler:

```bash
# Remove old
vercel env rm DATABASE_URL --yes

# Add pooler connection
echo "postgresql://postgres.xyxvgmzqzrogqzoaqjfd:Plaid2090%2490@aws-0-us-east-1.pooler.supabase.com:6543/postgres" | vercel env add DATABASE_URL production
echo "postgresql://postgres.xyxvgmzqzrogqzoaqjfd:Plaid2090%2490@aws-0-us-east-1.pooler.supabase.com:6543/postgres" | vercel env add DATABASE_URL preview
echo "postgresql://postgres.xyxvgmzqzrogqzoaqjfd:Plaid2090%2490@aws-0-us-east-1.pooler.supabase.com:6543/postgres" | vercel env add DATABASE_URL development

# Redeploy
vercel --prod
```

## Verify Connection String in Supabase

1. Go to: https://supabase.com/dashboard/project/xyxvgmzqzrogqzoaqjfd/settings/database
2. Scroll to **Connection string**
3. Select **URI** tab
4. Copy the connection string
5. Make sure password is URL-encoded (`$` → `%24`)

## Test Connection Locally

Test if connection works from your machine:

```bash
# Test with psql (if installed)
psql "postgresql://postgres:Plaid2090\$90@db.xyxvgmzqzrogqzoaqjfd.supabase.co:5432/postgres"

# Or test with Prisma Studio
npm run db:studio
```

If local connection works but Vercel doesn't, it's likely a database pause issue.

