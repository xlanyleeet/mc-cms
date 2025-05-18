import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Stripe } from "stripe";

// Ініціалізація Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
});

export default async function SubscriptionsPage() {
  const session = await getServerSession(authOptions);
  const subscriptions = await prisma.subscription.findMany({
    where: { active: true },
    orderBy: { price: "asc" },
  });

  let currentSubscription = null;
  
  if (session?.user?.id) {
    // Отримуємо поточну підписку користувача, якщо є
    const userSubscription = await prisma.userSubscription.findFirst({
      where: {
        userId: session.user.id,
        endDate: { gt: new Date() }, // Підписка ще не закінчилась
      },
      include: {
        subscription: true,
      },
      orderBy: {
        endDate: "desc", // Беремо найновішу підписку
      },
    });
    
    currentSubscription = userSubscription;
  }

  async function createCheckoutSession(subscriptionId: string) {
    "use server";
    
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return redirect("/login?callbackUrl=/subscriptions");
    }
    
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });
    
    if (!subscription) {
      throw new Error("Підписку не знайдено");
    }
    
    // Створюємо сесію Stripe Checkout
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "uah",
            product_data: {
              name: subscription.name,
              description: subscription.description,
            },
            unit_amount: Math.round(subscription.price * 100), // Ціна у копійках
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/subscriptions/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/subscriptions`,
      client_reference_id: session.user.id,
      metadata: {
        subscriptionId: subscription.id,
        userId: session.user.id,
        durationDays: subscription.durationDays.toString(),
      },
    });
    
    if (checkoutSession.url) {
      redirect(checkoutSession.url);
    }
  }

  return (
    <div className="container mx-auto p-6 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-center">Підписки</h1>
      
      {currentSubscription && (
        <div className="mb-12 p-4 bg-green-800 rounded-lg max-w-2xl mx-auto">
          <h2 className="text-xl font-bold mb-2">Ваша поточна підписка</h2>
          <p className="text-lg">{currentSubscription.subscription.name}</p>
          <p>Дійсна до: {new Date(currentSubscription.endDate).toLocaleDateString()}</p>
          <p className="mt-2 text-sm">Насолоджуйтесь привілеями вашої підписки на сервері!</p>
        </div>
      )}
      
      {!session && (
        <div className="mb-8 p-4 bg-yellow-800 rounded-lg max-w-2xl mx-auto">
          <p className="text-center">
            Для придбання підписки необхідно{" "}
            <Link href="/login?callbackUrl=/subscriptions" className="text-blue-400 underline">
              увійти в аккаунт
            </Link>
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subscriptions.map((subscription) => (
          <div key={subscription.id} className="border border-gray-700 rounded-lg overflow-hidden bg-zinc-800">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-2">{subscription.name}</h2>
              <p className="mb-4 text-gray-300">{subscription.description}</p>
              <p className="text-3xl font-bold mb-2">{subscription.price} ₴</p>
              <p className="text-sm text-gray-400 mb-6">на {subscription.durationDays} днів</p>
              
              <form action={createCheckoutSession.bind(null, subscription.id)}>
                <button 
                  type="submit"
                  className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  disabled={!session}
                >
                  {session ? "Придбати" : "Увійдіть, щоб придбати"}
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
      
      {subscriptions.length === 0 && (
        <div className="text-center p-8">
          <p>На даний момент підписки недоступні. Будь ласка, перевірте пізніше.</p>
        </div>
      )}
    </div>
  );
}