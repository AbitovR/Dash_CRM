import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { sendEmail, generatePaymentConfirmationHTML } from "@/lib/email";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "No signature" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const contractId = session.metadata?.contractId;

        if (contractId) {
          // Get contract and customer info
          const contract = await prisma.contract.findUnique({
            where: { id: contractId },
            include: { customer: true },
          });

          if (contract) {
            // Create payment record
            const payment = await prisma.payment.create({
              data: {
                customerId: session.metadata?.customerId || contract.customerId,
                contractId: contractId,
                amount: (session.amount_total || 0) / 100,
                currency: session.currency?.toUpperCase() || "USD",
                status: "completed",
                paymentMethod: "stripe",
                stripePaymentId: session.id,
                stripeCustomerId: session.customer as string,
                paidAt: new Date(),
              },
            });

            // Update contract status
            await prisma.contract.update({
              where: { id: contractId },
              data: {
                status: "signed",
                signedAt: new Date(),
              },
            });

            // Send payment confirmation email
            const emailHtml = generatePaymentConfirmationHTML(
              `${contract.customer.firstName} ${contract.customer.lastName}`,
              payment.amount,
              payment.currency,
              session.id,
              contract.contractNumber
            );

            await sendEmail({
              to: contract.customer.email,
              subject: `Payment Confirmation - Contract ${contract.contractNumber}`,
              html: emailHtml,
            });
          }
        }
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        // Handle successful payment
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

