const sharp = require('sharp');
const fs = require('fs');

async function createLogo() {
  const width = 1350;
  const height = 400;

  // Resize cow logo to clean dimensions
  const cowBuffer = await sharp('src/assets/cowLogo.png')
    .resize(360, 360, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  // Render SVG text overlay with elegant typography
  const svgText = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <style>
        .brand-title {
          font-family: 'Segoe UI', 'Trebuchet MS', 'Arial', sans-serif;
          font-weight: 800;
          font-size: 115px;
          fill: #FFFFFF;
          letter-spacing: -1px;
        }
        .brand-subtitle {
          font-family: 'Segoe UI', 'Trebuchet MS', 'Arial', sans-serif;
          font-weight: 600;
          font-size: 42px;
          fill: #F1F5F9;
          letter-spacing: 3px;
        }
      </style>
      <text x="390" y="145" class="brand-title">Madhu</text>
      <text x="390" y="255" class="brand-title">Dairy</text>
      <text x="395" y="335" class="brand-subtitle">And Daily Needs</text>
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
      top: 20,
      left: 15
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
  console.log('Successfully regenerated logoDarkMode.png!');
}

createLogo().catch(console.error);
