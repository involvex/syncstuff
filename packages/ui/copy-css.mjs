import { cpSync, readdirSync, existsSync, mkdirSync } from "fs";
import { dirname, join, relative, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

function findCssFiles(dir, results = []) {
  const files = readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    const fullPath = join(dir, file.name);
    if (file.isDirectory()) {
      findCssFiles(fullPath, results);
    } else if (file.name.endsWith(".css")) {
      results.push({ from: fullPath });
    }
  }
  return results;
}

const srcDir = resolve(__dirname, "src");
const distDir = resolve(__dirname, "dist");
const files = findCssFiles(srcDir);

for (const { from } of files) {
  const relPath = relative(srcDir, from);
  const to = join(distDir, relPath);
  const destDir = dirname(to);

  if (!existsSync(destDir)) {
    mkdirSync(destDir, { recursive: true });
  }
  cpSync(from, to);
  console.log(`Copied ${from} to ${to}`);
}
