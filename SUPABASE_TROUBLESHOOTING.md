# Supabase Database Connection Troubleshooting

## Common Issues and Solutions

### 1. Database is Paused (Most Common)

Supabase free tier databases pause after 1 week of inactivity.

**Solution:**
1. Go to https://supabase.com/dashboard/project/xyxvgmzqzrogqzoaqjfd
2. Click on your project
3. If you see "Paused" status, click "Restore" or "Resume"
4. Wait 1-2 minutes for the database to start
5. Try accessing your Vercel app again

### 2. Wrong Connection String Format

Make sure you're using the **direct connection string**, not the pooler.

**Correct Format:**
```
postgresql://postgres:[PASSWORD]@db.xyxvgmzqzrogqzoaqjfd.supabase.co:5432/postgres
```

**NOT the pooler:**
```
postgresql://postgres:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

### 3. Environment Variable Not Set in Vercel

**Steps to Add:**
1. Go to https://vercel.com/dashboard
2. Select project: `dash-crm`
3. Go to **Settings** → **Environment Variables**
4. Add:
   - **Key:** `DATABASE_URL`
   - **Value:** `postgresql://postgres:Plaid2090$90@db.xyxvgmzqzrogqzoaqjfd.supabase.co:5432/postgres`
   - **Environment:** Production, Preview, Development (select all)
5. Click **Save**
6. **Redeploy** your application

### 4. Password Special Characters

If your password contains special characters (like `$`), they need to be URL-encoded:
- `$` becomes `%24`
- `@` becomes `%40`
- `#` becomes `%23`
- etc.

**Example:**
```
postgresql://postgres:Plaid2090%2490@db.xyxvgmzqzrogqzoaqjfd.supabase.co:5432/postgres
```

### 5. Check Database Status

**In Supabase Dashboard:**
1. Go to https://supabase.com/dashboard/project/xyxvgmzqzrogqzoaqjfd
2. Check the project status
3. Go to **Settings** → **Database**
4. Verify the connection string matches what you have in Vercel

### 6. Test Connection Locally

Test if the connection works from your local machine:

```bash
# Test connection
psql "postgresql://postgres:Plaid2090$90@db.xyxvgmzqzrogqzoaqjfd.supabase.co:5432/postgres"
```

Or use Prisma Studio:
```bash
npm run db:studio
```

### 7. Vercel Environment Variables

**Important:** After adding environment variables in Vercel:
- They are NOT automatically applied to existing deployments
- You MUST redeploy for changes to take effect

**Redeploy:**
```bash
vercel --prod
```

Or in Vercel Dashboard:
- Go to **Deployments**
- Click the three dots on the latest deployment
- Click **Redeploy**

### 8. Connection Pooling (Alternative)

If direct connection doesn't work, try using Supabase's connection pooler:

**Pooler Connection String:**
```
postgresql://postgres.xyxvgmzqzrogqzoaqjfd:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

Note: Port `6543` for pooler, not `5432`

### 9. Firewall/Network Issues

If you're still having issues:
- Check Supabase project settings for IP restrictions
- Verify Vercel's IP ranges are allowed (usually not needed)
- Check Supabase status page: https://status.supabase.com

## Quick Fix Checklist

- [ ] Database is not paused in Supabase
- [ ] Using direct connection string (port 5432)
- [ ] Password is URL-encoded if it has special characters
- [ ] DATABASE_URL is set in Vercel environment variables
- [ ] Environment variable is set for all environments (Production, Preview, Development)
- [ ] Application has been redeployed after adding environment variable
- [ ] Connection string format is correct

## Get Your Connection String from Supabase

1. Go to https://supabase.com/dashboard/project/xyxvgmzqzrogqzoaqjfd
2. Click **Settings** → **Database**
3. Scroll to **Connection string**
4. Select **URI** tab
5. Copy the connection string
6. Replace `[YOUR-PASSWORD]` with your actual password: `Plaid2090$90`
7. URL-encode special characters if needed

