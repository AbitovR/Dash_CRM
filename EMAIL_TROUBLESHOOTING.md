# Email Troubleshooting Guide

## Issue: Contract Status Changed to "Sent" but No Email Received

If the contract status changed to "sent" but you didn't receive an email, here's how to fix it:

### Step 1: Verify Sender Email in SendGrid

**This is the most common issue!** SendGrid requires you to verify your sender email before you can send emails.

1. Go to https://app.sendgrid.com/settings/sender_auth
2. Click **"Verify a Single Sender"**
3. Fill in the form:
   - **From Email**: `noreply@caravantransport.com` (or your verified email)
   - **From Name**: `Caravan Transport`
   - **Reply To**: Your business email
   - **Company Address**: Your business address
4. Click **"Create"**
5. **Check your email inbox** for a verification email from SendGrid
6. Click the verification link in the email

**Important**: You cannot send emails until the sender email is verified!

### Step 2: Check Server Console

Check your terminal/console where the dev server is running. Look for:
- `Email sending result:` - Shows if email was sent successfully
- `Error sending email:` - Shows any errors

### Step 3: Check SendGrid Activity

1. Go to https://app.sendgrid.com/activity
2. Look for recent email attempts
3. Check the status:
   - ✅ **Delivered**: Email was sent successfully
   - ❌ **Bounced**: Email address is invalid
   - ⚠️ **Blocked**: Sender not verified or other issue
   - ⏳ **Processing**: Email is being sent

### Step 4: Common Issues and Fixes

#### Issue: "The from address does not match a verified Sender Identity"
**Fix**: Verify your sender email in SendGrid (Step 1 above)

#### Issue: "Invalid email address"
**Fix**: Check that the customer email address is valid

#### Issue: "Rate limit exceeded"
**Fix**: You've hit the free tier limit (100 emails/day). Wait 24 hours or upgrade

#### Issue: "API key invalid"
**Fix**: Check that `SENDGRID_API_KEY` in `.env` is correct

### Step 5: Test Email Sending

You can test email sending with the test endpoint:

```bash
curl -X POST http://localhost:3000/api/email/test \
  -H "Content-Type: application/json" \
  -d '{"to": "your-email@example.com"}'
```

Or use a tool like Postman to send a POST request to `/api/email/test` with:
```json
{
  "to": "your-email@example.com"
}
```

### Step 6: Check Email Spam Folder

Sometimes emails end up in spam. Check:
- Spam/Junk folder
- Promotions tab (Gmail)
- All Mail folder

### Step 7: Verify Configuration

Make sure your `.env` has:
```env
SENDGRID_API_KEY="SG.your-actual-api-key"
SENDGRID_FROM_EMAIL="noreply@caravantransport.com"  # Must be verified in SendGrid
```

### Quick Checklist

- [ ] Sender email verified in SendGrid
- [ ] `SENDGRID_API_KEY` is set in `.env`
- [ ] `SENDGRID_FROM_EMAIL` matches verified sender
- [ ] Customer email address is valid
- [ ] Dev server restarted after updating `.env`
- [ ] Checked server console for errors
- [ ] Checked SendGrid Activity dashboard
- [ ] Checked spam folder

### Still Not Working?

1. Check the server console for detailed error messages
2. Check SendGrid Activity dashboard for delivery status
3. Try the test email endpoint
4. Verify sender email is verified in SendGrid

