import type { ActionFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { Form, Link, useActionData, useNavigation } from "@remix-run/react";
import { Separator, Text } from "@syncstuff/ui";
import { Button, Card, Input } from "~/components/ui";
import { commitSession, getSession } from "~/services/session.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Login - Syncstuff" },
    { name: "description", content: "Login to Syncstuff" },
  ];
};

export async function action({ request, context }: ActionFunctionArgs) {
  // ... existing action logic remains unchanged ...
  const formData = await request.formData();
  const email = (formData as any).get("email");
  const password = (formData as any).get("password");

  if (typeof email !== "string" || typeof password !== "string") {
    return { error: "Invalid form data" };
  }

  try {
    const API_URL =
      context.cloudflare.env.API_URL ||
      "https://syncstuff-api.involvex.workers.dev";
    const fullUrl = `${API_URL}/api/auth/login`;
    console.log(`[WEB] POST to ${fullUrl}`);

    const response = await fetch(fullUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    console.log(`[WEB] Status: ${response.status} ${response.statusText}`);
    console.log(
      `[WEB] Headers: ${JSON.stringify(Object.fromEntries(response.headers))}`,
    );

    const contentType = response.headers.get("Content-Type");
    let responseText = "";
    let data: {
      success: boolean;
      data?: { token: string; user: { id: string; role: string } };
      error?: string;
    };

    try {
      responseText = await response.text();

      if (!contentType || !contentType.includes("application/json")) {
        console.error("Non-JSON response from login API:", responseText);
        return {
          error: "Server returned invalid response. Please try again.",
        };
      }

      try {
        data = JSON.parse(responseText) as {
          success: boolean;
          data?: { token: string; user: { id: string; role: string } };
          error?: string;
        };
      } catch (parseError) {
        console.error("JSON parse error:", parseError, {
          responseText: responseText.substring(0, 200),
        });
        return {
          error: "Server returned invalid response. Please try again.",
        };
      }
    } catch (textError) {
      console.error("Response text read error:", textError);
      return {
        error: "Network error. Please try again.",
      };
    }

    if (!data.success || !data.data) {
      return { error: data.error || "Login failed" };
    }

    const session = await getSession(request.headers.get("Cookie"));
    session.set("token", data.data.token);
    session.set("userId", data.data.user.id);
    session.set("role", data.data.user.role);

    return new Response(null, {
      status: 302,
      headers: {
        Location: "/dashboard", // Redirect to dashboard
        "Set-Cookie": await commitSession(session),
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return { error: "Network error. Please try again." };
  }
}

export default function Login() {
  const actionData = useActionData<typeof action>() as
    | { error?: string }
    | undefined;
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="bg-background absolute inset-0 flex items-center justify-center p-4">
      <Card className="w-full max-w-[400px] space-y-6 p-4">
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-color-primary text-4xl font-bold">Syncstuff</h1>
          <h2 className="text-on-surface text-xl font-bold">
            Sign in to your account
          </h2>
        </div>

        <Form method="post">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="email"
                className="text-on-surface text-sm font-bold"
              >
                Email Address
              </label>
              <Input
                id="email"
                name="email"
                placeholder="john@example.com"
                className="bg-surface border-border text-on-surface"
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between">
                <label
                  htmlFor="password"
                  className="text-on-surface text-sm font-bold"
                >
                  Password
                </label>
                <Link
                  style={{ textDecoration: "none" }}
                  to="/auth/forgot-password"
                  className="text-color-primary text-sm font-bold hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                className="bg-surface border-border text-on-surface"
              />
            </div>

            {actionData?.error && (
              <p className="text-error text-center text-sm">
                {actionData.error}
              </p>
            )}

            <Button
              disabled={isSubmitting}
              isLoading={isSubmitting}
              className="bg-primary hover:bg-primary/90 text-primary-foreground w-full"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </div>
        </Form>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Separator className="flex-1" />
            <Text className="text-color-subtitle text-xs uppercase">
              Or continue with
            </Text>
            <Separator className="flex-1" />
          </div>

          <div className="flex gap-3">
            <Button
              className="flex-1 border border-gray-300"
              variant="outline"
              onClick={() => (window.location.href = "/auth/github")}
            >
              <span className="mr-2 text-xl">🐙</span> GitHub
            </Button>
            <Button
              className="flex-1 bg-[#5865F2] text-white hover:bg-[#4752c4]"
              onClick={() => (window.location.href = "/auth/discord")}
            >
              <span className="mr-2 text-xl">💬</span> Discord
            </Button>
          </div>
        </div>

        <div className="flex justify-center gap-2">
          <Text className="text-sm">Not a member?</Text>
          <Link style={{ textDecoration: "none" }} to="/auth/signup">
            <Text className="text-primary text-sm font-bold">
              Start a 14 day free trial
            </Text>
          </Link>
        </div>
      </Card>
    </div>
  );
}
