import { json, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";

export async function loader({ context }: LoaderFunctionArgs) {
  let userCount = 0;
  let activeUserCount = 0;
  let suspendedUserCount = 0;
  let pendingUserCount = 0;

  if (
    context.cloudflare &&
    context.cloudflare.env &&
    context.cloudflare.env.syncstuff_db
  ) {
    const db = context.cloudflare.env.syncstuff_db;
    try {
      // Fetch basic stats
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const userCountResult: any = await db
        .prepare("SELECT COUNT(*) as count FROM users")
        .first();
      userCount = userCountResult?.count || 0;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const activeUserCountResult: any = await db
        .prepare("SELECT COUNT(*) as count FROM users WHERE status = 'active'")
        .first();
      activeUserCount = activeUserCountResult?.count || 0;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const suspendedUserCountResult: any = await db
        .prepare(
          "SELECT COUNT(*) as count FROM users WHERE status = 'suspended'",
        )
        .first();
      suspendedUserCount = suspendedUserCountResult?.count || 0;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pendingUserCountResult: any = await db
        .prepare("SELECT COUNT(*) as count FROM users WHERE status = 'pending'")
        .first();
      pendingUserCount = pendingUserCountResult?.count || 0;
    } catch (error) {
      console.error("Database error in admin loader:", error);
    }
  } else {
    console.warn("Database binding not found in admin._index, using mock data");
    userCount = 10;
    activeUserCount = 7;
    suspendedUserCount = 2;
    pendingUserCount = 1;
  }

  // Mock other stats since we don't have tables for everything yet
  const totalStorageUsed = "0 GB";
  const totalFiles = 0;
  const systemHealth = "healthy";

  return json({
    stats: {
      userCount,
      activeUserCount,
      suspendedUserCount,
      pendingUserCount,
      totalStorageUsed,
      totalFiles,
      systemHealth,
    },
  });
}

export default function AdminOverview() {
  const { stats } = useLoaderData<typeof loader>();

  const statCards = [
    {
      name: "Total Users",
      stat: stats.userCount,
      color: "bg-indigo-500",
      icon: (
        <svg
          className="size-6 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
      href: "/admin/users",
    },
    {
      name: "Active Users",
      stat: stats.activeUserCount,
      color: "bg-green-500",
      icon: (
        <svg
          className="size-6 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      href: "/admin/users?status=active",
    },
    {
      name: "Storage Used",
      stat: stats.totalStorageUsed,
      color: "bg-yellow-500",
      icon: (
        <svg
          className="size-6 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
          />
        </svg>
      ),
      href: "#",
    },
    {
      name: "Total Files",
      stat: stats.totalFiles,
      color: "bg-blue-500",
      icon: (
        <svg
          className="size-6 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
      href: "#",
    },
  ];

  const userStatusBreakdown = [
    {
      label: "Active",
      value: stats.activeUserCount,
      color: "bg-green-500",
      percentage:
        stats.userCount > 0
          ? Math.round((stats.activeUserCount / stats.userCount) * 100)
          : 0,
    },
    {
      label: "Suspended",
      value: stats.suspendedUserCount,
      color: "bg-red-500",
      percentage:
        stats.userCount > 0
          ? Math.round((stats.suspendedUserCount / stats.userCount) * 100)
          : 0,
    },
    {
      label: "Pending",
      value: stats.pendingUserCount,
      color: "bg-yellow-500",
      percentage:
        stats.userCount > 0
          ? Math.round((stats.pendingUserCount / stats.userCount) * 100)
          : 0,
    },
  ];

  const quickActions = [
    {
      name: "Manage Users",
      description: "View and manage all users",
      href: "/admin/users",
      icon: "👥",
    },
    {
      name: "System Settings",
      description: "Configure system settings",
      href: "#",
      icon: "⚙️",
    },
    {
      name: "View Logs",
      description: "Check system logs",
      href: "#",
      icon: "📋",
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Admin Overview
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Monitor and manage your Syncstuff instance
        </p>
      </div>

      {/* System Health */}
      <div className="mb-6 rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`rounded-full p-2 ${
                stats.systemHealth === "healthy"
                  ? "bg-green-100 dark:bg-green-900"
                  : "bg-red-100 dark:bg-red-900"
              }`}
            >
              {stats.systemHealth === "healthy" ? (
                <svg
                  className="size-5 text-green-600 dark:text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="size-5 text-red-600 dark:text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                System Status
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {stats.systemHealth === "healthy"
                  ? "All systems operational"
                  : "Issues detected"}
              </p>
            </div>
          </div>
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
              stats.systemHealth === "healthy"
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
            }`}
          >
            {stats.systemHealth === "healthy" ? "Healthy" : "Degraded"}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map(card => {
          const CardContent = (
            <div className="overflow-hidden rounded-lg bg-white shadow transition-shadow hover:shadow-md dark:bg-gray-800">
              <div className="p-5">
                <div className="flex items-center">
                  <div className={`shrink-0 rounded-md p-3 ${card.color}`}>
                    {card.icon}
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">
                        {card.name}
                      </dt>
                      <dd>
                        <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                          {String(card.stat)}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          );

          return card.href !== "#" ? (
            <Link key={card.name} to={card.href} className="block">
              {CardContent}
            </Link>
          ) : (
            <div key={card.name}>{CardContent}</div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* User Status Breakdown */}
        <div className="overflow-hidden rounded-lg bg-white shadow lg:col-span-2 dark:bg-gray-800">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="mb-4 text-base font-semibold leading-6 text-gray-900 dark:text-white">
              User Status Breakdown
            </h3>
            <div className="space-y-4">
              {userStatusBreakdown.map(item => (
                <div key={item.label}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {item.label}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {item.value} ({item.percentage}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className={`h-2.5 rounded-full ${item.color}`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="mb-4 text-base font-semibold leading-6 text-gray-900 dark:text-white">
              Quick Actions
            </h3>
            <div className="space-y-3">
              {quickActions.map(action => {
                const ActionContent = (
                  <div
                    className={`rounded-lg border border-gray-200 p-4 transition-colors dark:border-gray-700 ${
                      action.href !== "#"
                        ? "cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-600"
                        : "cursor-not-allowed opacity-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{action.icon}</div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {action.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );

                return action.href !== "#" ? (
                  <Link key={action.name} to={action.href}>
                    {ActionContent}
                  </Link>
                ) : (
                  <div key={action.name}>{ActionContent}</div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
