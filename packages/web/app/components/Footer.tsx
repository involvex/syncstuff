import { Link } from "@remix-run/react";

export default function Footer() {
  return (
    /* eslint-disable tailwindcss/no-custom-classname */
    <footer className="bg-surfaceContainer px-4 pb-8 pt-16 dark:bg-gray-950 sm:pt-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex justify-center space-x-6 md:order-2">
          {/* Social Links Placeholder - kept from original design concepts if needed, or remove if not present */}
        </div>
        <div className="mt-8 md:order-1 md:mt-0">
          <ul className="mb-6 flex flex-wrap items-center justify-center text-gray-900 dark:text-white">
            <li>
              <Link to="/about" className="mr-4 hover:underline md:mr-6">
                About
              </Link>
            </li>
            <li>
              <Link to="/premium" className="mr-4 hover:underline md:mr-6">
                Premium
              </Link>
            </li>
            <li>
              <Link to="/campaigns" className="mr-4 hover:underline md:mr-6">
                Campaigns
              </Link>
            </li>
            <li>
              <Link to="/faq" className="mr-4 hover:underline md:mr-6">
                FAQs
              </Link>
            </li>
            <li>
              <Link to="/contact" className="mr-4 hover:underline md:mr-6">
                Contact
              </Link>
            </li>
          </ul>
          <p className="text-center text-xs leading-5 text-gray-500 dark:text-gray-400">
            &copy; 2026 Syncstuff&trade;. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
