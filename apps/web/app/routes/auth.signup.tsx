import type { ActionFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { Form, Link, useActionData, useNavigation } from "@remix-run/react";
import { Button, Card, Input, Text, View, XStack, YStack } from "@syncstuff/ui";
import { commitSession, getSession } from "~/services/session.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Sign Up - Syncstuff" },
    { name: "description", content: "Create a Syncstuff account" },
  ];
};

export async function action({ request, context }: ActionFunctionArgs) {
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
        <YStack alignItems="center" space="$2">
          <Text color="$primary" fontSize="$8" fontWeight="bold">
            Syncstuff
          </Text>

          <Text fontSize="$4" fontWeight="bold">
            Create your account
          </Text>
        </YStack>

        <Form method="post">
          <YStack space="$4">
            <YStack space="$2">
              <Text fontSize="$2" fontWeight="bold">
                Username
              </Text>

              <Input placeholder="johndoe" />
            </YStack>

            <YStack space="$2">
              <Text fontSize="$2" fontWeight="bold">
                Email Address
              </Text>

              <Input placeholder="john@example.com" />
            </YStack>

            <YStack space="$2">
              <Text fontSize="$2" fontWeight="bold">
                Password
              </Text>

              <Input secureTextEntry />
            </YStack>

            {actionData?.error && (
              <Text color="$red10" fontSize="$2" textAlign="center">
                {actionData.error}
              </Text>
            )}

            <Button disabled={isSubmitting} size="$4" theme="blue">
              {isSubmitting ? "Creating account..." : "Sign up"}
            </Button>
          </YStack>
        </Form>

        <XStack justifyContent="center" space="$2">
          <Text fontSize="$2">Already a member?</Text>
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
