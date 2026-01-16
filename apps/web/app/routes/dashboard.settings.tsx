import {
  type ActionFunctionArgs,
  json,
  type LoaderFunctionArgs,
  redirect,
} from "@remix-run/cloudflare";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import {
  Avatar,
  Button,
  Card,
  Input,
  Text,
  View,
  XStack,
  YStack,
} from "@syncstuff/ui";
import { getSession } from "~/services/session.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("userId");
  const db = context.cloudflare.env.syncstuff_db;

  if (!db) {
    throw new Error(
      "D1 database binding 'syncstuff_db' not found. If running locally, ensure you are using 'wrangler dev' or have configured the proxy correctly.",
    );
  }

  const user: any = await db
    .prepare(
      "SELECT id, username, email, full_name, role, status, github_id, discord_id, password_hash FROM users WHERE id = ?",
    )
    .bind(userId)
    .first();

  const hasPassword = !!user?.password_hash;

  // Remove sensitive data
  if (user) {
    delete user.password_hash;
  }

  return json({ user, hasPassword });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("userId");
  const token = session.get("token");

  if (!userId || !token) {
    return json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const intent = (formData as any).get("intent");

  if (intent === "change_password") {
    const currentPassword = (formData as any).get("current_password");
    const newPassword = (formData as any).get("new_password");
    const confirmPassword = (formData as any).get("confirm_password");

    if (newPassword !== confirmPassword) {
      return json({ success: false, error: "New passwords do not match" });
    }

    try {
      const API_URL =
        context.cloudflare.env.API_URL ||
        "https://syncstuff-api.involvex.workers.dev";

      const fullUrl = `${API_URL}/api/auth/change-password`;
      console.log(`[WEB] POST to ${fullUrl}`);

      let response: Response;
      try {
        response = await fetch(fullUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ currentPassword, newPassword }),
        });
      } catch (fetchError) {
        console.error("[WEB] Fetch error:", fetchError);
        const errorMsg =
          fetchError instanceof Error ? fetchError.message : String(fetchError);
        // Check for Cloudflare error 1042
        if (
          errorMsg.includes("1042") ||
          errorMsg.includes("error code: 1042")
        ) {
          return json({
            success: false,
            error: "Unable to connect to the server. Please try again later.",
          });
        }
        return json({
          success: false,
          error: "Network error. Please check your connection and try again.",
        });
      }

      console.log(`[WEB] Status: ${response.status} ${response.statusText}`);
      console.log(
        `[WEB] Headers: ${JSON.stringify(Object.fromEntries(response.headers))}`,
      );

      const contentType = response.headers.get("Content-Type");
      let responseText = "";
      let data: {
        success: boolean;
        error?: string;
        message?: string;
      };

      try {
        responseText = await response.text();

        if (!contentType || !contentType.includes("application/json")) {
          console.error("Non-JSON response from API:", responseText);
          // Check if it's the specific error code 1042
          if (
            responseText.includes("error code: 1042") ||
            responseText.includes("1042")
          ) {
            return json({
              success: false,
              error: "Server connection error. Please try again later.",
            });
          }
          return json({
            success: false,
            error: "Server returned invalid response. Please try again.",
          });
        }

        try {
          data = JSON.parse(responseText) as {
            success: boolean;
            error?: string;
            message?: string;
          };
        } catch (parseError) {
          console.error("JSON parse error:", parseError, {
            responseText: responseText.substring(0, 200),
          });
          return json({
            success: false,
            error: "Server returned invalid response. Please try again.",
          });
        }
      } catch (textError) {
        console.error("Response text read error:", textError);
        return json({
          success: false,
          error: "Network error. Please try again.",
        });
      }

      if (!response.ok) {
        console.error("Change password API error:", data);
        return json({
          success: false,
          error: data.error || "Failed to change password",
        });
      }

      return json({ success: true, message: "Password updated successfully" });
    } catch (error) {
      console.error("Change password fetch exception:", error);
      return json({
        success: false,
        error:
          "Network error: " +
          (error instanceof Error ? error.message : "Unknown"),
      });
    }
  }

  if (intent === "update_profile") {
    const fullName = (formData as any).get("full_name");

    try {
      const API_URL =
        context.cloudflare.env.API_URL ||
        "https://syncstuff-api.involvex.workers.dev";

      const response = await fetch(`${API_URL}/api/auth/update-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fullName }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        return json({
          success: false,
          error: data.error || "Failed to update profile",
        });
      }

      return json({ success: true, message: "Profile updated successfully" });
    } catch (error) {
      console.error("Update profile error:", error);
      return json({
        success: false,
        error: "Failed to update profile. Please try again later.",
      });
    }
  }

  if (intent === "delete_account") {
    try {
      const API_URL =
        context.cloudflare.env.API_URL ||
        "https://syncstuff-api.involvex.workers.dev";

      const response = await fetch(`${API_URL}/api/auth/delete-account`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        return json({
          success: false,
          error: data.error || "Failed to delete account",
        });
      }

      // Logout after deletion
      return redirect("/auth/logout");
    } catch (error) {
      console.error("Delete account error:", error);
      return json({
        success: false,
        error: "Failed to delete account. Please try again later.",
      });
    }
  }

  return json({ success: false, error: "Invalid intent" });
}

export default function Settings() {
  const { user, hasPassword } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>() as
    | { success: boolean; error?: string; message?: string }
    | undefined;
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <YStack space="$8">
      {/* Page Header */}
      <YStack space="$2">
        <Text fontSize="$8" fontWeight="bold" className="text-on-surface">
          Settings
        </Text>
        <Text className="text-color-subtitle" fontSize="$3">
          Manage your account settings and preferences
        </Text>
      </YStack>

      {/* Profile Section */}
      <Card bordered elevate padding="$6" className="bg-surface border-border">
        <YStack space="$6">
          <YStack space="$2">
            <Text fontSize="$6" fontWeight="bold" className="text-on-surface">
              Profile Information
            </Text>
            <Text className="text-color-subtitle" fontSize="$2">
              Manage your public-facing information and personal details.
            </Text>
          </YStack>

          <XStack alignItems="center" space="$6">
            <Avatar className="size-10 rounded-full">
              <View
                alignItems="center"
                className="bg-primary"
                bottom={0}
                justifyContent="center"
                left={0}
                position="absolute"
                right={0}
                top={0}
              >
                <Text
                  className="text-primary-foreground"
                  fontSize="$8"
                  fontWeight="bold"
                >
                  {user?.username?.charAt(0).toUpperCase() || "U"}
                </Text>
              </View>
            </Avatar>
            <YStack space="$2">
              <Button disabled size="sm" variant="outline">
                Change Photo
              </Button>
              <Text className="text-color-subtitle" fontSize="$1">
                Custom profile pictures coming soon.
              </Text>
            </YStack>
          </XStack>

          <Form method="post">
            <input name="intent" type="hidden" value="update_profile" />
            <YStack space="$4">
              <XStack flexWrap="wrap" space="$4">
                <YStack flex={1} minWidth={200} space="$2">
                  <Text
                    fontSize="$2"
                    fontWeight="bold"
                    className="text-on-surface"
                  >
                    Username
                  </Text>
                  <Input
                    className="bg-surface-variant text-on-surface"
                    defaultValue={user?.username}
                    readOnly
                  />
                </YStack>
                <YStack flex={1} minWidth={200} space="$2">
                  <Text
                    fontSize="$2"
                    fontWeight="bold"
                    className="text-on-surface"
                  >
                    Email Address
                  </Text>
                  <Input
                    className="bg-surface-variant text-on-surface"
                    defaultValue={user?.email}
                    readOnly
                  />
                </YStack>
              </XStack>

              <YStack space="$2">
                <Text
                  fontSize="$2"
                  fontWeight="bold"
                  className="text-on-surface"
                >
                  Display Name
                </Text>
                <Input
                  className="bg-surface text-on-surface border-input"
                  defaultValue={user?.full_name || ""}
                  id="full_name"
                  name="full_name"
                  placeholder="Sync User"
                />
              </YStack>

              <XStack justifyContent="flex-end">
                <Button disabled={isSubmitting} type="submit">
                  Update Profile
                </Button>
              </XStack>
            </YStack>
          </Form>
        </YStack>
      </Card>

      {/* Password Section */}
      <Card bordered elevate padding="$6" className="bg-surface border-border">
        <YStack space="$6">
          <YStack space="$2">
            <Text fontSize="$6" fontWeight="bold" className="text-on-surface">
              Security
            </Text>
            <Text className="text-color-subtitle" fontSize="$2">
              {hasPassword
                ? "Change your existing password to keep your account secure."
                : "Set a secure password for your account to enhance security."}
            </Text>
          </YStack>

          <Form method="post">
            <input name="intent" type="hidden" value="change_password" />
            <YStack space="$4">
              {hasPassword && (
                <YStack space="$2">
                  <Text
                    fontSize="$2"
                    fontWeight="bold"
                    className="text-on-surface"
                  >
                    Current Password
                  </Text>
                  <Input
                    id="current_password"
                    name="current_password"
                    type="password"
                    className="bg-surface text-on-surface border-input"
                  />
                </YStack>
              )}

              <XStack flexWrap="wrap" space="$4">
                <YStack flex={1} minWidth={200} space="$2">
                  <Text
                    fontSize="$2"
                    fontWeight="bold"
                    className="text-on-surface"
                  >
                    {hasPassword ? "New Password" : "Password"}
                  </Text>
                  <Input
                    id="new_password"
                    name="new_password"
                    type="password"
                    className="bg-surface text-on-surface border-input"
                  />
                </YStack>
                <YStack flex={1} minWidth={200} space="$2">
                  <Text
                    fontSize="$2"
                    fontWeight="bold"
                    className="text-on-surface"
                  >
                    Confirm Password
                  </Text>
                  <Input
                    id="confirm_password"
                    name="confirm_password"
                    type="password"
                    className="bg-surface text-on-surface border-input"
                  />
                </YStack>
              </XStack>

              {actionData?.error && (
                <Text className="text-error" fontSize="$2">
                  {actionData.error}
                </Text>
              )}
              {actionData?.message && (
                <Text className="text-success" fontSize="$2">
                  {actionData.message}
                </Text>
              )}

              <XStack justifyContent="flex-end">
                <Button disabled={isSubmitting} type="submit">
                  {isSubmitting
                    ? "Processing..."
                    : hasPassword
                      ? "Update Password"
                      : "Set Password"}
                </Button>
              </XStack>
            </YStack>
          </Form>
        </YStack>
      </Card>

      {/* Danger Zone */}
      <Card
        className="border-error bg-surface shadow-sm"
        bordered
        elevate
        padding="$6"
      >
        <YStack space="$6">
          <YStack space="$2">
            <Text className="text-error" fontSize="$6" fontWeight="bold">
              Danger Zone
            </Text>
            <Text className="text-color-subtitle" fontSize="$2">
              Permanently delete your account and all associated data. This
              action cannot be undone.
            </Text>
          </YStack>

          <View className="bg-error/10 rounded-lg p-5">
            <XStack
              alignItems="center"
              flexWrap="wrap"
              justifyContent="space-between"
              space="$4"
            >
              <YStack flex={1} minWidth={300} space="$2">
                <Text className="text-error font-semibold" fontSize="$3">
                  Delete Account
                </Text>
                <Text className="text-error/80" fontSize="$2">
                  Once you delete your account, there is no going back. All your
                  data, devices, and settings will be permanently removed.
                </Text>
              </YStack>
              <Form
                method="post"
                onSubmit={e => {
                  if (
                    !confirm(
                      "Are you absolutely sure? This action is permanent.",
                    )
                  ) {
                    e.preventDefault();
                  }
                }}
              >
                <input name="intent" type="hidden" value="delete_account" />
                <Button variant="destructive" type="submit">
                  Delete Account
                </Button>
              </Form>
            </XStack>
          </View>
        </YStack>
      </Card>
    </YStack>
  );
}
