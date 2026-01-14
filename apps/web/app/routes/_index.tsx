import {
  json,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/cloudflare";
import { Link, useLoaderData, useNavigate } from "@remix-run/react";
import { Button } from "@syncstuff/ui";
import Footer from "~/components/Footer";
import { commitSession, getSession } from "~/services/session.server";
import "../tailwind.css";

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
  const navigate = useNavigate();

  return (
    <div className="bg-background text-on-background min-h-screen transition-colors duration-300">
      <main>
        {/* Hero Section */}
        <section className="bg-surface">
          <div className="mx-auto grid max-w-7xl px-4 py-8 lg:grid-cols-12 lg:gap-8 lg:py-16 xl:gap-0">
            <div className="mr-auto place-self-center lg:col-span-7">
              <h1 className="text-on-background mb-4 max-w-2xl text-4xl leading-none font-extrabold tracking-tight md:text-5xl xl:text-6xl">
                Sync secure. Sync simple. Sync everything.
              </h1>
              <p className="text-onSurfaceVariant mb-6 max-w-2xl text-lg font-light md:text-xl lg:mb-8">
                Securely transfer files, clipboard, and notifications across
                your devices. No cloud required, or cloud optional. You choose.
              </p>
              {isLoggedIn ? (
                <Link
                  className="bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary/50 mr-3 inline-flex items-center justify-center rounded-xl px-6 py-3.5 text-center text-base font-medium shadow-md transition-all duration-200 hover:shadow-lg focus:ring-4"
                  to="/dashboard"
                >
                  Go to Dashboard
                  <svg
                    className="-mr-1 ml-2 size-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      clipRule="evenodd"
                      d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                      fillRule="evenodd"
                    />
                  </svg>
                </Link>
              ) : (
                <Button
                  variant="default"
                  size="lg"
                  onClick={() => navigate("/auth/register")}
                  icon={
                    <svg
                      className="-mr-1 ml-2 size-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        clipRule="evenodd"
                        d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                        fillRule="evenodd"
                      />
                    </svg>
                  }
                >
                  Get started
                </Button>
              )}
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate("#features")}
              >
                Learn more
              </Button>
            </div>
            <div className="hidden lg:col-span-5 lg:mt-0 lg:flex">
              {/* <img src="/hero-mockup.png" alt="mockup" /> */}
              <div className="hero-hover bg-surfaceVariant ml-20 flex items-end justify-end rounded-lg p-4">
                <span className="text-onSurfaceVariant">
                  <svg
                    height="250"
                    viewBox="0 0 24 24"
                    width="350"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12.125 13H16.2q.65 0 1.1-.45t.45-1.1t-.45-1.112t-1.1-.463h-.05q-.125-.8-.725-1.338T14 8q-.65 0-1.175.338t-.8.912q-.75.05-1.263.588t-.512 1.287t.538 1.313t1.337.562M1 21V6h2v13h17v2zm4-4V2h7l2 2h9v13zm2-2h14V6h-7.825l-2-2H7zm0 0V4z"
                      fill="currentColor"
                      stroke="currentColor"
                      strokeWidth="1"
                    />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-background py-16" id="features">
          <div className="mx-auto max-w-7xl px-4 lg:px-6">
            <div className="mx-auto mb-12 max-w-3xl text-center lg:mb-16">
              <h2 className="text-onBackground mb-4 text-4xl font-extrabold tracking-tight">
                Designed for seamless productivity
              </h2>
              <p className="text-onSurfaceVariant sm:text-xl">
                Work across your phone, tablet, and computer without missing a
                beat.
              </p>
            </div>
            <div className="space-y-8 md:grid md:grid-cols-2 md:gap-8 md:space-y-0 lg:grid-cols-3">
              {/* Card 1 */}
              <div className="bg-surface-container hover:border-outline-variant rounded-2xl border border-transparent p-8 shadow-sm transition-all duration-200 hover:shadow-md">
                <div className="bg-primary/10 mb-6 flex size-12 items-center justify-center rounded-xl">
                  <svg
                    className="text-primary size-6"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      clipRule="evenodd"
                      d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.9-1.348a1 1 0 00-1.78-1.006l-1.359 2.038L7.84 17.652a1 1 0 00-1.78 1.006l.92 1.348H5a2 2 0 01-2-2V5zm11 1H6v8h8V6z"
                      fillRule="evenodd"
                    />
                  </svg>
                </div>
                <h3 className="text-onBackground mb-3 text-2xl font-bold">
                  Universal Clipboard
                </h3>
                <p className="text-on-surface-variant">
                  Copy on your phone, paste on your laptop. It works like magic.
                </p>
              </div>

              {/* Card 2 */}
              <div className="bg-surface-container hover:border-outline-variant rounded-2xl border border-transparent p-8 shadow-sm transition-all duration-200 hover:shadow-md">
                <div className="bg-primary/10 mb-6 flex size-12 items-center justify-center rounded-xl">
                  <svg
                    className="text-primary size-6"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                  </svg>
                </div>
                <h3 className="text-onBackground mb-3 text-2xl font-bold">
                  File Transfer
                </h3>
                <p className="text-on-surface-variant">
                  Send files of any size between devices securely and instantly.
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-surface-container hover:border-outline-variant rounded-2xl border border-transparent p-8 shadow-sm transition-all duration-200 hover:shadow-md">
                <div className="bg-primary/10 mb-6 flex size-12 items-center justify-center rounded-xl">
                  <svg
                    className="text-primary size-6"
                    height="24"
                    viewBox="0 0 24 24"
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4 20q-.825 0-1.412-.587T2 18V6q0-.825.588-1.412T4 4h16q.825 0 1.413.588T22 6v12q0 .825-.587 1.413T20 20zm0-2h16V8H4zm3.5-1l-1.4-1.4L8.675 13l-2.6-2.6L7.5 9l4 4zm4.5 0v-2h6v2z"
                      fill="currentColor"
                      stroke="currentColor"
                      strokeWidth="0.5"
                    />
                  </svg>
                </div>
                <h3 className="text-onBackground mb-3 text-2xl font-bold">
                  CLI Integration
                </h3>
                <p className="text-on-surface-variant">
                  Syncstuff provides a CLI tool to sync files between devices.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Download Section */}
        <section className="bg-surface" id="download">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:py-16 lg:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-onBackground mb-4 text-4xl font-extrabold tracking-tight">
                Download Syncstuff App
              </h2>
              <p className="text-onSurfaceVariant mb-8 sm:text-xl">
                Get the app on your device and start syncing today.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                {/* Android Download */}
                <a
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-green-700 focus:ring-4 focus:ring-green-300 dark:focus:ring-green-800"
                  download
                  href="/downloads/syncstuff-v0.0.1.apk"
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
                <div className="border-outlineVariant bg-surfaceVariant text-onSurfaceVariant inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-lg border px-6 py-3 text-base font-medium">
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
              <div className="mt-4">
                <p className="text-onSurfaceVariant mb-1 text-sm">
                  Or install via npm:
                </p>
                <code className="rounded bg-gray-100 px-3 py-2 text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                  npm install -g @involvex/syncstuff-cli
                </code>
              </div>
              <div className="mt-2" style={{ marginBottom: "-2rem" }}>
                <p className="text-onSurfaceVariant text-sm">
                  or quickstart with npx:
                </p>
                <code className="rounded bg-gray-100 px-3 py-2 text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                  npx @involvex/syncstuff-cli
                </code>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
