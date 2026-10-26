import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const brainDir = "C:/Users/beera/.gemini/antigravity-ide/brain/cf1fb723-23ba-430a-aff8-2be58dfbe3ea";
const clientPublicImages = path.join(__dirname, "Client", "public", "images");
const clientShowcase = path.join(__dirname, "Client", "public", "assets", "showcase");
const clientSrcAssets = path.join(__dirname, "Client", "src", "assets");
const mobileAssetsImages = path.join(__dirname, "mobile", "assets", "images");

// Ensure directories exist
[clientPublicImages, clientShowcase, clientSrcAssets, mobileAssetsImages].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Master mapping of source generated branded images
const sources = {
  milk: path.join(brainDir, "natural_milk_showcase_1792995575565.jpg"),
  paneer: path.join(brainDir, "natural_paneer_showcase_1792995598008.jpg"),
  ghee: path.join(brainDir, "natural_ghee_showcase_1792995637825.jpg"),
  curd: path.join(brainDir, "natural_curd_showcase_1792995662550.jpg"),
  butter: path.join(brainDir, "natural_butter_showcase_1792995685404.jpg"),
  lassi: path.join(brainDir, "natural_lassi_showcase_1792995715139.jpg"),
  chaas: path.join(brainDir, "natural_chaas_showcase_1792995744580.jpg"),
  cheese: path.join(brainDir, "natural_cheese_showcase_1792995771652.jpg"),
  khoya: path.join(brainDir, "natural_khoya_showcase_1792995799506.jpg"),
  shrikhand: path.join(brainDir, "natural_shrikhand_showcase_1792995829547.jpg"),
  basundi: path.join(brainDir, "natural_basundi_showcase_1792995857750.jpg"),
  sweets: path.join(brainDir, "natural_sweets_showcase_1792995890873.jpg"),
  cream: path.join(brainDir, "natural_cream_showcase_1792995921564.jpg"),
};

// Verification of all source files
for (const [key, filePath] of Object.entries(sources)) {
  if (!fs.existsSync(filePath)) {
    console.error(`Missing generated source image for: ${key} at ${filePath}`);
    process.exit(1);
  }
}

console.log("All 13 master Natural Milk Dairy branded source images found! Processing...");

async function processImage(srcPath, destPathNoExt, { makeJpg = true, makePng = true, makeWebp = true } = {}) {
  const image = sharp(srcPath);

  if (makePng) {
    await image.clone().png({ quality: 95, compressionLevel: 8 }).toFile(`${destPathNoExt}.png`);
  }
  if (makeWebp) {
    await image.clone().webp({ quality: 90, effort: 6 }).toFile(`${destPathNoExt}.webp`);
  }
  if (makeJpg) {
    await image.clone().jpeg({ quality: 92, mozjpeg: true }).toFile(`${destPathNoExt}.jpg`);
  }
}

async function run() {
  // 1. Process Client/public/images/ (Catalog products)
  console.log("Deploying branded images to Client/public/images/...");

  const catalogMappings = [
    { src: sources.milk, names: ["natural_cow_milk", "natural_buffalo_milk", "natural_dairy_milk", "natural_dairy_milk_pack_1786086355274"] },
    { src: sources.paneer, names: ["natural_malai_paneer", "natural_dairy_paneer", "natural_dairy_paneer_pack_1786086430746"] },
    { src: sources.ghee, names: ["natural_desi_ghee", "natural_dairy_ghee", "natural_dairy_ghee_jar_1786086374761"] },
    { src: sources.curd, names: ["natural_thick_curd"] },
    { src: sources.butter, names: ["natural_cooking_butter"] },
    { src: sources.lassi, names: ["natural_malai_lassi"] },
    { src: sources.chaas, names: ["natural_masala_chaas"] },
    { src: sources.cheese, names: ["natural_mozzarella_cheese"] },
    { src: sources.khoya, names: ["natural_khoya_mawa"] },
    { src: sources.shrikhand, names: ["natural_kesar_shrikhand"] },
    { src: sources.basundi, names: ["natural_kesar_basundi"] },
    { src: sources.sweets, names: ["natural_gulab_jamun", "natural_bengali_rasgulla", "natural_kesar_peda"] },
    { src: sources.cream, names: ["natural_dairy_cream"] },
  ];

  for (const group of catalogMappings) {
    for (const name of group.names) {
      const destBase = path.join(clientPublicImages, name);
      await processImage(group.src, destBase, { makeJpg: false, makePng: true, makeWebp: true });
      console.log(`  ✓ Created ${name}.png & ${name}.webp`);
    }
  }

  // 2. Process Client/public/assets/showcase/ (3D Showcase & Home)
  console.log("Deploying branded images to Client/public/assets/showcase/...");
  const showcaseMappings = [
    { src: sources.milk, name: "milk_hd" },
    { src: sources.milk, name: "milk_cutout" },
    { src: sources.paneer, name: "paneer_hd" },
    { src: sources.paneer, name: "paneer_cutout" },
    { src: sources.ghee, name: "ghee_hd" },
    { src: sources.ghee, name: "ghee_cutout" },
    { src: sources.curd, name: "curd_hd" },
    { src: sources.curd, name: "curd_cutout" },
    { src: sources.butter, name: "butter_hd" },
    { src: sources.lassi, name: "lassi_hd" },
    { src: sources.chaas, name: "buttermilk_hd" },
    { src: sources.cheese, name: "cheese_hd" },
    { src: sources.khoya, name: "khoya_hd" },
    { src: sources.shrikhand, name: "shrikhand_hd" },
    { src: sources.basundi, name: "basundi_hd" },
    { src: sources.sweets, name: "sweets_hd" },
    { src: sources.cream, name: "cream_hd" },
  ];

  for (const item of showcaseMappings) {
    const destBase = path.join(clientShowcase, item.name);
    await processImage(item.src, destBase, { makeJpg: false, makePng: true, makeWebp: false });
    console.log(`  ✓ Updated showcase ${item.name}.png`);
  }

  // 3. Process Client/src/assets/
  console.log("Deploying branded images to Client/src/assets/...");
  const srcAssetMappings = [
    { src: sources.milk, name: "milk" },
    { src: sources.milk, name: "freshMilk" },
    { src: sources.paneer, name: "paneer" },
    { src: sources.paneer, name: "farmFreshPaneer" },
    { src: sources.ghee, name: "ghee" },
    { src: sources.curd, name: "curd" },
    { src: sources.butter, name: "butter" },
    { src: sources.cheese, name: "cheese" },
    { src: sources.lassi, name: "lassi" },
    { src: sources.cream, name: "cream" },
    { src: sources.basundi, name: "basundi" },
    { src: sources.shrikhand, name: "shrikhand" },
    { src: sources.khoya, name: "khoa" },
    { src: sources.sweets, name: "gulabJamun" },
    { src: sources.sweets, name: "rasgulla" },
    { src: sources.sweets, name: "sweetPeda" },
  ];

  for (const item of srcAssetMappings) {
    const destBase = path.join(clientSrcAssets, item.name);
    await processImage(item.src, destBase, { makeJpg: true, makePng: false, makeWebp: false });
    console.log(`  ✓ Updated Client/src/assets/${item.name}.jpg`);
  }

  // 4. Update mobile/assets/images/
  console.log("Deploying branded freshMilk to mobile/assets/images/...");
  await processImage(sources.milk, path.join(mobileAssetsImages, "freshMilk"), { makeJpg: true, makePng: false, makeWebp: false });

  console.log("\n🎉 ALL BRANDED NATURAL MILK DAIRY PRODUCT & CATEGORY IMAGES SUCCESSFULLY GENERATED & DEPLOYED!");
}

run().catch((err) => {
  console.error("Execution failed:", err);
  process.exit(1);
});
