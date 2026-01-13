/**
 * By default, Remix will handle generating the HTTP Response for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again, you can run `npx remix reveal` ✨
 * For more information, see https://remix.run/file-conventions/entry.server
 */

import type { AppLoadContext, EntryContext } from "@remix-run/cloudflare";
import { RemixServer } from "@remix-run/react";
import { isbot } from "isbot";
import { renderToReadableStream } from "react-dom/server";

const ABORT_DELAY = 5000;

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  loadContext: AppLoadContext,
) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ABORT_DELAY);

  const body = await renderToReadableStream(
    <RemixServer
      abortDelay={ABORT_DELAY}
      context={remixContext}
      url={request.url}
    />,
    {
      signal: controller.signal,
      onError(error: unknown) {
        if (!controller.signal.aborted) {
          console.error(error);
        }
        responseStatusCode = 500;
      },
    },
  );

  await body.allReady;
  body.allReady.then(() => clearTimeout(timeoutId));

  if (isbot(request.headers.get("user-agent") || "")) {
    await body.allReady;
  }

  responseHeaders.set("Content-Type", "text/html");
  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
