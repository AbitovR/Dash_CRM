# Supabase CLI Setup

## Quick Setup Steps

### Option 1: Get Connection String from Dashboard (Easiest)

1. Go to https://supabase.com/dashboard
2. Select your project: **Dashboard_Caravan**
3. Go to **Settings** → **Database**
4. Scroll to **Connection string**
5. Select **URI** tab
6. Copy the connection string
7. It will look like: `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres`

### Option 2: Use Supabase CLI

1. **Get your Access Token:**
   - Go to https://supabase.com/dashboard/account/tokens
   - Click "Generate new token"
   - Copy the token

2. **Login via CLI:**
   ```bash
   export SUPABASE_ACCESS_TOKEN="your-token-here"
   supabase login
   ```

3. **Get Project Reference:**
   - Go to your project dashboard
   - The project reference is in the URL: `https://supabase.com/dashboard/project/[PROJECT-REF]`
   - Or go to Settings → General → Reference ID

4. **Link Project:**
   ```bash
   supabase link --project-ref [YOUR-PROJECT-REF]
   ```

5. **Get Connection String:**
   ```bash
   supabase status
   ```
   This will show your connection details.

## Recommended: Use Dashboard Connection String

The easiest way is to:
1. Copy the connection string from Supabase dashboard
2. Paste it here
3. I'll update your `.env` and run migrations

