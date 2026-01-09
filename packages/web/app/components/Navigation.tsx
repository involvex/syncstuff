import { Link } from "@remix-run/react";
import { useState } from "react";
import ThemeToggle from "./ThemeToggle";

interface NavigationProps {
  isLoggedIn?: boolean;
}

export default function Navigation({ isLoggedIn = false }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    // /* eslint-disable tailwindcss/no-custom-classname */
    // /* eslint-disable tailwindcss/no-custom-classname */
    <nav className="bg-surface/80 border-outlineVariant sticky start-0 top-0 z-50 w-full border-b backdrop-blur-md">
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
          {/* <span className="self-center whitespace-nowrap text-2xl font-bold tracking-tight dark:text-white">
            Syncstuff
          </span> */}
        </Link>

        <div className="flex items-center space-x-2 md:order-2 md:space-x-4 rtl:space-x-reverse">
          <ThemeToggle />

          {isLoggedIn ? (
            <Link
              to="/dashboard"
              className="bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary/50 rounded-full px-4 py-2 text-center text-sm font-semibold transition-all focus:ring-4 focus:outline-none"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              to="/auth/login"
              className="bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary/50 rounded-full px-4 py-2 text-center text-sm font-semibold transition-all focus:ring-4 focus:outline-none"
            >
              Get started
            </Link>
          )}

          <button
            type="button"
            className="text-onSurface hover:bg-surfaceVariant focus:ring-outlineVariant inline-flex size-10 items-center justify-center rounded-lg p-2 text-sm focus:ring-2 focus:outline-none md:hidden"
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
          <ul className="border-outlineVariant bg-surfaceVariant mt-4 flex flex-col rounded-xl border p-4 font-medium md:mt-0 md:flex-row md:space-x-8 md:border-0 md:bg-transparent md:p-0 rtl:space-x-reverse">
            <li>
              <Link
                to="/"
                className="text-onSurface hover:bg-surfaceVariant/50 md:hover:text-primary block rounded-lg px-3 py-2 transition-colors md:p-0 md:hover:bg-transparent"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className="text-onSurface hover:bg-surfaceVariant/50 md:hover:text-primary block rounded-lg px-3 py-2 transition-colors md:p-0 md:hover:bg-transparent"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                to="/premium"
                className="text-onSurface hover:bg-surfaceVariant/50 md:hover:text-primary block rounded-lg px-3 py-2 transition-colors md:p-0 md:hover:bg-transparent"
              >
                Premium
              </Link>
            </li>
            <li>
              <Link
                to="/campaigns"
                className="text-onSurface hover:bg-surfaceVariant/50 md:hover:text-primary block rounded-lg px-3 py-2 transition-colors md:p-0 md:hover:bg-transparent"
              >
                Campaigns
              </Link>
            </li>
            <li>
              <Link
                to="/faq"
                className="text-onSurface hover:bg-surfaceVariant/50 md:hover:text-primary block rounded-lg px-3 py-2 transition-colors md:p-0 md:hover:bg-transparent"
              >
                FAQs
              </Link>
            </li>
            {isLoggedIn && (
              <li>
                <Link
                  to="/dashboard/settings"
                  className="text-onSurface hover:bg-surfaceVariant/50 md:hover:text-primary block rounded-lg px-3 py-2 transition-colors md:p-0 md:hover:bg-transparent"
                >
                  Settings
                </Link>
              </li>
            )}
            <li>
              <Link
                to="/contact"
                className="text-onSurface hover:bg-surfaceVariant/50 md:hover:text-primary block rounded-lg px-3 py-2 transition-colors md:p-0 md:hover:bg-transparent"
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
