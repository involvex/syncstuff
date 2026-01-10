import { json, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";
import {
  Button,
  Card,
  Separator,
  StatCard,
  Text,
  View,
  XStack,
  YStack,
} from "@syncstuff/ui";
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
    <YStack space="$8">
      {/* Stats Cards */}
      <XStack space="$6" flexWrap="wrap">
        {statCards.map(card => (
          <StatCard
            key={card.name}
            title={card.name}
            value={card.value}
            icon={card.icon}
          />
        ))}
      </XStack>

      <XStack space="$8" flexWrap="wrap">
        {/* User Profile Card */}
        <Card flex={1} minWidth={300} elevate bordered>
          <View padding="$4">
            <XStack justifyContent="space-between" alignItems="center">
              <Text fontSize="$4" fontWeight="bold">
                Account Overview
              </Text>
              <Link to="/dashboard/settings" style={{ textDecoration: "none" }}>
                <Button size="$2" variant="outlined">
                  Edit
                </Button>
              </Link>
            </XStack>
          </View>

          <YStack padding="$4" space="$5">
            <XStack space="$4" alignItems="center">
              <View
                width={48}
                height={48}
                borderRadius="$4"
                backgroundColor="$primary"
                alignItems="center"
                justifyContent="center"
              >
                <Text color="white" fontWeight="bold" fontSize="$6">
                  {user?.username?.charAt(0).toUpperCase() || "U"}
                </Text>
              </View>
              <YStack>
                <Text fontWeight="bold">
                  {user?.full_name || user?.username || "Sync User"}
                </Text>
                <Text color="$colorSubtitle" fontSize="$2">
                  {user?.email}
                </Text>
              </YStack>
            </XStack>

            <XStack space="$4">
              <YStack
                flex={1}
                padding="$4"
                backgroundColor="$backgroundFocus"
                borderRadius="$3"
              >
                <Text
                  fontSize="$1"
                  color="$colorSubtitle"
                  textTransform="uppercase"
                >
                  Status
                </Text>
                <Text fontWeight="bold" color="$primary">
                  {user?.status || "active"}
                </Text>
              </YStack>
              <YStack
                flex={1}
                padding="$4"
                backgroundColor="$backgroundFocus"
                borderRadius="$3"
              >
                <Text
                  fontSize="$1"
                  color="$colorSubtitle"
                  textTransform="uppercase"
                >
                  Role
                </Text>
                <Text
                  fontWeight="bold"
                  color="$primary"
                  textTransform="capitalize"
                >
                  {user?.role || "user"}
                </Text>
              </YStack>
            </XStack>
          </YStack>
        </Card>

        {/* Recent Activity Card */}
        <Card flex={2} minWidth={400} elevate bordered>
          <View padding="$4">
            <XStack justifyContent="space-between" alignItems="center">
              <Text fontSize="$4" fontWeight="bold">
                Recent Activity
              </Text>
              <Button size="$2" variant="outlined">
                View All
              </Button>
            </XStack>
          </View>

          <YStack separator={<Separator />}>
            {activity.length === 0 ? (
              <YStack padding="$4" alignItems="center">
                <Text color="$colorSubtitle">No activity logged yet</Text>
              </YStack>
            ) : (
              (activity as ActivityItem[]).map(item => (
                <XStack
                  key={item.id}
                  padding="$4"
                  space="$4"
                  alignItems="center"
                  hoverStyle={{ backgroundColor: "$backgroundHover" }}
                >
                  <Text fontSize="$6">{item.icon || "📋"}</Text>
                  <YStack flex={1}>
                    <Text fontWeight="bold">{item.description}</Text>
                    <Text color="$colorSubtitle" fontSize="$2">
                      {new Date(item.date).toLocaleString([], {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </Text>
                  </YStack>
                </XStack>
              ))
            )}
          </YStack>
        </Card>
      </XStack>

      {/* Quick Actions */}
      <YStack space="$4">
        <Text fontSize="$4" fontWeight="bold" paddingHorizontal="$1">
          Instant Operations
        </Text>
        <XStack space="$4" flexWrap="wrap">
          {quickActions.map(action => (
            <Link
              key={action.name}
              to={action.href}
              style={{ textDecoration: "none", flex: 1, minWidth: 200 }}
            >
              <Card
                elevate
                bordered
                padding="$4"
                hoverStyle={{ borderColor: "$primary" }}
                cursor={action.href === "#" ? "not-allowed" : "pointer"}
              >
                <YStack space="$3">
                  <View
                    width={48}
                    height={48}
                    borderRadius="$3"
                    backgroundColor="$primary"
                    alignItems="center"
                    justifyContent="center"
                  >
                    {action.icon}
                  </View>
                  <YStack>
                    <Text fontWeight="bold">{action.name}</Text>
                    <Text fontSize="$2" color="$colorSubtitle">
                      {action.description}
                    </Text>
                  </YStack>
                </YStack>
              </Card>
            </Link>
          ))}
        </XStack>
      </YStack>
    </YStack>
  );
}
