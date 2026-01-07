import { json, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";
import { getSession } from "~/services/session.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("userId");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let user: any = null;
  const stats = {
    totalFiles: 0,
    storageUsed: "0 GB",
    syncsToday: 0,
  };

  // Check if DB is available (it might not be in some local dev modes without wrangler)
  if (
    context.cloudflare &&
    context.cloudflare.env &&
    context.cloudflare.env.syncstuff_db
  ) {
    const db = context.cloudflare.env.syncstuff_db;
    try {
      // Fetch user details
      user = await db
        .prepare(
          "SELECT email, username, full_name, role, status, created_at FROM users WHERE id = ?",
        )
        .bind(userId)
        .first();
    } catch (e) {
      console.error("Database error:", e);
    }
  } else {
    // Mock user for local dev if DB is missing
    console.warn("Database binding not found, using mock data");
    user = {
      username: "mockuser",
      email: "mock@example.com",
      full_name: "Mock User",
      role: "admin",
      status: "active",
      created_at: Date.now(),
    };
  }

  // Fetch recent activity (mock for now as we don't have activity logs yet)
  const activity = [
    {
      id: 1,
      type: "login",
      description: "Logged in from Web",
      date: new Date().toISOString(),
      icon: "🔐",
    },
    {
      id: 2,
      type: "sync",
      description: "Synced files from GitHub",
      date: new Date(Date.now() - 3600000).toISOString(),
      icon: "🔄",
    },
    {
      id: 3,
      type: "file",
      description: "Uploaded 5 new files",
      date: new Date(Date.now() - 7200000).toISOString(),
      icon: "📁",
    },
  ];

  return json({ user, activity, stats });
}

export default function DashboardIndex() {
  const { user, activity, stats } = useLoaderData<typeof loader>();

  const statCards = [
    {
      name: "Total Files",
      value: stats.totalFiles,
      icon: "📁",
      color: "bg-blue-500",
      href: "#",
    },
    {
      name: "Storage Used",
      value: stats.storageUsed,
      icon: "💾",
      color: "bg-purple-500",
      href: "#",
    },
    {
      name: "Syncs Today",
      value: stats.syncsToday,
      icon: "🔄",
      color: "bg-green-500",
      href: "#",
    },
  ];

  const quickActions = [
    {
      name: "Sync Files",
      description: "Start a new sync",
      href: "#",
      icon: "🔄",
      color: "bg-indigo-600 hover:bg-indigo-700",
    },
    {
      name: "Upload Files",
      description: "Upload new files",
      href: "#",
      icon: "📤",
      color: "bg-green-600 hover:bg-green-700",
    },
    {
      name: "View Settings",
      description: "Manage your account",
      href: "/dashboard/settings",
      icon: "⚙️",
      color: "bg-gray-600 hover:bg-gray-700",
    },
  ];

  return (
    <div className="px-4 py-6 sm:px-0">
      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map(card => (
          <div
            key={card.name}
            className="overflow-hidden rounded-lg bg-white shadow transition-shadow hover:shadow-md dark:bg-gray-800"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div
                  className={`shrink-0 rounded-md p-3 ${card.color} text-2xl text-white`}
                >
                  {card.icon}
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">
                      {card.name}
                    </dt>
                    <dd>
                      <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                        {String(card.value)}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* User Profile Card */}
        <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                Profile
              </h3>
              <Link
                to="/dashboard/settings"
                className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
              >
                Edit
              </Link>
            </div>
            <div className="mt-5 space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Username
                </p>
                <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                  {user?.username || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Email
                </p>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {user?.email}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Status
                </p>
                <span
                  className={`mt-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    user?.status === "active"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  }`}
                >
                  {user?.status || "unknown"}
                </span>
              </div>
              {user?.full_name && (
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Full Name
                  </p>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {user.full_name}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity Card */}
        <div className="overflow-hidden rounded-lg bg-white shadow lg:col-span-2 dark:bg-gray-800">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-white">
              Recent Activity
            </h3>
            <div className="mt-5 flow-root">
              {activity.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No recent activity
                  </p>
                </div>
              ) : (
                <ul className="-my-5 divide-y divide-gray-200 dark:divide-gray-700">
                  {activity.map(
                    (item: {
                      id: number;
                      description: string;
                      date: string;
                      icon?: string;
                    }) => (
                      <li key={item.id} className="py-4">
                        <div className="flex items-center space-x-4">
                          <div className="shrink-0 text-2xl">
                            {item.icon || "📋"}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                              {item.description}
                            </p>
                            <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                              {new Date(item.date).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </li>
                    ),
                  )}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h3 className="mb-4 text-base font-semibold leading-6 text-gray-900 dark:text-white">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {quickActions.map(action => (
            <Link
              key={action.name}
              to={action.href}
              className={`relative flex items-center space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm transition-colors focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:border-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600 ${
                action.href === "#" ? "cursor-not-allowed opacity-50" : ""
              }`}
            >
              <div className="shrink-0 text-3xl">{action.icon}</div>
              <div className="min-w-0 flex-1">
                <span className="absolute inset-0" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {action.name}
                </p>
                <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                  {action.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
