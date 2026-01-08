import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json, redirect } from "@remix-run/cloudflare";
import {
  Form,
  Link,
  Outlet,
  useLoaderData,
  useLocation,
  useNavigation,
} from "@remix-run/react";
import { getSession } from "~/services/session.server";
import ThemeToggle from "../components/ThemeToggle";

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("userId");
  const role = session.get("role");

  if (!userId) {
    return redirect("/auth/login");
  }

  return json({ userId, role });
}

export default function DashboardLayout() {
  const { userId, role } = useLoaderData<typeof loader>();
  const location = useLocation();
  const navigation = useNavigation();

  const navItems = [
    {
      name: "Overview",
      href: "/dashboard",
      current: location.pathname === "/dashboard",
      icon: (
        <svg
          className="size-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      current: location.pathname === "/dashboard/settings",
      icon: (
        <svg
          className="size-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
  ];

  if (role === "admin") {
    navItems.push({
      name: "Admin",
      href: "/admin",
      current: location.pathname.startsWith("/admin"),
      icon: (
        <svg
          className="size-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
    });
  }

  const isLoading = navigation.state === "loading";

  return (
    <div className="flex min-h-screen bg-gray-50 transition-colors duration-200 dark:bg-gray-900">
      {/* Sidebar for Desktop */}
      <aside className="hidden border-r border-gray-200 bg-white backdrop-blur-sm md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col dark:border-gray-800 dark:bg-gray-800/50">
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex h-16 shrink-0 items-center border-b border-gray-200 px-4 dark:border-gray-800">
            <Link
              to="/"
              className="text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400"
            >
              Syncstuff
            </Link>
          </div>
          <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4">
            {navItems.map(item => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                  item.current
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700/50 dark:hover:text-white"
                }`}
              >
                <span
                  className={`mr-3 ${item.current ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-500"}`}
                >
                  {item.icon}
                </span>
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="shrink-0 border-t border-gray-200 p-4 dark:border-gray-800">
            <div className="flex items-center gap-3 px-2">
              <div className="flex size-8 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-600 dark:bg-blue-900 dark:text-blue-400">
                {userId.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                  User
                </p>
                <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                  ID: {userId.substring(0, 8)}
                </p>
              </div>
            </div>
            <Form action="/auth/logout" method="post" className="mt-4">
              <button
                type="submit"
                className="flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
              >
                Sign out
              </button>
            </Form>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col md:pl-64">
        {/* Top Header */}
        <header className="sticky top-0 z-10 flex h-16 shrink-0 border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/80">
          <div className="flex flex-1 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex md:hidden">
              <button
                type="button"
                className="-ml-2 rounded-md p-2 text-gray-400 hover:text-gray-500 focus:outline-none lg:hidden"
                onClick={() => {
                  const menu = document.getElementById("mobile-sidebar");
                  if (menu) menu.classList.toggle("hidden");
                }}
              >
                <svg
                  className="size-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              <Link
                to="/"
                className="ml-4 text-xl font-bold text-blue-600 dark:text-blue-400"
              >
                Syncstuff
              </Link>
            </div>

            <div className="flex-1"></div>

            <div className="flex items-center space-x-4">
              <ThemeToggle />
              {role === "admin" && (
                <span className="hidden items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800 sm:inline-flex dark:bg-purple-900 dark:text-purple-200">
                  Admin
                </span>
              )}
            </div>
          </div>
        </header>

        {isLoading && (
          <div className="fixed inset-x-0 top-0 z-50">
            <div className="h-1 bg-blue-100 dark:bg-blue-900">
              <div
                className="h-full animate-[progress_2s_ease-in-out_infinite] bg-blue-600 dark:bg-blue-400"
                style={{ width: "30%" }}
              />
            </div>
          </div>
        )}

        <main className="flex-1 py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      <div id="mobile-sidebar" className="fixed inset-0 z-40 hidden md:hidden">
        <div
          className="fixed inset-0 bg-gray-600/75 backdrop-blur-sm"
          onClick={() =>
            document.getElementById("mobile-sidebar")?.classList.add("hidden")
          }
        ></div>
        <div className="fixed inset-y-0 left-0 flex w-full max-w-xs flex-col bg-white pb-4 pt-5 dark:bg-gray-800">
          <div className="flex items-center justify-between px-4">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              Syncstuff
            </div>
            <button
              type="button"
              className="p-2 text-gray-400 hover:text-gray-500 focus:outline-none"
              onClick={() =>
                document
                  .getElementById("mobile-sidebar")
                  ?.classList.add("hidden")
              }
            >
              <svg
                className="size-6"
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
            </button>
          </div>
          <nav className="mt-5 flex-1 space-y-1 overflow-y-auto px-2">
            {navItems.map(item => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center rounded-lg px-3 py-2 text-base font-medium ${
                  item.current
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700/50 dark:hover:text-white"
                }`}
                onClick={() =>
                  document
                    .getElementById("mobile-sidebar")
                    ?.classList.add("hidden")
                }
              >
                <span
                  className={`mr-4 ${item.current ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-500"}`}
                >
                  {item.icon}
                </span>
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
          <svg
            className="size-6 text-red-600 dark:text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="mt-4 text-center text-lg font-semibold text-gray-900 dark:text-white">
          Something went wrong
        </h2>
        <p className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
          {error instanceof Error
            ? error.message
            : "An unexpected error occurred"}
        </p>
        <div className="mt-6 flex justify-center">
          <Link
            to="/dashboard"
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Go back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
