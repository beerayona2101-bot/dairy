import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

cloudinary.config({
  cloud_name: (process.env.CLOUDINARY_CLOUD_NAME || "").trim(),
  api_key: (process.env.CLOUDINARY_API_KEY || "").trim(),
  api_secret: (process.env.CLOUDINARY_API_SECRET || "").trim(),
});

// Save image buffer or base64 to local disk when Cloudinary is unavailable
const DEFAULT_FOLDER = (process.env.CLOUDINARY_FOLDER || "dairy_app").trim();

// Save image buffer or base64 to local disk when Cloudinary is unavailable
const saveToDisk = (buffer, mimeType = "image/png", folderName = DEFAULT_FOLDER) => {
  try {
    const uploadDir = path.join(__dirname, "..", "uploads", folderName);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const ext = (mimeType || "").split("/")[1] || "png";
    const filename = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${ext}`;
    const filePath = path.join(uploadDir, filename);

    fs.writeFileSync(filePath, buffer);

    // Return static URL route accessible from client
    return `/uploads/${folderName}/${filename}`;
  } catch (err) {
    console.error("Failed to save image to disk:", err.message);
    return null;
  }
};

export const uploadToCloudinary = async (imageData, folderName = DEFAULT_FOLDER) => {
  if (!imageData || typeof imageData !== "string") return imageData;

  const targetFolder = folderName || DEFAULT_FOLDER;

  // If already an HTTP/HTTPS URL or static /uploads path, return as is
  if (imageData.startsWith("http://") || imageData.startsWith("https://") || imageData.startsWith("/uploads/")) {
    return imageData;
  }

  // If Base64 Data URL, attempt Cloudinary upload then disk fallback
  if (imageData.startsWith("data:image")) {
    const presetEnv = (process.env.CLOUDINARY_UPLOAD_PRESET || "ml_default").trim();
    const presetsToTry = Array.from(new Set(["ml_default", presetEnv, "MADHU_dairy"]));

    // 1. Try Cloudinary unsigned upload
    for (const p of presetsToTry) {
      try {
        const res = await cloudinary.uploader.unsigned_upload(imageData, p, { folder: targetFolder });
        if (res && res.secure_url) {
          return res.secure_url;
        }
      } catch (err) {
        // Continue to next preset
      }
    }

    // 2. Try Cloudinary signed upload
    try {
      const res = await cloudinary.uploader.upload(imageData, {
        folder: targetFolder,
        resource_type: "auto",
      });
      if (res && res.secure_url) {
        return res.secure_url;
      }
    } catch (err) {
      console.warn("Cloudinary signed upload notice:", err.message);
    }

    // 3. Fallback: Decode Base64 and save to local disk
    try {
      const matches = imageData.match(/^data:(image\/[a-zA-Z0-9+\-+.]+);base64,(.+)$/);
      if (matches) {
        const mimeType = matches[1];
        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, "base64");
        const diskPath = saveToDisk(buffer, mimeType, targetFolder);
        if (diskPath) return diskPath;
      }
    } catch (err) {
      console.error("Disk save fallback error:", err.message);
    }
  }

  return imageData;
};

class HybridCloudinaryStorage {
  constructor(options = {}) {
    this.folder = options.folder || DEFAULT_FOLDER;
  }

  _handleFile(req, file, cb) {
    const chunks = [];
    file.stream.on("data", (chunk) => chunks.push(chunk));
    file.stream.on("error", (err) => cb(err));
    file.stream.on("end", async () => {
      const buffer = Buffer.concat(chunks);

      if (!buffer || buffer.length === 0) {
        return cb(new Error("File cannot be empty"));
      }

      if (buffer.length > 10 * 1024 * 1024) {
        return cb(new Error("File exceeds maximum size limit of 10MB"));
      }

      const preset = (process.env.CLOUDINARY_UPLOAD_PRESET || "ml_default").trim();
      const mime = file.mimetype || "image/png";
      const base64Data = `data:${mime};base64,${buffer.toString("base64")}`;
      const targetFolder = this.folder || DEFAULT_FOLDER;

      // 1. Try Cloudinary unsigned upload
      try {
        const uploadResult = await cloudinary.uploader.unsigned_upload(base64Data, preset, { folder: targetFolder });
        if (uploadResult && uploadResult.secure_url) {
          return cb(null, {
            path: uploadResult.secure_url,
            url: uploadResult.secure_url,
            filename: uploadResult.public_id,
            mimetype: file.mimetype,
            size: buffer.length,
          });
        }
      } catch (cloudErr) {
        console.warn("Cloudinary unsigned upload notice:", cloudErr.message);
      }

      // 2. Try Cloudinary signed upload
      try {
        const uploadResult = await cloudinary.uploader.upload(base64Data, {
          folder: targetFolder,
          resource_type: "auto",
        });
        if (uploadResult && uploadResult.secure_url) {
          return cb(null, {
            path: uploadResult.secure_url,
            url: uploadResult.secure_url,
            filename: uploadResult.public_id,
            mimetype: file.mimetype,
            size: buffer.length,
          });
        }
      } catch (cloudErr) {
        console.warn("Cloudinary signed upload notice:", cloudErr.message);
      }

      // 3. Disk storage fallback
      const diskUrl = saveToDisk(buffer, mime, targetFolder);
      const finalUrl = diskUrl || base64Data;

      return cb(null, {
        path: finalUrl,
        url: finalUrl,
        filename: file.originalname,
        mimetype: mime,
        size: buffer.length,
      });
    });
  }

  _removeFile(req, file, cb) {
    cb(null);
  }
}

const storage = new HybridCloudinaryStorage({ folder: DEFAULT_FOLDER });
const upload = multer({ storage });

export { cloudinary, upload };
