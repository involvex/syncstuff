import { useSearchParams } from "@remix-run/react";
import { useEffect } from "react";

export default function PairPage() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const name = searchParams.get("name");

  useEffect(() => {
    // Attempt to open the native app
    if (id) {
      const deepLink = `syncstuff://pair?id=${id}&name=${encodeURIComponent(name || "")}`;
      window.location.href = deepLink;

      // If the app doesn't open after 2 seconds, we stay on this page
      // which shows the manual info below
    }
  }, [id, name]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 p-6 text-center text-white">
      <div className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-800 p-8 shadow-2xl">
        <h1 className="mb-4 text-3xl font-bold text-blue-400">
          Pairing Request
        </h1>

        {id ? (
          <>
            <p className="mb-6 text-slate-300">
              You are pairing with device:
              <br />
              <span className="mt-2 block font-mono text-xl text-white">
                {name || "Unknown Device"}
              </span>
              <span className="mt-1 block font-mono text-xs text-slate-500">
                {id}
              </span>
            </p>

            <div className="space-y-4">
              <p className="text-sm text-slate-400">
                If the Syncstuff app didn't open automatically, you can try:
              </p>

              <a
                href={`syncstuff://pair?id=${id}&name=${encodeURIComponent(name || "")}`}
                className="block w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold transition-colors hover:bg-blue-500"
              >
                Open Syncstuff App
              </a>

              <div className="border-t border-slate-700 pt-4">
                <p className="mb-2 text-xs text-slate-500">
                  Manual Code for Enter Code section:
                </p>
                <div className="cursor-pointer rounded bg-slate-900 p-3 font-mono text-blue-300 select-all">
                  {id}
                </div>
              </div>
            </div>
          </>
        ) : (
          <p className="text-red-400">
            Invalid pairing request. No device information found.
          </p>
        )}

        <div className="mt-8 border-t border-slate-700 pt-6">
          <a href="/" className="text-sm text-blue-400 hover:text-blue-300">
            Back to Syncstuff Web
          </a>
        </div>
      </div>
    </div>
  );
}
