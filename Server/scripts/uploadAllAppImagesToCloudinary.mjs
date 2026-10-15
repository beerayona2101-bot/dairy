import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env variables
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const CLOUD_NAME = (process.env.CLOUDINARY_CLOUD_NAME || "").trim();
const API_KEY = (process.env.CLOUDINARY_API_KEY || "").trim();
const API_SECRET = (process.env.CLOUDINARY_API_SECRET || "").trim();
const FOLDER_NAME = (process.env.CLOUDINARY_FOLDER || "dairy_app").trim();
const DB_URL = process.env.DB_URL;

console.log("=================================================");
console.log("🚀 CLOUDINARY APPLICATION IMAGES MIGRATION SCRIPT");
console.log("=================================================");
console.log(`Cloud Name  : ${CLOUD_NAME}`);
console.log(`API Key     : ${API_KEY}`);
console.log(`Target Folder: ${FOLDER_NAME}`);
console.log(`MongoDB URL : ${DB_URL ? DB_URL.split("@")[1] : "N/A"}`);
console.log("=================================================\n");

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET,
});

const isImageFile = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  return [".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"].includes(ext);
};

const uploadFileToCloudinary = async (filePath) => {
  try {
    const filenameWithoutExt = path.parse(filePath).name;
    const cleanPublicId = `${FOLDER_NAME}/${filenameWithoutExt.replace(/[^a-zA-Z0-9_\-]/g, "_")}`;
    const preset = (process.env.CLOUDINARY_UPLOAD_PRESET || "ml_default").trim();

    const res = await cloudinary.uploader.unsigned_upload(filePath, preset, {
      folder: FOLDER_NAME,
      public_id: cleanPublicId,
    });

    if (res && res.secure_url) {
      return res.secure_url;
    }
  } catch (err) {
    console.warn(`⚠️ Cloudinary upload notice for ${path.basename(filePath)}:`, err.message);
  }
  return null;
};

const getAllFiles = (dirPath, arrayOfFiles = []) => {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, arrayOfFiles);
    } else if (isImageFile(fullPath)) {
      arrayOfFiles.push(fullPath);
    }
  }
  return arrayOfFiles;
};

async function runMigration() {
  const urlMap = new Map();
  const summaryList = [];

  // Directories to scan
  const directoriesToScan = [
    { name: "Client src/assets", path: path.join(__dirname, "..", "..", "Client", "src", "assets") },
    { name: "Client public/images", path: path.join(__dirname, "..", "..", "Client", "public", "images") },
    { name: "Client public root", path: path.join(__dirname, "..", "..", "Client", "public") },
    { name: "Server uploads", path: path.join(__dirname, "..", "uploads") },
  ];

  console.log("📦 Phase 1: Scanning & Uploading Local Images to Cloudinary...");
  for (const item of directoriesToScan) {
    console.log(`\n📁 Scanning: ${item.name} (${item.path})`);
    const files = getAllFiles(item.path);
    console.log(`   Found ${files.length} image files.`);

    for (const filePath of files) {
      const basename = path.basename(filePath);
      if (urlMap.has(basename)) {
        console.log(`   ⏩ Skipping duplicate: ${basename}`);
        continue;
      }
      console.log(`   Uploading: ${basename} ...`);
      const secureUrl = await uploadFileToCloudinary(filePath);
      if (secureUrl) {
        urlMap.set(basename, secureUrl);
        urlMap.set(basename.toLowerCase(), secureUrl);
        summaryList.push({ category: item.name, fileName: basename, cloudUrl: secureUrl });
        console.log(`   ✅ Success: ${secureUrl}`);
      } else {
        console.log(`   ❌ Failed to upload ${basename}`);
      }
    }
  }

  console.log("\n=================================================");
  console.log(`✅ Uploaded ${summaryList.length} total images to folder '${FOLDER_NAME}'`);
  console.log("=================================================\n");

  // Connect to Database
  console.log("📦 Phase 2: Updating MongoDB Database Collections...");
  try {
    await mongoose.connect(DB_URL);
    console.log("✅ MongoDB Atlas Connected Successfully!");

    const db = mongoose.connection.db;

    // 1. Update Products Collection
    const productsColl = db.collection("products");
    const products = await productsColl.find({}).toArray();
    let updatedProductsCount = 0;

    for (const prod of products) {
      let isUpdated = false;
      let updatedImage = prod.image;
      let updatedPngImage = prod.pngImage;

      // Match product images by filename or title
      if (Array.isArray(prod.image) && prod.image.length > 0) {
        const newImages = prod.image.map((img) => {
          if (typeof img === "string") {
            const basename = path.basename(img.split("?")[0]);
            if (urlMap.has(basename)) {
              isUpdated = true;
              return urlMap.get(basename);
            }
          }
          return img;
        });
        updatedImage = newImages;
      }

      if (prod.pngImage && typeof prod.pngImage === "string") {
        const basename = path.basename(prod.pngImage.split("?")[0]);
        if (urlMap.has(basename)) {
          isUpdated = true;
          updatedPngImage = urlMap.get(basename);
        }
      }

      // Match product by slug or name fallback
      const nameKey = (prod.name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
      for (const [key, cloudUrl] of urlMap.entries()) {
        const cleanKey = key.toLowerCase().replace(/[^a-z0-9]/g, "");
        if (cleanKey.includes(nameKey) || nameKey.includes(cleanKey)) {
          if (!updatedImage || updatedImage.length === 0 || !updatedImage[0]?.includes("cloudinary")) {
            updatedImage = [cloudUrl];
            isUpdated = true;
          }
        }
      }

      if (isUpdated) {
        await productsColl.updateOne(
          { _id: prod._id },
          { $set: { image: updatedImage, pngImage: updatedPngImage } }
        );
        updatedProductsCount++;
      }
    }
    console.log(`✅ Updated ${updatedProductsCount} product documents with 'dairy_app' Cloudinary URLs.`);

    // 2. Update PageContent Collection
    const pageContentColl = db.collection("pagecontents");
    const contents = await pageContentColl.find({}).toArray();
    let updatedContentCount = 0;

    for (const content of contents) {
      let isUpdated = false;
      const updateDoc = {};

      const mapImageField = (val) => {
        if (!val || typeof val !== "string") return val;
        const basename = path.basename(val.split("?")[0]);
        if (urlMap.has(basename)) {
          isUpdated = true;
          return urlMap.get(basename);
        }
        return val;
      };

      if (content.landingHeroImage) {
        updateDoc.landingHeroImage = mapImageField(content.landingHeroImage);
      }
      if (content.heroBannerImage) {
        updateDoc.heroBannerImage = mapImageField(content.heroBannerImage);
      }

      if (Array.isArray(content.homeCategoryCards)) {
        updateDoc.homeCategoryCards = content.homeCategoryCards.map((item) => ({
          ...item,
          image: mapImageField(item.image),
        }));
      }

      if (Array.isArray(content.landingShowcaseCards)) {
        updateDoc.landingShowcaseCards = content.landingShowcaseCards.map((item) => ({
          ...item,
          image: mapImageField(item.image),
        }));
      }

      if (Array.isArray(content.goodnessOfferings)) {
        updateDoc.goodnessOfferings = content.goodnessOfferings.map((item) => ({
          ...item,
          image: mapImageField(item.image),
        }));
      }

      if (isUpdated) {
        await pageContentColl.updateOne({ _id: content._id }, { $set: updateDoc });
        updatedContentCount++;
      }
    }
    console.log(`✅ Updated ${updatedContentCount} page content documents with 'dairy_app' Cloudinary URLs.`);

    // 3. Update User Profiles Collection
    const usersColl = db.collection("users");
    const users = await usersColl.find({ photo: { $exists: true, $ne: "" } }).toArray();
    let updatedUsersCount = 0;

    for (const u of users) {
      if (u.photo && typeof u.photo === "string") {
        const basename = path.basename(u.photo.split("?")[0]);
        if (urlMap.has(basename)) {
          await usersColl.updateOne({ _id: u._id }, { $set: { photo: urlMap.get(basename) } });
          updatedUsersCount++;
        }
      }
    }
    console.log(`✅ Updated ${updatedUsersCount} user profile documents with 'dairy_app' Cloudinary URLs.`);

    console.log("\n=================================================");
    console.log("🎉 MIGRATION COMPLETE! ALL IMAGES UPLOADED TO 'dairy_app'");
    console.log("=================================================\n");

  } catch (err) {
    console.error("❌ Database update error:", err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

runMigration();
