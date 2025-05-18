// app/api/subscription/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ status: "unauthenticated" }, { status: 401 });
  }
  
  try {
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
    
    if (!userSubscription) {
      return NextResponse.json({ status: "free" });
    }
    
    return NextResponse.json({
      status: "active",
      subscription: {
        name: userSubscription.subscription.name,
        endDate: userSubscription.endDate,
      },
    });
  } catch (error) {
    console.error("Error fetching subscription status:", error);
    return NextResponse.json(
      { error: "Error fetching subscription status" },
      { status: 500 }
    );
  }
}