const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'public', 'images');
const targets = [
  { src: ['cigarette-image.png', 'cigarette-image.jpg', 'cigarette-litter.png', 'cigarette-litter.jpg'], out: 'cigarette-litter.jpg' },
  { src: ['dryBrush.png', 'dryBrush.jpg', 'dry-brush.png', 'dry-brush.jpg'], out: 'dry-brush.jpg' },
  { src: ['prototype.png', 'prototype.jpg', 'prototype-features.png', 'prototype-features.jpg'], out: 'prototype-features.png' },
  { src: ['prototype.png', 'prototype.jpg', 'prototype-features.png', 'prototype-features.jpg'], out: 'prototype-cropped.jpg' },
  { src: ['prototype-photo.png', 'prototype-photo.jpg', 'prototype-photo.png'], out: 'prototype-photo.jpg' },
  { src: ['chemicalTraces.png', 'chemicalTraces.jpg', 'chemical-traces.png'], out: 'chemical-traces.jpg' },
];

async function processImages() {
  if (!fs.existsSync(dir)) {
    console.error('Images directory not found:', dir);
    process.exit(1);
  }

  for (const t of targets) {
    const srcPath = t.src.map((n) => path.join(dir, n)).find((p) => fs.existsSync(p));
    if (!srcPath) {
      console.log('Skipping (not found):', t.out);
      continue;
    }

    const outPath = path.join(dir, t.out);
    try {
      if (t.out === 'prototype-features.png') {
        const svgVignette = `
          <svg width="900" height="400" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="g" cx="50%" cy="35%" r="80%">
                <stop offset="0%" stop-color="rgba(0,0,0,0)"/>
                <stop offset="100%" stop-color="rgba(0,0,0,0.45)"/>
              </radialGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#g)"/>
          </svg>
        `;
        await sharp(srcPath)
          .resize(900, 400, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .modulate({ brightness: 1.03, saturation: 1.06 })
          .sharpen()
          .normalize()
          .composite([{ input: Buffer.from(svgVignette), blend: 'multiply' }])
          .png({ compressionLevel: 9 })
          .toFile(outPath);
      } else if (t.out === 'prototype-cropped.jpg') {
        await sharp(srcPath)
          .resize(900, 400, { fit: 'cover', position: 'attention' })
          .jpeg({ quality: 92 })
          .toFile(outPath);
      } else {
        await sharp(srcPath)
          .resize(900, 400, { fit: 'cover', position: 'centre' })
          .jpeg({ quality: 90 })
          .toFile(outPath);
      }
      console.log('Wrote:', outPath);
    } catch (err) {
      console.error('Failed to process', srcPath, err);
    }
  }
}

processImages().catch((e) => {
  console.error(e);
  process.exit(1);
});
