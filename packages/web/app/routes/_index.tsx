import {
  json,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";
import { commitSession, getSession } from "~/services/session.server";
import Navigation from "../components/Navigation";

export const meta: MetaFunction = () => {
  return [
    { title: "Syncstuff - Seamless Sync" },
    { name: "description", content: "Sync your life across devices securely." },
  ];
};

export async function loader({ request, context }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));

  // Check for development environment using Cloudflare context if available
  // Or check host header as a fallback for local dev
  const isDev =
    context.cloudflare?.env?.API_URL?.includes("localhost") ||
    new URL(request.url).hostname === "localhost" ||
    new URL(request.url).hostname === "127.0.0.1";

  if (isDev && !session.has("userId")) {
    // Create mock login for local development convenience
    session.set("userId", "mock-user-id");
    session.set("role", "admin");
    return json(
      { isLoggedIn: true },
      {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      },
    );
  }

  return json({ isLoggedIn: session.has("userId") });
}

export default function Index() {
  const { isLoggedIn } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation isLoggedIn={isLoggedIn} />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-white dark:bg-gray-900">
          <div className="mx-auto grid max-w-screen-xl px-4 py-8 lg:grid-cols-12 lg:gap-8 lg:py-16 xl:gap-0">
            <div className="mr-auto place-self-center lg:col-span-7">
              <h1 className="mb-4 max-w-2xl text-4xl font-extrabold leading-none tracking-tight md:text-5xl xl:text-6xl dark:text-white">
                Sync Everything, Everywhere
              </h1>
              <p className="mb-6 max-w-2xl font-light text-gray-500 md:text-lg lg:mb-8 lg:text-xl dark:text-gray-400">
                Securely transfer files, clipboard, and notifications across
                your devices. No cloud required, or cloud optional. You choose.
              </p>
              {isLoggedIn ? (
                <Link
                  to="/dashboard"
                  className="mr-3 inline-flex items-center justify-center rounded-lg bg-blue-700 px-5 py-3 text-center text-base font-medium text-white hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900"
                >
                  Go to Dashboard
                  <svg
                    className="-mr-1 ml-2 size-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </Link>
              ) : (
                <a
                  href="/auth/register"
                  className="mr-3 inline-flex items-center justify-center rounded-lg bg-blue-700 px-5 py-3 text-center text-base font-medium text-white hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900"
                >
                  Get started
                  <svg
                    className="-mr-1 ml-2 size-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </a>
              )}
              <a
                href="#features"
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-5 py-3 text-center text-base font-medium text-gray-900 hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-800"
              >
                Learn more
              </a>
            </div>
            <div className="hidden lg:col-span-5 lg:mt-0 lg:flex">
              {/* <img src="/hero-mockup.png" alt="mockup" /> */}
              <div className="flex h-96 w-full items-center justify-center rounded-lg bg-gray-200 dark:bg-gray-800">
                <span className="text-gray-500 dark:text-gray-400">
                  App Mockup Placeholder
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="bg-gray-50 dark:bg-gray-800">
          <div className="mx-auto max-w-screen-xl px-4 py-8 sm:py-16 lg:px-6">
            <div className="mb-8 max-w-screen-md lg:mb-16">
              <h2 className="mb-4 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                Designed for seamless productivity
              </h2>
              <p className="text-gray-500 sm:text-xl dark:text-gray-400">
                Work across your phone, tablet, and computer without missing a
                beat.
              </p>
            </div>
            <div className="space-y-8 md:grid md:grid-cols-2 md:gap-12 md:space-y-0 lg:grid-cols-3">
              <div>
                <div className="mb-4 flex size-10 items-center justify-center rounded-full bg-blue-100 lg:size-12 dark:bg-blue-900">
                  <svg
                    className="size-5 text-blue-600 lg:size-6 dark:text-blue-300"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.9-1.348a1 1 0 00-1.78-1.006l-1.359 2.038L7.84 17.652a1 1 0 00-1.78 1.006l.92 1.348H5a2 2 0 01-2-2V5zm11 1H6v8h8V6z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </div>
                <h3 className="mb-2 text-xl font-bold dark:text-white">
                  Universal Clipboard
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Copy on your phone, paste on your laptop. It works like magic.
                </p>
              </div>
              <div>
                <div className="mb-4 flex size-10 items-center justify-center rounded-full bg-blue-100 lg:size-12 dark:bg-blue-900">
                  <svg
                    className="size-5 text-blue-600 lg:size-6 dark:text-blue-300"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"></path>
                  </svg>
                </div>
                <h3 className="mb-2 text-xl font-bold dark:text-white">
                  File Transfer
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Send files of any size between devices securely and instantly.
                </p>
              </div>
              <div>
                <div className="mb-4 flex size-10 items-center justify-center rounded-full bg-blue-100 lg:size-12 dark:bg-blue-900">
                  <svg
                    className="size-5 text-blue-600 lg:size-6 dark:text-blue-300"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"></path>
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.647 1.413 1.095 2.353 1.25V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.647-1.413-1.095-2.354-1.25V5z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </div>
                <h3 className="mb-2 text-xl font-bold dark:text-white">
                  File Transfer
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Send files of any size between devices securely and instantly.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Download Section */}
        <section id="download" className="bg-white dark:bg-gray-900">
          <div className="mx-auto max-w-screen-xl px-4 py-8 sm:py-16 lg:px-6">
            <div className="mx-auto max-w-screen-md text-center">
              <h2 className="mb-4 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                Download Syncstuff
              </h2>
              <p className="mb-8 text-gray-500 sm:text-xl dark:text-gray-400">
                Get the app on your device and start syncing today.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                {/* Android Download */}
                <a
                  href="/downloads/syncstuff-v0.0.1.apk"
                  download
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-green-700 focus:ring-4 focus:ring-green-300 dark:focus:ring-green-800"
                >
                  <svg
                    className="size-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M17.523 15.34l-.946-3.788c-.293-1.172-.733-2.198-1.32-3.072l.52-.52c.39-.39.39-1.024 0-1.414s-1.024-.39-1.414 0l-.293.293c-.883-.538-1.893-.844-2.97-.844-1.077 0-2.087.306-2.97.844l-.293-.293c-.39-.39-1.024-.39-1.414 0s-.39 1.024 0 1.414l.52.52c-.587.874-1.027 1.9-1.32 3.072l-.946 3.788c-.146.585.21 1.18.795 1.326.097.024.195.036.291.036.48 0 .918-.33 1.035-.82l.894-3.576c.39-1.56 1.167-2.846 2.254-3.716V18c0 .552.448 1 1 1s1-.448 1-1v-9.956c1.087.87 1.864 2.156 2.254 3.716l.894 3.576c.146.585.74.94 1.326.795.585-.147.94-.74.795-1.326zM12 6c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z" />
                  </svg>
                  Download for Android
                  <span className="rounded bg-green-500 px-2 py-0.5 text-xs font-semibold">
                    v0.0.1
                  </span>
                </a>

                {/* iOS Coming Soon */}
                <div className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-gray-300 bg-gray-100 px-6 py-3 text-base font-medium text-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400">
                  <svg
                    className="size-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                  iOS Coming Soon
                </div>
              </div>

              {/* CLI Install */}
              <div className="mt-8">
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  Or install via npm:
                </p>
                <code className="rounded bg-gray-100 px-3 py-2 text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                  npm install -g @involvex/syncstuff-cli
                </code>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white p-4 md:p-8 lg:p-10 dark:bg-gray-800">
        <div className="mx-auto max-w-screen-xl text-center">
          <a
            href="#"
            className="flex items-center justify-center text-2xl font-semibold text-gray-900 dark:text-white"
          >
            Syncstuff
          </a>
          <p className="my-6 text-gray-500 dark:text-gray-400">
            Open source sync for everyone.
          </p>
          <ul className="mb-6 flex flex-wrap items-center justify-center text-gray-900 dark:text-white">
            <li>
              <a href="#" className="mr-4 hover:underline md:mr-6">
                About
              </a>
            </li>
            <li>
              <a href="#" className="mr-4 hover:underline md:mr-6">
                Premium
              </a>
            </li>
            <li>
              <a href="#" className="mr-4 hover:underline md:mr-6">
                Campaigns
              </a>
            </li>
            <li>
              <a href="#" className="mr-4 hover:underline md:mr-6">
                Blog
              </a>
            </li>
            <li>
              <a href="#" className="mr-4 hover:underline md:mr-6">
                Affiliate Program
              </a>
            </li>
            <li>
              <a href="#" className="mr-4 hover:underline md:mr-6">
                FAQs
              </a>
            </li>
            <li>
              <a href="#" className="mr-4 hover:underline md:mr-6">
                Contact
              </a>
            </li>
          </ul>
          <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400">
            © 2026{" "}
            <a href="#" className="hover:underline">
              Syncstuff™
            </a>
            . All Rights Reserved.
          </span>
        </div>
      </footer>
    </div>
  );
}
