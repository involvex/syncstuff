import type { ActionFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { Form, Link, useActionData, useNavigation } from "@remix-run/react";
import {
  Button,
  Card,
  Input,
  Separator,
  Text,
  View,
  XStack,
  YStack,
} from "@syncstuff/ui";
import { commitSession, getSession } from "~/services/session.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Login - Syncstuff" },
    { name: "description", content: "Login to Syncstuff" },
  ];
};

export async function action({ request, context }: ActionFunctionArgs) {
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
            Sign in to your account
          </Text>
        </YStack>

        <Form method="post">
          <YStack space="$4">
            <YStack space="$2">
              <Text fontSize="$2" fontWeight="bold">
                Email Address
              </Text>
              <Input id="email" placeholder="john@example.com" />
            </YStack>

            <YStack space="$2">
              <XStack justifyContent="space-between">
                <Text fontSize="$2" fontWeight="bold">
                  Password
                </Text>
                <Link
                  style={{ textDecoration: "none" }}
                  to="/auth/forgot-password"
                >
                  <Text color="$primary" fontSize="$2" fontWeight="bold">
                    Forgot password?
                  </Text>
                </Link>
              </XStack>
              <Input id="password" secureTextEntry />
            </YStack>

            {actionData?.error && (
              <Text color="$red10" fontSize="$2" textAlign="center">
                {actionData.error}
              </Text>
            )}

            <Button disabled={isSubmitting} size="$4" theme="blue">
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </YStack>
        </Form>

        <YStack space="$4">
          <XStack alignItems="center" space="$2">
            <Separator flex={1} />
            <Text
              color="$colorSubtitle"
              fontSize="$1"
              textTransform="uppercase"
            >
              Or continue with
            </Text>
            <Separator flex={1} />
          </XStack>

          <XStack space="$3">
            <Button
              flex={1}
              icon={<Text fontSize="$5">🐙</Text>}
              onPress={() => (window.location.href = "/auth/github")}
              variant="outlined"
            >
              GitHub
            </Button>
            <Button
              backgroundColor="#5865F2"
              color="white"
              flex={1}
              icon={<Text fontSize="$5">💬</Text>}
              onPress={() => (window.location.href = "/auth/discord")}
            >
              Discord
            </Button>
          </XStack>
        </YStack>

        <XStack justifyContent="center" space="$2">
          <Text fontSize="$2">Not a member?</Text>
          <Link style={{ textDecoration: "none" }} to="/auth/signup">
            <Text color="$primary" fontSize="$2" fontWeight="bold">
              Start a 14 day free trial
            </Text>
          </Link>
        </XStack>
      </Card>
    </View>
  );
}
