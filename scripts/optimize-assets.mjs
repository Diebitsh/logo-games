#!/usr/bin/env node
/**
 * Re-encode all bitmap assets under src/assets so the offline APK stays slim.
 *
 *  - resize to at most 1280px on the long side (kids playing on tablets/phones
 *    don't need 4K source art)
 *  - JPEG → mozjpeg q82
 *  - PNG  → palette-quantized q82
 *  - skip if the optimized buffer isn't smaller than the original
 *
 * Run with `npm run optimize:assets`.
 */
import { readdir, stat, readFile, writeFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import sharp from 'sharp';

const ROOT = 'src/assets';
const MAX_DIM = 1280;
const MIN_BYTES = 80 * 1024;

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

async function optimize(file) {
  const input = await readFile(file);
  if (input.length < MIN_BYTES) return null;

  const ext = extname(file).toLowerCase();
  const isJpeg = ext === '.jpg' || ext === '.jpeg';
  const isPng = ext === '.png';
  if (!isJpeg && !isPng) return null;

  const meta = await sharp(input).metadata();
  let pipeline = sharp(input).rotate(); // honour EXIF
  const longSide = Math.max(meta.width ?? 0, meta.height ?? 0);
  if (longSide > MAX_DIM) {
    pipeline = pipeline.resize({
      width: meta.width >= meta.height ? MAX_DIM : null,
      height: meta.height > meta.width ? MAX_DIM : null,
      fit: 'inside',
      withoutEnlargement: true,
    });
  }

  if (isJpeg) {
    pipeline = pipeline.jpeg({ quality: 82, mozjpeg: true, progressive: true });
  } else {
    pipeline = pipeline.png({ quality: 82, palette: true, compressionLevel: 9, effort: 9 });
  }

  const output = await pipeline.toBuffer();
  if (output.length >= input.length) return { skipped: true, before: input.length, after: output.length };

  await writeFile(file, output);
  return { before: input.length, after: output.length };
}

const start = Date.now();
const files = await walk(ROOT);
let totalBefore = 0;
let totalAfter = 0;
let touched = 0;
for (const f of files) {
  try {
    const res = await optimize(f);
    if (!res) continue;
    totalBefore += res.before;
    totalAfter += res.after;
    if (res.skipped) continue;
    touched++;
    const before = (res.before / 1024).toFixed(0).padStart(5);
    const after = (res.after / 1024).toFixed(0).padStart(5);
    const pct = ((1 - res.after / res.before) * 100).toFixed(0).padStart(3);
    console.log(`${before}KB → ${after}KB  -${pct}%  ${f}`);
  } catch (err) {
    console.warn(`! skipped ${f}: ${err.message}`);
  }
}
const savings = totalBefore - totalAfter;
console.log('---');
console.log(`touched ${touched}/${files.length} files in ${((Date.now() - start) / 1000).toFixed(1)}s`);
console.log(
  `total ${(totalBefore / 1024 / 1024).toFixed(1)} MB → ${(totalAfter / 1024 / 1024).toFixed(1)} MB ` +
    `(saved ${(savings / 1024 / 1024).toFixed(1)} MB)`,
);
