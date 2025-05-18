import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    // Перевіряємо, чи користувач авторизований
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { message: 'Не авторизовано' },
        { status: 401 }
      );
    }

    // Отримуємо дані з запиту
    const { name, email, currentPassword, newPassword } = await req.json();

    // Знаходимо користувача в базі даних за ID
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Користувача не знайдено' },
        { status: 404 }
      );
    }

    // Підготовка даних для оновлення
    const updateData: any = {};

    // Оновлення імені (якщо змінено)
    if (name && name !== user.name) {
      updateData.name = name;
    }

    // Оновлення email (якщо змінено)
    if (email && email !== user.email) {
      // Перевіряємо, чи new email вже використовується
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser && existingUser.id !== user.id) {
        return NextResponse.json(
          { message: 'Ця електронна пошта вже використовується' },
          { status: 400 }
        );
      }

      updateData.email = email;
    }

    // Перевіряємо та оновлюємо пароль
    if (newPassword) {
      // Якщо намагаємося змінити пароль, необхідно перевірити поточний пароль
      if (!currentPassword || !user.hashedPassword) {
        return NextResponse.json(
          { message: 'Потрібен поточний пароль для зміни пароля' },
          { status: 400 }
        );
      }

      // Перевіряємо, чи поточний пароль правильний
      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        user.hashedPassword
      );

      if (!isPasswordValid) {
        return NextResponse.json(
          { message: 'Поточний пароль невірний' },
          { status: 400 }
        );
      }

      // Хешуємо новий пароль
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      updateData.hashedPassword = hashedPassword;
    }

    // Якщо немає змін, повертаємо помилку
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { message: 'Немає даних для оновлення' },
        { status: 400 }
      );
    }

    // Оновлюємо дані користувача
    await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    return NextResponse.json(
      { message: 'Профіль успішно оновлено' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Помилка при оновленні профілю:', error);
    return NextResponse.json(
      { message: 'Помилка сервера при оновленні профілю' },
      { status: 500 }
    );
  }
}