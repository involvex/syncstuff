import {
  type ActionFunctionArgs,
  json,
  type LoaderFunctionArgs,
} from "@remix-run/cloudflare";
import { Form, redirect, useLoaderData, useNavigation } from "@remix-run/react";
import {
  Card,
  Separator,
  StatusBadge,
  Text,
  View,
  XStack,
  YStack,
} from "@syncstuff/ui";
import { getSession } from "~/services/session.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");

  if (!token) {
    return redirect("/auth/login");
  }

  try {
    const API_URL =
      context.cloudflare.env.API_URL ||
      "https://syncstuff-api.involvex.workers.dev";

    const response = await fetch(`${API_URL}/api/admin/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error("You do not have permission to view this page.");
      }
      throw new Error(`Failed to fetch users: ${response.statusText}`);
    }

    const data = (await response.json()) as { success: boolean; data: any[] };
    return json({ users: data.data || [] });
  } catch (error) {
    console.error("Admin users loader error:", error);
    // Fallback to mock if API fails in dev
    return json({ users: [] });
  }
}

export async function action({ request, context }: ActionFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");

  if (!token) {
    return json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const intent = (formData as any).get("intent");
  const userId = (formData as any).get("userId");

  if (intent === "toggle_status" && typeof userId === "string") {
    try {
      const API_URL =
        context.cloudflare.env.API_URL ||
        "https://syncstuff-api.involvex.workers.dev";

      const response = await fetch(
        `${API_URL}/api/admin/user/${userId}/status`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        return json({
          success: false,
          error: data.error || "Failed to update status",
        });
      }

      return json({ success: true });
    } catch (error) {
      console.error("Admin toggle status error:", error);
      return json({ success: false, error: "Failed to update status" });
    }
  }

  return json({ success: false, error: "Invalid intent" });
}

export default function AdminUsers() {
  const { users } = useLoaderData<typeof loader>();
  const navigation = useNavigation();

  return (
    <YStack space="$6">
      <YStack>
        <Text fontSize="$8" fontWeight="bold" className="text-on-surface">
          Users
        </Text>
        <Text className="text-color-subtitle">
          A list of all the users in your account.
        </Text>
      </YStack>

      <Card
        bordered
        elevate
        className="bg-surface border-border overflow-hidden"
      >
        <YStack separator={<Separator className="bg-border" />}>
          {/* Header */}
          <XStack className="bg-surface-variant space-x-4 p-4">
            <Text
              flex={2}
              fontSize="$2"
              fontWeight="bold"
              textTransform="uppercase"
              className="text-on-surface"
            >
              Username
            </Text>
            <Text
              className="text-on-surface hidden sm:block"
              flex={3}
              fontSize="$2"
              fontWeight="bold"
              textTransform="uppercase"
            >
              Email
            </Text>
            <Text
              flex={1}
              fontSize="$2"
              fontWeight="bold"
              textTransform="uppercase"
              className="text-on-surface"
            >
              Role
            </Text>
            <Text
              flex={1}
              fontSize="$2"
              fontWeight="bold"
              textTransform="uppercase"
              className="text-on-surface"
            >
              Status
            </Text>
            <Text
              flex={1}
              fontSize="$2"
              fontWeight="bold"
              textAlign="right"
              textTransform="uppercase"
              className="text-on-surface"
            >
              Action
            </Text>
          </XStack>

          {users.length === 0 ? (
            <YStack alignItems="center" padding="$4">
              <Text className="text-color-subtitle">No users found</Text>
            </YStack>
          ) : (
            users.map((user: any) => (
              <XStack
                alignItems="center"
                className="hover:bg-surface-hover space-x-4 p-4 transition-colors"
                key={user.id}
              >
                <YStack flex={2}>
                  <Text fontWeight="bold" className="text-on-surface">
                    {user.username}
                  </Text>
                  <Text
                    className="text-color-subtitle block sm:hidden"
                    fontSize="$1"
                  >
                    {user.email}
                  </Text>
                </YStack>
                <Text
                  className="text-on-surface hidden sm:block"
                  flex={3}
                  fontSize="$3"
                >
                  {user.email}
                </Text>
                <View flex={1}>
                  <StatusBadge status="info">{user.role}</StatusBadge>
                </View>
                <View flex={1}>
                  <StatusBadge
                    status={user.status === "active" ? "success" : "error"}
                  >
                    {user.status}
                  </StatusBadge>
                </View>
                <XStack flex={1} justifyContent="flex-end">
                  <Form method="post">
                    <input name="userId" type="hidden" value={user.id} />
                    <button
                      disabled={navigation.state === "submitting"}
                      name="intent"
                      className={`rounded px-2 py-1 text-sm font-medium text-white transition-colors ${
                        user.status === "active"
                          ? "bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                          : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                      } disabled:cursor-not-allowed disabled:opacity-50`}
                      type="submit"
                      value="toggle_status"
                    >
                      {user.status === "active" ? "Suspend" : "Activate"}
                    </button>
                  </Form>
                </XStack>
              </XStack>
            ))
          )}
        </YStack>
      </Card>
    </YStack>
  );
}
