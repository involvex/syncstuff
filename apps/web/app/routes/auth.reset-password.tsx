import {
  type ActionFunctionArgs,
  json,
  type LoaderFunctionArgs,
} from "@remix-run/cloudflare";
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { Button, Card, Input, Text } from "@syncstuff/ui";

export async function loader({ request }: LoaderFunctionArgs) {
  // ... existing loader logic ...
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const email = url.searchParams.get("email");

  if (!token || !email) {
    return json({ error: "Missing reset token or email" }, { status: 400 });
  }

  return json({ token, email });
}

export async function action({ request, context }: ActionFunctionArgs) {
  // ... existing action logic ...
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
      <div className="bg-background absolute inset-0 flex items-center justify-center p-4">
        <Card className="w-full max-w-[400px] p-4">
          <div className="flex flex-col items-center gap-6">
            <div className="bg-green-100 text-green-600 flex h-16 w-16 items-center justify-center rounded-full text-3xl">
              ✓
            </div>
            <div className="flex flex-col items-center gap-2">
              <Text className="text-xl font-bold">Success!</Text>
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
                Go to Login
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  if ("error" in loaderData) {
    return (
      <div className="bg-background absolute inset-0 flex items-center justify-center p-4">
        <Card className="w-full max-w-[400px] p-4">
          <div className="flex flex-col items-center gap-6">
            <div className="bg-red-100 text-red-600 flex h-16 w-16 items-center justify-center rounded-full text-3xl">
              ✕
            </div>
            <div className="flex flex-col items-center gap-2">
              <Text className="text-xl font-bold">Invalid Link</Text>
              <Text className="text-color-subtitle text-center">
                {loaderData.error}
              </Text>
            </div>
            <Link
              style={{ textDecoration: "none", width: "100%" }}
              to="/auth/login"
            >
              <Button variant="outline" className="w-full">
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
        <div className="flex flex-col items-center gap-2">
          <div className="bg-gray-100 dark:bg-gray-800 flex h-14 w-14 items-center justify-center rounded-lg text-3xl">
            🔐
          </div>
          <Text className="text-xl font-bold">Reset Your Password</Text>
          <Text className="text-color-subtitle text-center">
            Enter your new password below.
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
          <input
            name="token"
            type="hidden"
            value={"token" in loaderData ? loaderData.token || "" : ""}
          />
          <input
            name="email"
            type="hidden"
            value={"email" in loaderData ? loaderData.email || "" : ""}
          />

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Text className="text-sm font-bold">New Password</Text>
              <Input name="password" type="password" secureTextEntry />
            </div>

            <div className="flex flex-col gap-2">
              <Text className="text-sm font-bold">Confirm Password</Text>
              <Input name="confirm_password" type="password" secureTextEntry />
            </div>

            <Button disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white w-full">
              {isSubmitting ? "Resetting..." : "Reset Password"}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}
