# Vercel Deployment Guide

## Quick Deploy

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel**: https://vercel.com
2. **Sign up/Login** with GitHub
3. **Import Project**:
   - Click "Add New..." → "Project"
   - Select your GitHub repository: `AbitovR/Dash_CRM`
   - Click "Import"
4. **Configure Project**:
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
5. **Add Environment Variables** (see below)
6. **Click "Deploy"**

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# For production
vercel --prod
```

## Required Environment Variables

Add these in Vercel Dashboard → Your Project → Settings → Environment Variables:

### Database
```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

### Stripe
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### SendGrid
```env
SENDGRID_API_KEY="SG.xxx..."
SENDGRID_FROM_EMAIL="support@caravantransport.io"
```

### App Configuration
```env
NEXT_PUBLIC_APP_URL="https://your-app.vercel.app"
ADMIN_NOTIFICATION_EMAIL="support@caravantransport.io"
```

### NextAuth (if using authentication)
```env
NEXTAUTH_URL="https://your-app.vercel.app"
NEXTAUTH_SECRET="your-secret-key-here"
```

## Important: Stripe Webhook Setup

After deployment, you need to configure Stripe webhooks:

1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Endpoint URL: `https://your-app.vercel.app/api/stripe/webhook`
4. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
5. Copy the webhook signing secret
6. Add to Vercel environment variables as `STRIPE_WEBHOOK_SECRET`

## Post-Deployment Checklist

- [ ] All environment variables added to Vercel
- [ ] Stripe webhook configured
- [ ] Test contract creation
- [ ] Test email sending
- [ ] Test payment processing
- [ ] Verify Supabase connection
- [ ] Test contract signing flow
- [ ] Update `NEXT_PUBLIC_APP_URL` to your Vercel domain

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version (Vercel uses 18.x by default)

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check Supabase allows connections from Vercel IPs
- Ensure database is not paused (Supabase free tier)

### Email Not Sending
- Verify `SENDGRID_API_KEY` is set
- Check sender email is verified in SendGrid
- Review SendGrid activity logs

### Payment Links Not Working
- Verify Stripe keys are production keys (not test)
- Check `NEXT_PUBLIC_APP_URL` matches your Vercel domain
- Verify webhook is configured correctly

## Custom Domain (Optional)

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update `NEXT_PUBLIC_APP_URL` to your custom domain

## Free Tier Limits

**Vercel Free Tier:**
- Unlimited deployments
- 100GB bandwidth/month
- Serverless functions
- Automatic HTTPS

**Supabase Free Tier:**
- 500MB database
- 2GB bandwidth/month

Perfect for starting out! 🚀

