'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });
  
  // Форма стану
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  // Оновлюємо форму, коли дані сесії завантажуються
  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        name: session.user.name || '',
        email: session.user.email || '',
      }));
    }
  }, [session]);
  
  // Перенаправляємо на сторінку входу, якщо користувач не авторизований
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);
  
  // Функція для обробки змін у формі
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  // Функція для оновлення профілю
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', content: '' });
    
    try {
      // Валідація паролів
      if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
        setMessage({ type: 'error', content: 'Паролі не співпадають' });
        setLoading(false);
        return;
      }
      
      // Запит до API для оновлення профілю
      const response = await fetch('/api/user/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          currentPassword: formData.currentPassword || undefined,
          newPassword: formData.newPassword || undefined,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Помилка при оновленні профілю');
      }
      
      // Оновлюємо сесію, щоб відобразити зміни
      await update();
      
      setMessage({ type: 'success', content: 'Профіль успішно оновлено' });
      
      // Очищаємо поля паролів
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (error) {
      console.error('Помилка при оновленні профілю:', error);
      setMessage({ 
        type: 'error', 
        content: error instanceof Error ? error.message : 'Невідома помилка при оновленні профілю' 
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Показуємо повідомлення про завантаження, якщо статус ще не визначений
  if (status === 'loading') {
    return <div className="flex justify-center items-center min-h-screen">Завантаження...</div>;
  }
  
  const avatarUrl = session?.user?.name
    ? `https://mc-heads.net/avatar/${session.user.name}/100`
    : '/default-avatar.png';
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto bg-zinc-800 rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">Профіль користувача</h1>
        
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <Image
              src={avatarUrl}
              alt="Аватар користувача"
              width={100}
              height={100}
              className="rounded-full border-2 border-indigo-500"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = '/default-avatar.png';
              }}
            />
          </div>
          <div className="text-sm text-zinc-400 text-center">
            Аватар автоматично завантажується з Minecraft за іменем користувача
          </div>
        </div>
        
        {message.content && (
          <div 
            className={`mb-4 p-3 rounded ${
              message.type === 'error' ? 'bg-red-900/50 text-red-200' : 'bg-green-900/50 text-green-200'
            }`}
          >
            {message.content}
          </div>
        )}
        
        <form onSubmit={handleUpdateProfile}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Ім'я користувача (Minecraft)
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Електронна пошта
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          
          <div className="border-t border-zinc-700 my-6 pt-6">
            <h2 className="text-lg font-medium mb-4">Зміна паролю</h2>
            
            <div className="mb-4">
              <label htmlFor="currentPassword" className="block text-sm font-medium mb-1">
                Поточний пароль
              </label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="newPassword" className="block text-sm font-medium mb-1">
                Новий пароль
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
                Підтвердіть новий пароль
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          
          <div className="flex justify-center">
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-md font-medium transition-colors duration-200"
              disabled={loading}
            >
              {loading ? 'Оновлення...' : 'Оновити профіль'}
            </button>
          </div>
        </form>
        {/* Блок підписки */}
        <div className="mb-8 p-4 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold mb-2">Статус підписки</h3>
            
            {userSubscription ? (
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-300">Тип підписки:</span>
                  <span className="font-medium text-green-400">{userSubscription.subscription.name}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-300">Активна до:</span>
                  <span className="font-medium">{new Date(userSubscription.endDate).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-gray-400 mt-2">
                  Ви маєте доступ до всіх переваг цієї підписки на сервері.
                </p>
              </div>
            ) : (
              <div>
                <p className="mb-2">
                  У вас немає активної підписки. Ви використовуєте безкоштовний акаунт.
                </p>
                <Link href="/subscriptions" className="text-blue-400 hover:underline">
                  Переглянути доступні підписки →
                </Link>
              </div>
            )}
          </div>
      </div>
    </div>
  );
}