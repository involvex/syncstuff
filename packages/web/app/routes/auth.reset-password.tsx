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
  const token = formData.get("token");
  const email = formData.get("email");
  const password = formData.get("password");
  const confirmPassword = formData.get("confirm_password");

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
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
        <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
          <div className="text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <svg
                className="size-8 text-green-600 dark:text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
              Success!
            </h2>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              {"message" in actionData ? actionData.message : actionData.error}
            </p>
            <Link
              to="/auth/login"
              className="inline-block w-full rounded-lg bg-indigo-600 px-4 py-2 text-center font-medium text-white transition-colors hover:bg-indigo-700"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if ("error" in loaderData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
        <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
          <div className="text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
              <svg
                className="size-8 text-red-600 dark:text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
              Invalid Link
            </h2>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              {loaderData.error}
            </p>
            <Link
              to="/auth/login"
              className="inline-block w-full rounded-lg bg-indigo-600 px-4 py-2 text-center font-medium text-white transition-colors hover:bg-indigo-700"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white transition-colors dark:bg-gray-950">
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12 sm:px-6 lg:px-8">
        {/* Background Gradients */}
        <div className="absolute left-[20%] top-[-10%] -z-10 size-[500px] rounded-full bg-blue-500/10 blur-[120px] dark:bg-blue-600/5"></div>
        <div className="absolute bottom-[-10%] right-[20%] -z-10 size-[500px] rounded-full bg-indigo-500/10 blur-[100px] dark:bg-indigo-600/5"></div>

        <div className="w-full max-w-md space-y-8 rounded-3xl border border-gray-100 bg-white p-8 shadow-xl shadow-gray-200/50 dark:border-gray-800 dark:bg-gray-900 dark:shadow-none">
          <div>
            <Link
              to="/auth/login"
              className="mb-4 inline-flex items-center text-sm font-bold text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              <svg
                className="mr-2 size-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Login
            </Link>
            <div className="text-center">
              <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                <svg
                  className="size-7"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h1 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Reset Your Password
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Enter your new password below.
              </p>
            </div>
          </div>

          {actionData && "error" in actionData && actionData.error && (
            <div className="rounded-xl border border-red-100 bg-red-50 p-4 dark:border-red-900/30 dark:bg-red-900/20">
              <div className="flex items-center gap-3">
                <svg
                  className="size-5 shrink-0 text-red-600 dark:text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  {actionData.error}
                </p>
              </div>
            </div>
          )}

          <Form method="post" className="mt-8 space-y-6">
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

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="password"
                  className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400"
                >
                  New Password
                </label>
                <div className="mt-2">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    className="block w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-3 text-sm transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-indigo-400"
                    placeholder="Enter new password"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirm_password"
                  className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400"
                >
                  Confirm Password
                </label>
                <div className="mt-2">
                  <input
                    id="confirm_password"
                    name="confirm_password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    className="block w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-3 text-sm transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-indigo-400"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full justify-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg
                      className="mr-2 size-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Resetting...
                  </span>
                ) : (
                  "Reset Password"
                )}
              </button>
            </div>
          </Form>

          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Remember your password?{" "}
              <Link
                to="/auth/login"
                className="font-bold text-indigo-600 transition-colors hover:text-indigo-500 hover:underline dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
