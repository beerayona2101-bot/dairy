import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const publicAssetsDir = 'c:/Users/Lenovo/Desktop/milkapp/Client/public/assets';
const publicImagesDir = 'c:/Users/Lenovo/Desktop/milkapp/Client/public/images';

async function compressDirectory(dirPath, maxDimension = 1200) {
  if (!fs.existsSync(dirPath)) return;
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    if (file.includes('_orig_bak')) continue;

    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isFile() && (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg'))) {
      const ext = path.extname(file);
      const baseName = path.basename(file, ext);
      const webpName = `${baseName}.webp`;
      const webpPath = path.join(dirPath, webpName);

      try {
        const metadata = await sharp(filePath).metadata();
        let pipeline = sharp(filePath);

        if (metadata.width && metadata.width > maxDimension) {
          pipeline = pipeline.resize({ width: maxDimension, withoutEnlargement: true });
        }

        await pipeline
          .webp({ quality: 80, effort: 6 })
          .toFile(webpPath);

        const origSize = (stat.size / 1024).toFixed(1);
        const webpSize = (fs.statSync(webpPath).size / 1024).toFixed(1);
        console.log(`Compressed ${file} (${origSize} KB) -> ${webpName} (${webpSize} KB)`);

        if (stat.size > 400 * 1024) {
          const originalBackup = path.join(dirPath, `${baseName}_orig_bak${ext}`);
          if (!fs.existsSync(originalBackup)) {
            fs.copyFileSync(filePath, originalBackup);
          }
          const tempOut = path.join(dirPath, `${baseName}_compressed_temp${ext}`);
          let compPipeline = sharp(filePath);
          if (metadata.width && metadata.width > maxDimension) {
            compPipeline = compPipeline.resize({ width: maxDimension, withoutEnlargement: true });
          }
          if (ext === '.png') {
            await compPipeline.png({ quality: 80, compressionLevel: 9 }).toFile(tempOut);
          } else {
            await compPipeline.jpeg({ quality: 80, progressive: true }).toFile(tempOut);
          }
          fs.copyFileSync(tempOut, filePath);
          fs.unlinkSync(tempOut);
          console.log(`  Re-saved ${file} as compressed ${ext} (${(fs.statSync(filePath).size / 1024).toFixed(1)} KB)`);
        }
      } catch (err) {
        console.warn(`Failed to compress ${file}:`, err.message);
      }
    }
  }
}

async function run() {
  console.log("Starting Image Compression pass...");
  await compressDirectory(publicAssetsDir, 1400);
  await compressDirectory(publicImagesDir, 800);
  console.log("Image Compression complete!");
}

run();
