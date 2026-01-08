# How to Add DATABASE_URL in Vercel

## Step-by-Step Instructions

### 1. Go to Vercel Dashboard
- Visit: https://vercel.com/dashboard
- Click on your project: **dash-crm**

### 2. Navigate to Environment Variables
- Click **Settings** (top menu)
- Click **Environment Variables** (left sidebar)

### 3. Add the Variable

**IMPORTANT:** Make sure you're filling in the correct fields:

#### Field 1: **Key** (Variable Name)
```
DATABASE_URL
```
- ✅ Only letters, numbers, and underscores
- ✅ Must start with a letter
- ✅ No spaces, dashes, or special characters

#### Field 2: **Value** (The Connection String)
```
postgresql://postgres:Plaid2090%2490@db.xyxvgmzqzrogqzoaqjfd.supabase.co:5432/postgres
```

#### Field 3: **Environment** (Select all three)
- ✅ Production
- ✅ Preview
- ✅ Development

### 4. Click "Save"

## Common Mistakes

❌ **WRONG:** Putting connection string in the "Key" field
- Key: `postgresql://postgres:...` ❌

✅ **CORRECT:** 
- Key: `DATABASE_URL` ✅
- Value: `postgresql://postgres:...` ✅

## If Variable Already Exists

If `DATABASE_URL` already exists:
1. Click the **pencil icon** (✏️) to edit
2. Update the **Value** field with the new connection string
3. Make sure all environments are selected
4. Click **Save**

## Verify It's Added

After saving, you should see:
- **Key:** `DATABASE_URL`
- **Value:** `postgresql://postgres:Plaid2090%2490@...` (partially hidden)
- **Environments:** Production, Preview, Development

## Then Redeploy

After adding/updating the variable, redeploy your application.

