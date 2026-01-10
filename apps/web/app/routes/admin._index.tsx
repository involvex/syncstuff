import { json, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";
import {
  Button,
  Card,
  StatCard,
  StatusBadge,
  Text,
  View,
  XStack,
  YStack,
} from "@syncstuff/ui";

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
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
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
      color: "$green10",
      percentage:
        stats.userCount > 0
          ? Math.round((stats.activeUserCount / stats.userCount) * 100)
          : 0,
    },
    {
      label: "Suspended",
      value: stats.suspendedUserCount,
      color: "$red10",
      percentage:
        stats.userCount > 0
          ? Math.round((stats.suspendedUserCount / stats.userCount) * 100)
          : 0,
    },
    {
      label: "Pending",
      value: stats.pendingUserCount,
      color: "$yellow10",
      percentage:
        stats.userCount > 0
          ? Math.round((stats.pendingUserCount / stats.userCount) * 100)
          : 0,
    },
  ];

  return (
    <YStack space="$6">
      <YStack>
        <Text fontSize="$8" fontWeight="bold">
          Admin Overview
        </Text>
        <Text color="$colorSubtitle">
          Monitor and manage your Syncstuff instance
        </Text>
      </YStack>

      {/* System Health */}
      <Card elevate bordered padded>
        <XStack justifyContent="space-between" alignItems="center">
          <XStack space="$4" alignItems="center">
            <View
              padding="$2"
              borderRadius="$full"
              backgroundColor={
                stats.systemHealth === "healthy" ? "$green4" : "$red4"
              }
            >
              <View
                width={10}
                height={10}
                borderRadius="$full"
                backgroundColor={
                  stats.systemHealth === "healthy" ? "$green10" : "$red10"
                }
              />
            </View>
            <YStack>
              <Text fontWeight="bold">System Status</Text>
              <Text fontSize="$2" color="$colorSubtitle">
                {stats.systemHealth === "healthy"
                  ? "All systems operational"
                  : "Issues detected"}
              </Text>
            </YStack>
          </XStack>
          <StatusBadge
            status={stats.systemHealth === "healthy" ? "success" : "error"}
          >
            {stats.systemHealth === "healthy" ? "Healthy" : "Degraded"}
          </StatusBadge>
        </XStack>
      </Card>

      {/* Stats Cards */}
      <XStack space="$4" flexWrap="wrap">
        {statCards.map(card => (
          <StatCard
            key={card.name}
            title={card.name}
            value={card.stat}
            icon={card.icon}
          />
        ))}
      </XStack>

      <XStack space="$6" flexWrap="wrap">
        {/* User Status Breakdown */}
        <Card flex={2} minWidth={400} elevate bordered padded>
          <YStack space="$4">
            <Text fontSize="$4" fontWeight="bold">
              User Status Breakdown
            </Text>
            <YStack space="$4">
              {userStatusBreakdown.map(item => (
                <YStack key={item.label} space="$1">
                  <XStack justifyContent="space-between">
                    <Text fontWeight="medium">{item.label}</Text>
                    <Text fontSize="$2" color="$colorSubtitle">
                      {item.value} ({item.percentage}%)
                    </Text>
                  </XStack>
                  <View
                    height={8}
                    width="100%"
                    backgroundColor="$backgroundFocus"
                    borderRadius="$full"
                    overflow="hidden"
                  >
                    <View
                      height="100%"
                      width={`${item.percentage}%`}
                      backgroundColor={item.color as any}
                    />
                  </View>
                </YStack>
              ))}
            </YStack>
          </YStack>
        </Card>

        {/* Quick Actions */}
        <Card flex={1} minWidth={300} elevate bordered padded>
          <YStack space="$4">
            <Text fontSize="$4" fontWeight="bold">
              Quick Actions
            </Text>
            <YStack space="$3">
              <Link to="/admin/users" style={{ textDecoration: "none" }}>
                <Button
                  width="100%"
                  justifyContent="flex-start"
                  icon={<Text fontSize="$5">👥</Text>}
                >
                  Manage Users
                </Button>
              </Link>
              <Button
                width="100%"
                justifyContent="flex-start"
                variant="outlined"
                icon={<Text fontSize="$5">⚙️</Text>}
              >
                System Settings
              </Button>
              <Button
                width="100%"
                justifyContent="flex-start"
                variant="outlined"
                icon={<Text fontSize="$5">📋</Text>}
              >
                View Logs
              </Button>
            </YStack>
          </YStack>
        </Card>
      </XStack>
    </YStack>
  );
}
