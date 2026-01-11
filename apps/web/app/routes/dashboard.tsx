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
import {
  Button,
  MainLayout,
  SidebarItem,
  Text,
  XStack,
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
    {
      name: "Settings",
      href: "/dashboard/settings",
      active: location.pathname === "/dashboard/settings",
      icon: (
        <svg
          className="size-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
          <path
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
        </svg>
      ),
    },
  ];

  if (role === "admin") {
    navItems.push({
      name: "Admin",
      href: "/admin",
      active: location.pathname.startsWith("/admin"),
      icon: (
        <svg
          className="size-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
        </svg>
      ),
    });
  }

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
          Syncstuff
        </Text>
      </Link>

      <YStack space="$1">
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

      <YStack flex={1} />

      {role === "admin" && (
        <YStack
          borderColor="$borderColor"
          borderTopWidth={1}
          marginBottom="$4"
          paddingTop="$4"
          space="$1"
        >
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
          <Link style={{ textDecoration: "none" }} to="/admin">
            <SidebarItem
              icon={
                <svg
                  className="size-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              }
              label="Admin Panel"
            />
          </Link>
        </YStack>
      )}

      <YStack
        borderColor="$borderColor"
        borderTopWidth={1}
        paddingTop="$4"
        space="$4"
      >
        <XStack alignItems="center" space="$3">
          <div className="bg-surfaceVariant text-primary flex size-8 items-center justify-center rounded-full font-bold">
            {userId.charAt(0).toUpperCase()}
          </div>
          <YStack flex={1}>
            <Text fontSize="$3" fontWeight="bold" numberOfLines={1}>
              User
            </Text>
            <Text
              color="$colorSubtitle"
              fontSize="          "
              numberOfLines={1}
            >
              {userId.substring(0, 8)}
            </Text>
          </YStack>
        </XStack>

        <Form action="/auth/logout" method="post">
          <Button theme="red" width="100%">
            Sign out
          </Button>
        </Form>
      </YStack>
    </YStack>
  );

  return (
    <MainLayout sidebar={sidebar} title="Dashboard">
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
      <Outlet />
    </MainLayout>
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
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
            to="/dashboard"
          >
            Go back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
