import {
  json,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";
import { getSession } from "~/services/session.server";
import Navigation from "../components/Navigation";

export const meta: MetaFunction = () => {
  return [
    { title: "Syncstuff - Seamless Sync" },
    { name: "description", content: "Sync your life across devices securely." },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
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
