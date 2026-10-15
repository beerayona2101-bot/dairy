import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/ProductSchema.js";
import path from "path";
import { fileURLToPath } from "url";
import dns from "dns";
import { initialProducts } from "../config/initialProducts.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

try {
  if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder("ipv4first");
  }
} catch (dnsErr) {
  console.warn("DNS config notice:", dnsErr.message);
}

const seedDB = async () => {
  try {
    const dbUrl = process.env.DB_URL;
    if (!dbUrl) {
      console.error("DB_URL missing!");
      process.exit(1);
    }

    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(dbUrl);
    
    await Product.deleteMany({});
    console.log("Cleared old product data.");

    console.log("Seeding all Natural Milk Dairy categories & products with unique branded images...");
    await Product.insertMany(initialProducts);

    console.log(`Successfully seeded ${initialProducts.length} Natural Milk Dairy products covering all 16 categories!`);
  } catch (err) {
    console.error("Error during seeding:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
    process.exit(0);
  }
};

seedDB();
