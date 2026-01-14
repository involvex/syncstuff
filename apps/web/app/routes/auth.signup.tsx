import type { ActionFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { Form, Link, useActionData, useNavigation } from "@remix-run/react";
import { Button, Card, Input, Text } from "@syncstuff/ui";
import { commitSession, getSession } from "~/services/session.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Sign Up - Syncstuff" },
    { name: "description", content: "Create a Syncstuff account" },
  ];
};

export async function action({ request, context }: ActionFunctionArgs) {
  // ... existing action logic ...
  const formData = await request.formData();
  const email = (formData as any).get("email");
  const password = (formData as any).get("password");
  const username = (formData as any).get("username");

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    typeof username !== "string"
  ) {
    return { error: "Invalid form data" };
  }

  try {
    const API_URL =
      context.cloudflare.env.API_URL ||
      "https://syncstuff-api.involvex.workers.dev";
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, username }),
    });

    const data = await response.json<any>();

    if (!data.success) {
      return { error: data.error || "Registration failed" };
    }

    const session = await getSession(request.headers.get("Cookie"));
    session.set("token", data.data.token);
    session.set("userId", data.data.user.id);
    session.set("role", data.data.user.role);

    return new Response(null, {
      status: 302,
      headers: {
        Location: "/dashboard",
        "Set-Cookie": await commitSession(session),
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return { error: "Network error. Please try again." };
  }
}

export default function Signup() {
  const actionData = useActionData<typeof action>() as
    | { error?: string }
    | undefined;
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="bg-background absolute inset-0 flex items-center justify-center p-4">
      <Card className="w-full max-w-[400px] space-y-6 p-4">
        <div className="flex flex-col items-center gap-2">
          <Text className="text-primary text-4xl font-bold">Syncstuff</Text>
          <Text className="text-xl font-bold">Create your account</Text>
        </div>

        <Form method="post">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Text className="text-sm font-bold">Username</Text>
              <Input name="username" placeholder="johndoe" />
            </div>

            <div className="flex flex-col gap-2">
              <Text className="text-sm font-bold">Email Address</Text>
              <Input name="email" placeholder="john@example.com" />
            </div>

            <div className="flex flex-col gap-2">
              <Text className="text-sm font-bold">Password</Text>
              <Input name="password" type="password" />
            </div>

            {actionData?.error && (
              <Text className="text-center text-sm text-red-500">
                {actionData.error}
              </Text>
            )}

            <Button
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white hover:bg-blue-700"
            >
              {isSubmitting ? "Creating account..." : "Sign up"}
            </Button>
          </div>
        </Form>

        <div className="flex justify-center gap-2">
          <Text className="text-sm">Already a member?</Text>
          <Link style={{ textDecoration: "none" }} to="/auth/login">
            <Text className="text-primary text-sm font-bold">Sign in</Text>
          </Link>
        </div>
      </Card>
    </div>
  );
}
