import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import dns from "dns";

import Admin from "../models/AdminSchema.js";
import User from "../models/UserSchema.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

try {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
  if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder("ipv4first");
  }
} catch (dnsErr) {
  console.warn("DNS notice:", dnsErr.message);
}

const seedCredentials = async () => {
  try {
    const dbUrl = process.env.DB_URL;
    if (!dbUrl) {
      console.error("DB_URL missing!");
      process.exit(1);
    }

    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(dbUrl);

    // 1. Seed Admin
    const adminEmail = "admin@madhurdairy.com";
    const adminPassword = "Admin@12345";
    const hashedAdminPassword = await bcryptjs.hash(adminPassword, 10);

    await Admin.findOneAndUpdate(
      { email: adminEmail },
      {
        name: "Madhur Admin",
        username: "admin_madhur",
        email: adminEmail,
        password: hashedAdminPassword,
        mobileNo: "9876543210",
        factoryAddress: {
          street: "Dairy Road",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400001"
        }
      },
      { upsert: true, new: true }
    );
    console.log("Admin account created/updated successfully.");

    // 2. Seed Customer User
    const userEmail = "user@madhurdairy.com";
    const userPassword = "User@12345";
    const hashedUserPassword = await bcryptjs.hash(userPassword, 10);

    await User.findOneAndUpdate(
      { email: userEmail },
      {
        fullName: "Rahul Sharma",
        firstName: "Rahul",
        lastName: "Sharma",
        username: "rahul_s",
        email: userEmail,
        password: hashedUserPassword,
        mobileNo: "9876543211",
        gender: "Male"
      },
      { upsert: true, new: true }
    );
    console.log("User account created/updated successfully.");

  } catch (err) {
    console.error("Seeding credentials error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
    process.exit(0);
  }
};

seedCredentials();
