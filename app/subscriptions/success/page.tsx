import { redirect } from "next/navigation";
import { Stripe } from "stripe";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

// Ініціалізація Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
});

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  const sessionId = searchParams.session_id;

  if (!sessionId) {
    redirect("/subscriptions");
  }

  // Отримуємо інформацію про платіж з Stripe
  const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);
  
  if (!checkoutSession || checkoutSession.payment_status !== "paid") {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-3xl font-bold mb-4">Помилка обробки платежу</h1>
        <p className="mb-6">Виникла помилка при підтвердженні вашого платежу. Будь ласка, зв'яжіться з адміністрацією.</p>
        <Link href="/subscriptions" className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700">
          Повернутись до підписок
        </Link>
      </div>
    );
  }

  // Отримуємо дані з метаданих сесії
  const userId = checkoutSession.client_reference_id;
  const subscriptionId = checkoutSession.metadata?.subscriptionId;
  const durationDays = parseInt(checkoutSession.metadata?.durationDays || "0");

  if (!userId || !subscriptionId || !durationDays) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-3xl font-bold mb-4">Помилка активації підписки</h1>
        <p className="mb-6">Відсутні необхідні дані для активації підписки. Будь ласка, зв'яжіться з адміністрацією.</p>
        <Link href="/subscriptions" className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700">
          Повернутись до підписок
        </Link>
      </div>
    );
  }

  // Перевіряємо, чи платіж ще не був оброблений
  const existingSubscription = await prisma.userSubscription.findFirst({
    where: {
      stripePaymentId: sessionId,
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
        stripePaymentId: sessionId,
      },
    });
  }

  return (
    <div className="container mx-auto p-6 text-center">
      <div className="max-w-lg mx-auto bg-zinc-800 p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-green-400">Підписку успішно активовано!</h1>
        <div className="bg-green-900 bg-opacity-30 p-4 rounded-lg mb-6">
          <p className="mb-2">Ваш платіж успішно оброблено.</p>
          <p>Дякуємо за підтримку нашого серверу!</p>
        </div>
        <div className="space-y-4">
          <Link href="/profile" className="block bg-blue-600 px-4 py-2 rounded hover:bg-blue-700">
            Перейти до профілю
          </Link>
          <Link href="/" className="block bg-gray-700 px-4 py-2 rounded hover:bg-gray-600">
            На головну
          </Link>
        </div>
      </div>
    </div>
  );
}