import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const inputImagePath = path.resolve('public/assets/aistudio/logoemprendimientoropa_9eefadce.jpeg');
const publicDir = path.resolve('public');

async function generateIcons() {
  console.log('Generating PWA icons from:', inputImagePath);
  if (!fs.existsSync(inputImagePath)) {
    console.error('Source image does not exist:', inputImagePath);
    process.exit(1);
  }

  // 1. 192x192 icon
  await sharp(inputImagePath)
    .resize(192, 192, { fit: 'contain', background: { r: 251, g: 247, b: 238, alpha: 1 } })
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('Created pwa-192x192.png');

  // 2. 512x512 icon
  await sharp(inputImagePath)
    .resize(512, 512, { fit: 'contain', background: { r: 251, g: 247, b: 238, alpha: 1 } })
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log('Created pwa-512x512.png');

  // 3. 512x512 maskable icon with safe zone padding (15% padding, 70% inner image)
  const innerSize = Math.round(512 * 0.75); // 384x384
  const innerImageBuffer = await sharp(inputImagePath)
    .resize(innerSize, innerSize, { fit: 'contain', background: { r: 251, g: 247, b: 238, alpha: 1 } })
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 251, g: 247, b: 238, alpha: 1 }
    }
  })
    .composite([{ input: innerImageBuffer, gravity: 'centre' }])
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
  console.log('Created pwa-maskable-512x512.png');

  // 4. Apple Touch Icon 180x180
  await sharp(inputImagePath)
    .resize(180, 180, { fit: 'contain', background: { r: 251, g: 247, b: 238, alpha: 1 } })
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Created apple-touch-icon.png');

  console.log('All PWA icons generated successfully!');
}

generateIcons().catch((err) => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
