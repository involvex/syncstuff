import { json, type ActionFunctionArgs } from "@remix-run/cloudflare";
import { Form, Link, useActionData, useNavigation } from "@remix-run/react";
import { Button, Card, Input, Text, View, XStack, YStack } from "@syncstuff/ui";

export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = (formData as any).get("email");

  if (!email || typeof email !== "string") {
    return json({ success: false, error: "Email is required" });
  }

  try {
    const API_URL =
      context.cloudflare.env.API_URL ||
      "https://syncstuff-api.involvex.workers.dev";

    const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const contentType = response.headers.get("Content-Type");
    let responseText = "";

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
        // Parse to validate JSON, but we always return success to prevent email enumeration
        JSON.parse(responseText) as {
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

    // Always return success to prevent email enumeration
    // Even if user doesn't exist, show success message
    return json({
      success: true,
      message:
        "If an account with that email exists, we've sent a password reset link.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return json({
      success: false,
      error:
        "Network error: " +
        (error instanceof Error ? error.message : "Unknown"),
    });
  }
}

export default function ForgotPassword() {
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
                Check Your Email
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
        <YStack space="$2">
          <Link to="/auth/login" style={{ textDecoration: "none" }}>
            <XStack alignItems="center" space="$2">
              <Text color="$colorSubtitle">←</Text>
              <Text color="$colorSubtitle" fontWeight="bold">
                Back to Login
              </Text>
            </XStack>
          </Link>
        </YStack>

        <YStack alignItems="center" space="$2">
          <View
            width={56}
            height={56}
            borderRadius="$3"
            backgroundColor="$backgroundFocus"
            alignItems="center"
            justifyContent="center"
          >
            <Text fontSize="$8">✉️</Text>
          </View>
          <Text fontSize="$6" fontWeight="bold">
            Forgot Password?
          </Text>
          <Text textAlign="center" color="$colorSubtitle">
            Enter your email address and we'll send you a link to reset your
            password.
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
          <YStack space="$4">
            <YStack space="$2">
              <Text fontSize="$2" fontWeight="bold" textTransform="uppercase">
                Email Address
              </Text>
              <Input id="email" placeholder="john@example.com" />
            </YStack>

            <Button theme="blue" size="$4" disabled={isSubmitting}>
              {isSubmitting ? "Sending Link..." : "Send Reset Link"}
            </Button>
          </YStack>
        </Form>

        <XStack justifyContent="center" space="$2">
          <Text fontSize="$2">Remember your password?</Text>
          <Link to="/auth/login" style={{ textDecoration: "none" }}>
            <Text fontSize="$2" color="$primary" fontWeight="bold">
              Sign in
            </Text>
          </Link>
        </XStack>
      </Card>
    </View>
  );
}
