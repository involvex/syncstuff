import { Link } from "@remix-run/react";
import { useState } from "react";
import ThemeToggle from "./ThemeToggle";

interface NavigationProps {
  isLoggedIn?: boolean;
}

export default function Navigation({ isLoggedIn = false }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky start-0 top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-700 dark:bg-gray-900/80">
      <div className="mx-auto flex max-w-screen-xl flex-wrap items-center justify-between p-4">
        <Link
          to="/"
          className="flex items-center space-x-3 rtl:space-x-reverse"
        >
          <img
            src="/logo-light.png"
            className="h-8 dark:hidden"
            alt="Syncstuff Logo"
          />
          <img
            src="/logo-dark.png"
            className="hidden h-8 dark:block"
            alt="Syncstuff Logo"
          />
          <span className="self-center whitespace-nowrap text-2xl font-bold tracking-tight dark:text-white">
            Syncstuff
          </span>
        </Link>

        <div className="flex items-center space-x-2 md:order-2 md:space-x-4 rtl:space-x-reverse">
          <ThemeToggle />

          {isLoggedIn ? (
            <Link
              to="/dashboard"
              className="rounded-full bg-blue-600 px-4 py-2 text-center text-sm font-semibold text-white transition-all hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              to="/auth/login"
              className="rounded-full bg-blue-600 px-4 py-2 text-center text-sm font-semibold text-white transition-all hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800"
            >
              Get started
            </Link>
          )}

          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-lg p-2 text-sm text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 md:hidden dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
            aria-controls="navbar-sticky"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="sr-only">Open main menu</span>
            <svg
              className="size-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 17 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M1 1h15M1 7h15M1 13h15"
              />
            </svg>
          </button>
        </div>

        <div
          className={`w-full items-center justify-between md:order-1 md:flex md:w-auto ${
            isMenuOpen ? "block" : "hidden"
          }`}
          id="navbar-sticky"
        >
          <ul className="mt-4 flex flex-col rounded-xl border border-gray-100 bg-gray-50 p-4 font-medium md:mt-0 md:flex-row md:space-x-8 md:border-0 md:bg-transparent md:p-0 rtl:space-x-reverse dark:border-gray-700 dark:bg-gray-800 md:dark:bg-transparent">
            <li>
              <Link
                to="/"
                className="block rounded-lg px-3 py-2 text-blue-600 md:p-0 dark:text-blue-500"
                aria-current="page"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="#features"
                className="block rounded-lg px-3 py-2 text-gray-900 transition-colors hover:bg-gray-100 md:p-0 md:hover:bg-transparent md:hover:text-blue-600 dark:text-white dark:hover:bg-gray-700 md:dark:hover:bg-transparent md:dark:hover:text-blue-500"
              >
                Features
              </Link>
            </li>
            <li>
              <Link
                to="#pricing"
                className="block rounded-lg px-3 py-2 text-gray-900 transition-colors hover:bg-gray-100 md:p-0 md:hover:bg-transparent md:hover:text-blue-600 dark:text-white dark:hover:bg-gray-700 md:dark:hover:bg-transparent md:dark:hover:text-blue-500"
              >
                Pricing
              </Link>
            </li>
            {isLoggedIn && (
              <li>
                <Link
                  to="/dashboard/settings"
                  className="block rounded-lg px-3 py-2 text-gray-900 transition-colors hover:bg-gray-100 md:p-0 md:hover:bg-transparent md:hover:text-blue-600 dark:text-white dark:hover:bg-gray-700 md:dark:hover:bg-transparent md:dark:hover:text-blue-500"
                >
                  Settings
                </Link>
              </li>
            )}
            <li>
              <Link
                to="/contact"
                className="block rounded-lg px-3 py-2 text-gray-900 transition-colors hover:bg-gray-100 md:p-0 md:hover:bg-transparent md:hover:text-blue-600 dark:text-white dark:hover:bg-gray-700 md:dark:hover:bg-transparent md:dark:hover:text-blue-500"
              >
                Contact
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
