import { Link } from "@remix-run/react";

export default function Footer() {
  return (
    // /* eslint-disable tailwindcss/no-custom-classname */
    <footer className="bg-surface-container border-outlineVariant border-t px-4 pt-16 pb-8 sm:pt-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex justify-center space-x-6 md:order-2">
          {/* Social Links Placeholder - kept from original design concepts if needed, or remove if not present */}
        </div>
        <div className="mt-8 md:order-1 md:mt-0">
          <ul className="text-on-surface mb-6 flex flex-wrap items-center justify-center">
            <li>
              <Link className="mr-4 hover:underline md:mr-6" to="/about">
                About
              </Link>
            </li>
            <li>
              <Link className="mr-4 hover:underline md:mr-6" to="/premium">
                Premium
              </Link>
            </li>
            <li>
              <Link className="mr-4 hover:underline md:mr-6" to="/campaigns">
                Campaigns
              </Link>
            </li>
            <li>
              <Link className="mr-4 hover:underline md:mr-6" to="/faq">
                FAQs
              </Link>
            </li>
            <li>
              <Link className="mr-4 hover:underline md:mr-6" to="/contact">
                Contact
              </Link>
            </li>
          </ul>
          <p className="text-onSurfaceVariant text-center text-xs leading-5">
            &copy; 2026 Syncstuff&trade;. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
