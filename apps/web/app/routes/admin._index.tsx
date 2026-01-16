import { json, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";
import { Badge, Button, Card, CardContent, StatCard } from "~/components/ui";

export async function loader({ context }: LoaderFunctionArgs) {
  let userCount = 0;
  let activeUserCount = 0;
  let suspendedUserCount = 0;
  let pendingUserCount = 0;

  if (context.cloudflare?.env?.syncstuff_db) {
    const db = context.cloudflare.env.syncstuff_db;
    try {
      // Fetch basic stats

      const userCountResult: any = await db
        .prepare("SELECT COUNT(*) as count FROM users")
        .first();
      userCount = userCountResult?.count || 0;

      const activeUserCountResult: any = await db
        .prepare("SELECT COUNT(*) as count FROM users WHERE status = 'active'")
        .first();
      activeUserCount = activeUserCountResult?.count || 0;

      const suspendedUserCountResult: any = await db
        .prepare(
          "SELECT COUNT(*) as count FROM users WHERE status = 'suspended'",
        )
        .first();
      suspendedUserCount = suspendedUserCountResult?.count || 0;

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
      icon: (
        <svg
          className="size-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
        </svg>
      ),
      href: "/admin/users",
    },
    {
      name: "Active Users",
      stat: stats.activeUserCount,
      icon: (
        <svg
          className="size-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
        </svg>
      ),
      href: "/admin/users?status=active",
    },
    {
      name: "Storage Used",
      stat: stats.totalStorageUsed,
      icon: (
        <svg
          className="size-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
        </svg>
      ),
      href: "#",
    },
    {
      name: "Total Files",
      stat: stats.totalFiles,
      icon: (
        <svg
          className="size-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
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
      color: "bg-green-500 dark:bg-green-400",
      percentage:
        stats.userCount > 0
          ? Math.round((stats.activeUserCount / stats.userCount) * 100)
          : 0,
    },
    {
      label: "Suspended",
      value: stats.suspendedUserCount,
      color: "bg-red-500 dark:bg-red-400",
      percentage:
        stats.userCount > 0
          ? Math.round((stats.suspendedUserCount / stats.userCount) * 100)
          : 0,
    },
    {
      label: "Pending",
      value: stats.pendingUserCount,
      color: "bg-yellow-500 dark:bg-yellow-400",
      percentage:
        stats.userCount > 0
          ? Math.round((stats.pendingUserCount / stats.userCount) * 100)
          : 0,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-on-surface">Admin Overview</h1>
        <p className="text-color-subtitle">
          Monitor and manage your Syncstuff instance
        </p>
      </div>

      {/* System Health */}
      <Card bordered elevate className="bg-surface border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full p-2 ${
                  stats.systemHealth === "healthy"
                    ? "bg-green-100 dark:bg-green-900/30"
                    : "bg-red-100 dark:bg-red-900/30"
                }`}
              >
                <div
                  className={`h-2.5 w-2.5 rounded-full ${
                    stats.systemHealth === "healthy"
                      ? "bg-green-500"
                      : "bg-red-500"
                  }`}
                />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-on-surface">System Status</span>
                <span className="text-sm text-color-subtitle">
                  {stats.systemHealth === "healthy"
                    ? "All systems operational"
                    : "Issues detected"}
                </span>
              </div>
            </div>
            <Badge
              variant={
                stats.systemHealth === "healthy" ? "success" : "destructive"
              }
            >
              {stats.systemHealth === "healthy" ? "Healthy" : "Degraded"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <StatCard
            key={card.name}
            icon={card.icon}
            title={card.name}
            value={card.stat}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* User Status Breakdown */}
        <Card bordered elevate className="bg-surface border-border lg:col-span-2">
          <CardContent className="p-6">
            <h3 className="mb-4 text-lg font-bold text-on-surface">
              User Status Breakdown
            </h3>
            <div className="flex flex-col gap-4">
              {userStatusBreakdown.map((item) => (
                <div key={item.label} className="flex flex-col gap-1">
                  <div className="flex justify-between">
                    <span className="font-medium text-on-surface">
                      {item.label}
                    </span>
                    <span className="text-sm text-color-subtitle">
                      {item.value} ({item.percentage}%)
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-surface-variant">
                    <div
                      className={`h-full ${item.color}`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card bordered elevate className="bg-surface border-border">
          <CardContent className="p-6">
            <h3 className="mb-4 text-lg font-bold text-on-surface">
              Quick Actions
            </h3>
            <div className="flex flex-col gap-3">
              <Link to="/admin/users" className="w-full">
                <Button className="w-full justify-start gap-2">
                  <span className="text-xl">👥</span>
                  Manage Users
                </Button>
              </Link>
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
              >
                <span className="text-xl">⚙️</span>
                System Settings
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
              >
                <span className="text-xl">📋</span>
                View Logs
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
