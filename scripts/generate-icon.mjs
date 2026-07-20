/**
 * The site mark: one frame sitting in the black rebate field, which is the
 * whole design compressed to 32 pixels. Writes src/app/icon.png, which Next
 * picks up as the favicon automatically.
 *
 *   node scripts/generate-icon.mjs
 */
import path from "node:path";
import sharp from "sharp";

const S = 256;
const inset = 34; // rebate margin around the frame
const frameH = Math.round((S - inset * 2) * (2 / 3)); // 3:2, like the frames

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}">
  <rect width="${S}" height="${S}" fill="#141310"/>
  <rect x="${inset}" y="${(S - frameH) / 2}" width="${S - inset * 2}" height="${frameH}" fill="#e9eae6"/>
</svg>`;

const out = path.join(process.cwd(), "src", "app", "icon.png");
await sharp(Buffer.from(svg)).png().toFile(out);
console.log(`icon written to src/app/icon.png (${S}×${S})`);
