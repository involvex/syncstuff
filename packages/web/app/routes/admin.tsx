import { json, redirect, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Link, Outlet, useLocation } from "@remix-run/react";
import { getSession } from "~/services/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("userId");
  const role = session.get("role");

  if (!userId) {
    return redirect("/auth/login");
  }

  if (role !== "admin") {
    // Redirect non-admins to the dashboard
    return redirect("/dashboard");
  }

  return json({});
}

export default function AdminLayout() {
  const location = useLocation();

  const navigation = [
    {
      name: "Overview",
      href: "/dashboard",
      current: location.pathname === "/dashboard",
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      current: location.pathname === "/dashboard/settings",
    },
    {
      name: "Overview",
      href: "/admin",
      current: location.pathname === "/admin",
    },
    {
      name: "Users",
      href: "/admin/users",
      current: location.pathname.startsWith("/admin/users"),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="flex">
        {/* Sidebar */}
        <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg dark:bg-gray-800">
          <div className="flex h-16 items-center justify-center border-b border-gray-200 px-4 dark:border-gray-700">
            <Link
              to="/"
              className="text-xl font-bold text-gray-900 dark:text-white"
            >
              Syncstuff Admin
            </Link>
          </div>
          <nav className="mt-5 space-y-1 px-2">
            {navigation.map(item => (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center rounded-md p-2 text-sm font-medium ${
                  item.current
                    ? "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                }`}
              >
                {item.name}
              </Link>
            ))}
            <div className="mt-8 border-t border-gray-200 pt-4 dark:border-gray-700">
              <Link
                to="/dashboard"
                className="group flex items-center rounded-md p-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
              >
                Back to Dashboard
              </Link>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 flex-col pl-64">
          <main className="flex-1">
            <div className="py-6">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
                <Outlet />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
