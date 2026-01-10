import {
  json,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/cloudflare";
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { Button, Card, Input, Text, View, YStack } from "@syncstuff/ui";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const email = url.searchParams.get("email");

  if (!token || !email) {
    return json({ error: "Missing reset token or email" }, { status: 400 });
  }

  return json({ token, email });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData();
  const token = (formData as any).get("token");
  const email = (formData as any).get("email");
  const password = (formData as any).get("password");
  const confirmPassword = (formData as any).get("confirm_password");

  if (!token || !email || !password || !confirmPassword) {
    return json({ success: false, error: "All fields are required" });
  }

  if (password !== confirmPassword) {
    return json({ success: false, error: "Passwords do not match" });
  }

  if (typeof password !== "string" || password.length < 8) {
    return json({
      success: false,
      error: "Password must be at least 8 characters long",
    });
  }

  try {
    const API_URL =
      context.cloudflare.env.API_URL ||
      "https://syncstuff-api.involvex.workers.dev";

    const response = await fetch(`${API_URL}/api/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        email,
        newPassword: password,
      }),
    });

    const contentType = response.headers.get("Content-Type");
    let responseText = "";
    let data: { success: boolean; error?: string; message?: string };

    try {
      responseText = await response.text();

      if (!contentType || !contentType.includes("application/json")) {
        console.error("Non-JSON response from API:", responseText);
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
        console.error("JSON parse error:", parseError);
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

    if (!response.ok || !data.success) {
      return json({
        success: false,
        error: data.error || "Failed to reset password",
      });
    }

    return json({
      success: true,
      message: "Password reset successfully. You can now log in.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return json({
      success: false,
      error:
        "Network error: " +
        (error instanceof Error ? error.message : "Unknown"),
    });
  }
}

export default function ResetPassword() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  if (actionData?.success) {
    return (
      <View
        position="absolute"
        top={0}
        right={0}
        bottom={0}
        left={0}
        backgroundColor="$background"
        alignItems="center"
        justifyContent="center"
        padding="$4"
      >
        <Card elevate bordered padding="$4" maxWidth={400} width="100%">
          <YStack space="$6" alignItems="center">
            <View
              width={64}
              height={64}
              borderRadius="$full"
              backgroundColor="$green4"
              alignItems="center"
              justifyContent="center"
            >
              <Text fontSize="$8" color="$green10">
                ✓
              </Text>
            </View>
            <YStack space="$2" alignItems="center">
              <Text fontSize="$6" fontWeight="bold">
                Success!
              </Text>
              <Text textAlign="center" color="$colorSubtitle">
                {"message" in actionData
                  ? actionData.message
                  : actionData.error}
              </Text>
            </YStack>
            <Link
              to="/auth/login"
              style={{ textDecoration: "none", width: "100%" }}
            >
              <Button theme="blue" width="100%">
                Go to Login
              </Button>
            </Link>
          </YStack>
        </Card>
      </View>
    );
  }

  if ("error" in loaderData) {
    return (
      <View
        position="absolute"
        top={0}
        right={0}
        bottom={0}
        left={0}
        backgroundColor="$background"
        alignItems="center"
        justifyContent="center"
        padding="$4"
      >
        <Card elevate bordered padding="$4" maxWidth={400} width="100%">
          <YStack space="$6" alignItems="center">
            <View
              width={64}
              height={64}
              borderRadius="$full"
              backgroundColor="$red4"
              alignItems="center"
              justifyContent="center"
            >
              <Text fontSize="$8" color="$red10">
                ✕
              </Text>
            </View>
            <YStack space="$2" alignItems="center">
              <Text fontSize="$6" fontWeight="bold">
                Invalid Link
              </Text>
              <Text textAlign="center" color="$colorSubtitle">
                {loaderData.error}
              </Text>
            </YStack>
            <Link
              to="/auth/login"
              style={{ textDecoration: "none", width: "100%" }}
            >
              <Button variant="outlined" width="100%">
                Back to Login
              </Button>
            </Link>
          </YStack>
        </Card>
      </View>
    );
  }

  return (
    <View
      position="absolute"
      top={0}
      right={0}
      bottom={0}
      left={0}
      backgroundColor="$background"
      alignItems="center"
      justifyContent="center"
      padding="$4"
    >
      <Card
        elevate
        bordered
        padding="$4"
        maxWidth={400}
        width="100%"
        space="$6"
      >
        <YStack alignItems="center" space="$2">
          <View
            width={56}
            height={56}
            borderRadius="$3"
            backgroundColor="$backgroundFocus"
            alignItems="center"
            justifyContent="center"
          >
            <Text fontSize="$8">🔐</Text>
          </View>
          <Text fontSize="$6" fontWeight="bold">
            Reset Your Password
          </Text>
          <Text textAlign="center" color="$colorSubtitle">
            Enter your new password below.
          </Text>
        </YStack>

        {actionData && "error" in actionData && actionData.error && (
          <YStack padding="$4" backgroundColor="$red2" borderRadius="$3">
            <Text color="$red10" fontSize="$2">
              {actionData.error}
            </Text>
          </YStack>
        )}

        <Form method="post">
          <input
            type="hidden"
            name="token"
            value={"token" in loaderData ? loaderData.token || "" : ""}
          />
          <input
            type="hidden"
            name="email"
            value={"email" in loaderData ? loaderData.email || "" : ""}
          />

          <YStack space="$4">
            <YStack space="$2">
              <Text fontSize="$2" fontWeight="bold">
                New Password
              </Text>
              <Input secureTextEntry />
            </YStack>

            <YStack space="$2">
              <Text fontSize="$2" fontWeight="bold">
                Confirm Password
              </Text>
              <Input secureTextEntry />
            </YStack>

            <Button theme="blue" size="$4" disabled={isSubmitting}>
              {isSubmitting ? "Resetting..." : "Reset Password"}
            </Button>
          </YStack>
        </Form>
      </Card>
    </View>
  );
}
