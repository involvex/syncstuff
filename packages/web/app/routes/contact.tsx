import { json, type ActionFunctionArgs } from "@remix-run/cloudflare";
import { Form, useActionData, useNavigation } from "@remix-run/react";

export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData();
  const name = formData.get("name");
  const email = formData.get("email");
  const subject = formData.get("subject");
  const message = formData.get("message");
  // const recaptchaToken = formData.get("g-recaptcha-response");

  if (!name || !email || !subject || !message) {
    return json({ success: false, error: "All fields are required" });
  }

  try {
    const API_URL =
      context.cloudflare.env.API_URL ||
      "https://syncstuff-api.involvex.workers.dev";

    const response = await fetch(`${API_URL}/api/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, subject, message }),
    });

    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      return json({
        success: false,
        error: data.error || "Failed to send message",
      });
    }

    return json({
      success: true,
      message:
        "Your message has been sent successfully. We'll get back to you soon!",
    });
  } catch (error) {
    console.error("Contact form error:", error);
    return json({
      success: false,
      error: "Failed to send message. Please try again later.",
    });
  }
}

export default function Contact() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="min-h-screen bg-white transition-colors dark:bg-gray-950">
      <div className="relative overflow-hidden py-24 sm:py-32">
        {/* Background Gradients */}
        <div className="absolute left-[5%] top-[-10%] -z-10 size-2/5 rounded-full bg-blue-500/10 blur-[120px] dark:bg-blue-600/5"></div>
        <div className="absolute bottom-[-10%] right-[5%] -z-10 size-[30%] rounded-full bg-indigo-500/10 blur-[100px] dark:bg-indigo-600/5"></div>

        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-sm font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
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
                  Support
                </h3>
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                  Join our Discord community for real-time help and discussions
                  with other users and developers.
                </p>
                <a
                  href="https://discord.gg/involvex"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#5865F2] px-6 py-3 text-sm font-bold text-white transition-all hover:scale-105 hover:bg-[#4752C4]"
                >
                  <svg
                    className="size-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.074 0 0 0-.079-.037 19.736 19.736 0 0 0-4.885 1.515.069.069 0 0 0-.032.027C.533 9.048-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
                  </svg>
                  Join Discord
                </a>
              </div>

              <div className="rounded-3xl border border-gray-100 bg-gray-50/50 p-8 dark:border-gray-800 dark:bg-gray-900/50">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Email
                </h3>
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                  Prefer email? Our support team typically responds within 24
                  hours during business days.
                </p>
                <p className="mt-4 font-bold text-blue-600 dark:text-blue-400">
                  support@involvex.dev
                </p>
              </div>
            </div>

            {/* Form Section */}
            <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-xl shadow-gray-200/50 dark:border-gray-800 dark:bg-gray-900 dark:shadow-none">
              {actionData?.success ? (
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
                    {"message" in actionData ? actionData.message : ""}
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-8 text-sm font-bold text-blue-600 hover:underline dark:text-blue-400"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <Form method="post" className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label
                        htmlFor="name"
                        className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400"
                      >
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        className="block w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-3 text-sm transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="email"
                        className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400"
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        className="block w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-3 text-sm transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="subject"
                      className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400"
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
                      className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400"
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
                    ></textarea>
                  </div>

                  {actionData && "error" in actionData && (
                    <p className="text-sm font-medium text-red-600 dark:text-red-400">
                      {actionData.error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex w-full justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </button>
                </Form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
