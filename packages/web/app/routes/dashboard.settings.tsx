import { type LoaderFunctionArgs, json } from "@remix-run/cloudflare";
import { Form, useLoaderData } from "@remix-run/react";
import { getSession } from "~/services/session.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("userId");
  const db = context.cloudflare.env.syncstuff_db;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user: any = await db
    .prepare("SELECT * FROM users WHERE id = ?")
    .bind(userId)
    .first();

  return json({ user });
}

export default function Settings() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <div className="space-y-6 px-4 py-6 sm:px-0">
      <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6 dark:bg-gray-800">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
              Profile
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              This information will be displayed publicly so be careful what you
              share.
            </p>
          </div>
          <div className="mt-5 md:col-span-2 md:mt-0">
            <Form method="post">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-4">
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    id="username"
                    defaultValue={user?.username}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="col-span-6 sm:col-span-4">
                  <label
                    htmlFor="full_name"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    id="full_name"
                    defaultValue={user?.full_name || ""}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="col-span-6 sm:col-span-4">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Email address
                  </label>
                  <input
                    type="text"
                    name="email"
                    id="email"
                    defaultValue={user?.email}
                    disabled
                    className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 text-gray-500 shadow-sm sm:text-sm dark:border-gray-500 dark:bg-gray-600 dark:text-gray-400"
                  />
                </div>
              </div>
              <div className="-mx-6 -mb-6 mt-6 rounded-b-lg bg-gray-50 px-4 py-3 text-right sm:px-6 dark:bg-gray-700">
                <button
                  type="submit"
                  className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Save
                </button>
              </div>
            </Form>
          </div>
        </div>
      </div>

      <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6 dark:bg-gray-800">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
              Connected Accounts
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage your connected cloud storage providers.
            </p>
          </div>
          <div className="mt-5 md:col-span-2 md:mt-0">
            <div className="space-y-4">
              {user?.github_id ? (
                <div className="flex items-center justify-between rounded-md border p-4 dark:border-gray-700">
                  <div className="flex items-center">
                    <svg
                      className="h-6 w-6 text-gray-900 dark:text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.91 8.18 6.947 9.53.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.825.612-3.422-1.362-3.422-1.362-.455-1.158-1.11-1.466-1.11-1.466-.923-.632.068-.62.068-.62 1.02.072 1.558 1.05 1.558 1.05.907 1.547 2.38 1.1 2.96.842.093-.654.352-1.1.64-1.354-2.258-.256-4.632-1.128-4.632-5.023 0-1.108.396-2.014 1.046-2.724-.105-.256-.453-1.288.1-2.686 0 0 .852-.27 2.79 1.043a9.71 9.71 0 012.537-.343c.86.004 1.72.115 2.537.343 1.938-1.313 2.79-1.043 2.79-1.043.554 1.398.206 2.43.101 2.686.65.71 1.045 1.616 1.045 2.724 0 3.906-2.378 4.764-4.643 5.016.363.31.686.92.686 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white">
                      GitHub (Connected)
                    </span>
                  </div>
                  <span className="rounded-full bg-green-100 px-2 py-1 text-sm text-green-600 dark:bg-green-900 dark:text-green-300">
                    Active
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-between rounded-md border p-4 dark:border-gray-700">
                  <div className="flex items-center">
                    <svg
                      className="h-6 w-6 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.91 8.18 6.947 9.53.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.825.612-3.422-1.362-3.422-1.362-.455-1.158-1.11-1.466-1.11-1.466-.923-.632.068-.62.068-.62 1.02.072 1.558 1.05 1.558 1.05.907 1.547 2.38 1.1 2.96.842.093-.654.352-1.1.64-1.354-2.258-.256-4.632-1.128-4.632-5.023 0-1.108.396-2.014 1.046-2.724-.105-.256-.453-1.288.1-2.686 0 0 .852-.27 2.79 1.043a9.71 9.71 0 012.537-.343c.86.004 1.72.115 2.537.343 1.938-1.313 2.79-1.043 2.79-1.043.554 1.398.206 2.43.101 2.686.65.71 1.045 1.616 1.045 2.724 0 3.906-2.378 4.764-4.643 5.016.363.31.686.92.686 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="ml-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                      GitHub (Not Connected)
                    </span>
                  </div>
                  <button className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                    Connect
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
