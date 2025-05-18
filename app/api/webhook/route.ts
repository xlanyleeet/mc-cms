import { NextRequest, NextResponse } from "next/server";
import { Stripe } from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
});

// Для перевірки підпису webhook
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature") || "";

  let event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, endpointSecret!);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Обробка успішних платежів
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // Перевіряємо, чи платіж успішний
    if (session.payment_status === "paid") {
      const userId = session.client_reference_id;
      const subscriptionId = session.metadata?.subscriptionId;
      const durationDays = parseInt(session.metadata?.durationDays || "0");

      if (userId && subscriptionId && durationDays) {
        try {
          // Перевіряємо, чи платіж ще не був оброблений
          const existingSubscription = await prisma.userSubscription.findFirst({
            where: {
              stripePaymentId: session.id,
            },
          });

          if (!existingSubscription) {
            // Розраховуємо дату закінчення підписки
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + durationDays);

            // Зберігаємо інформацію про підписку в базу даних
            await prisma.userSubscription.create({
              data: {
                userId: userId,
                subscriptionId: subscriptionId,
                startDate: new Date(),
                endDate: endDate,
                stripePaymentId: session.id,
              },
            });

            console.log(`Subscription activated for user ${userId}`);
          }
        } catch (error) {
          console.error("Error processing subscription:", error);
          return NextResponse.json(
            { error: "Error processing subscription" },
            { status: 500 }
          );
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}

// Вимикаємо перевірку CSRF для Stripe webhook
export const config = {
  api: {
    bodyParser: false,
  },
};