import { prisma } from '@/lib/prisma';
import Image from 'next/image';

export default async function StaffList() {
  const staff = await prisma.staff.findMany();

  return (
    <div className="max-w-4xl w-full">
      <h2 className="text-4xl font-bold mb-10 text-center">Наш персонал</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {staff.map((member) => {
          const avatarUrl = `https://mc-heads.net/avatar/${member.name}/64`;
          return (
            <div key={member.id} className="bg-zinc-800 p-6 rounded-xl flex items-center gap-4">
              <Image
                src={avatarUrl}
                alt={member.name}
                width={64}
                height={64}
                className="rounded"
              />
              <div>
                <h3 className="text-xl font-semibold">
                  {member.role}: {member.name}
                </h3>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
