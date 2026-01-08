# Fix: IPv4 Compatibility Issue

## The Problem

The Supabase dashboard shows a warning:
> "Not IPv4 compatible. Use Session Pooler if on a IPv4 network"

Vercel uses IPv4, so the direct connection won't work. We need to use the **Session Pooler**.

## Solution: Switch to Session Pooler

### Step 1: In Supabase Dashboard

1. In the "Connect to your project" modal you have open
2. Click **"Pooler settings"** button (in the red warning box)
   - OR
3. Change the **"Method"** dropdown from "Direct connection" to **"Session Pooler"**

### Step 2: Get Pooler Connection String

After switching to Session Pooler:
- The connection string will change
- It will look like:
  ```
  postgresql://postgres.xyxvgmzqzrogqzoaqjfd:[PASSWORD]@[POOLER-HOST]:6543/postgres
  ```
- Port will be **6543** (not 5432)
- Username will be `postgres.xyxvgmzqzrogqzoaqjfd` (with project ref)

### Step 3: Copy and Share

Copy the pooler connection string and share it here, or:
- Replace `[PASSWORD]` with `Plaid2090%2490` (URL-encoded)
- I'll update it in Vercel

## Why This Happens

- Supabase direct connections use IPv6
- Vercel serverless functions use IPv4
- Session Pooler supports IPv4 and works with Vercel

