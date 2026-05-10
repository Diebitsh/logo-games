#!/usr/bin/env node
/**
 * Render SVG sources to PNGs:
 *  - assets/*.png  — feeds @capacitor/assets for native icons & splash
 *  - src/favicon.* — web favicon variants
 *
 * Run `npm run icons:render` after editing assets/icon-*.svg.
 */
import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

const SOURCES = [
  { svg: 'assets/icon-only.svg',       png: 'assets/icon-only.png' },
  { svg: 'assets/icon-foreground.svg', png: 'assets/icon-foreground.png' },
  { svg: 'assets/icon-background.svg', png: 'assets/icon-background.png' },
];

const FAVICONS = [
  { size:  16, out: 'src/favicon-16.png' },
  { size:  32, out: 'src/favicon-32.png' },
  { size: 180, out: 'src/apple-touch-icon.png' },
  { size: 192, out: 'src/icon-192.png' },
  { size: 512, out: 'src/icon-512.png' },
];

await mkdir('assets', { recursive: true });

for (const { svg, png } of SOURCES) {
  const buf = await readFile(svg);
  await sharp(buf, { density: 384 }).resize(1024, 1024).png().toFile(png);
  console.log(`${svg} → ${png}`);
}

const masterSvg = await readFile('assets/icon-only.svg');
for (const { size, out } of FAVICONS) {
  await sharp(masterSvg, { density: 384 })
    .resize(size, size)
    .png()
    .toFile(out);
  console.log(`favicon → ${out} (${size}px)`);
}

await copyFile('assets/icon-only.svg', 'src/favicon.svg');
console.log('favicon → src/favicon.svg');
