/**
 * Compress large PNG/JPG assets in public/assets (in-place).
 * Run: npm run optimize:assets
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assetsDir = path.resolve(__dirname, '../public/assets');

const TARGETS = [
  'notes-archive.png',
  'dns.png',
  'blog2.png',
  'blog3.png',
  'blogs4.png',
  'blogs5.png',
  'blogs6.png',
  'blogs7.png',
  'aakarshh.png',
];

async function main() {
  let sharp;
  try {
    sharp = (await import('sharp')).default;
  } catch {
    console.error('Install sharp first: npm install -D sharp');
    process.exit(1);
  }

  let savedTotal = 0;

  for (const name of TARGETS) {
    const filePath = path.join(assetsDir, name);
    if (!fs.existsSync(filePath)) {
      console.warn(`Skip (missing): ${name}`);
      continue;
    }

    const before = fs.statSync(filePath).size;
    const buffer = await sharp(filePath)
      .png({ quality: 82, compressionLevel: 9, palette: true })
      .toBuffer();

    if (buffer.length < before) {
      fs.writeFileSync(filePath, buffer);
      const saved = before - buffer.length;
      savedTotal += saved;
      console.log(`${name}: ${(before / 1024).toFixed(1)}KB → ${(buffer.length / 1024).toFixed(1)}KB`);
    } else {
      console.log(`${name}: kept original (${(before / 1024).toFixed(1)}KB)`);
    }
  }

  console.log(`Done. Total saved: ${(savedTotal / 1024).toFixed(1)}KB`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
