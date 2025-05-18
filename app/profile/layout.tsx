
export default function ProfileLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <div className="min-h-screen">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-2">Ваш Профіль</h1>
          <p className="text-zinc-400 mb-8">Керуйте своїми налаштуваннями та персональними даними</p>
          {children}
        </div>
      </div>
    );
  }