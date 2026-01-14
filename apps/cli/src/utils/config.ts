import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";

export interface Config {
  token?: string | null;
  user?: {
    id: string;
    email: string;
    username: string;
    full_name?: string;
    role: string;
  } | null;
  apiUrl?: string;
  deviceId?: string;
}

const CONFIG_DIR = join(homedir(), ".syncstuff");
const CONFIG_FILE = join(CONFIG_DIR, "config.json");

function ensureConfigDir(): void {
  try {
    mkdirSync(CONFIG_DIR, { recursive: true });
  } catch {
    // Directory might already exist
  }
}

export function readConfig(): Config {
  ensureConfigDir();
  try {
    const content = readFileSync(CONFIG_FILE, "utf-8");
    return JSON.parse(content) as Config;
  } catch {
    return {};
  }
}

export function writeConfig(config: Config): void {
  ensureConfigDir();
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
}
