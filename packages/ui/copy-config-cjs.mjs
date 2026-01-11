import { copyFileSync, existsSync, mkdirSync } from "fs";
import { dirname, resolve } from "path";

// Copy the bundled .tamagui config to dist-cjs for SSR usage
const source = resolve(".tamagui/tamagui.config.cjs");
const dest = resolve("dist-cjs/tamagui.config.cjs");

// Ensure destination directory exists
const destDir = dirname(dest);
if (!existsSync(destDir)) {
  mkdirSync(destDir, { recursive: true });
}

// Decide if we should generate (always generate in dev when compact flag is enabled)
const isDev = process.env.NODE_ENV !== 'production' || process.env.TAMAGUI_DEV_COMPACT === '1';
let shouldGenerate = isDev;
if (!shouldGenerate && existsSync(source)) {
  try {
    const content = await (await import('fs')).promises.readFile(source, 'utf8');
    if (!content || !content.trim()) {
      shouldGenerate = true;
    }
  } catch (_e) {
    shouldGenerate = true;
  }
}

if (existsSync(source) && !shouldGenerate) {
  copyFileSync(source, dest);
  console.log(`✓ Copied ${source} to ${dest}`);
} else {
  // If the CJS file is missing or empty, but a JSON representation exists or we're
  // generating in dev, generate a CJS wrapper so Tamagui's static worker can load it during dev/build.
  const jsonSource = resolve(".tamagui/tamagui.config.json");
  if (existsSync(jsonSource)) {
    const { writeFileSync } = await import("fs");

    // If we're in development and want a lightweight dev config, generate a
    // compact config that contains just the necessary tokens/themes to avoid
    // large memory usage in the Tamagui static worker.
    const jsonRaw = (await import('fs')).promises.readFile(jsonSource, 'utf8');
    const jsonRoot = await jsonRaw.then((s) => JSON.parse(s));
    const json = jsonRoot.tamaguiConfig || jsonRoot;

    // Always prefer generating a compact wrapper when we have a JSON build available.
    // This keeps the CJS wrapper small for the Tamagui static worker and avoids
    // loading the full component metadata into worker memory during dev.
    const compact = {};
    [
      'tokens',
      'themes',
      'defaultFontToken',
      'fonts',
      'shorthands',
      'media',
      'conditions',
    ].forEach((k) => {
      if (k in json) compact[k] = json[k];
    });

    const compactStr = JSON.stringify(compact);
    const wrapper = `const { createTamagui } = require('tamagui');\nconst cfg = ${compactStr};\nconst tamaguiConfig = createTamagui(cfg);\nmodule.exports = tamaguiConfig;\nmodule.exports.tamaguiConfig = tamaguiConfig;\nmodule.exports.default = tamaguiConfig;\n`;
    writeFileSync(source, wrapper);
    copyFileSync(source, dest);
    console.log(`✓ Generated compact CJS ${source} and copied to ${dest}`);
  } else {
    console.warn(`⚠ Source file not found: ${source}`);
    console.warn("  Run the build first to generate .tamagui/tamagui.config.cjs");
  }
}
