import {
  json,
  type ActionFunctionArgs,
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
        <Text fontSize="$8" fontWeight="bold">
          Users
        </Text>
        <Text color="$colorSubtitle">
          A list of all the users in your account.
        </Text>
      </YStack>

      <Card elevate bordered overflow="hidden">
        <YStack separator={<Separator />}>
          {/* Header */}
          <XStack padding="$4" backgroundColor="$backgroundFocus" space="$4">
            <Text
              flex={2}
              fontWeight="bold"
              fontSize="$2"
              textTransform="uppercase"
            >
              Username
            </Text>
            <Text
              flex={3}
              fontWeight="bold"
              fontSize="$2"
              textTransform="uppercase"
              $sm={{ display: "none" }}
            >
              Email
            </Text>
            <Text
              flex={1}
              fontWeight="bold"
              fontSize="$2"
              textTransform="uppercase"
            >
              Role
            </Text>
            <Text
              flex={1}
              fontWeight="bold"
              fontSize="$2"
              textTransform="uppercase"
            >
              Status
            </Text>
            <Text
              flex={1}
              fontWeight="bold"
              fontSize="$2"
              textTransform="uppercase"
              textAlign="right"
            >
              Action
            </Text>
          </XStack>

          {users.length === 0 ? (
            <YStack padding="$4" alignItems="center">
              <Text color="$colorSubtitle">No users found</Text>
            </YStack>
          ) : (
            users.map((user: any) => (
              <XStack
                key={user.id}
                padding="$4"
                alignItems="center"
                space="$4"
                hoverStyle={{ backgroundColor: "$backgroundHover" }}
              >
                <YStack flex={2}>
                  <Text fontWeight="bold">{user.username}</Text>
                  <Text
                    fontSize="$1"
                    color="$colorSubtitle"
                    $gtSm={{ display: "none" }}
                  >
                    {user.email}
                  </Text>
                </YStack>
                <Text flex={3} fontSize="$3" $sm={{ display: "none" }}>
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
                    <input type="hidden" name="userId" value={user.id} />
                    <button
                      type="submit"
                      name="intent"
                      value="toggle_status"
                      style={{
                        backgroundColor:
                          user.status === "active"
                            ? "var(--red10)"
                            : "var(--blue10)",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        padding: "4px 8px",
                        cursor:
                          navigation.state === "submitting"
                            ? "not-allowed"
                            : "pointer",
                      }}
                      disabled={navigation.state === "submitting"}
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
