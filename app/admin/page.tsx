import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export default async function AdminPage() {
  //await requireAdmin();
  
  const config = await prisma.siteConfig.findFirst();
  const staff = await prisma.staff.findMany();
  const subscriptions = await prisma.subscription.findMany();

  return (
    <div className="container mx-auto p-6 bg-zinc-900 text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>

      {/* Site Config Section */}
      <div className="mb-12 bg-zinc-800 p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Site Configuration</h2>
        <form action={async (formData: FormData) => {
          "use server";
          await prisma.siteConfig.upsert({
            where: { id: config?.id || "" },
            update: {
              serverIP: formData.get("serverIP") as string,
              youtubeUrl: formData.get("youtubeUrl") as string,
              description: formData.get("description") as string,
              links: JSON.parse(formData.get("links") as string),
            },
            create: {
              serverIP: formData.get("serverIP") as string,
              youtubeUrl: formData.get("youtubeUrl") as string,
              description: formData.get("description") as string,
              links: JSON.parse(formData.get("links") as string),
            },
          });
          revalidatePath("/");
        }}>
          <label className="block mb-4">
            Description:
            <textarea
              name="description"
              defaultValue={config?.description || ""}
              className="w-full p-2 bg-gray-800 text-white rounded mt-1"
              rows={3}
            />
          </label>
          <label className="block mb-2 mt-4">
            YouTube URL:
            <input
              type="text"
              name="youtubeUrl"
              defaultValue={config?.youtubeUrl || ""}
              className="w-full p-2 bg-gray-800 text-white rounded mt-1"
            />
          </label>
          <label className="block mb-2 mt-4">
            Server IP:
            <input
              type="text"
              name="serverIP"
              defaultValue={config?.serverIP || ""}
              className="w-full p-2 bg-gray-800 text-white rounded mt-1"
            />
          </label>
          <label className="block mb-4 mt-4">
            Links (JSON array):
            <textarea
              name="links"
              defaultValue={JSON.stringify(config?.links || [], null, 2)}
              className="w-full p-2 bg-gray-800 text-white rounded mt-1"
              rows={4}
            />
          </label>
          <button
            type="submit"
            className="bg-green-600 px-4 py-2 rounded hover:bg-green-700"
          >
            Save Changes
          </button>
        </form>
      </div>

      {/* Subscriptions Section */}
      <div className="mb-12 bg-zinc-800 p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Subscriptions</h2>
        <ul className="mb-6 space-y-3">
          {subscriptions.map((subscription) => (
            <li key={subscription.id} className="bg-zinc-700 p-4 rounded">
              <div className="flex justify-between">
                <div>
                  <p className="font-bold text-lg">{subscription.name}</p>
                  <p className="text-gray-300">{subscription.description}</p>
                  <p className="text-sm text-gray-400">
                    {subscription.price}₴ / {subscription.durationDays} днів
                  </p>
                </div>
                <div className="flex items-start">
                  <span className={`px-2 py-1 rounded text-xs ${subscription.active ? 'bg-green-600' : 'bg-red-600'}`}>
                    {subscription.active ? 'Активна' : 'Неактивна'}
                  </span>
                  <form action={async () => {
                    "use server";
                    await prisma.subscription.update({
                      where: { id: subscription.id },
                      data: { active: !subscription.active },
                    });
                    revalidatePath("/admin");
                  }}>
                    <button className="ml-2 px-2 py-1 bg-blue-600 rounded text-xs hover:bg-blue-700">
                      {subscription.active ? 'Деактивувати' : 'Активувати'}
                    </button>
                  </form>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <form action={async (formData: FormData) => {
          "use server";
          await prisma.subscription.create({
            data: {
              name: formData.get("name") as string,
              description: formData.get("description") as string,
              price: parseFloat(formData.get("price") as string),
              durationDays: parseInt(formData.get("durationDays") as string),
              active: true,
            },
          });
          revalidatePath("/admin");
        }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              Назва:
              <input
                type="text"
                name="name"
                className="w-full p-2 bg-gray-800 text-white rounded mt-1"
                required
              />
            </label>
            <label className="block">
              Ціна (₴):
              <input
                type="number"
                step="0.01"
                name="price"
                className="w-full p-2 bg-gray-800 text-white rounded mt-1"
                required
              />
            </label>
            <label className="block">
              Тривалість (днів):
              <input
                type="number"
                name="durationDays"
                className="w-full p-2 bg-gray-800 text-white rounded mt-1"
                required
              />
            </label>
            <label className="block md:col-span-2">
              Опис:
              <textarea
                name="description"
                className="w-full p-2 bg-gray-800 text-white rounded mt-1"
                rows={2}
                required
              />
            </label>
          </div>
          <button
            type="submit"
            className="mt-4 bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
          >
            Додати підписку
          </button>
        </form>
      </div>

      {/* Staff Section */}
      <div className="bg-zinc-800 p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Staff Members</h2>
        <ul className="mb-6">
          {staff.map((member) => (
            <li key={member.id} className="bg-zinc-700 p-4 rounded mb-2">
              <p>
                <strong>{member.name}</strong> — {member.role}
              </p>
              <p className="text-sm text-gray-400">{member.skinUrl}</p>
            </li>
          ))}
        </ul>

        <form action={async (formData: FormData) => {
          "use server";
          await prisma.staff.create({
            data: {
              name: formData.get("name") as string,
              role: formData.get("role") as string,
              skinUrl: formData.get("skinUrl") as string,
            },
          });
          revalidatePath("/admin");
        }}>
          <label className="block mb-2">
            Name:
            <input
              type="text"
              name="name"
              className="w-full p-2 bg-gray-800 text-white rounded mt-1"
            />
          </label>
          <label className="block mb-2 mt-4">
            Role:
            <input
              type="text"
              name="role"
              className="w-full p-2 bg-gray-800 text-white rounded mt-1"
            />
          </label>
          <label className="block mb-4 mt-4">
            Skin URL:
            <input
              type="text"
              name="skinUrl"
              className="w-full p-2 bg-gray-800 text-white rounded mt-1"
            />
          </label>
          <button
            type="submit"
            className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
          >
            Add Staff
          </button>
        </form>
      </div>
    </div>
  );
}