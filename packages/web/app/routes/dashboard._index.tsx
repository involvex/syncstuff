import { json, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { getSession } from "~/services/session.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("userId");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let user: any = null;

  // Check if DB is available (it might not be in some local dev modes without wrangler)
  if (
    context.cloudflare &&
    context.cloudflare.env &&
    context.cloudflare.env.syncstuff_db
  ) {
    const db = context.cloudflare.env.syncstuff_db;
    try {
      // Fetch user details
      user = await db
        .prepare(
          "SELECT email, username, full_name, role, status, created_at FROM users WHERE id = ?",
        )
        .bind(userId)
        .first();
    } catch (e) {
      console.error("Database error:", e);
    }
  } else {
    // Mock user for local dev if DB is missing
    console.warn("Database binding not found, using mock data");
    user = {
      username: "mockuser",
      email: "mock@example.com",
      full_name: "Mock User",
      role: "admin",
      status: "active",
      created_at: Date.now(),
    };
  }

  // Fetch recent activity (mock for now as we don't have activity logs yet)
  const activity = [
    {
      id: 1,
      type: "login",
      description: "Logged in from Web",
      date: new Date().toISOString(),
    },
  ];

  return json({ user, activity });
}

export default function DashboardIndex() {
  const { user, activity } = useLoaderData<typeof loader>();

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* User Profile Card */}
        <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-white">
              Profile
            </h3>
            <div className="mt-5 space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Username
                </p>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {user?.username || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Email
                </p>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {user?.email}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Status
                </p>
                <span
                  className={`mt-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    user?.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {user?.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Card */}
        <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-white">
              Recent Activity
            </h3>
            <div className="mt-5 flow-root">
              <ul className="-my-5 divide-y divide-gray-200 dark:divide-gray-700">
                {activity.map(
                  (item: { id: number; description: string; date: string }) => (
                    <li key={item.id} className="py-4">
                      <div className="flex items-center space-x-4">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                            {item.description}
                          </p>
                          <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                            {new Date(item.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </li>
                  ),
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
