import { type ActionFunctionArgs, json } from "@remix-run/cloudflare";
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
        alignItems="center"
        backgroundColor="$background"
        bottom={0}
        justifyContent="center"
        left={0}
        padding="$4"
        position="absolute"
        right={0}
        top={0}
      >
        <Card bordered elevate maxWidth={400} padding="$4" width="100%">
          <YStack alignItems="center" space="$6">
            <View
              alignItems="center"
              backgroundColor="$green4"
              borderRadius="$full"
              height={64}
              justifyContent="center"
              width={64}
            >
              <Text color="$green10" fontSize="$8">
                ✓
              </Text>
            </View>
            <YStack alignItems="center" space="$2">
              <Text fontSize="$6" fontWeight="bold">
                Check Your Email
              </Text>
              <Text color="$colorSubtitle" textAlign="center">
                {"message" in actionData
                  ? actionData.message
                  : actionData.error}
              </Text>
            </YStack>
            <Link
              style={{ textDecoration: "none", width: "100%" }}
              to="/auth/login"
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
      alignItems="center"
      backgroundColor="$background"
      bottom={0}
      justifyContent="center"
      left={0}
      padding="$4"
      position="absolute"
      right={0}
      top={0}
    >
      <Card
        bordered
        elevate
        maxWidth={400}
        padding="$4"
        space="$6"
        width="100%"
      >
        <YStack space="$2">
          <Link style={{ textDecoration: "none" }} to="/auth/login">
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
            alignItems="center"
            backgroundColor="$backgroundFocus"
            borderRadius="$3"
            height={56}
            justifyContent="center"
            width={56}
          >
            <Text fontSize="$8">✉️</Text>
          </View>
          <Text fontSize="$6" fontWeight="bold">
            Forgot Password?
          </Text>
          <Text color="$colorSubtitle" textAlign="center">
            Enter your email address and we'll send you a link to reset your
            password.
          </Text>
        </YStack>

        {actionData && "error" in actionData && actionData.error && (
          <YStack backgroundColor="$red2" borderRadius="$3" padding="$4">
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

            <Button disabled={isSubmitting} size="$4" theme="blue">
              {isSubmitting ? "Sending Link..." : "Send Reset Link"}
            </Button>
          </YStack>
        </Form>

        <XStack justifyContent="center" space="$2">
          <Text fontSize="$2">Remember your password?</Text>
          <Link style={{ textDecoration: "none" }} to="/auth/login">
            <Text color="$primary" fontSize="$2" fontWeight="bold">
              Sign in
            </Text>
          </Link>
        </XStack>
      </Card>
    </View>
  );
}
