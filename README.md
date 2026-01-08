# Caravan Transport CRM

A comprehensive Customer Relationship Management system for caravan transport businesses, built with Next.js, TypeScript, Prisma, and Stripe.

## Features

- **Customer Management**: Create and manage customer profiles with car shipping-specific details
- **Contract Management**: Generate contracts and send them for e-signature
- **Stripe Integration**: Payment collection through Stripe Payment Links
- **Analytics Dashboard**: View business insights, revenue trends, and contract statistics
- **Payment Tracking**: Monitor payments and their status

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS
- **Payments**: Stripe
- **Charts**: Recharts

## Prerequisites

- Node.js 18+ and npm
- Database (see [DATABASE_SETUP.md](./DATABASE_SETUP.md) for options):
  - **Development**: SQLite (included, no setup needed)
  - **Production**: PostgreSQL (recommended: Supabase, Neon, or Railway)
- Stripe account (for payment processing)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

**For Local Development (SQLite - Easiest):**
```env
# Database - SQLite for local development
DATABASE_URL="file:./dev.db"
```

**For Production (PostgreSQL - Recommended):**
```env
# Database - PostgreSQL (get from Supabase, Neon, or Railway)
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
```

> 💡 **Tip**: See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for detailed database setup instructions and recommendations.

# NextAuth (optional, for future authentication)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# SendGrid (for email notifications)
SENDGRID_API_KEY="SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
SENDGRID_FROM_EMAIL="noreply@yourdomain.com"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Set Up Database

**For SQLite (Local Development - Current Setup):**
```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database (creates dev.db file)
npm run db:push
```

**For PostgreSQL (Production):**
```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# Or create a migration (recommended)
npx prisma migrate dev --name init
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Stripe Setup

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your API keys from the Stripe Dashboard
3. Add them to your `.env` file
4. Set up webhook endpoint:
   - In Stripe Dashboard, go to Developers → Webhooks
   - Add endpoint: `https://yourdomain.com/api/stripe/webhook`
   - Select events: `checkout.session.completed`, `payment_intent.succeeded`
   - Copy the webhook secret to `STRIPE_WEBHOOK_SECRET` in `.env`

## Project Structure

```
├── app/
│   ├── api/              # API routes
│   │   ├── customers/    # Customer CRUD endpoints
│   │   ├── contracts/    # Contract management endpoints
│   │   └── stripe/       # Stripe webhook handler
│   ├── customers/        # Customer pages
│   ├── contracts/        # Contract pages
│   ├── payments/         # Payments page
│   ├── analytics/        # Analytics dashboard
│   └── page.tsx          # Home page
├── lib/
│   ├── prisma.ts         # Prisma client
│   └── stripe.ts         # Stripe client
├── prisma/
│   └── schema.prisma     # Database schema
└── public/               # Static assets
```

## Key Features Explained

### Customer Management
- Create customer profiles with personal information
- Add vehicle details (make, model, year, VIN)
- Specify pickup and delivery locations
- Track customer contracts and payments

### Contract Management
- Create contracts linked to customers
- Generate unique contract numbers
- Send contracts with Stripe payment links
- Track contract status (draft, sent, signed, completed)

### Stripe Integration
- Automatic payment link generation when sending contracts
- Webhook handling for payment events
- Payment tracking and status updates

### Analytics
- Revenue trends over time
- Customer growth metrics
- Contract status distribution
- Payment statistics

## Future Enhancements

- User authentication and authorization
- Email notifications for contracts
- PDF contract generation
- E-signature integration (DocuSign, HelloSign)
- Advanced search and filtering
- Export functionality (CSV, PDF)
- Multi-user support with roles
- Shipment tracking integration

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Open Prisma Studio (database GUI)
npm run db:studio
```

## License

MIT

