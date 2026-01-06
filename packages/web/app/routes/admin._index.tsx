import { json, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";

export async function loader({ context }: LoaderFunctionArgs) {
  const db = context.cloudflare.env.syncstuff_db;

  // Fetch basic stats
  const userCount = await db
    .prepare("SELECT COUNT(*) as count FROM users")
    .first("count");
  const activeUserCount = await db
    .prepare("SELECT COUNT(*) as count FROM users WHERE status = 'active'")
    .first("count");

  // Mock other stats since we don't have tables for everything yet
  const totalStorageUsed = "0 GB";
  const totalFiles = 0;

  return json({
    stats: { userCount, activeUserCount, totalStorageUsed, totalFiles },
  });
}

export default function AdminOverview() {
  const { stats } = useLoaderData<typeof loader>();

  const cards = [
    { name: "Total Users", stat: stats.userCount, color: "bg-indigo-500" },
    {
      name: "Active Users",
      stat: stats.activeUserCount,
      color: "bg-green-500",
    },
    {
      name: "Storage Used",
      stat: stats.totalStorageUsed,
      color: "bg-yellow-500",
    },
    { name: "Total Files", stat: stats.totalFiles, color: "bg-blue-500" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
        Overview
      </h1>
      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(card => (
          <div
            key={card.name}
            className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className={`shrink-0 rounded-md p-3 ${card.color}`}>
                  {/* Icon placeholder */}
                  <div className="size-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">
                      {card.name}
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900 dark:text-white">
                        {String(card.stat)}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
