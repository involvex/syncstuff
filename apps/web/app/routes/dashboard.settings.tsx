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
      {/* Profile Section */}
      <Card bordered elevate padding="$4">
        <YStack space="$6">
          <YStack>
            <Text fontSize="$6" fontWeight="bold">
              Profile Information
            </Text>
            <Text color="$colorSubtitle">
              Manage your public-facing information and personal details.
            </Text>
          </YStack>

          <XStack alignItems="center" space="$6">
            <Avatar circular size="$10">
              <View
                alignItems="center"
                backgroundColor="$primary"
                bottom={0}
                justifyContent="center"
                left={0}
                position="absolute"
                right={0}
                top={0}
              >
                <Text color="white" fontSize="$8" fontWeight="bold">
                  {user?.username?.charAt(0).toUpperCase() || "U"}
                </Text>
              </View>
            </Avatar>
            <YStack space="$2">
              <Button disabled size="$3" variant="outlined">
                Change Photo
              </Button>
              <Text color="$colorSubtitle" fontSize="$1">
                Custom profile pictures coming soon.
              </Text>
            </YStack>
          </XStack>

          <Form method="post">
            <YStack space="$4">
              <XStack flexWrap="wrap" space="$4">
                <YStack flex={1} minWidth={200} space="$2">
                  <Text fontSize="$2" fontWeight="bold">
                    Username
                  </Text>
                  <Input
                    backgroundColor="$backgroundFocus"
                    defaultValue={user?.username}
                    readOnly
                  />
                </YStack>
                <YStack flex={1} minWidth={200} space="$2">
                  <Text fontSize="$2" fontWeight="bold">
                    Email Address
                  </Text>
                  <Input
                    backgroundColor="$backgroundFocus"
                    defaultValue={user?.email}
                    readOnly
                  />
                </YStack>
              </XStack>

              <YStack space="$2">
                <Text fontSize="$2" fontWeight="bold">
                  Display Name
                </Text>
                <Input
                  defaultValue={user?.full_name || ""}
                  id="full_name"
                  placeholder="Sync User"
                />
              </YStack>

              <XStack justifyContent="flex-end">
                <Button disabled={isSubmitting} theme="blue">
                  Update Profile
                </Button>
              </XStack>
            </YStack>
          </Form>
        </YStack>
      </Card>

      {/* Password Section */}
      <Card bordered elevate padding="$4">
        <YStack space="$6">
          <YStack>
            <Text fontSize="$6" fontWeight="bold">
              Security
            </Text>
            <Text color="$colorSubtitle">
              {hasPassword
                ? "Change your existing password."
                : "Set a secure password for your account."}
            </Text>
          </YStack>

          <Form method="post">
            <input name="intent" type="hidden" value="change_password" />
            <YStack space="$4">
              {hasPassword && (
                <YStack space="$2">
                  <Text fontSize="$2" fontWeight="bold">
                    Current Password
                  </Text>
                  <Input id="current_password" secureTextEntry />
                </YStack>
              )}

              <XStack flexWrap="wrap" space="$4">
                <YStack flex={1} minWidth={200} space="$2">
                  <Text fontSize="$2" fontWeight="bold">
                    {hasPassword ? "New Password" : "Password"}
                  </Text>
                  <Input id="new_password" secureTextEntry />
                </YStack>
                <YStack flex={1} minWidth={200} space="$2">
                  <Text fontSize="$2" fontWeight="bold">
                    Confirm Password
                  </Text>
                  <Input id="confirm_password" secureTextEntry />
                </YStack>
              </XStack>

              {actionData?.error && (
                <Text color="$red10" fontSize="$2">
                  {actionData.error}
                </Text>
              )}
              {actionData?.message && (
                <Text color="$green10" fontSize="$2">
                  {actionData.message}
                </Text>
              )}

              <XStack justifyContent="flex-end">
                <Button disabled={isSubmitting} theme="blue">
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
      <Card borderColor="$red8" bordered elevate padding="$4">
        <YStack space="$4">
          <YStack>
            <Text color="$red10" fontSize="$6" fontWeight="bold">
              Danger Zone
            </Text>
            <Text color="$colorSubtitle">
              Permanently delete your account and all associated data.
            </Text>
          </YStack>

          <View backgroundColor="$red2" borderRadius="$3" padding="$4">
            <XStack
              alignItems="center"
              flexWrap="wrap"
              justifyContent="space-between"
              space="$4"
            >
              <Text color="$red10" flex={1} minWidth={300}>
                Once you delete your account, there is no going back. Please be
                certain.
              </Text>
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
                <Button
                  theme="red"
                  {...({ name: "intent", value: "delete_account" } as any)}
                >
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
