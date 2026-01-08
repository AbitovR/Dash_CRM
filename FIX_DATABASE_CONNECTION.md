# Fix Database Connection Error

## The Problem

Your password contains a `$` character which needs to be URL-encoded in the connection string.

**Your password:** `Plaid2090$90`  
**URL-encoded:** `Plaid2090%2490`

## Solution: Update Vercel Environment Variable

### Step 1: Get the Correct Connection String

Use this connection string (with URL-encoded password):

```
postgresql://postgres:Plaid2090%2490@db.xyxvgmzqzrogqzoaqjfd.supabase.co:5432/postgres
```

### Step 2: Add to Vercel

1. Go to https://vercel.com/dashboard
2. Click on your project: **dash-crm**
3. Go to **Settings** → **Environment Variables**
4. Find `DATABASE_URL` (or add it if it doesn't exist)
5. Update the value to:
   ```
   postgresql://postgres:Plaid2090%2490@db.xyxvgmzqzrogqzoaqjfd.supabase.co:5432/postgres
   ```
6. Make sure it's enabled for:
   - ✅ Production
   - ✅ Preview  
   - ✅ Development
7. Click **Save**

### Step 3: Check if Database is Paused

1. Go to https://supabase.com/dashboard/project/xyxvgmzqzrogqzoaqjfd
2. Check if the database shows "Paused" status
3. If paused, click **"Restore"** or **"Resume"**
4. Wait 1-2 minutes for it to start

### Step 4: Redeploy

After adding/updating the environment variable:

**Option A: Via CLI**
```bash
vercel --prod
```

**Option B: Via Dashboard**
1. Go to **Deployments** tab
2. Click the three dots (⋯) on the latest deployment
3. Click **Redeploy**

## Alternative: Use Pooler Connection

If direct connection still doesn't work, try the pooler:

```
postgresql://postgres.xyxvgmzqzrogqzoaqjfd:Plaid2090%2490@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

Note: Port `6543` for pooler (not `5432`)

## Verify Connection

After redeploying, check:
1. Go to your app: https://dash-crm.vercel.app
2. Try accessing Customers, Contracts, or Payments pages
3. The error should be gone!

## Still Having Issues?

1. **Check Supabase Dashboard:**
   - Is the database running? (not paused)
   - Is the project active?

2. **Verify Password:**
   - Make sure the password is correct: `Plaid2090$90`
   - URL-encoded: `Plaid2090%2490`

3. **Check Vercel Logs:**
   ```bash
   vercel logs dash-crm.vercel.app
   ```

4. **Test Connection Locally:**
   ```bash
   # Update .env with the connection string
   # Then test:
   npm run db:studio
   ```

