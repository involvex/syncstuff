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
          <p className="text-onSurfaceVariant text-center text-xs leading-5">
            &copy; 2026 Syncstuff&trade;. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
