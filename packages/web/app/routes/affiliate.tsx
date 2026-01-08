export default function Affiliate() {
  return (
    <div className="min-h-screen bg-white py-24 dark:bg-gray-950 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-sm font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
            Partnership
          </h2>
          <p className="mt-2 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
            Join our Affiliate Program
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400">
            Earn up to 20% commission for every premium user you refer to
            SyncStuff. Help us grow the productivity ecosystem while you earn.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <button className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-105 hover:bg-blue-700">
              Apply Now
            </button>
            <a
              href="/faq"
              className="text-sm font-bold leading-6 text-gray-900 dark:text-white"
            >
              Learn more <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>

        <div className="mx-auto mt-24 max-w-2xl sm:mt-32 lg:max-w-none">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="mb-6 flex size-12 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                <svg
                  className="size-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Share your link
              </h3>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                Get a unique referral link and share it on your blog, social
                media, or with friends.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-6 flex size-12 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                <svg
                  className="size-6"
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
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Track Signups
              </h3>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                Monitor your referrals and earnings in real-time through your
                personal affiliate dashboard.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-6 flex size-12 items-center justify-center rounded-xl bg-purple-600/10 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400">
                <svg
                  className="size-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Get Paid
              </h3>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                Receive monthly payouts directly to your account. No Minimum
                payout threshold.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
