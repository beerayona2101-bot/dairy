import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: (process.env.CLOUDINARY_CLOUD_NAME || "").trim(),
  api_key: (process.env.CLOUDINARY_API_KEY || "").trim(),
  api_secret: (process.env.CLOUDINARY_API_SECRET || "").trim(),
});

export const uploadToCloudinary = async (imageData, folderName = "evan_homepage_cms") => {
  if (!imageData || typeof imageData !== "string") return imageData;

  // If already a Cloudinary or HTTPS URL, return as is
  if (imageData.startsWith("http://") || imageData.startsWith("https://")) {
    return imageData;
  }

  // If Base64 Data URL, upload to Cloudinary using preset ml_default
  if (imageData.startsWith("data:image")) {
    const presetEnv = (process.env.CLOUDINARY_UPLOAD_PRESET || "ml_default").trim();
    const presetsToTry = Array.from(new Set(["ml_default", presetEnv, "madhur_dairy"]));

    // 1. Unsigned upload with presets
    for (const p of presetsToTry) {
      try {
        const res = await cloudinary.uploader.unsigned_upload(imageData, p);
        if (res && res.secure_url) {
          return res.secure_url;
        }
      } catch (err) {
        // Silently check next preset
      }
    }

    // 2. Signed upload fallback
    try {
      const res = await cloudinary.uploader.upload(imageData, {
        folder: folderName,
        resource_type: "auto",
      });
      if (res && res.secure_url) {
        return res.secure_url;
      }
    } catch (err) {
      console.warn("Cloudinary signed upload notice:", err.message);
    }
  }

  return imageData;
};

class HybridCloudinaryStorage {
  constructor(options = {}) {
    this.folder = options.folder || "user-profiles";
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

      // 1. Try unsigned upload with preset ml_default
      try {
        const uploadResult = await cloudinary.uploader.unsigned_upload(base64Data, preset);
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

      // 2. Fallback: Convert to Base64 data URL if Cloudinary upload failed
      return cb(null, {
        path: base64Data,
        url: base64Data,
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

const storage = new HybridCloudinaryStorage({ folder: "user-profiles" });
const upload = multer({ storage });

export { cloudinary, upload };
