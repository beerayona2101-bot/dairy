const sharp = require('sharp');
const fs = require('fs');

async function createLogo() {
  // Resize cow logo to clean dimensions
  const cowBuffer = await sharp('src/assets/cowLogo.png')
    .resize(320, 395, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  const width = 1350;
  const height = 400;

  // Render SVG text overlay with elegant typography
  const svgText = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <style>
        .brand-main {
          font-family: 'Segoe UI', 'Inter', 'Montserrat', 'Helvetica Neue', Arial, sans-serif;
          font-weight: 800;
          font-size: 112px;
          fill: #FFFFFF;
          letter-spacing: -0.5px;
        }
        .brand-sub {
          font-family: 'Segoe UI', 'Inter', 'Montserrat', 'Helvetica Neue', Arial, sans-serif;
          font-weight: 600;
          font-size: 44px;
          fill: #E2E8F0;
          letter-spacing: 2px;
        }
      </style>
      <text x="350" y="145" class="brand-main">Madhu</text>
      <text x="350" y="255" class="brand-main">Dairy</text>
      <text x="355" y="335" class="brand-sub">And Daily Needs</text>
    </svg>
  `;

  await sharp({
    create: {
      width: width,
      height: height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
  .composite([
    {
      input: cowBuffer,
      top: 2,
      left: 10
    },
    {
      input: Buffer.from(svgText),
      top: 0,
      left: 0
    }
  ])
  .png()
  .toFile('src/assets/logoDarkMode.png');

  fs.copyFileSync('src/assets/logoDarkMode.png', 'public/logoDarkMode.png');
  console.log('Successfully generated logoDarkMode.png with pristine white text!');
}

createLogo().catch(console.error);
