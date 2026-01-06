import { json, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { getSession } from "~/services/session.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("userId");

  const db = context.cloudflare.env.syncstuff_db;

  // Fetch user details
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user: any = await db
    .prepare(
      "SELECT email, username, full_name, role, status, created_at FROM users WHERE id = ?",
    )
    .bind(userId)
    .first();

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

        {/* Stats Card (Placeholder) */}
        <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-white">
              Storage Usage
            </h3>
            <div className="mt-5">
              <div className="flex items-baseline text-2xl font-semibold text-indigo-600">
                0 GB
                <span className="ml-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                  from 5 GB
                </span>
              </div>
              <div className="mt-4 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className="h-2 rounded-full bg-indigo-600"
                  style={{ width: "0%" }}
                ></div>
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
                {activity.map((item: any) => (
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
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
