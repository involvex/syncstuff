import { Link } from "@remix-run/react";
import Footer from "../components/Footer";
import Navigation from "../components/Navigation";

export default function Campaigns() {
  const campaigns = [
    {
      title: "Referral Bonus",
      description:
        "Invite your friends to SyncStuff and earn free Premium months. For every friend who subscribes, you both get 1 month free.",
      status: "Active",
      icon: (
        <svg
          className="size-6 text-white"
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
      color: "bg-blue-500",
      link: "/auth/signup?ref=campaign",
    },
    {
      title: "Community Contributor",
      description:
        "Help us translate SyncStuff or contribute code to our open-source repositories. Top contributors earn lifetime Premium status.",
      status: "Ongoing",
      icon: (
        <svg
          className="size-6 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
          />
        </svg>
      ),
      color: "bg-purple-500",
      link: "https://github.com/involvex/syncstuff",
    },
    {
      title: "Bug Hunter",
      description:
        "Find a bug? Report it to us! Verified critical bugs will be rewarded with exclusive badges and Premium subscriptions.",
      status: "Ongoing",
      icon: (
        <svg
          className="size-6 text-white"
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
      ),
      color: "bg-red-500",
      link: "https://github.com/involvex/syncstuff/issues",
    },
  ];

  return (
    <>
      <Navigation />
      <div className="bg-background min-h-screen transition-colors dark:bg-gray-950">
        <div className="relative isolate overflow-hidden py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-base font-bold tracking-widest text-blue-600 uppercase dark:text-blue-400">
                Community & Rewards
              </h2>
              <p className="mt-2 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl dark:text-white">
                Active Campaigns
              </p>
              <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400">
                Join our community initiatives, earn rewards, and help shape the
                future of SyncStuff.
              </p>
            </div>

            <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-8">
              {campaigns.map(campaign => (
                <div
                  key={campaign.title}
                  className="flex flex-col justify-between rounded-3xl border border-gray-100 bg-white p-8 shadow-xl shadow-gray-200/50 transition-all hover:scale-105 hover:shadow-2xl dark:border-gray-800 dark:bg-gray-900 dark:shadow-none"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div
                        className={`flex size-12 items-center justify-center rounded-xl ${campaign.color} shadow-lg`}
                      >
                        {campaign.icon}
                      </div>
                      <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-green-600/20 ring-inset dark:bg-green-900/30 dark:text-green-400 dark:ring-green-500/30">
                        {campaign.status}
                      </span>
                    </div>
                    <h3 className="mt-6 text-xl font-bold text-gray-900 dark:text-white">
                      {campaign.title}
                    </h3>
                    <p className="mt-4 text-base leading-7 text-gray-600 dark:text-gray-400">
                      {campaign.description}
                    </p>
                  </div>
                  <div className="mt-8">
                    <Link
                      to={campaign.link}
                      className="text-sm leading-6 font-bold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Learn more <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
