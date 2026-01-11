import { copyFileSync, existsSync, mkdirSync } from 'fs';
import { dirname, resolve } from 'path';

// Copy the bundled .tamagui config to dist-cjs for SSR usage
const source = resolve('.tamagui/tamagui.config.cjs');
const dest = resolve('dist-cjs/tamagui.config.cjs');

// Ensure destination directory exists
const destDir = dirname(dest);
if (!existsSync(destDir)) {
  mkdirSync(destDir, { recursive: true });
}

if (existsSync(source)) {
  copyFileSync(source, dest);
  console.log(`✓ Copied ${source} to ${dest}`);
} else {
  console.warn(`⚠ Source file not found: ${source}`);
  console.warn('  Run the build first to generate .tamagui/tamagui.config.cjs');
}
