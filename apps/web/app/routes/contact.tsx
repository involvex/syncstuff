import emailjs from "@emailjs/browser";
import { useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { maintainers } from "../../package.json";

export async function action() {
  // Keep server action for fallback or potential future use
  return null;
}

export default function Contact() {
  const form = useRef<HTMLFormElement>(null);
  const [isSending, setIsSending] = useState(false);
  const [emailStatus, setEmailStatus] = useState<"idle" | "success" | "error">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);

  const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
  const isRecaptchaEnabled = !!recaptchaSiteKey;

  const sendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!form.current) return;

    if (isRecaptchaEnabled && !recaptchaToken) {
      setErrorMessage("Please complete the reCAPTCHA verification.");
      return;
    }

    setIsSending(true);

    const formData = new FormData(form.current);
    const templateParams = Object.fromEntries(formData.entries());

    // Explicitly add reCAPTCHA token if not already in formData (it should be via hidden input, but checking)
    if (!templateParams["g-recaptcha-response"]) {
      templateParams["g-recaptcha-response"] = recaptchaToken;
    }

    emailjs
      .send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        templateParams,
        {
          publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
        },
      )
      .then(
        () => {
          setEmailStatus("success");
          setIsSending(false);
          form.current?.reset();
          setRecaptchaToken(null);
        },
        error => {
          console.error("FAILED...", error.text);
          setEmailStatus("error");
          setErrorMessage("Failed to send message. Please try again.");
          setIsSending(false);
        },
      );
  };

  return (
    <>
      <div className="min-h-screen bg-white transition-colors dark:bg-gray-950">
        <div className="relative overflow-hidden py-24 sm:py-32">
          {/* Background Gradients */}
          <div className="absolute top-[-10%] left-[5%] -z-10 size-2/5 rounded-full bg-blue-500/10 blur-[120px] dark:bg-blue-600/5" />
          <div className="absolute right-[5%] bottom-[-10%] -z-10 size-[30%] rounded-full bg-indigo-500/10 blur-[100px] dark:bg-indigo-600/5" />

          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-sm font-bold tracking-widest text-blue-600 uppercase dark:text-blue-400">
                Contact Us
              </h2>
              <p className="mt-2 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl dark:text-white">
                Get in touch
              </p>
              <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400">
                Have questions or need help? Our team is here to support you in
                your synchronization journey.
              </p>
            </div>

            <div className="mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-12 lg:grid-cols-2">
              {/* Info Section */}
              <div className="space-y-8">
                <div className="rounded-3xl border border-gray-100 bg-gray-50/50 p-8 dark:border-gray-800 dark:bg-gray-900/50">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Email
                  </h3>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">
                    Prefer email? Our support team typically responds within 24
                    hours during business days.
                  </p>
                  <p className="mt-4 font-bold text-blue-600 dark:text-blue-400">
                    {maintainers}
                  </p>
                </div>
              </div>

              {/* Form Section */}
              <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-xl shadow-gray-200/50 dark:border-gray-800 dark:bg-gray-900 dark:shadow-none">
                {emailStatus === "success" ? (
                  <div className="text-center">
                    <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                      <svg
                        className="size-10 text-emerald-600 dark:text-emerald-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <h3 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white">
                      Message Sent!
                    </h3>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                      We've received your message and will get back to you
                      shortly.
                    </p>
                    <button
                      onClick={() => setEmailStatus("idle")}
                      className="mt-8 text-sm font-bold text-blue-600 hover:underline dark:text-blue-400"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form ref={form} onSubmit={sendEmail} className="space-y-6">
                    <input
                      type="hidden"
                      name="g-recaptcha-response"
                      value={recaptchaToken || ""}
                    />
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label
                          htmlFor="name"
                          className="text-xs font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400"
                        >
                          Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="user_name"
                          required
                          className="block w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-3 text-sm transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                          placeholder="John Doe"
                        />
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor="email"
                          className="text-xs font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400"
                        >
                          Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="user_email"
                          required
                          className="block w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-3 text-sm transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="subject"
                        className="text-xs font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400"
                      >
                        Subject
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        required
                        className="block w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-3 text-sm transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      >
                        <option value="">Select a topic</option>
                        <option value="support">Technical Support</option>
                        <option value="billing">Billing & Premium</option>
                        <option value="feedback">Feature Feedback</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="message"
                        className="text-xs font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400"
                      >
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={4}
                        required
                        className="block w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-3 text-sm transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        placeholder="How can we help you?"
                      />
                    </div>

                    {isRecaptchaEnabled && recaptchaSiteKey && (
                      <div className="flex justify-center">
                        <ReCAPTCHA
                          sitekey={recaptchaSiteKey}
                          onChange={setRecaptchaToken}
                          theme="light"
                        />
                      </div>
                    )}

                    {!isRecaptchaEnabled && (
                      <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                        Note: reCAPTCHA is not configured. Contact form may be vulnerable to spam.
                      </p>
                    )}

                    {emailStatus === "error" && (
                      <p className="text-sm font-medium text-red-600 dark:text-red-400">
                        {errorMessage}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={isSending || (isRecaptchaEnabled && !recaptchaToken)}
                      className="flex w-full justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSending ? "Sending..." : "Send Message"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
