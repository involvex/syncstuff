import {
  json,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/cloudflare";
import { Form, useLoaderData, useNavigation } from "@remix-run/react";

export async function loader({ context }: LoaderFunctionArgs) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let users: any[] = [];

  if (
    context.cloudflare &&
    context.cloudflare.env &&
    context.cloudflare.env.syncstuff_db
  ) {
    const db = context.cloudflare.env.syncstuff_db;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await db
      .prepare(
        "SELECT id, username, email, role, status, created_at FROM users ORDER BY created_at DESC LIMIT 50",
      )
      .all();
    users = result.results;
  } else {
    console.warn("Database binding not found in admin.users, using mock data");
    users = [
      {
        id: "1",
        username: "mockuser",
        email: "mock@example.com",
        role: "user",
        status: "active",
        created_at: Date.now(),
      },
      {
        id: "2",
        username: "admin",
        email: "admin@example.com",
        role: "admin",
        status: "active",
        created_at: Date.now(),
      },
    ];
  }

  return json({ users });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const userId = formData.get("userId");

  if (
    context.cloudflare &&
    context.cloudflare.env &&
    context.cloudflare.env.syncstuff_db
  ) {
    const db = context.cloudflare.env.syncstuff_db;

    if (intent === "toggle_status" && typeof userId === "string") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const user: any = await db
        .prepare("SELECT status FROM users WHERE id = ?")
        .bind(userId)
        .first();
      if (user) {
        const newStatus = user.status === "active" ? "suspended" : "active";
        await db
          .prepare("UPDATE users SET status = ? WHERE id = ?")
          .bind(newStatus, userId)
          .run();
      }
    }
  } else {
    console.warn(
      "Database binding not found in admin.users action, skipping DB update",
    );
  }

  return json({ success: true });
}

export default function AdminUsers() {
  const { users } = useLoaderData<typeof loader>();
  const navigation = useNavigation();

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Users
          </h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            A list of all the users in your account including their name, title,
            email and role.
          </p>
        </div>
      </div>
      <div className="mt-8 flex flex-col">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black/5 dark:ring-white/10 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6"
                    >
                      Username
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                    >
                      Email
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                    >
                      Role
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                    >
                      Joined
                    </th>
                    <th
                      scope="col"
                      className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                    >
                      <span className="sr-only">Edit</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {users.map((user: any) => (
                    <tr key={user.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:pl-6">
                        {user.username}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">
                        {user.email}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">
                        {user.role}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">
                        <span
                          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${user.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <Form method="post" className="inline-block">
                          <input type="hidden" name="userId" value={user.id} />
                          <button
                            type="submit"
                            name="intent"
                            value="toggle_status"
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                            disabled={navigation.state === "submitting"}
                          >
                            {user.status === "active" ? "Suspend" : "Activate"}
                          </button>
                        </Form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
