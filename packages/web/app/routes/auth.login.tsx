import type { ActionFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { Form, Link, useActionData, useNavigation } from "@remix-run/react";
import { commitSession, getSession } from "~/services/session.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Login - Syncstuff" },
    { name: "description", content: "Login to Syncstuff" },
  ];
};

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string") {
    return { error: "Invalid form data" };
  }

  try {
    const API_URL = "http://localhost:8787"; // TODO: Use env var
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await response.json<any>();

    if (!data.success) {
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
    <div className="flex min-h-screen flex-col justify-center bg-gray-50 px-6 py-12 lg:px-8 dark:bg-gray-900">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-white">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <Form method="post" className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200"
            >
              Email address
            </label>
            <div className="mt-2">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:text-white dark:ring-gray-700"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200"
              >
                Password
              </label>
              <div className="text-sm">
                <a
                  href="#"
                  className="font-semibold text-indigo-600 hover:text-indigo-500"
                >
                  Forgot password?
                </a>
              </div>
            </div>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:text-white dark:ring-gray-700"
              />
            </div>
          </div>

          {actionData?.error && (
            <div className="text-center text-sm text-red-500">
              {actionData.error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </Form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-gray-50 px-2 text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3">
            <a
              href="/auth/github"
              className="flex w-full items-center justify-center gap-3 rounded-md bg-white px-3 py-1.5 text-sm font-semibold leading-6 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:ring-transparent dark:bg-gray-800 dark:text-white dark:ring-gray-700 dark:hover:bg-gray-700"
            >
              <svg
                className="size-5"
                aria-hidden="true"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.91 8.18 6.947 9.53.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.825.612-3.422-1.362-3.422-1.362-.455-1.158-1.11-1.466-1.11-1.466-.923-.632.068-.62.068-.62 1.02.072 1.558 1.05 1.558 1.05.907 1.547 2.38 1.1 2.96.842.093-.654.352-1.1.64-1.354-2.258-.256-4.632-1.128-4.632-5.023 0-1.108.396-2.014 1.046-2.724-.105-.256-.453-1.288.1-2.686 0 0 .852-.27 2.79 1.043a9.71 9.71 0 012.537-.343c.86.004 1.72.115 2.537.343 1.938-1.313 2.79-1.043 2.79-1.043.554 1.398.206 2.43.101 2.686.65.71 1.045 1.616 1.045 2.724 0 3.906-2.378 4.764-4.643 5.016.363.31.686.92.686 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm font-semibold leading-6">GitHub</span>
            </a>
          </div>
        </div>

        <p className="mt-10 text-center text-sm text-gray-500">
          Not a member?{" "}
          <Link
            to="/auth/signup"
            className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
          >
            Start a 14 day free trial
          </Link>
        </p>
      </div>
    </div>
  );
}
