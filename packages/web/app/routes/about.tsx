import Footer from "../components/Footer";
import Navigation from "../components/Navigation";

export default function About() {
  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-background transition-colors dark:bg-gray-950">
        <div className="relative isolate overflow-hidden py-24 sm:py-32">
          {/* ... existing content ... */}
          {/* Decorative elements */}
          <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
            <div
              className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
              style={{
                clipPath:
                  "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
              }}
            />
          </div>

          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:mx-0">
              <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
                About SyncStuff
              </h2>
              <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400">
                SyncStuff was born out of a simple need: to make file and
                clipboard synchronization across devices as effortless as
                breathing. No cables, no complex setups, just pure connectivity.
              </p>
            </div>

            <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-12 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
              <div className="flex flex-col">
                <dt className="text-lg font-extrabold leading-7 text-gray-900 dark:text-white">
                  <span className="mb-4 block size-10 rounded-lg bg-blue-600 p-2 text-white">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </span>
                  Our Mission
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-400">
                  <p className="flex-auto">
                    To democratize cross-device productivity by providing a
                    fast, secure, and open-source platform for synchronization.
                  </p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="text-lg font-extrabold leading-7 text-gray-900 dark:text-white">
                  <span className="mb-4 block size-10 rounded-lg bg-indigo-600 p-2 text-white">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </span>
                  Privacy First
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-400">
                  <p className="flex-auto">
                    Your data is yours. We use peer-to-peer WebRTC technology to
                    ensure your files never sit on our servers unless you want
                    them to.
                  </p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="text-lg font-extrabold leading-7 text-gray-900 dark:text-white">
                  <span className="mb-4 block size-10 rounded-lg bg-purple-600 p-2 text-white">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </span>
                  Community Driven
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-400">
                  <p className="flex-auto">
                    SyncStuff is part of the Involvex ecosystem, built with love
                    by developers for developers.
                  </p>
                </dd>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Our Team
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400">
            The brilliant minds at Involvex dedicated to building the future of
            productivity.
          </p>
          <div className="mx-auto mt-20 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 bg-gray-200 dark:bg-gray-800 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-1">
            <div className="text-center">
              <a href="https://github.com/involvex" target="_blank">
                <div className="mx-auto mt-6 size-32 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-200">
                  <img
                    src="https://github.com/involvex.png"
                    alt="Involvex"
                    className="size-full object-cover"
                  />
                </div>
                <h3 className="mt-6 text-base font-bold leading-7 tracking-tight text-gray-900 dark:text-white">
                  Involvex
                </h3>
                <p className="text-sm leading-6 text-gray-600 dark:text-gray-400">
                  Lead Developer & Founder
                </p>
              </a>
            </div>
            {/* Add more team members as needed */}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
