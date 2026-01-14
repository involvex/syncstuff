import chalk from "chalk";
import { createServer, type IncomingMessage, type ServerResponse } from "http";
import { networkInterfaces } from "os";
import { type CommandContext, debugLog } from "../../utils/context.js";
import { networkScanner } from "../../utils/network.js"; // Added this line
import {
  createSpinner,
  error,
  info,
  printHeader,
  success,
} from "../../utils/ui.js";

const PORT = 54321; // Default port for SyncStuff CLI

export async function listen(
  _args: string[],
  ctx: CommandContext,
): Promise<void> {
  printHeader();
  debugLog(ctx, "Starting listen command");

  console.log(chalk.cyan("Starting SyncStuff CLI Listener..."));
  console.log(
    chalk.gray(
      "This allows other devices to discover this CLI and send files directly.\n",
    ),
  );

  const spinner = createSpinner("Initializing network listener...");
  spinner.start();

  try {
    // 1. Start HTTP Server
    const server = createServer(handleRequest);

    server.listen(PORT, "0.0.0.0", () => {
      spinner.succeed(`HTTP Server running on port ${PORT}`);

      const ips = getLocalIPs();
      if (ips.length > 0) {
        info("Listening on:");
        ips.forEach(ip => {
          console.log(`  http://${ip}:${PORT}`);
        });
      }

      // 2. Start UDP Broadcast (Advertising)
      startAdvertising();
    });

    server.on("error", err => {
      spinner.fail("Failed to start server");
      error(`Server error: ${err.message}`);
      process.exit(1);
    });
  } catch (err) {
    spinner.fail("Failed to start listener");
    error(`Error: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }
}

/**
 * Handle incoming HTTP requests
 */
function handleRequest(req: IncomingMessage, res: ServerResponse) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === "GET" && req.url === "/status") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({ status: "online", type: "cli", version: "0.0.6" }),
    );
    return;
  }

  if (req.method === "POST" && req.url === "/upload") {
    // Handle file upload
    info(`\nIncoming transfer request from ${req.socket.remoteAddress}`);

    // Minimal handler for now - just acknowledge
    // In a full implementation, we'd parse multipart/form-data or raw stream
    // and save to disk

    let dataLength = 0;
    req.on("data", chunk => {
      dataLength += chunk.length;
    });

    req.on("end", () => {
      success(`Received ${dataLength} bytes`);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, message: "File received" }));
    });

    return;
  }

  res.writeHead(404);
  res.end("Not Found");
}

/**
 * Get local IP addresses
 */
function getLocalIPs(): string[] {
  const nets = networkInterfaces();
  const results: string[] = [];

  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (net.family === "IPv4" && !net.internal) {
        results.push(net.address);
      }
    }
  }
  return results;
}

/**
 * Advertise presence via UDP
 */
function startAdvertising() {
  info("\nAdvertising CLI on local network...");

  // Start advertising
  // We use a random ID for the CLI session for now
  networkScanner.startAdvertising("SyncStuff CLI", PORT);

  info("Ready to receive files. Press Ctrl+C to stop.");
}
