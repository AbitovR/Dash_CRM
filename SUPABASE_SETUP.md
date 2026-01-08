# Supabase Setup Guide

## Step 1: Create Supabase Account

1. Go to https://supabase.com
2. Click "Start your project" or "Sign in"
3. Sign up with GitHub, Google, or email

## Step 2: Create a New Project

1. Click "New Project"
2. Fill in:
   - **Name**: Caravan Transport CRM (or any name)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free (for now)
3. Click "Create new project"
4. Wait 2-3 minutes for project to initialize

## Step 3: Get Connection String

1. Go to **Settings** → **Database**
2. Scroll down to **Connection string**
3. Select **URI** tab
4. Copy the connection string
5. It looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

## Step 4: Update .env File

Replace the `DATABASE_URL` in your `.env` file with the Supabase connection string:

```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"
```

**Important**: Replace `[YOUR-PASSWORD]` with the password you created in Step 2.

## Step 5: Run Database Migration

After updating `.env`, run:

```bash
npm run db:generate
npm run db:push
```

Or create a migration:

```bash
npx prisma migrate dev --name init
```

## Step 6: Verify Connection

Check your Supabase dashboard → **Table Editor** to see your tables.

## Troubleshooting

### Connection Issues

- **"password authentication failed"**: Check your password in the connection string
- **"connection timeout"**: Check your network/firewall settings
- **"database does not exist"**: Make sure project is fully initialized (wait a few minutes)

### Migration Issues

- **"relation already exists"**: Tables might already exist. Use `prisma db push --force-reset` (⚠️ deletes all data)
- **"column does not exist"**: Run `npx prisma db push` to sync schema

## Next Steps

Once connected:
- Your data will be stored in Supabase PostgreSQL
- You can view/edit data in Supabase dashboard
- Your app will work the same, just with a better database

## Free Tier Limits

- **Database Size**: 500 MB
- **Bandwidth**: 2 GB/month
- **API Requests**: Unlimited
- Perfect for development and small production apps!

