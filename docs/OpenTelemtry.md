# OpenTelemetry using Cloudflare Workers

> This guide explains how to configure a Cloudflare Workers app to send telemetry data to Axiom.

This guide demonstrates how to configure OpenTelemetry in Cloudflare Workers to send telemetry data to Axiom using the [OTel CF Worker package](https://github.com/evanderkoogh/otel-cf-workers).

## Prerequisites

* [Create an Axiom account](https://app.axiom.co/register).
* [Create a dataset in Axiom](/reference/datasets#create-dataset) where you send your data.
* [Create an API token in Axiom](/reference/tokens) with permissions to ingest data to the dataset you have created.

- Create a Cloudflare account.
- [Install Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/), the CLI tool for Cloudflare.

## Setting up your Cloudflare Workers environment

Create a new directory for your project and navigate into it:

```bash  theme={null}
mkdir my-axiom-worker && cd my-axiom-worker
```

Initialize a new Wrangler project using this command:

```bash  theme={null}
wrangler init --type="javascript"
```

## Cloudflare Workers Script Configuration (index.ts)

Configure and implement your Workers script by integrating OpenTelemetry with the `@microlabs/otel-cf-workers` package to send telemetry data to Axiom, as illustrated in the example `index.ts` below:

```js  theme={null}
// index.ts
import { trace } from '@opentelemetry/api';
import { instrument, ResolveConfigFn } from '@microlabs/otel-cf-workers';

export interface Env {
  AXIOM_API_TOKEN: string,
  AXIOM_DATASET: string
}

const handler = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    await fetch('https://cloudflare.com');
    const greeting = "Welcome to Axiom Cloudflare instrumentation";
    trace.getActiveSpan()?.setAttribute('greeting', greeting);
    ctx.waitUntil(fetch('https://workers.dev'));
    return new Response(`${greeting}!`);
  },
};

const config: ResolveConfigFn = (env: Env, _trigger) => {
  return {
    exporter: {
      url: 'https://AXIOM_DOMAIN/v1/traces',
      headers: {
        'Authorization': `Bearer ${env.AXIOM_API_TOKEN}`,
        'X-Axiom-Dataset': `${env.AXIOM_DATASET}`
      },
    },
    service: { name: 'axiom-cloudflare-workers' },
  };
};

export default instrument(handler, config);
```

<Info>
  Replace `AXIOM_DOMAIN` with the base domain of your edge deployment. For more information, see [Edge deployments](/reference/edge-deployments).
</Info>

## Wrangler Configuration (`wrangler.toml`)

Configure **`wrangler.toml`** with your Cloudflare account details and set environment variables for the Axiom API token and dataset.

```toml  theme={null}
name = "my-axiom-worker"
type = "javascript"
account_id = "$YOUR_CLOUDFLARE_ACCOUNT_ID" # Replace with your actual Cloudflare account ID
workers_dev = true
compatibility_date = "2023-03-27"
compatibility_flags = ["nodejs_compat"]
main = "index.ts"

# Define environment variables here
[vars]
AXIOM_API_TOKEN = "API_TOKEN"
AXIOM_DATASET = "DATASET_NAME"
```

<Info>
  Replace `API_TOKEN` with the Axiom API token you have generated. For added security, store the API token in an environment variable.

  Replace `DATASET_NAME` with the name of the Axiom dataset where you send your data.
</Info>

## Install Dependencies

Navigate to the root directory of your project and add `@microlabs/otel-cf-workers` and other OTel packages to the `package.json` file.

```json  theme={null}
{
    "name": "my-axiom-worker",
    "version": "1.0.0",
    "description": "A template for kick-starting a Cloudflare Workers project",
    "main": "index.ts",
    "scripts": {
      "start": "wrangler dev",
      "deploy": "wrangler publish"
    },
    "dependencies": {
      "@microlabs/otel-cf-workers": "^1.0.0-rc.20",
      "@opentelemetry/api": "^1.6.0",
      "@opentelemetry/core": "^1.17.1",
      "@opentelemetry/exporter-trace-otlp-http": "^0.43.0",
      "@opentelemetry/otlp-exporter-base": "^0.43.0",
      "@opentelemetry/otlp-transformer": "^0.43.0",
      "@opentelemetry/resources": "^1.17.1",
      "@opentelemetry/sdk-trace-base": "^1.17.1",
      "@opentelemetry/semantic-conventions": "^1.17.1",
      "deepmerge": "^4.3.1",
      "husky": "^8.0.3",
      "lint-staged": "^15.0.2",
      "ts-checked-fsm": "^1.1.0"
    },
    "devDependencies": {
      "@changesets/cli": "^2.26.2",
      "@cloudflare/workers-types": "^4.20231016.0",
      "prettier": "^3.0.3",
      "rimraf": "^4.4.1",
      "typescript": "^5.2.2",
      "wrangler": "2.13.0"
    },
    "private": true
  }
```

Run `npm install` to install the packages. This command will install all the necessary packages listed in your `package.json` file.

## Running the instrumented app

To run your Cloudflare Workers app with OpenTelemetry instrumentation, ensure your API token and dataset are correctly set in your `wrangler.toml` file. As outlined in our `package.json` file, you have two primary scripts to manage your app’s lifecycle.

### In development mode

For local development and testing, you can start a local development server by running:

```bash  theme={null}
npm run start
```

This command runs `wrangler dev` allowing you to preview and test your app locally.

### Deploying to production

Deploy your app to the Cloudflare Workers environment by running:

```bash  theme={null}
npm run deploy
```

This command runs **`wrangler publish`**, deploying your project to Cloudflare Workers.

### Alternative: Use Wrangler directly

If you prefer not to use **`npm`** commands or want more direct control over the deployment process, you can use Wrangler commands directly in your terminal.

For local development:

```bash  theme={null}
wrangler dev
```

For deploying to Cloudflare Workers:

```bash  theme={null}
wrangler deploy
```

## View your app in Cloudflare Workers

Once you’ve deployed your app using Wrangler, view and manage it through the Cloudflare dashboard. To see your Cloudflare Workers app, follow these steps:

* In your [Cloudflare dashboard](https://dash.cloudflare.com/), click **Workers & Pages** to access the Workers section. You see a list of your deployed apps.

* Locate your app by its name. For this tutorial, look for `my-axiom-worker`.

<Frame caption="View your app in your cloudflare workers dashboard">
  <img src="https://mintcdn.com/axiom/6UXjyyx-ZiWeEcux/doc-assets/shots/view-application-in-cloudflare-workers.png?fit=max&auto=format&n=6UXjyyx-ZiWeEcux&q=85&s=f9dbc692fdc9c94ef280c4b37807fd2d" alt="View your app in your cloudflare workers dashboard" data-og-width="786" width="786" data-og-height="410" height="410" data-path="doc-assets/shots/view-application-in-cloudflare-workers.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/axiom/6UXjyyx-ZiWeEcux/doc-assets/shots/view-application-in-cloudflare-workers.png?w=280&fit=max&auto=format&n=6UXjyyx-ZiWeEcux&q=85&s=db11ed0f09e40c175a9a3f2ecf4685b4 280w, https://mintcdn.com/axiom/6UXjyyx-ZiWeEcux/doc-assets/shots/view-application-in-cloudflare-workers.png?w=560&fit=max&auto=format&n=6UXjyyx-ZiWeEcux&q=85&s=b482adfb7f1ef02cdcf0ce199c693c92 560w, https://mintcdn.com/axiom/6UXjyyx-ZiWeEcux/doc-assets/shots/view-application-in-cloudflare-workers.png?w=840&fit=max&auto=format&n=6UXjyyx-ZiWeEcux&q=85&s=f7cfda20a1db144f4e131c6f3ccc22fd 840w, https://mintcdn.com/axiom/6UXjyyx-ZiWeEcux/doc-assets/shots/view-application-in-cloudflare-workers.png?w=1100&fit=max&auto=format&n=6UXjyyx-ZiWeEcux&q=85&s=8503b9f6d0ceb76792947f2b6555205e 1100w, https://mintcdn.com/axiom/6UXjyyx-ZiWeEcux/doc-assets/shots/view-application-in-cloudflare-workers.png?w=1650&fit=max&auto=format&n=6UXjyyx-ZiWeEcux&q=85&s=1a694f8b5fb96079c85a7fda25d77042 1650w, https://mintcdn.com/axiom/6UXjyyx-ZiWeEcux/doc-assets/shots/view-application-in-cloudflare-workers.png?w=2500&fit=max&auto=format&n=6UXjyyx-ZiWeEcux&q=85&s=8c8864f56f75d9f50492df7936a7c968 2500w" />
</Frame>

* Click your app’s name to view its details. Within the app’s page, select the triggers tab to review the triggers associated with your app.

* Under the routes section of the triggers tab, you will find the URL route assigned to your Worker. This is where your Cloudflare Worker responds to incoming requests. Vist the [Cloudflare Workers documentation](https://developers.cloudflare.com/workers/get-started/guide/) to learn how to configure routes

## Observe the telemetry data in Axiom

As you interact with your app, traces will be collected and exported to Axiom, allowing you to monitor, analyze, and gain insights into your app’s performance and behavior.

<Frame caption="Observe the telemetry data in Axiom">
  <img src="https://mintcdn.com/axiom/6UXjyyx-ZiWeEcux/doc-assets/shots/observe-telemetry-data-cloudflare-workers.png?fit=max&auto=format&n=6UXjyyx-ZiWeEcux&q=85&s=29992f797893d6676d5dde9588ee7766" alt="Observe the telemetry data in Axiom" data-og-width="1407" width="1407" data-og-height="1305" height="1305" data-path="doc-assets/shots/observe-telemetry-data-cloudflare-workers.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/axiom/6UXjyyx-ZiWeEcux/doc-assets/shots/observe-telemetry-data-cloudflare-workers.png?w=280&fit=max&auto=format&n=6UXjyyx-ZiWeEcux&q=85&s=1329b793fd0bcc30fea3418e82924bf4 280w, https://mintcdn.com/axiom/6UXjyyx-ZiWeEcux/doc-assets/shots/observe-telemetry-data-cloudflare-workers.png?w=560&fit=max&auto=format&n=6UXjyyx-ZiWeEcux&q=85&s=03c0148dd16ad584e6a83955fb33aa1d 560w, https://mintcdn.com/axiom/6UXjyyx-ZiWeEcux/doc-assets/shots/observe-telemetry-data-cloudflare-workers.png?w=840&fit=max&auto=format&n=6UXjyyx-ZiWeEcux&q=85&s=77064c3ee3f4da57a7a411b409291e30 840w, https://mintcdn.com/axiom/6UXjyyx-ZiWeEcux/doc-assets/shots/observe-telemetry-data-cloudflare-workers.png?w=1100&fit=max&auto=format&n=6UXjyyx-ZiWeEcux&q=85&s=f0ba16f81f9dc2cd23dd7a28c1c143e6 1100w, https://mintcdn.com/axiom/6UXjyyx-ZiWeEcux/doc-assets/shots/observe-telemetry-data-cloudflare-workers.png?w=1650&fit=max&auto=format&n=6UXjyyx-ZiWeEcux&q=85&s=123bd47026cff06c3663e23684e2c718 1650w, https://mintcdn.com/axiom/6UXjyyx-ZiWeEcux/doc-assets/shots/observe-telemetry-data-cloudflare-workers.png?w=2500&fit=max&auto=format&n=6UXjyyx-ZiWeEcux&q=85&s=8b4c7d520733de66c58acb0aeb7c9764 2500w" />
</Frame>

## Dynamic OpenTelemetry traces dashboard

This data can then be further viewed and analyzed in Axiom’s dashboard, offering a deeper understanding of your app’s performance and behavior.

<Frame caption="Dynamic Opentelemetry traces dashboard">
  <img src="https://mintcdn.com/axiom/ht_bivVnbPw26JRw/doc-assets/shots/dynamic-opentelemetry-dashboard.png?fit=max&auto=format&n=ht_bivVnbPw26JRw&q=85&s=8b025202c1882699465a01a1eeb998dd" alt="Dynamic Opentelemetry traces dashboard" data-og-width="1450" width="1450" data-og-height="954" height="954" data-path="doc-assets/shots/dynamic-opentelemetry-dashboard.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/axiom/ht_bivVnbPw26JRw/doc-assets/shots/dynamic-opentelemetry-dashboard.png?w=280&fit=max&auto=format&n=ht_bivVnbPw26JRw&q=85&s=88cd38549dc289063b1d123c5a8d31cf 280w, https://mintcdn.com/axiom/ht_bivVnbPw26JRw/doc-assets/shots/dynamic-opentelemetry-dashboard.png?w=560&fit=max&auto=format&n=ht_bivVnbPw26JRw&q=85&s=e9bed054141bdddca44b81102e44f9a6 560w, https://mintcdn.com/axiom/ht_bivVnbPw26JRw/doc-assets/shots/dynamic-opentelemetry-dashboard.png?w=840&fit=max&auto=format&n=ht_bivVnbPw26JRw&q=85&s=98ba65aa8928797419f6edc938ca5d9e 840w, https://mintcdn.com/axiom/ht_bivVnbPw26JRw/doc-assets/shots/dynamic-opentelemetry-dashboard.png?w=1100&fit=max&auto=format&n=ht_bivVnbPw26JRw&q=85&s=32c92c98041e371efef1965e3e4d3ac3 1100w, https://mintcdn.com/axiom/ht_bivVnbPw26JRw/doc-assets/shots/dynamic-opentelemetry-dashboard.png?w=1650&fit=max&auto=format&n=ht_bivVnbPw26JRw&q=85&s=bd660abf311eae0db2f0081a895946d6 1650w, https://mintcdn.com/axiom/ht_bivVnbPw26JRw/doc-assets/shots/dynamic-opentelemetry-dashboard.png?w=2500&fit=max&auto=format&n=ht_bivVnbPw26JRw&q=85&s=4c21987e180f5408309a98f1fac7de78 2500w" />
</Frame>

**Working with Cloudflare Pages Functions:** Integration with OpenTelemetry is similar to Workers but uses the Cloudflare Dashboard for configuration, bypassing **`wrangler.toml`**. This simplifies setup through the Cloudflare dashboard web interface.

## Manual Instrumentation

Manual instrumentation requires adding code into your Worker’s script to create and manage spans around the code blocks you want to trace.

1. Initialize Tracer:

Use the OpenTelemetry API to create a tracer instance at the beginning of your script using the **`@microlabs/otel-cf-workers`** package.

```js  theme={null}
import { trace } from '@opentelemetry/api';
const tracer = trace.getTracer('your-service-name');
```

2. Create start and end Spans:

Manually start spans before the operations or events you want to trace and ensure you end them afterward to complete the tracing lifecycle.

```js  theme={null}
const span = tracer.startSpan('operationName');
try {
  // Your operation code here
} finally {
  span.end();
}
```

3. Annotate Spans:

Add important metadata to spans to provide additional context. This can include setting attributes or adding events within the span.

```js  theme={null}
span.setAttribute('key', 'value');
span.addEvent('eventName', { 'eventAttribute': 'value' });
```

## Automatic Instrumentation

Automatic instrumentation uses the **`@microlabs/otel-cf-workers`** package to automatically trace incoming requests and outbound fetch calls without manual span management.

1. Instrument your Worker:

Wrap your Cloudflare Workers script with the `instrument` function from the **`@microlabs/otel-cf-workers`** package. This automatically instruments incoming requests and outbound fetch calls.

```js  theme={null}
import { instrument } from '@microlabs/otel-cf-workers';

export default instrument(yourHandler, yourConfig);
```

2. Configuration: Provide configuration details, including how to export telemetry data and service metadata to Axiom as part of the `instrument` function call.

   ```js  theme={null}
   const config = (env) => ({
     exporter: {
       url: 'https://AXIOM_DOMAIN/v1/traces',
       headers: {
         'Authorization': `Bearer ${env.AXIOM_API_TOKEN}`,
         'X-Axiom-Dataset': `${env.AXIOM_DATASET}`
       },
     },
     service: { name: 'axiom-cloudflare-workers' },
   });
   ```

   <Info>
     Replace `AXIOM_DOMAIN` with the base domain of your edge deployment. For more information, see [Edge deployments](/reference/edge-deployments).
   </Info>

After instrumenting your Worker script, the `@microlabs/otel-cf-workers` package takes care of tracing automatically.

## Reference

### List of OpenTelemetry trace fields

| Field Category               | Field Name                                  | Description                                                                           |
| ---------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------- |
| **Unique Identifiers**       |                                             |                                                                                       |
|                              | \_rowid                                     | Unique identifier for each row in the trace data.                                     |
|                              | span\_id                                    | Unique identifier for the span within the trace.                                      |
|                              | trace\_id                                   | Unique identifier for the entire trace.                                               |
| **Timestamps**               |                                             |                                                                                       |
|                              | \_systime                                   | System timestamp when the trace data was recorded.                                    |
|                              | \_time                                      | Timestamp when the actual event being traced occurred.                                |
| **HTTP Attributes**          |                                             |                                                                                       |
|                              | attributes.custom\["http.host"]             | Host information where the HTTP request was sent.                                     |
|                              | attributes.custom\["http.server\_name"]     | Server name for the HTTP request.                                                     |
|                              | attributes.http.flavor                      | HTTP protocol version used.                                                           |
|                              | attributes.http.method                      | HTTP method used for the request.                                                     |
|                              | attributes.http.route                       | Route accessed during the HTTP request.                                               |
|                              | attributes.http.scheme                      | Protocol scheme (HTTP/HTTPS).                                                         |
|                              | attributes.http.status\_code                | HTTP response status code.                                                            |
|                              | attributes.http.target                      | Specific target of the HTTP request.                                                  |
|                              | attributes.http.user\_agent                 | User agent string of the client.                                                      |
|                              | attributes.custom.user\_agent.original      | Original user agent string, providing client software and OS.                         |
|                              | attributes.custom\["http.accepts"]          | Accepted content types for the HTTP request.                                          |
|                              | attributes.custom\["http.mime\_type"]       | MIME type of the HTTP response.                                                       |
|                              | attributes.custom.http.wrote\_bytes         | Number of bytes written in the HTTP response.                                         |
|                              | attributes.http.request.method              | HTTP request method used.                                                             |
|                              | attributes.http.response.status\_code       | HTTP status code returned in response.                                                |
| **Network Attributes**       |                                             |                                                                                       |
|                              | attributes.net.host.port                    | Port number on the host receiving the request.                                        |
|                              | attributes.net.peer.port                    | Port number on the peer (client) side.                                                |
|                              | attributes.custom\["net.peer.ip"]           | IP address of the peer in the network interaction.                                    |
|                              | attributes.net.sock.peer.addr               | Socket peer address, indicating the IP version used.                                  |
|                              | attributes.net.sock.peer.port               | Socket peer port number.                                                              |
|                              | attributes.custom.net.protocol.version      | Protocol version used in the network interaction.                                     |
|                              | attributes.network.protocol.name            | Name of the network protocol used.                                                    |
|                              | attributes.network.protocol.version         | Version of the network protocol used.                                                 |
|                              | attributes.server.address                   | Address of the server handling the request.                                           |
|                              | attributes.url.full                         | Full URL accessed in the request.                                                     |
|                              | attributes.url.path                         | Path component of the URL accessed.                                                   |
|                              | attributes.url.query                        | Query component of the URL accessed.                                                  |
|                              | attributes.url.scheme                       | Scheme component of the URL accessed.                                                 |
| **Operational Details**      |                                             |                                                                                       |
|                              | duration                                    | Time taken for the operation.                                                         |
|                              | kind                                        | Type of span (for example,, server, client).                                          |
|                              | name                                        | Name of the span.                                                                     |
|                              | scope                                       | Instrumentation scope.                                                                |
|                              | scope.name                                  | Name of the scope for the operation.                                                  |
|                              | service.name                                | Name of the service generating the trace.                                             |
|                              | service.version                             | Version of the service generating the trace.                                          |
| **Resource Attributes**      |                                             |                                                                                       |
|                              | resource.environment                        | Environment where the trace was captured, for example,, production.                   |
|                              | resource.cloud.platform                     | Platform of the cloud provider, for example,, cloudflare.workers.                     |
|                              | resource.cloud.provider                     | Name of the cloud provider, for example,, cloudflare.                                 |
|                              | resource.cloud.region                       | Cloud region where the service is located, for example,, earth.                       |
|                              | resource.faas.max\_memory                   | Maximum memory allocated for the function as a service (FaaS).                        |
| **Telemetry SDK Attributes** |                                             |                                                                                       |
|                              | telemetry.sdk.language                      | Language of the telemetry SDK, for example,, js.                                      |
|                              | telemetry.sdk.name                          | Name of the telemetry SDK, for example,, @microlabs/otel-workers-sdk.                 |
|                              | telemetry.sdk.version                       | Version of the telemetry SDK.                                                         |
| **Custom Attributes**        |                                             |                                                                                       |
|                              | attributes.custom.greeting                  | Custom greeting message, for example,, "Welcome to Axiom Cloudflare instrumentation." |
|                              | attributes.custom\["http.accepts"]          | Specifies acceptable response formats for HTTP request.                               |
|                              | attributes.custom\["net.asn"]               | Autonomous System Number representing the hosting entity.                             |
|                              | attributes.custom\["net.colo"]              | Colocation center where the request was processed.                                    |
|                              | attributes.custom\["net.country"]           | Country where the request was processed.                                              |
|                              | attributes.custom\["net.request\_priority"] | Priority of the request processing.                                                   |
|                              | attributes.custom\["net.tcp\_rtt"]          | Round Trip Time of the TCP connection.                                                |
|                              | attributes.custom\["net.tls\_cipher"]       | TLS cipher suite used for the connection.                                             |
|                              | attributes.custom\["net.tls\_version"]      | Version of the TLS protocol used for the connection.                                  |
|                              | attributes.faas.coldstart                   | Indicates if the function execution was a cold start.                                 |
|                              | attributes.faas.invocation\_id              | Unique identifier for the function invocation.                                        |
|                              | attributes.faas.trigger                     | Trigger that initiated the function execution.                                        |

### List of imported libraries

**`@microlabs/otel-cf-workers`**

This package is designed for integrating OpenTelemetry within Cloudflare Workers. It provides automatic instrumentation capabilities, making it easier to collect telemetry data from your Workers apps without extensive manual instrumentation. This package simplifies tracing HTTP requests and other asynchronous operations within Workers.

**`@opentelemetry/api`**

The core API for OpenTelemetry in JavaScript, providing the necessary interfaces and utilities for tracing, metrics, and context propagation. In the context of Cloudflare Workers, it allows developers to manually instrument custom spans, manipulate context, and access the active span if needed.

**`@opentelemetry/exporter-trace-otlp-http`**

This exporter enables your Cloudflare Workers app to send trace data over HTTP to any backend that supports the OTLP (OpenTelemetry Protocol), such as Axiom. Using OTLP ensures compatibility with a wide range of observability tools and standardizes the data export process.

**`@opentelemetry/otlp-exporter-base`**, **`@opentelemetry/otlp-transformer`**

These packages provide the foundational elements for OTLP exporters, including the transformation of telemetry data into the OTLP format and base classes for implementing OTLP exporters. They are important for ensuring that the data exported from Cloudflare Workers adheres to the OTLP specification.

**`@opentelemetry/resources`**

Defines the Resource, which represents the entity producing telemetry. In Cloudflare Workers, Resources can be used to describe the worker (for example,, service name, version) and are attached to all exported telemetry, aiding in identifying data in backend systems.


---

> To find navigation and other pages in this documentation, fetch the llms.txt file at: https://axiom.co/docs/llms.txt