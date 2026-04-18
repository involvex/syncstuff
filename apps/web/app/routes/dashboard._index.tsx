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

interface UserData {
  id: string;
  email: string;
  username: string;
  full_name: string | null;
  role: string;
  status: string;
  created_at: string;
}

export async function loader({ request, context }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("userId");

  let user: UserData | null = null;
  const stats = {
    totalFiles: 0,
    storageUsed: "0 GB",
    syncsToday: 0,
  };

  // Check if DB is available (it might not be in some local dev modes without wrangler)
  if (context.cloudflare?.env?.syncstuff_db) {
    const db = context.cloudflare.env.syncstuff_db;
    try {
      // Fetch user details
      user = await db
        .prepare(
          "SELECT email, username, full_name, role, status, created_at FROM users WHERE id = ?",
        )
        .bind(userId)
        .first<UserData>();
    } catch (e) {
      console.error("Database error:", e);
    }
  } else {
    // Mock user for local dev if DB is missing
    console.warn("Database binding not found, using mock data");
    user = {
      id: "mock-user-id",
      username: "mockuser",
      email: "mock@example.com",
      full_name: "Mock User",
      role: "admin",
      status: "active",
      created_at: new Date().toISOString(),
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
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
        </svg>
      ),
      color: "text-primary",
      bgColor: "bg-surface-variant",
      href: "#",
    },
    {
      name: "Storage Used",
      value: stats.storageUsed,
      icon: (
        <svg
          className="size-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
        </svg>
      ),
      color: "text-primary",
      bgColor: "bg-surface-variant",
      href: "#",
    },
    {
      name: "Syncs Today",
      value: stats.syncsToday,
      icon: (
        <svg
          className="size-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
        </svg>
      ),
      color: "text-success",
      bgColor: "bg-surface-variant",
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
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
        </svg>
      ),
      color: "bg-primary hover:bg-primary/90 text-primary-foreground",
    },
    {
      name: "Upload Files",
      description: "Securely upload to cloud",
      href: "#",
      icon: (
        <svg
          className="size-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
        </svg>
      ),
      color: "bg-secondary hover:bg-secondary/90 text-secondary-foreground",
    },
    {
      name: "Device Settings",
      description: "Manage paired devices",
      href: "/dashboard/settings",
      icon: (
        <svg
          className="size-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
        </svg>
      ),
      color: "bg-surface-variant hover:bg-surface-variant/80 text-on-surface",
    },
  ];

  return (
    <YStack className="text-on-background" space="$8">
      {/* Stats Cards */}
      <XStack flexWrap="wrap" space="$6">
        {statCards.map(card => (
          <StatCard
            icon={card.icon}
            key={card.name}
            title={card.name}
            value={card.value}
          />
        ))}
      </XStack>

      <XStack flexWrap="wrap" space="$8">
        {/* User Profile Card */}
        <Card
          bordered
          className="bg-surface border-border"
          elevate
          flex={1}
          minWidth={300}
        >
          <View padding="$4">
            <XStack alignItems="center" justifyContent="space-between">
              <Text className="text-on-surface" fontSize="$4" fontWeight="bold">
                Account Overview
              </Text>
              <Link style={{ textDecoration: "none" }} to="/dashboard/settings">
                <Button size="sm" variant="outline">
                  Edit
                </Button>
              </Link>
            </XStack>
          </View>

          <YStack padding="$4" space="$5">
            <XStack alignItems="center" space="$4">
              <View
                alignItems="center"
                borderRadius="$4"
                className="bg-primary"
                height={48}
                justifyContent="center"
                width={48}
              >
                <Text
                  className="text-primary-foreground"
                  fontSize="$6"
                  fontWeight="bold"
                >
                  {user?.username?.charAt(0).toUpperCase() || "U"}
                </Text>
              </View>
              <YStack>
                <Text className="text-on-surface" fontWeight="bold">
                  {user?.full_name || user?.username || "Sync User"}
                </Text>
                <Text className="text-color-subtitle" fontSize="$2">
                  {user?.email}
                </Text>
              </YStack>
            </XStack>

            <XStack space="$4">
              <YStack
                borderRadius="$3"
                className="bg-surface-variant"
                flex={1}
                padding="$4"
              >
                <Text
                  className="text-color-subtitle"
                  fontSize="$1"
                  textTransform="uppercase"
                >
                  Status
                </Text>
                <Text className="text-primary" fontWeight="bold">
                  {user?.status || "active"}
                </Text>
              </YStack>
              <YStack
                borderRadius="$3"
                className="bg-surface-variant"
                flex={1}
                padding="$4"
              >
                <Text
                  className="text-color-subtitle"
                  fontSize="$1"
                  textTransform="uppercase"
                >
                  Role
                </Text>
                <Text
                  className="text-primary"
                  fontWeight="bold"
                  textTransform="capitalize"
                >
                  {user?.role || "user"}
                </Text>
              </YStack>
            </XStack>
          </YStack>
        </Card>

        {/* Recent Activity Card */}
        <Card
          bordered
          className="bg-surface border-border"
          elevate
          flex={2}
          minWidth={400}
        >
          <View padding="$4">
            <XStack alignItems="center" justifyContent="space-between">
              <Text className="text-on-surface" fontSize="$4" fontWeight="bold">
                Recent Activity
              </Text>
              <Button size="sm" variant="outline">
                View All
              </Button>
            </XStack>
          </View>

          <YStack separator={<Separator className="bg-border" />}>
            {activity.length === 0 ? (
              <YStack alignItems="center" padding="$4">
                <Text className="text-color-subtitle">
                  No activity logged yet
                </Text>
              </YStack>
            ) : (
              (activity as ActivityItem[]).map(item => (
                <XStack
                  alignItems="center"
                  className="hover:bg-surface-hover transition-colors"
                  key={item.id}
                  padding="$4"
                  space="$4"
                >
                  <Text fontSize="$6">{item.icon || "📋"}</Text>
                  <YStack flex={1}>
                    <Text className="text-on-surface" fontWeight="bold">
                      {item.description}
                    </Text>
                    <Text
                      className="text-color-subtitle"
                      fontSize="$2"
                      suppressHydrationWarning
                    >
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
        <Text
          className="text-on-surface"
          fontSize="$4"
          fontWeight="bold"
          paddingHorizontal="$1"
        >
          Instant Operations
        </Text>
        <XStack flexWrap="wrap" space="$4">
          {quickActions.map(action => (
            <Link
              key={action.name}
              style={{ textDecoration: "none", flex: 1, minWidth: 200 }}
              to={action.href}
            >
              <Card
                bordered
                className="hover:border-primary bg-surface border-border cursor-pointer p-4 transition-colors"
              >
                <YStack space="$3">
                  <View
                    alignItems="center"
                    borderRadius="$3"
                    className={action.color}
                    height={48}
                    justifyContent="center"
                    width={48}
                  >
                    {action.icon}
                  </View>
                  <YStack>
                    <Text className="text-on-surface" fontWeight="bold">
                      {action.name}
                    </Text>
                    <Text className="text-color-subtitle" fontSize="$2">
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
