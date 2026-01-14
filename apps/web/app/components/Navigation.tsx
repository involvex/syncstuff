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
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between p-4">
        <Link
          className="flex shrink-0 items-center space-x-3 rtl:space-x-reverse"
          to="/"
        >
          <img
            alt="Syncstuff Logo"
            className="h-8 dark:hidden"
            src="/logo-light.png"
          />
          <img
            alt="Syncstuff Logo"
            className="hidden h-8 dark:block"
            src="/logo-dark.png"
          />
        </Link>

        <div className="flex items-center space-x-2 md:order-2 md:space-x-4 rtl:space-x-reverse">
          <ThemeToggle />

          {isLoggedIn ? (
            <Link
              className="bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary/50 rounded-full px-4 py-2 text-center text-sm font-semibold transition-all focus:ring-4 focus:outline-none"
              to="/dashboard"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              className="bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary/50 rounded-full px-4 py-2 text-center text-sm font-semibold transition-all focus:ring-4 focus:outline-none"
              to="/auth/login"
            >
              Get started
            </Link>
          )}

          <button
            type="button"
            aria-controls="navbar-sticky"
            aria-expanded={isMenuOpen}
            className="text-onSurface hover:bg-surfaceVariant focus:ring-outlineVariant inline-flex size-10 items-center justify-center rounded-lg p-2 text-sm focus:ring-2 focus:outline-none md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="sr-only">Open main menu</span>
            <svg
              aria-hidden="true"
              className="size-5"
              fill="none"
              viewBox="0 0 17 14"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1 1h15M1 7h15M1 13h15"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          </button>
        </div>

        <div
          className={`w-full items-center justify-between md:order-1 md:flex md:w-auto ${
            isMenuOpen
              ? "absolute top-full left-0 block bg-white/95 px-4 pb-4 shadow-lg backdrop-blur-md md:relative md:top-auto md:bg-transparent md:p-0 md:shadow-none md:backdrop-blur-none dark:bg-gray-900/95"
              : "hidden"
          }`}
          id="navbar-sticky"
        >
          <ul className="border-outlineVariant bg-surfaceVariant mt-4 flex flex-col rounded-xl border p-4 font-medium md:mt-0 md:flex-row md:space-x-8 md:border-0 md:bg-transparent md:p-0 rtl:space-x-reverse">
            <li>
              <Link
                className="text-onSurface hover:bg-surfaceVariant/50 md:hover:text-primary block rounded-lg px-3 py-2 transition-colors md:p-0 md:hover:bg-transparent"
                onClick={() => setIsMenuOpen(false)}
                to="/"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                className="text-onSurface hover:bg-surfaceVariant/50 md:hover:text-primary block rounded-lg px-3 py-2 transition-colors md:p-0 md:hover:bg-transparent"
                onClick={() => setIsMenuOpen(false)}
                to="/about"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                className="text-onSurface hover:bg-surfaceVariant/50 md:hover:text-primary block rounded-lg px-3 py-2 transition-colors md:p-0 md:hover:bg-transparent"
                onClick={() => setIsMenuOpen(false)}
                to="/premium"
              >
                Premium
              </Link>
            </li>
            <li>
              <Link
                className="text-onSurface hover:bg-surfaceVariant/50 md:hover:text-primary block rounded-lg px-3 py-2 transition-colors md:p-0 md:hover:bg-transparent"
                onClick={() => setIsMenuOpen(false)}
                to="/campaigns"
              >
                Campaigns
              </Link>
            </li>
            <li>
              <Link
                className="text-onSurface hover:bg-surfaceVariant/50 md:hover:text-primary block rounded-lg px-3 py-2 transition-colors md:p-0 md:hover:bg-transparent"
                onClick={() => setIsMenuOpen(false)}
                to="/faq"
              >
                FAQs
              </Link>
            </li>

            <li>
              <Link
                className="text-onSurface hover:bg-surfaceVariant/50 md:hover:text-primary block rounded-lg px-3 py-2 transition-colors md:p-0 md:hover:bg-transparent"
                onClick={() => setIsMenuOpen(false)}
                to="/contact"
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
