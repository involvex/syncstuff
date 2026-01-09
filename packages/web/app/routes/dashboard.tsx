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
    <div className="bg-background flex min-h-screen transition-colors duration-200">
      {/* Sidebar for Desktop */}
      <aside className="border-outlineVariant bg-surface hidden border-r backdrop-blur-sm md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="border-outlineVariant flex h-16 shrink-0 items-center border-b px-4">
            <Link
              to="/"
              className="text-primary text-2xl font-bold tracking-tight"
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
                    ? "bg-surfaceVariant text-onSurface"
                    : "text-onSurface hover:bg-surfaceVariant hover:text-primary"
                }`}
              >
                <span
                  className={`mr-3 ${item.current ? "text-primary" : "text-onSurfaceVariant"}`}
                >
                  {item.icon}
                </span>
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="border-outlineVariant shrink-0 border-t p-4">
            <div className="flex items-center gap-3 px-2">
              <div className="bg-surfaceVariant text-primary flex size-8 items-center justify-center rounded-full font-bold">
                {userId.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-onSurface truncate text-sm font-medium">
                  User
                </p>
                <p className="text-onSurfaceVariant truncate text-xs">
                  ID: {userId.substring(0, 8)}
                </p>
              </div>
            </div>
            <Form action="/auth/logout" method="post" className="mt-4">
              <button
                type="submit"
                className="border-outlineVariant bg-surface text-onSurface hover:bg-surfaceVariant flex w-full items-center justify-center rounded-lg border px-4 py-2 text-sm font-medium"
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
        <header className="border-outlineVariant bg-surface/80 sticky top-0 z-10 flex h-16 shrink-0 border-b backdrop-blur-md">
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
              <Link to="/" className="text-primary ml-4 text-xl font-bold">
                Syncstuff
              </Link>
            </div>

            <div className="flex-1"></div>

            <div className="flex items-center space-x-4">
              <ThemeToggle />
              {role === "admin" && (
                <span className="bg-surfaceVariant text-primary hidden items-center rounded-full px-2.5 py-0.5 text-xs font-medium sm:inline-flex">
                  Admin
                </span>
              )}
            </div>
          </div>
        </header>

        {isLoading && (
          <div className="fixed inset-x-0 top-0 z-50">
            <div className="bg-surfaceVariant h-1">
              <div
                className="bg-primary h-full animate-[progress_2s_ease-in-out_infinite]"
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
          className="bg-background/75 fixed inset-0 backdrop-blur-sm"
          onClick={() =>
            document.getElementById("mobile-sidebar")?.classList.add("hidden")
          }
        ></div>
        <div className="bg-surface fixed inset-y-0 left-0 flex w-full max-w-xs flex-col pt-5 pb-4">
          <div className="flex items-center justify-between px-4">
            <div className="text-primary text-2xl font-bold">Syncstuff</div>
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
                    ? "bg-surfaceVariant text-onSurface"
                    : "text-onSurface hover:bg-surfaceVariant hover:text-primary"
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
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
          >
            Go back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
