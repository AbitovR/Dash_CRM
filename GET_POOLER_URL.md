# Get Correct Pooler Connection String

## Steps to Get Pooler URL from Supabase

1. **Go to Supabase Dashboard:**
   - Visit: https://supabase.com/dashboard/project/xyxvgmzqzrogqzoaqjfd

2. **Navigate to Database Settings:**
   - Click **Settings** (gear icon in left sidebar)
   - Click **Database** (under Project Settings)

3. **Get Connection String:**
   - Scroll down to **Connection string**
   - Select **Connection pooling** tab (NOT "URI")
   - Select **Session mode** (recommended for Prisma)
   - Copy the connection string

4. **It should look like:**
   ```
   postgresql://postgres.xyxvgmzqzrogqzoaqjfd:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```

5. **URL-encode the password:**
   - Replace `$` with `%24`
   - So `Plaid2090$90` becomes `Plaid2090%2490`

6. **Final connection string:**
   ```
   postgresql://postgres.xyxvgmzqzrogqzoaqjfd:Plaid2090%2490@[YOUR-POOLER-URL]:6543/postgres
   ```

## If Pooler Doesn't Work

If the pooler connection still doesn't work, try:

1. **Check IP Restrictions:**
   - In Supabase Dashboard → Settings → Database
   - Check if there are IP restrictions
   - Vercel IPs should be allowed by default

2. **Try Transaction Mode:**
   - In Connection pooling, try "Transaction mode" instead of "Session mode"

3. **Verify Database is Accessible:**
   - Go to Table Editor in Supabase
   - Try to view/create a table
   - If this works, database is fine

4. **Check Vercel Logs:**
   ```bash
   vercel logs dash-crm.vercel.app
   ```

