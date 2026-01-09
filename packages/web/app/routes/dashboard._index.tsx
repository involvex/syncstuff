import { json, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";
import { getSession } from "~/services/session.server";

interface ActivityItem {
  id: number;
  type: string;
  description: string;
  date: string;
  icon: string;
}

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
      icon: (
        <svg
          className="size-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
          />
        </svg>
      ),
      color: "text-primary",
      bgColor: "bg-surfaceVariant",
      href: "#",
    },
    {
      name: "Storage Used",
      value: stats.storageUsed,
      icon: (
        <svg
          className="size-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
      ),
      color: "text-primary",
      bgColor: "bg-surfaceVariant",
      href: "#",
    },
    {
      name: "Syncs Today",
      value: stats.syncsToday,
      icon: (
        <svg
          className="size-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      ),
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      href: "#",
    },
  ];

  const quickActions = [
    {
      name: "Sync Files",
      description: "Start a new sync session",
      href: "#",
      icon: (
        <svg
          className="size-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
          />
        </svg>
      ),
      color:
        "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600",
    },
    {
      name: "Upload Files",
      description: "Securely upload to cloud",
      href: "#",
      icon: (
        <svg
          className="size-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
      ),
      color: "bg-primary hover:bg-primary/90",
    },
    {
      name: "Device Settings",
      description: "Manage paired devices",
      href: "/dashboard/settings",
      icon: (
        <svg
          className="size-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      ),
      color:
        "bg-gray-700 hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map(card => (
          <div
            key={card.name}
            className="group border-outlineVariant bg-surface hover:border-outlineVariant overflow-hidden rounded-2xl border p-6 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex items-center space-x-5">
              <div
                className={`shrink-0 rounded-xl p-3 ${card.bgColor} ${card.color} transition-transform group-hover:scale-110`}
              >
                {card.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-onSurfaceVariant truncate text-sm font-medium">
                  {card.name}
                </p>
                <h4 className="text-onSurface mt-1 text-2xl font-bold">
                  {String(card.value)}
                </h4>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* User Profile Card */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="border-outlineVariant bg-surfaceVariant/50 flex items-center justify-between border-b px-6 py-4">
            <h3 className="text-onSurfaceVariant text-sm font-bold tracking-wider uppercase">
              Account Overview
            </h3>
            <Link
              to="/dashboard/settings"
              className="rounded-lg p-1 transition-colors hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              <svg
                className="text-onSurfaceVariant size-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </Link>
          </div>
          <div className="space-y-5 p-6">
            <div className="flex items-center space-x-4 pb-2">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-xl font-bold text-white shadow-lg ring-4 ring-blue-50 dark:ring-blue-900/20">
                {user?.username?.charAt(0).toUpperCase() || "U"}
              </div>
              <div>
                <h4 className="leading-none font-bold text-gray-900 dark:text-white">
                  {user?.full_name || user?.username || "Sync Device"}
                </h4>
                <p className="text-onSurfaceVariant mt-1 text-sm">
                  {user?.email}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="bg-surfaceVariant rounded-xl p-3">
                <p className="text-onSurfaceVariant text-[10px] font-bold tracking-wider uppercase">
                  Status
                </p>
                <p className="text-primary mt-0.5 text-sm font-bold">
                  {user?.status || "active"}
                </p>
              </div>
              <div className="bg-surfaceVariant rounded-xl p-3">
                <p className="text-onSurfaceVariant text-[10px] font-bold tracking-wider uppercase">
                  Role
                </p>
                <p className="text-primary mt-0.5 text-sm font-bold capitalize">
                  {user?.role || "user"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Card */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm lg:col-span-2 dark:border-gray-700 dark:bg-gray-800">
          <div className="border-outlineVariant bg-surfaceVariant/50 flex items-center justify-between border-b px-6 py-4">
            <h3 className="text-onSurfaceVariant text-sm font-bold tracking-wider uppercase">
              Recent Activity Triggers
            </h3>
            <button className="text-primary text-xs font-bold hover:underline">
              View All
            </button>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {activity.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-onSurfaceVariant text-sm">
                  No activity logged yet
                </p>
              </div>
            ) : (
              (activity as ActivityItem[]).map(item => (
                <div
                  key={item.id}
                  className="group p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/30"
                >
                  <div className="flex items-center space-x-4">
                    <div className="border-outlineVariant bg-surfaceVariant group-hover:bg-surface flex size-10 items-center justify-center rounded-lg border text-xl shadow-sm transition-colors">
                      {item.icon || "📋"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-onSurface truncate text-sm font-semibold">
                        {item.description}
                      </p>
                      <p className="text-onSurfaceVariant mt-0.5 text-xs">
                        {new Date(item.date).toLocaleString([], {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    </div>
                    <div className="invisible group-hover:visible">
                      <svg
                        className="size-4 text-gray-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="mb-4 px-1 text-sm font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
          Instant Operations
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {quickActions.map(action => (
            <Link
              key={action.name}
              to={action.href}
              className={`group border-outlineVariant bg-surface hover:border-primary flex flex-col rounded-2xl border p-5 shadow-sm transition-all hover:shadow-lg ${
                action.href === "#" ? "cursor-not-allowed grayscale" : ""
              }`}
            >
              <div
                className={`flex size-12 items-center justify-center rounded-xl text-white shadow-md ${action.color} mb-4 transition-transform group-hover:scale-110`}
              >
                {action.icon}
              </div>
              <h4 className="text-onSurface text-base font-bold">
                {action.name}
              </h4>
              <p className="text-onSurfaceVariant mt-1 text-sm">
                {action.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
