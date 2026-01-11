import type { LinksFunction } from "@remix-run/cloudflare";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { Provider } from "@syncstuff/ui";
import { ClientOnly } from "./components/ClientOnly";

import React from "react";
import "./tailwind.css";
import "./tamagui.css";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

import { isRouteErrorResponse, useRouteError } from "@remix-run/react";

export function ErrorBoundary() {
  const error = useRouteError();
  console.error("Root ErrorBoundary:", error);
  
  return (
    <div style={{ padding: 20, background: 'darkred', color: 'white', fontFamily: 'system-ui', minHeight: '100vh' }}>
      <h1>Application Error</h1>
      <pre style={{ whiteSpace: 'pre-wrap', marginTop: 10, background: 'rgba(0,0,0,0.2)', padding: 10, borderRadius: 4 }}>
        {error instanceof Error
          ? error.message + "\n" + error.stack
          : "Unknown error"}
      </pre>
      {isRouteErrorResponse(error) && (
        <p style={{ marginTop: 10 }}>
          Status: {error.status} {error.statusText}
        </p>
      )}
    </div>
  );
}

export default function App() {
  return (
    <Provider>
      <Outlet />
    </Provider>
  );
}
