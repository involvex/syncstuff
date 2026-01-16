import {
  type ActionFunctionArgs,
  json,
  type LoaderFunctionArgs,
} from "@remix-run/cloudflare";
import { Form, redirect, useLoaderData, useNavigation } from "@remix-run/react";
import { Badge, Card, CardContent } from "~/components/ui";
import { getSession } from "~/services/session.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");

  if (!token) {
    return redirect("/auth/login");
  }

  try {
    const API_URL =
      context.cloudflare.env.API_URL ||
      "https://syncstuff-api.involvex.workers.dev";

    const response = await fetch(`${API_URL}/api/admin/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error("You do not have permission to view this page.");
      }
      throw new Error(`Failed to fetch users: ${response.statusText}`);
    }

    const data = (await response.json()) as { success: boolean; data: any[] };
    return json({ users: data.data || [] });
  } catch (error) {
    console.error("Admin users loader error:", error);
    // Fallback to mock if API fails in dev
    return json({ users: [] });
  }
}

export async function action({ request, context }: ActionFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");

  if (!token) {
    return json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const intent = (formData as any).get("intent");
  const userId = (formData as any).get("userId");

  if (intent === "toggle_status" && typeof userId === "string") {
    try {
      const API_URL =
        context.cloudflare.env.API_URL ||
        "https://syncstuff-api.involvex.workers.dev";

      const response = await fetch(
        `${API_URL}/api/admin/user/${userId}/status`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        return json({
          success: false,
          error: data.error || "Failed to update status",
        });
      }

      return json({ success: true });
    } catch (error) {
      console.error("Admin toggle status error:", error);
      return json({ success: false, error: "Failed to update status" });
    }
  }

  return json({ success: false, error: "Invalid intent" });
}

export default function AdminUsers() {
  const { users } = useLoaderData<typeof loader>();
  const navigation = useNavigation();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-on-surface">Users</h1>
        <p className="text-color-subtitle">
          A list of all the users in your account.
        </p>
      </div>

      <Card bordered elevate className="bg-surface border-border overflow-hidden">
        <CardContent className="p-0">
          {/* Header */}
          <div className="bg-surface-variant grid grid-cols-12 gap-4 border-b border-border p-4 text-xs font-bold text-on-surface uppercase">
            <div className="col-span-3">Username</div>
            <div className="col-span-4 hidden sm:block">Email</div>
            <div className="col-span-2">Role</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1 text-right">Action</div>
          </div>

          {users.length === 0 ? (
            <div className="flex flex-col items-center p-8">
              <p className="text-color-subtitle">No users found</p>
            </div>
          ) : (
            users.map((user: any) => (
              <div
                className="grid grid-cols-12 items-center gap-4 border-b border-border p-4 transition-colors hover:bg-surface-hover last:border-0"
                key={user.id}
              >
                <div className="col-span-3 flex flex-col">
                  <span className="font-bold text-on-surface">
                    {user.username}
                  </span>
                  <span className="block text-xs text-color-subtitle sm:hidden">
                    {user.email}
                  </span>
                </div>
                <div className="col-span-4 hidden truncate text-on-surface sm:block">
                  {user.email}
                </div>
                <div className="col-span-2">
                  <Badge variant="info" className="capitalize">
                    {user.role}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <Badge
                    variant={user.status === "active" ? "success" : "destructive"}
                    className="capitalize"
                  >
                    {user.status}
                  </Badge>
                </div>
                <div className="col-span-1 flex justify-end">
                  <Form method="post">
                    <input name="userId" type="hidden" value={user.id} />
                    <button
                      disabled={navigation.state === "submitting"}
                      name="intent"
                      className={`rounded px-2 py-1 text-sm font-medium text-white transition-colors ${
                        user.status === "active"
                          ? "bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                          : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                      } disabled:cursor-not-allowed disabled:opacity-50`}
                      type="submit"
                      value="toggle_status"
                    >
                      {user.status === "active" ? "Suspend" : "Activate"}
                    </button>
                  </Form>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
