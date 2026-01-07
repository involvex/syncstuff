import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  json,
} from "@remix-run/cloudflare";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { getSession } from "~/services/session.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("userId");
  const db = context.cloudflare.env.syncstuff_db;

  if (!db) {
    throw new Error(
      "D1 database binding 'syncstuff_db' not found. If running locally, ensure you are using 'wrangler dev' or have configured the proxy correctly.",
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user: any = await db
    .prepare(
      "SELECT id, username, email, full_name, role, status, github_id, discord_id, password_hash FROM users WHERE id = ?",
    )
    .bind(userId)
    .first();

  const hasPassword = !!user?.password_hash;

  // Remove sensitive data
  if (user) {
    delete user.password_hash;
  }

  return json({ user, hasPassword });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("userId");
  const token = session.get("token");

  if (!userId || !token) {
    return json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "change_password") {
    const currentPassword = formData.get("current_password");
    const newPassword = formData.get("new_password");
    const confirmPassword = formData.get("confirm_password");

    if (newPassword !== confirmPassword) {
      return json({ success: false, error: "New passwords do not match" });
    }

    try {
      const API_URL =
        context.cloudflare.env.API_URL ||
        "https://syncstuff-api.involvex.workers.dev";
      const response = await fetch(`${API_URL}/api/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data: any = await response.json();

      if (!response.ok) {
        console.error("Change password API error:", data);
        return json({
          success: false,
          error: data.error || "Failed to change password",
        });
      }

      return json({ success: true, message: "Password updated successfully" });
    } catch (error) {
      console.error("Change password fetch exception:", error);
      return json({ success: false, error: "Network error: " + (error instanceof Error ? error.message : "Unknown") });
    }
  }

  return json({ success: false, error: "Invalid intent" });
}

export default function Settings() {
  const { user, hasPassword } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="space-y-6 px-4 py-6 sm:px-0">
      <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6 dark:bg-gray-800">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
              Profile
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              This information will be displayed publicly so be careful what you
              share.
            </p>
          </div>
          <div className="mt-5 md:col-span-2 md:mt-0">
            <Form method="post">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-4">
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    id="username"
                    defaultValue={user?.username}
                    readOnly
                    className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="col-span-6 sm:col-span-4">
                  <label
                    htmlFor="full_name"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    id="full_name"
                    defaultValue={user?.full_name || ""}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="col-span-6 sm:col-span-4">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Email address
                  </label>
                  <input
                    type="text"
                    name="email"
                    id="email"
                    defaultValue={user?.email}
                    disabled
                    className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 text-gray-500 shadow-sm sm:text-sm dark:border-gray-500 dark:bg-gray-600 dark:text-gray-400"
                  />
                </div>
              </div>
              <div className="-mx-6 -mb-6 mt-6 rounded-b-lg bg-gray-50 px-4 py-3 text-right sm:px-6 dark:bg-gray-700">
                <button
                  type="submit"
                  name="intent"
                  value="update_profile"
                  className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Save
                </button>
              </div>
            </Form>
          </div>
        </div>
      </div>

      <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6 dark:bg-gray-800">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
              Password
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {hasPassword
                ? "Update your password securely."
                : "Set a password for your account."}
            </p>
          </div>
          <div className="mt-5 md:col-span-2 md:mt-0">
            <Form method="post">
              <input type="hidden" name="intent" value="change_password" />
              <div className="grid grid-cols-6 gap-6">
                {hasPassword && (
                  <div className="col-span-6 sm:col-span-4">
                    <label
                      htmlFor="current_password"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Current Password
                    </label>
                    <input
                      type="password"
                      name="current_password"
                      id="current_password"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                )}

                <div className="col-span-6 sm:col-span-4">
                  <label
                    htmlFor="new_password"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    {hasPassword ? "New Password" : "Password"}
                  </label>
                  <input
                    type="password"
                    name="new_password"
                    id="new_password"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="col-span-6 sm:col-span-4">
                  <label
                    htmlFor="confirm_password"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Confirm {hasPassword ? "New " : ""}Password
                  </label>
                  <input
                    type="password"
                    name="confirm_password"
                    id="confirm_password"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              {actionData && "error" in actionData && (
                <div className="mt-4 text-sm text-red-600">
                  {actionData.error}
                </div>
              )}
              {actionData && "message" in actionData && (
                <div className="mt-4 text-sm text-green-600">
                  {actionData.message}
                </div>
              )}

              <div className="-mx-6 -mb-6 mt-6 rounded-b-lg bg-gray-50 px-4 py-3 text-right sm:px-6 dark:bg-gray-700">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {isSubmitting
                    ? "Updating..."
                    : hasPassword
                      ? "Update Password"
                      : "Set Password"}
                </button>
              </div>
            </Form>
          </div>
        </div>
      </div>

      <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6 dark:bg-gray-800">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
              Connected Accounts
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage your connected cloud storage providers.
            </p>
          </div>
          <div className="mt-5 md:col-span-2 md:mt-0">
            <div className="space-y-4">
              {user?.github_id ? (
                <div className="flex items-center justify-between rounded-md border p-4 dark:border-gray-700">
                  <div className="flex items-center">
                    <svg
                      className="size-6 text-gray-900 dark:text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.91 8.18 6.947 9.53.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.825.612-3.422-1.362-3.422-1.362-.455-1.158-1.11-1.466-1.11-1.466-.923-.632.068-.62.068-.62 1.02.072 1.558 1.05 1.558 1.05.907 1.547 2.38 1.1 2.96.842.093-.654.352-1.1.64-1.354-2.258-.256-4.632-1.128-4.632-5.023 0-1.108.396-2.014 1.046-2.724-.105-.256-.453-1.288.1-2.686 0 0 .852-.27 2.79 1.043a9.71 9.71 0 012.537-.343c.86.004 1.72.115 2.537.343 1.938-1.313 2.79-1.043 2.79-1.043.554 1.398.206 2.43.101 2.686.65.71 1.045 1.616 1.045 2.724 0 3.906-2.378 4.764-4.643 5.016.363.31.686.92.686 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white">
                      GitHub (Connected)
                    </span>
                  </div>
                  <span className="rounded-full bg-green-100 px-2 py-1 text-sm text-green-600 dark:bg-green-900 dark:text-green-300">
                    Active
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-between rounded-md border p-4 dark:border-gray-700">
                  <div className="flex items-center">
                    <svg
                      className="size-6 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.91 8.18 6.947 9.53.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.825.612-3.422-1.362-3.422-1.362-.455-1.158-1.11-1.466-1.11-1.466-.923-.632.068-.62.068-.62 1.02.072 1.558 1.05 1.558 1.05.907 1.547 2.38 1.1 2.96.842.093-.654.352-1.1.64-1.354-2.258-.256-4.632-1.128-4.632-5.023 0-1.108.396-2.014 1.046-2.724-.105-.256-.453-1.288.1-2.686 0 0 .852-.27 2.79 1.043a9.71 9.71 0 012.537-.343c.86.004 1.72.115 2.537.343 1.938-1.313 2.79-1.043 2.79-1.043.554 1.398.206 2.43.101 2.686.65.71 1.045 1.616 1.045 2.724 0 3.906-2.378 4.764-4.643 5.016.363.31.686.92.686 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="ml-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                      GitHub (Not Connected)
                    </span>
                  </div>
                  <a
                    href="/auth/github"
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Connect
                  </a>
                </div>
              )}

              {/* Discord Connection */}
              {user?.discord_id ? (
                <div className="flex items-center justify-between rounded-md border p-4 dark:border-gray-700">
                  <div className="flex items-center">
                    <svg
                      className="size-6 text-[#5865F2]"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.074 0 0 0-.079-.037 19.736 19.736 0 0 0-4.885 1.515.069.069 0 0 0-.032.027C.533 9.048-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.419-2.157 2.419z" />
                    </svg>
                    <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white">
                      Discord (Connected)
                    </span>
                  </div>
                  <span className="rounded-full bg-green-100 px-2 py-1 text-sm text-green-600 dark:bg-green-900 dark:text-green-300">
                    Active
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-between rounded-md border p-4 dark:border-gray-700">
                  <div className="flex items-center">
                    <svg
                      className="size-6 text-[#5865F2]"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.074 0 0 0-.079-.037 19.736 19.736 0 0 0-4.885 1.515.069.069 0 0 0-.032.027C.533 9.048-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.419-2.157 2.419z" />
                    </svg>
                    <span className="ml-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                      Discord (Not Connected)
                    </span>
                  </div>
                  <a
                    href="/auth/discord"
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Connect
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
