import CopyIPButton from '@/components/CopyIPButton';
import StaffList from '@/components/StaffList';
import { prisma } from '@/lib/prisma';

async function HomePage() {
  const siteConfig = await prisma.siteConfig.findFirst();
  return (
    <section className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-black via-zinc-900 to-black text-white py-20 px-4">
      <div className="text-center mb-20">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6">Ласкаво просимо!</h1>
        <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-xl mx-auto">
        {siteConfig?.description || "Приєднуйся до нашого Minecraft-світу, де ти можеш будувати, досліджувати та грати разом з друзями."}
      </p>
      <div className="flex flex-col md:flex-row justify-center gap-4">
        <CopyIPButton serverIP={siteConfig?.serverIP} />
        <a
          href={siteConfig?.youtubeUrl || "https://youtube.com/yourvideo"}
          target="_blank"
          className="bg-red-600 hover:bg-red-500 text-white px-5 py-3 rounded-lg text-base font-semibold transition"
        >
          Переглянути відео
        </a>
      </div>
      </div>

      <div className="max-w-5xl w-full mb-20">
        <h2 className="text-4xl font-bold mb-10 text-center">Переваги сервера</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="bg-zinc-800 p-6 rounded-xl">
            <h3 className="text-xl font-semibold mb-2">Унікальні режими гри</h3>
            <p className="text-gray-400">Насолоджуйся кастомними міні-іграми та пригодами, яких немає на інших серверах.</p>
          </div>
          <div className="bg-zinc-800 p-6 rounded-xl">
            <h3 className="text-xl font-semibold mb-2">Активна спільнота</h3>
            <p className="text-gray-400">Наш Discord сервер завжди активний — знайомся, спілкуйся, грай!</p>
          </div>
          <div className="bg-zinc-800 p-6 rounded-xl">
            <h3 className="text-xl font-semibold mb-2">Стабільна робота</h3>
            <p className="text-gray-400">Потужний хостинг та оптимізована інфраструктура для гри без лагів.</p>
          </div>
        </div>
      </div>

      <StaffList />

      <div className="max-w-6xl w-full">
        <h2 className="text-4xl font-bold mb-10 text-center">Про сервер</h2>
        <p className="text-gray-400 text-center max-w-3xl mx-auto mb-10">
          Наш сервер — це результат роботи відданої команди, яка прагне створити ідеальне місце для гри кожного гравця. Ми постійно додаємо нові можливості, слухаємо спільноту та робимо усе, щоб гра приносила лише задоволення.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-zinc-800 p-6 rounded-xl">
            <h3 className="text-xl font-semibold mb-2">Захист від шахраїв</h3>
            <p className="text-gray-400">Всі платежі та акаунти захищені сучасними технологіями безпеки.</p>
          </div>
          <div className="bg-zinc-800 p-6 rounded-xl">
            <h3 className="text-xl font-semibold mb-2">Івенти та конкурси</h3>
            <p className="text-gray-400">Регулярно проводимо цікаві заходи з подарунками.</p>
          </div>
          <div className="bg-zinc-800 p-6 rounded-xl">
            <h3 className="text-xl font-semibold mb-2">Підтримка 24/7</h3>
            <p className="text-gray-400">Команда підтримки завжди готова допомогти.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomePage;
