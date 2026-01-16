import { json, type LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";
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
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
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
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
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
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
        </svg>
      ),
    },
  ];

  const isLoading = navigation.state === "loading";

  const sidebar = (
    <YStack flex={1} padding="$4" space="$4">
      <Link style={{ textDecoration: "none" }} to="/">
        <Text
          color="$primary"
          fontSize="$7"
          fontWeight="bold"
          paddingVertical="$4"
        >
          Admin Panel
        </Text>
      </Link>

      <YStack space="$1">
        <Text
          color="$colorSubtitle"
          fontSize="$2"
          fontWeight="bold"
          marginBottom="$2"
          paddingHorizontal="$4"
          textTransform="uppercase"
        >
          Admin
        </Text>
        {navItems.map(item => (
          <Link
            key={item.name}
            style={{ textDecoration: "none" }}
            to={item.href}
          >
            <SidebarItem
              active={item.active}
              icon={item.icon}
              label={item.name}
            />
          </Link>
        ))}
      </YStack>

      <Separator />

      <YStack space="$1">
        <Text
          color="$colorSubtitle"
          fontSize="$2"
          fontWeight="bold"
          marginBottom="$2"
          paddingHorizontal="$4"
          textTransform="uppercase"
        >
          App
        </Text>
        {dashboardNavItems.map(item => (
          <Link
            key={item.name}
            style={{ textDecoration: "none" }}
            to={item.href}
          >
            <SidebarItem
              active={item.active}
              icon={item.icon}
              label={item.name}
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
          <div className="bg-surface-variant h-1">
            <div
              className="bg-primary animate-progress h-full"
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
    <div className="bg-background flex min-h-screen items-center justify-center px-4 pl-64">
      <div className="bg-surface border-border w-full max-w-md rounded-lg border p-6 shadow-lg">
        <div className="bg-error/10 mx-auto flex size-12 items-center justify-center rounded-full">
          <svg
            className="text-error size-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
        </div>
        <h2 className="text-on-surface mt-4 text-center text-lg font-semibold">
          Admin Error
        </h2>
        <p className="text-color-subtitle mt-2 text-center text-sm">
          {error instanceof Error
            ? error.message
            : "An unexpected error occurred"}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            className="bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-ring rounded-md px-4 py-2 text-sm font-medium shadow-sm focus:ring-2 focus:ring-offset-2 focus:outline-none"
            to="/admin"
          >
            Go to Admin
          </Link>
          <Link
            className="bg-surface-variant text-on-surface hover:bg-surface-variant/80 focus:ring-ring rounded-md px-4 py-2 text-sm font-medium shadow-sm focus:ring-2 focus:ring-offset-2 focus:outline-none"
            to="/dashboard"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
