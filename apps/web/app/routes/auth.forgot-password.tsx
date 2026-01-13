import { type ActionFunctionArgs, json } from "@remix-run/cloudflare";
import { Form, Link, useActionData, useNavigation } from "@remix-run/react";
import { Button, Card, Input, Text } from "@syncstuff/ui";

export async function action({ request, context }: ActionFunctionArgs) {
  // ... existing action logic ...
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
      <div className="bg-background absolute inset-0 flex items-center justify-center p-4">
        <Card className="w-full max-w-[400px] p-4">
          <div className="flex flex-col items-center gap-6">
            <div className="bg-green-100 text-green-600 flex h-16 w-16 items-center justify-center rounded-full text-3xl">
              ✓
            </div>
            <div className="flex flex-col items-center gap-2">
              <Text className="text-xl font-bold">Check Your Email</Text>
              <Text className="text-color-subtitle text-center">
                {"message" in actionData
                  ? actionData.message
                  : actionData.error}
              </Text>
            </div>
            <Link
              style={{ textDecoration: "none", width: "100%" }}
              to="/auth/login"
            >
              <Button className="bg-blue-600 hover:bg-blue-700 text-white w-full">
                Back to Login
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-background absolute inset-0 flex items-center justify-center p-4">
      <Card className="w-full max-w-[400px] p-4 space-y-6">
        <div className="space-y-2">
          <Link style={{ textDecoration: "none" }} to="/auth/login">
            <div className="flex items-center gap-2 text-color-subtitle">
              <Text>←</Text>
              <Text className="font-bold">Back to Login</Text>
            </div>
          </Link>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="bg-gray-100 dark:bg-gray-800 flex h-14 w-14 items-center justify-center rounded-lg text-3xl">
            ✉️
          </div>
          <Text className="text-xl font-bold">Forgot Password?</Text>
          <Text className="text-color-subtitle text-center">
            Enter your email address and we'll send you a link to reset your
            password.
          </Text>
        </div>

        {actionData && "error" in actionData && actionData.error && (
          <div className="bg-red-100 p-4 rounded-lg">
            <Text className="text-red-600 text-sm">
              {actionData.error}
            </Text>
          </div>
        )}

        <Form method="post">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Text className="text-sm font-bold uppercase">Email Address</Text>
              <Input id="email" name="email" placeholder="john@example.com" />
            </div>

            <Button disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white w-full">
              {isSubmitting ? "Sending Link..." : "Send Reset Link"}
            </Button>
          </div>
        </Form>

        <div className="flex justify-center gap-2">
          <Text className="text-sm">Remember your password?</Text>
          <Link style={{ textDecoration: "none" }} to="/auth/login">
            <Text className="text-primary text-sm font-bold">Sign in</Text>
          </Link>
        </div>
      </Card>
    </div>
  );
}
