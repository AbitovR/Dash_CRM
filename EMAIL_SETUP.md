# Email Setup with SendGrid

## Overview

The CRM now includes email functionality powered by SendGrid for:
- Sending contracts to customers
- Contract signing confirmations
- Payment confirmations
- General notifications

## SendGrid Setup

### Step 1: Create SendGrid Account

1. Go to [sendgrid.com](https://sendgrid.com)
2. Sign up for a free account (100 emails/day free)
3. Verify your email address

### Step 2: Create API Key

1. Go to Settings → API Keys
2. Click "Create API Key"
3. Name it (e.g., "Caravan CRM")
4. Select "Full Access" or "Restricted Access" with Mail Send permissions
5. Copy the API key (you'll only see it once!)

### Step 3: Verify Sender Email (Required)

1. Go to Settings → Sender Authentication
2. Click "Verify a Single Sender"
3. Fill in your details:
   - From Email: `noreply@yourdomain.com` or your email
   - From Name: `Caravan Transport`
   - Reply To: Your business email
4. Verify the email address (check your inbox)

### Step 4: Update Environment Variables

Add to your `.env` file:

```env
# SendGrid Configuration
SENDGRID_API_KEY="SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
SENDGRID_FROM_EMAIL="noreply@yourdomain.com"  # Must be verified in SendGrid
```

### Step 5: Test Email Sending

The system will automatically send emails when:
- ✅ Contract is sent to customer
- ✅ Contract is signed by customer
- ✅ Payment is received

## Email Templates

### Contract Email
Sent when a contract is sent to a customer, includes:
- Contract details
- Link to sign contract
- Payment link (if available)

### Payment Confirmation
Sent when payment is received via Stripe webhook, includes:
- Payment amount
- Payment ID
- Contract number

### Signature Confirmation
Sent when customer signs the contract, includes:
- Confirmation message
- Link to view signed contract

## Free Tier Limits

**SendGrid Free Tier:**
- 100 emails/day
- Unlimited contacts
- Email API access
- Basic analytics

**Upgrade when needed:**
- Essentials: $19.95/month (50,000 emails)
- Pro: $89.95/month (100,000 emails)

## Testing Without SendGrid

If SendGrid is not configured, the system will:
- Log email details to console
- Continue working normally
- Not send actual emails

This allows you to develop and test without setting up SendGrid immediately.

## Email Features

### Automatic Emails

1. **Contract Sent Email**
   - Triggered: When admin sends contract
   - Contains: Contract details, signing link, payment link

2. **Contract Signed Email**
   - Triggered: When customer signs contract
   - Contains: Confirmation and contract link

3. **Payment Confirmation Email**
   - Triggered: When Stripe payment succeeds
   - Contains: Payment details and receipt

### Customization

Email templates are in `/lib/email.ts`:
- `generateContractEmailHTML()` - Contract email template
- `generatePaymentConfirmationHTML()` - Payment confirmation template

You can customize:
- Colors and branding
- Email content
- Additional information
- Styling

## Troubleshooting

### Emails Not Sending

1. **Check API Key**: Verify `SENDGRID_API_KEY` is set correctly
2. **Check Sender**: Verify sender email is verified in SendGrid
3. **Check Logs**: Look for errors in console
4. **Check SendGrid Dashboard**: View activity logs

### Common Issues

- **"Invalid API Key"**: Regenerate API key in SendGrid
- **"Sender not verified"**: Verify sender email in SendGrid dashboard
- **"Rate limit exceeded"**: Upgrade plan or wait for reset (daily limit)

## Alternative Email Services

If you prefer other services:

### Resend
- Modern email API
- Great developer experience
- Free tier: 3,000 emails/month

### Mailgun
- Reliable email service
- Free tier: 5,000 emails/month (first 3 months)

### AWS SES
- Very cheap ($0.10 per 1,000 emails)
- Requires AWS account setup
- More complex setup

## Next Steps

1. Set up SendGrid account
2. Add API key to `.env`
3. Verify sender email
4. Test by sending a contract
5. Check SendGrid dashboard for delivery status

