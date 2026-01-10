import { json, redirect, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Link, Outlet, useLocation, useNavigation } from "@remix-run/react";
import {
  MainLayout,
  Separator,
  SidebarItem,
  Text,
  YStack,
} from "@syncstuff/ui";
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
  const navigation = useNavigation();

  const navItems = [
    {
      name: "Admin Overview",
      href: "/admin",
      active: location.pathname === "/admin",
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
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
    },
    {
      name: "Users",
      href: "/admin/users",
      active: location.pathname.startsWith("/admin/users"),
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
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
    },
  ];

  const dashboardNavItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      active: location.pathname === "/dashboard",
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
  ];

  const isLoading = navigation.state === "loading";

  const sidebar = (
    <YStack flex={1} padding="$4" space="$4">
      <Link to="/" style={{ textDecoration: "none" }}>
        <Text
          fontSize="$7"
          fontWeight="bold"
          color="$purple10"
          paddingVertical="$4"
        >
          Admin Panel
        </Text>
      </Link>

      <YStack space="$1">
        <Text
          fontSize="$2"
          fontWeight="bold"
          color="$colorSubtitle"
          paddingHorizontal="$4"
          marginBottom="$2"
          textTransform="uppercase"
        >
          Admin
        </Text>
        {navItems.map(item => (
          <Link
            key={item.name}
            to={item.href}
            style={{ textDecoration: "none" }}
          >
            <SidebarItem
              icon={item.icon}
              label={item.name}
              active={item.active}
            />
          </Link>
        ))}
      </YStack>

      <Separator />

      <YStack space="$1">
        <Text
          fontSize="$2"
          fontWeight="bold"
          color="$colorSubtitle"
          paddingHorizontal="$4"
          marginBottom="$2"
          textTransform="uppercase"
        >
          App
        </Text>
        {dashboardNavItems.map(item => (
          <Link
            key={item.name}
            to={item.href}
            style={{ textDecoration: "none" }}
          >
            <SidebarItem
              icon={item.icon}
              label={item.name}
              active={item.active}
            />
          </Link>
        ))}
      </YStack>
    </YStack>
  );

  return (
    <MainLayout sidebar={sidebar} title="Admin">
      {isLoading && (
        <div className="fixed inset-x-0 top-0 z-50">
          <div className="h-1 bg-purple-200 dark:bg-purple-900">
            <div
              className="h-full animate-pulse bg-purple-600 dark:bg-purple-400"
              style={{ width: "30%" }}
            />
          </div>
        </div>
      )}
      <Outlet />
    </MainLayout>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 pl-64 dark:bg-gray-900">
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
          Admin Error
        </h2>
        <p className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
          {error instanceof Error
            ? error.message
            : "An unexpected error occurred"}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            to="/admin"
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
          >
            Go to Admin
          </Link>
          <Link
            to="/dashboard"
            className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-900 shadow-sm hover:bg-gray-300 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
