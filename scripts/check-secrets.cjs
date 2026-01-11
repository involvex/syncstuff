#!/usr/bin/env node
/**
 * Security Check Script
 * Verifies that no sensitive data is stored in the git repository
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
};

// Patterns that indicate potential secrets
const sensitivePatterns = [
  {
    pattern: /GITHUB_TOKEN\s*=\s*['"]?[a-zA-Z0-9_]{20,}['"]?/i,
    name: "GitHub Token",
    severity: "high",
  },
  {
    pattern: /NPM_TOKEN\s*=\s*['"]?[a-zA-Z0-9_]{20,}['"]?/i,
    name: "NPM Token",
    severity: "high",
  },
  {
    pattern: /DISCORD_CLIENT_SECRET\s*=\s*['"]?[a-zA-Z0-9_]{20,}['"]?/i,
    name: "Discord Client Secret",
    severity: "high",
  },
  {
    pattern: /GITHUB_CLIENT_SECRET\s*=\s*['"]?[a-zA-Z0-9_]{20,}['"]?/i,
    name: "GitHub Client Secret",
    severity: "high",
  },
  {
    pattern: /IONIC_ACCESS_TOKEN\s*=\s*['"]?[a-zA-Z0-9_]{20,}['"]?/i,
    name: "Ionic Access Token",
    severity: "high",
  },
  {
    pattern: /password\s*[:=]\s*['"]?[^'"]{8,}['"]?/i,
    name: "Password",
    severity: "medium",
  },
  {
    pattern: /secret[_-]?key\s*[:=]\s*['"]?[a-zA-Z0-9_]{20,}['"]?/i,
    name: "Secret Key",
    severity: "high",
  },
  {
    pattern: /api[_-]?key\s*[:=]\s*['"]?[a-zA-Z0-9_]{20,}['"]?/i,
    name: "API Key",
    severity: "medium",
  },
  {
    pattern: /private[_-]?key\s*[:=]/i,
    name: "Private Key",
    severity: "high",
  },
  {
    pattern: /-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----/i,
    name: "Private Key Block",
    severity: "critical",
  },
];

const trackedFiles = [
  "package.json",
  "package-lock.json",
  "bun.lock",
  "*.ts",
  "*.tsx",
  "*.js",
  "*.jsx",
  "*.json",
  "*.toml",
  "*.yaml",
  "*.yml",
  "*.md",
];

function checkFile(filePath) {
  const issues = [];
  try {
    const content = fs.readFileSync(filePath, "utf8");
    sensitivePatterns.forEach(({ pattern, name, severity }) => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          // Extract line number
          const lines = content.split("\n");
          const lineNum = lines.findIndex(line => line.includes(match)) + 1;
          issues.push({
            file: filePath,
            pattern: name,
            severity,
            line: lineNum,
            match: match.substring(0, 50) + "...", // Truncate for display
          });
        });
      }
    });
  } catch (e) {
    // File might not exist or be readable, skip
    console.error(`Failed to read file ${filePath}:`, e.message);
  }
  return issues;
}

function getAllTrackedFiles() {
  try {
    // Get all tracked files from git
    const output = execSync("git ls-files", { encoding: "utf8" });
    return output
      .split("\n")
      .filter(line => line.trim())
      .filter(file => {
        // Only check text files
        return (
          file.endsWith(".ts") ||
          file.endsWith(".tsx") ||
          file.endsWith(".js") ||
          file.endsWith(".jsx") ||
          file.endsWith(".json") ||
          file.endsWith(".toml") ||
          file.endsWith(".yaml") ||
          file.endsWith(".yml") ||
          file.endsWith(".md") ||
          file === "package.json" ||
          file === "package-lock.json" ||
          file === "bun.lock"
        );
      });
  } catch (e) {
    console.error("Failed to get tracked files:", e.message);
    return [];
  }
}

function main() {
  console.log(
    `${colors.cyan}${colors.bright}🔒 Security Check - Scanning for secrets...${colors.reset}\n`,
  );

  const allIssues = [];
  const trackedFiles = getAllTrackedFiles();

  console.log(`Scanning ${trackedFiles.length} tracked files...\n`);

  trackedFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      const issues = checkFile(filePath);
      allIssues.push(...issues);
    }
  });

  // Also check .env files even if they're in .gitignore (in case they're accidentally tracked)
  const envFiles = [".env", ".env.local", ".env.production"];
  envFiles.forEach(envFile => {
    const envPath = path.join(process.cwd(), envFile);
    if (fs.existsSync(envPath)) {
      console.log(
        `${colors.yellow}⚠️  Found ${envFile} file (should be in .gitignore)${colors.reset}`,
      );
    }
  });

  // Group issues by severity
  const critical = allIssues.filter(i => i.severity === "critical");
  const high = allIssues.filter(i => i.severity === "high");
  const medium = allIssues.filter(i => i.severity === "medium");

  console.log(`\n${colors.cyan}--- 📋 Results ---${colors.reset}\n`);

  if (allIssues.length === 0) {
    console.log(
      `${colors.green}✅ No obvious secrets found in tracked files${colors.reset}\n`,
    );
  } else {
    if (critical.length > 0) {
      console.log(
        `${colors.red}${colors.bright}🚨 CRITICAL: ${critical.length} issue(s)${colors.reset}\n`,
      );
      critical.forEach(issue => {
        console.log(
          `  ${colors.red}• ${issue.file}:${issue.line} - ${issue.pattern}${colors.reset}`,
        );
        console.log(`    Match: ${issue.match}`);
      });
      console.log();
    }

    if (high.length > 0) {
      console.log(
        `${colors.red}⚠️  HIGH: ${high.length} issue(s)${colors.reset}\n`,
      );
      high.forEach(issue => {
        console.log(
          `  ${colors.red}• ${issue.file}:${issue.line} - ${issue.pattern}${colors.reset}`,
        );
        console.log(`    Match: ${issue.match}`);
      });
      console.log();
    }

    if (medium.length > 0) {
      console.log(
        `${colors.yellow}⚠️  MEDIUM: ${medium.length} issue(s)${colors.reset}\n`,
      );
      medium.forEach(issue => {
        console.log(
          `  ${colors.yellow}• ${issue.file}:${issue.line} - ${issue.pattern}${colors.reset}`,
        );
      });
      console.log();
    }

    console.log(
      `${colors.red}${colors.bright}❌ Found ${allIssues.length} potential secret(s)${colors.reset}\n`,
    );
    console.log(`${colors.cyan}💡 Recommendations:${colors.reset}`);
    console.log("  • Remove secrets from tracked files immediately");
    console.log("  • Use environment variables (.env files) for secrets");
    console.log("  • Ensure .env files are in .gitignore");
    console.log("  • Rotate any exposed secrets immediately");
    console.log();
    process.exit(1);
  }

  console.log(`${colors.green}✅ Security check passed!${colors.reset}\n`);
}

main();
