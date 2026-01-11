import { Link } from "@remix-run/react";
import { Footer, Navigation } from "@syncstuff/ui";

export default function Premium() {
  const tiers = [
    {
      name: "Basic",
      id: "tier-basic",
      href: "/auth/signup",
      priceMonthly: "$0",
      description: "Everything you need to get started.",
      features: [
        "Unlimited device pairing",
        "Clipboard synchronization",
        "Up to 50MB file transfer",
        "Local P2P encryption",
        "Community support",
      ],
      mostPopular: false,
    },
    {
      name: "Premium",
      id: "tier-premium",
      href: "/auth/signup?plan=premium",
      priceMonthly: "$5",
      description: "Advanced features for power users.",
      features: [
        "All Basic features",
        "Up to 2GB file transfer",
        "Priority support",
        "Cross-platform notification sync",
        "Custom device names",
      ],
      mostPopular: true,
    },
    {
      name: "Team",
      id: "tier-team",
      href: "/auth/signup?plan=team",
      priceMonthly: "$15",
      description: "Collaboration for small teams.",
      features: [
        "All Premium features",
        "Shared team clipboards",
        "Admin dashboard",
        "Team file sharing",
        "SAML SSO (Coming Soon)",
        "Audit logs",
      ],
      mostPopular: false,
    },
  ];

  return (
    <>
      <Navigation />
      <div className="bg-background min-h-screen py-24 sm:py-32 dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-base font-bold tracking-widest text-blue-600 uppercase dark:text-blue-400">
              Pricing
            </h2>
            <p className="mt-2 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl dark:text-white">
              Choose the right plan for you
            </p>
          </div>
          <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600 dark:text-gray-400">
            Unlock the full potential of SyncStuff with our premium plans. No
            hidden fees, just pure productivity.
          </p>
          <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8">
            {tiers.map(tier => (
              <div
                className={`flex flex-col justify-between rounded-3xl p-8 ring-1 transition-all hover:scale-105 ${
                  tier.mostPopular
                    ? "bg-white shadow-2xl shadow-blue-500/10 ring-blue-600 dark:bg-gray-900 dark:ring-blue-500"
                    : "bg-white ring-gray-200 dark:bg-gray-900 dark:ring-gray-800"
                }`}
                key={tier.id}
              >
                <div>
                  <div className="flex items-center justify-between gap-x-4">
                    <h3
                      className={`text-lg leading-8 font-bold ${
                        tier.mostPopular
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-gray-900 dark:text-white"
                      }`}
                      id={tier.id}
                    >
                      {tier.name}
                    </h3>
                    {tier.mostPopular ? (
                      <p className="rounded-full bg-blue-600/10 px-2.5 py-1 text-xs leading-5 font-bold text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                        Most popular
                      </p>
                    ) : null}
                  </div>
                  <p className="mt-4 text-sm leading-6 text-gray-600 dark:text-gray-400">
                    {tier.description}
                  </p>
                  <p className="mt-6 flex items-baseline gap-x-1">
                    <span className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                      {tier.priceMonthly}
                    </span>
                    <span className="text-sm leading-6 font-bold text-gray-600 dark:text-gray-400">
                      /month
                    </span>
                  </p>
                  <ul className="mt-8 space-y-3 text-sm leading-6 text-gray-600 dark:text-gray-400">
                    {tier.features.map(feature => (
                      <li className="flex gap-x-3" key={feature}>
                        <svg
                          aria-hidden="true"
                          className="h-6 w-5 flex-none text-blue-600 dark:text-blue-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            clipRule="evenodd"
                            d="M16.704 4.176a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                            fillRule="evenodd"
                          />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <Link
                  aria-describedby={tier.id}
                  className={`mt-8 block rounded-xl px-3 py-2 text-center text-sm leading-6 font-bold transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                    tier.mostPopular
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700 focus-visible:outline-blue-600"
                      : "bg-blue-600/10 text-blue-600 hover:bg-blue-600/20 focus-visible:outline-blue-600 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20"
                  }`}
                  to={tier.href}
                >
                  Get started today
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
