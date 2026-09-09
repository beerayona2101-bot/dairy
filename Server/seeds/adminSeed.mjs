import dotenv from "dotenv";
import bcryptjs from "bcryptjs";
import mongoose from "mongoose";
// import { connectDB } from "../config/db.js";
import Admin from "../models/AdminSchema.js";

dotenv.config();

console.log("DB_URL from env:", (process.env.DB_URL || '').replace(/./g, (c, i) => i < 12 ? c : '*'));

const email = process.env.ADMIN_EMAIL || "ct9308478@gmail.com";
const password = process.env.ADMIN_PASSWORD || "12345678";
const name = process.env.ADMIN_NAME || "Administrator";
const username = process.env.ADMIN_USERNAME || email.split("@")[0];
const mobileNo = process.env.ADMIN_MOBILE || "9999999999";

async function seedAdmin() {
  try {
    // Ensure DB_URL has no invisible whitespace issues
    if (process.env.DB_URL) process.env.DB_URL = process.env.DB_URL.trim();
    let uri = process.env.DB_URL;
    const qIndex = uri.indexOf('?');
    if (qIndex !== -1) {
      const base = uri.slice(0, qIndex);
      const query = uri.slice(qIndex + 1);
      const pairs = query.split('&').filter(Boolean);
      const kvs = pairs.map(p => {
        const [k, v] = p.split('=');
        return [k, v];
      });
      const map = new Map(kvs);
      // Ensure retryWrites has a proper boolean value
      const rw = map.get('retryWrites');
      if (!rw || (rw !== 'true' && rw !== 'false')) {
        map.set('retryWrites', 'false');
      }
      // Rebuild query string
      const sanitized = Array.from(map.entries()).map(([k, v]) => `${k}=${v}`).join('&');
      uri = `${base}?${sanitized}`;
    } else {
      // No query params; add retryWrites=false explicitly
      uri = `${uri}?retryWrites=false`;
    }
    await mongoose.connect(uri);

    const existing = await Admin.findOne({ email });
    if (existing) {
      console.log(`Admin already exists for email: ${email} (id: ${existing._id})`);
      return;
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    const admin = new Admin({
      name,
      username,
      email,
      password: hashedPassword,
      mobileNo,
      factoryAddress: {
        street: "",
        city: "",
        state: "",
        pincode: ""
      },
      image: "",
      pendingOrders: [],
      notifications: []
    });

    await admin.save();

    console.log("Admin seeded successfully:");
    console.log({ _id: admin._id.toString(), email, password });
  } catch (err) {
    console.error("Admin seeding failed:", err.message);
  } finally {
    await mongoose.connection.close();
    console.log("MongoDB connection closed.");
  }
}

seedAdmin();
