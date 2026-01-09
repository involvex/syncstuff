import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  json,
  redirect,
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

      const fullUrl = `${API_URL}/api/auth/change-password`;
      console.log(`[WEB] POST to ${fullUrl}`);

      let response: Response;
      try {
        response = await fetch(fullUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ currentPassword, newPassword }),
        });
      } catch (fetchError) {
        console.error("[WEB] Fetch error:", fetchError);
        const errorMsg =
          fetchError instanceof Error ? fetchError.message : String(fetchError);
        // Check for Cloudflare error 1042
        if (
          errorMsg.includes("1042") ||
          errorMsg.includes("error code: 1042")
        ) {
          return json({
            success: false,
            error: "Unable to connect to the server. Please try again later.",
          });
        }
        return json({
          success: false,
          error: "Network error. Please check your connection and try again.",
        });
      }

      console.log(`[WEB] Status: ${response.status} ${response.statusText}`);
      console.log(
        `[WEB] Headers: ${JSON.stringify(Object.fromEntries(response.headers))}`,
      );

      const contentType = response.headers.get("Content-Type");
      let responseText = "";
      let data: {
        success: boolean;
        error?: string;
        message?: string;
      };

      try {
        responseText = await response.text();

        if (!contentType || !contentType.includes("application/json")) {
          console.error("Non-JSON response from API:", responseText);
          // Check if it's the specific error code 1042
          if (
            responseText.includes("error code: 1042") ||
            responseText.includes("1042")
          ) {
            return json({
              success: false,
              error: "Server connection error. Please try again later.",
            });
          }
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
          console.error("JSON parse error:", parseError, {
            responseText: responseText.substring(0, 200),
          });
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
      return json({
        success: false,
        error:
          "Network error: " +
          (error instanceof Error ? error.message : "Unknown"),
      });
    }
  }

  if (intent === "update_profile") {
    const fullName = formData.get("full_name");

    try {
      const API_URL =
        context.cloudflare.env.API_URL ||
        "https://syncstuff-api.involvex.workers.dev";

      const response = await fetch(`${API_URL}/api/auth/update-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fullName }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        return json({
          success: false,
          error: data.error || "Failed to update profile",
        });
      }

      return json({ success: true, message: "Profile updated successfully" });
    } catch (error) {
      console.error("Update profile error:", error);
      return json({
        success: false,
        error: "Failed to update profile. Please try again later.",
      });
    }
  }

  if (intent === "delete_account") {
    try {
      const API_URL =
        context.cloudflare.env.API_URL ||
        "https://syncstuff-api.involvex.workers.dev";

      const response = await fetch(`${API_URL}/api/auth/delete-account`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        return json({
          success: false,
          error: data.error || "Failed to delete account",
        });
      }

      // Logout after deletion
      return redirect("/auth/logout");
    } catch (error) {
      console.error("Delete account error:", error);
      return json({
        success: false,
        error: "Failed to delete account. Please try again later.",
      });
    }
  }

  return json({ success: false, error: "Invalid intent" });
}

export default function Settings() {
  const { user, hasPassword } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>() as
    | { success: boolean; error?: string; message?: string }
    | undefined;
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      {/* Profile Section */}
      <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl shadow-gray-200/50 transition-all hover:shadow-2xl dark:border-gray-800 dark:bg-gray-900 dark:shadow-none">
        <div className="p-6 sm:p-8">
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Profile Information
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage your public-facing information and personal details.
            </p>
          </div>

          <div className="mb-8 flex items-center space-x-6">
            <div className="relative">
              <div className="flex size-24 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-3xl font-bold text-white shadow-lg ring-4 ring-white dark:ring-gray-800">
                {user?.username?.charAt(0).toUpperCase() || "U"}
              </div>
              <span className="absolute right-0 bottom-0 flex size-8 items-center justify-center rounded-full bg-white shadow-md ring-2 ring-white dark:bg-gray-800 dark:ring-gray-800">
                <svg
                  className="size-4 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </span>
            </div>
            <div>
              <button
                type="button"
                disabled
                className="rounded-xl bg-gray-100 px-4 py-2 text-sm font-bold text-gray-500 transition-colors dark:bg-gray-800 dark:text-gray-400"
              >
                Change Photo
                <span className="ml-2 inline-flex items-center rounded-md bg-gray-200 px-1.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                  Soon
                </span>
              </button>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Custom profile pictures coming in the next update.
              </p>
            </div>
          </div>

          <Form method="post" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="username"
                  className="text-xs font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400"
                >
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  id="username"
                  defaultValue={user?.username}
                  readOnly
                  className="block w-full cursor-not-allowed rounded-xl border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500 transition-all focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-xs font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  defaultValue={user?.email}
                  readOnly
                  className="block w-full cursor-not-allowed rounded-xl border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500 transition-all focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label
                  htmlFor="full_name"
                  className="text-xs font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400"
                >
                  Display Name
                </label>
                <input
                  type="text"
                  name="full_name"
                  id="full_name"
                  defaultValue={user?.full_name || ""}
                  placeholder="Sync User"
                  className="block w-full rounded-xl border-gray-200 bg-white px-4 py-3 text-sm transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                name="intent"
                value="update_profile"
                className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"
              >
                Update Profile
              </button>
            </div>
          </Form>
        </div>
      </section>

      {/* Password Section */}
      <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
        <div className="p-6 sm:p-8">
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Security
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {hasPassword
                ? "Change your existing password."
                : "Set a secure password for your account."}
            </p>
          </div>

          <Form method="post" className="space-y-6">
            <input type="hidden" name="intent" value="change_password" />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {hasPassword && (
                <div className="space-y-2 sm:col-span-2">
                  <label
                    htmlFor="current_password"
                    className="text-xs font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400"
                  >
                    Current Password
                  </label>
                  <input
                    type="password"
                    name="current_password"
                    id="current_password"
                    required
                    className="block w-full rounded-xl border-gray-300 bg-white px-4 py-3 text-sm transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label
                  htmlFor="new_password"
                  className="text-xs font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400"
                >
                  {hasPassword ? "New Password" : "Password"}
                </label>
                <input
                  type="password"
                  name="new_password"
                  id="new_password"
                  required
                  className="block w-full rounded-xl border-gray-300 bg-white px-4 py-3 text-sm transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="confirm_password"
                  className="text-xs font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400"
                >
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirm_password"
                  id="confirm_password"
                  required
                  className="block w-full rounded-xl border-gray-300 bg-white px-4 py-3 text-sm transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {actionData?.error && (
              <p className="text-sm font-medium text-red-600 dark:text-red-400">
                {actionData.error}
              </p>
            )}
            {actionData?.message && (
              <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                {actionData.message}
              </p>
            )}

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-gray-800 px-6 py-2.5 text-sm font-bold text-white transition-all hover:scale-[1.02] hover:bg-black focus:ring-4 focus:ring-gray-300 disabled:opacity-50 dark:bg-gray-700 dark:hover:bg-gray-600"
              >
                {isSubmitting
                  ? "Processing..."
                  : hasPassword
                    ? "Update Password"
                    : "Set Password"}
              </button>
            </div>
          </Form>
        </div>
      </section>

      {/* Connected Accounts */}
      <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
        <div className="p-6 sm:p-8">
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Connected Services
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Link your accounts to enable cloud syncing and social login
              features.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* GitHub Card */}
            <div
              className={`group flex items-center justify-between rounded-2xl border p-4 transition-all ${user?.github_id ? "border-emerald-100 bg-emerald-50/10 dark:border-emerald-900/40" : "border-gray-100 bg-gray-50/30 dark:border-gray-700 dark:bg-gray-900/30"}`}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`rounded-xl border border-gray-100 bg-white p-2 text-gray-900 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white`}
                >
                  <svg
                    className="size-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.91 8.18 6.947 9.53.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.825.612-3.422-1.362-3.422-1.362-.455-1.158-1.11-1.466-1.11-1.466-.923-.632.068-.62.068-.62 1.02.072 1.558 1.05 1.558 1.05.907 1.547 2.38 1.1 2.96.842.093-.654.352-1.1.64-1.354-2.258-.256-4.632-1.128-4.632-5.023 0-1.108.396-2.014 1.046-2.724-.105-.256-.453-1.288.1-2.686 0 0 .852-.27 2.79 1.043a9.71 9.71 0 012.537-.343c.86.004 1.72.115 2.537.343 1.938-1.313 2.79-1.043 2.79-1.043.554 1.398.206 2.43.101 2.686.65.71 1.045 1.616 1.045 2.724 0 3.906-2.378 4.764-4.643 5.016.363.31.686.92.686 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                    GitHub
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.github_id ? "Authenticated" : "Not linked"}
                  </p>
                </div>
              </div>
              {user?.github_id ? (
                <div className="flex items-center text-[10px] font-bold tracking-widest text-emerald-600 uppercase dark:text-emerald-400">
                  <span className="mr-2 size-2 animate-pulse rounded-full bg-emerald-500"></span>{" "}
                  Connected
                </div>
              ) : (
                <a
                  href="/auth/github"
                  className="text-xs font-bold text-blue-600 hover:underline dark:text-blue-400"
                >
                  Link Account
                </a>
              )}
            </div>

            {/* Discord Card */}
            <div
              className={`group flex items-center justify-between rounded-2xl border p-4 transition-all ${user?.discord_id ? "border-emerald-100 bg-emerald-50/10 dark:border-emerald-900/40" : "border-gray-100 bg-gray-50/30 dark:border-gray-700 dark:bg-gray-900/30"}`}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`rounded-xl border border-gray-100 bg-white p-2 text-[#5865F2] shadow-sm dark:border-gray-700 dark:bg-gray-800`}
                >
                  <svg
                    className="size-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.074 0 0 0-.079-.037 19.736 19.736 0 0 0-4.885 1.515.069.069 0 0 0-.032.027C.533 9.048-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.419-2.157 2.419z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                    Discord
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.discord_id ? "Authenticated" : "Not linked"}
                  </p>
                </div>
              </div>
              {user?.discord_id ? (
                <div className="flex items-center text-[10px] font-bold tracking-widest text-emerald-600 uppercase dark:text-emerald-400">
                  <span className="mr-2 size-2 animate-pulse rounded-full bg-emerald-500"></span>{" "}
                  Connected
                </div>
              ) : (
                <a
                  href="/auth/discord"
                  className="text-xs font-bold text-blue-600 hover:underline dark:text-blue-400"
                >
                  Link Account
                </a>
              )}
            </div>
          </div>
        </div>
      </section>
      {/* Danger Zone */}
      <section className="overflow-hidden rounded-2xl border border-red-100 bg-white shadow-sm transition-all hover:shadow-md dark:border-red-900/30 dark:bg-gray-800">
        <div className="p-6 sm:p-8">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-red-600 dark:text-red-400">
              Danger Zone
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Permanently delete your account and all associated data. This
              action cannot be undone.
            </p>
          </div>

          <div className="rounded-xl bg-red-50 p-4 dark:bg-red-900/10">
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div className="text-sm text-red-800 dark:text-red-200">
                Once you delete your account, there is no going back. Please be
                certain.
              </div>
              <Form
                method="post"
                onSubmit={e => {
                  if (
                    !confirm(
                      "Are you absolutely sure you want to delete your account? This action is permanent and cannot be undone.",
                    )
                  ) {
                    e.preventDefault();
                  }
                }}
              >
                <button
                  type="submit"
                  name="intent"
                  value="delete_account"
                  className="w-full rounded-xl bg-red-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-500/20 transition-all hover:bg-red-700 sm:w-auto"
                >
                  Delete Account
                </button>
              </Form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
