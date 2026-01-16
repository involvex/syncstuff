import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useState } from "react";
import { getSession } from "~/services/session.server";

const faqs = [
  {
    question: "How does SyncStuff synchronize my devices?",
    answer:
      "SyncStuff uses WebRTC technology to establish a direct, peer-to-peer connection between your devices. This means your data is sent directly from one device to another without ever being stored on our servers (unless you use Cloud Sync).",
  },
  {
    question: "Is SyncStuff secure?",
    answer:
      "Yes! All peer-to-peer transfers are end-to-end encrypted using industry-standard protocols. Since we prioritize P2P, we never see your data.",
  },
  {
    question: "Which platforms are supported?",
    answer:
      "SyncStuff is available on Android, iOS, Windows, macOS, Linux, and as a Web App. You can sync between any combination of these platforms.",
  },
  {
    question: "What is the file size limit?",
    answer:
      "Free users can transfer files up to 50MB. Premium users enjoy a significantly larger limit of up to 2GB per transfer.",
  },
  {
    question: "Do I need an account to use SyncStuff?",
    answer:
      "Basic P2P sync works without an account on local networks. However, to sync over the internet, manage devices remotely, or use Cloud storage, you'll need to create a free account.",
  },
  {
    question: "What is Cloud Sync?",
    answer:
      "Cloud Sync is a premium feature that uses Cloudflare R2 storage to allow you to upload files from one device and download them later on another, even if the original device is offline.",
  },
];

import { useLoaderData, useNavigate } from "@remix-run/react";
import { Footer, Navigation } from "@syncstuff/ui";

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("userId");
  return json({ isLoggedIn: !!userId });
}

export default function FAQ() {
  const { isLoggedIn } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      <Navigation
        isLoggedIn={isLoggedIn}
        onDashboard={() => navigate("/dashboard")}
        onLogin={() => navigate("/auth/login")}
        onSignup={() => navigate("/auth/signup")}
      />
      <div className="bg-background min-h-screen py-24 sm:py-32 dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-base font-bold tracking-widest text-blue-600 uppercase dark:text-blue-400">
              Support
            </h2>
            <p className="mt-2 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl dark:text-white">
              Frequently Asked Questions
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400">
              Can't find the answer you're looking for? Reach out to our{" "}
              <a
                className="font-bold text-blue-600 hover:underline dark:text-blue-400"
                href="/contact"
              >
                customer support
              </a>{" "}
              team.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-3xl">
            <dl className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  className="rounded-2xl border border-gray-100 bg-gray-50/50 p-6 transition-all dark:border-gray-800 dark:bg-gray-900/50"
                  key={index}
                >
                  <dt>
                    <button
                      className="flex w-full items-start justify-between text-left text-gray-900 dark:text-white"
                      onClick={() =>
                        setOpenIndex(openIndex === index ? null : index)
                      }
                    >
                      <span className="text-base leading-7 font-bold">
                        {faq.question}
                      </span>
                      <span className="ml-6 flex h-7 items-center">
                        <svg
                          className={`size-6 transition-transform ${openIndex === index ? "rotate-180" : ""}`}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </button>
                  </dt>
                  {openIndex === index && (
                    <dd className="mt-4 pr-12">
                      <p className="text-base leading-7 text-gray-600 dark:text-gray-400">
                        {faq.answer}
                      </p>
                    </dd>
                  )}
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
