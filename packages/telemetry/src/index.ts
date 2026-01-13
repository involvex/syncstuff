import { instrument, ResolveConfigFn } from "@microlabs/otel-cf-workers";
import { trace } from "@opentelemetry/api";

export interface Env {
  AXIOM_API_TOKEN: string;
  AXIOM_DATASET: string;
}

const handler = {
  async fetch(
    request: Request,
    _env: Env,
    _ctx: ExecutionContext,
  ): Promise<Response> {
    const url = new URL(request.url);

    // Example: Add custom attributes to the active span
    const span = trace.getActiveSpan();
    span?.setAttribute("http.method", request.method);
    span?.setAttribute("http.url", request.url);
    span?.setAttribute("http.path", url.pathname);

    if (url.pathname === "/health") {
      return new Response("OK");
    }

    const greeting = "SyncStuff Telemetry Worker is active";
    span?.setAttribute("greeting", greeting);

    return new Response(`${greeting}!`);
  },
};

const config: ResolveConfigFn = (env: Env, _trigger) => {
  return {
    exporter: {
      url: "https://api.axiom.co/v1/traces",
      headers: {
        Authorization: `Bearer ${env.AXIOM_API_TOKEN}`,
        "X-Axiom-Dataset": `${env.AXIOM_DATASET}`,
      },
    },
    service: { name: "syncstuff-telemetry" },
  };
};

export default instrument(handler, config);
