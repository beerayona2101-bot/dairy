import dns from "dns";
import dotenv from "dotenv";

dotenv.config();

try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
  if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder("ipv4first");
  }
} catch (dnsErr) {
  // Silent DNS fallback
}

import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import bcryptjs from "bcryptjs";

import Admin from "../models/AdminSchema.js";
import User from "../models/UserSchema.js";
import Product from "../models/ProductSchema.js";
import Order from "../models/OrderSchema.js";
import { initialProducts } from "./initialProducts.js";

let mongoMemoryInstance = null;

const defaultCustomers = [
  {
    fullName: "Rahul Sharma",
    firstName: "Rahul",
    lastName: "Sharma",
    username: "rahul_s",
    email: "user@MADHUdairy.com",
    mobileNo: "9876543211",
    gender: "Male"
  },
  {
    fullName: "Priya Patel",
    firstName: "Priya",
    lastName: "Patel",
    username: "priya_p",
    email: "priya@gmail.com",
    mobileNo: "9876543212",
    gender: "Female"
  },
  {
    fullName: "Ramesh Sharma",
    firstName: "Ramesh",
    lastName: "Sharma",
    username: "ramesh_s",
    email: "ramesh@gmail.com",
    mobileNo: "9876543213",
    gender: "Male"
  },
  {
    fullName: "Amitabh Verma",
    firstName: "Amitabh",
    lastName: "Verma",
    username: "amitabh_v",
    email: "amitabh@gmail.com",
    mobileNo: "9876543214",
    gender: "Male"
  },
  {
    fullName: "Sunita Deshmukh",
    firstName: "Sunita",
    lastName: "Deshmukh",
    username: "sunita_d",
    email: "sunita@gmail.com",
    mobileNo: "9876543215",
    gender: "Female"
  }
];

const seedDefaultData = async () => {
  try {
    // 1. Seed Admin
    const adminEmail = "admin@naturalmilkdairy.com";
    const existingAdmin = await Admin.findOne({ email: { $in: [adminEmail, "admin@MADHUdairy.com"] } });
    if (!existingAdmin) {
      const hashedAdminPassword = await bcryptjs.hash("Admin@12345", 10);
      await Admin.create({
        name: "Natural Admin",
        username: "admin_natural",
        email: adminEmail,
        password: hashedAdminPassword,
        mobileNo: "9876543210",
        factoryAddress: {
          street: "Dairy Road",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400001",
        },
      });
      console.log("✅ Admin Account Ready: admin@naturalmilkdairy.com / Admin@12345");
    } else if (existingAdmin.name && existingAdmin.name.includes("MADHU")) {
      existingAdmin.name = "Natural Admin";
      existingAdmin.username = "admin_natural";
      existingAdmin.email = adminEmail;
      await existingAdmin.save();
    }

    // 2. Seed Customers
    for (const cust of defaultCustomers) {
      const existing = await User.findOne({ email: cust.email });
      if (!existing) {
        const defaultHashedPassword = await bcryptjs.hash("User@12345", 10);
        await User.create({
          ...cust,
          password: defaultHashedPassword,
        });
      }
    }
    console.log("✅ Seeded customer accounts");

    // 3. Seed Products if count is less than initialProducts.length or if legacy MADHU products exist
    const hasLegacy = await Product.findOne({ name: /^MADHU/i });
    const productCount = await Product.countDocuments();
    if (productCount < initialProducts.length || hasLegacy) {
      await Product.deleteMany({});
      await Product.insertMany(initialProducts);
      console.log(`✅ Seeded ${initialProducts.length} Natural Milk Dairy products into database`);
    }

    // 4. Migrate existing Order IDs to MD-ORD-YYMMDD-XXXX format
    await migrateExistingOrderIds();
  } catch (seedErr) {
    console.warn("Data seed notice:", seedErr.message);
  }
};

const migrateExistingOrderIds = async () => {
  try {
    const orders = await Order.find({}).sort({ createdAt: 1 });
    if (!orders || orders.length === 0) return;

    const dateCounts = {};
    const validPattern = /^MD-ORD-\d{6}-\d{4}$/;

    // Pass 1: record max sequence numbers for existing valid MD-ORD-YYMMDD-XXXX IDs
    for (const order of orders) {
      if (order.orderId && validPattern.test(order.orderId)) {
        const parts = order.orderId.split("-");
        const dKey = parts[2];
        const seq = parseInt(parts[3], 10);
        if (dKey && !isNaN(seq)) {
          dateCounts[dKey] = Math.max(dateCounts[dKey] || 0, seq);
        }
      }
    }

    // Pass 2: assign unique MD-ORD-YYMMDD-XXXX IDs to all orders missing valid formatting
    for (const order of orders) {
      if (!order.orderId || !validPattern.test(order.orderId)) {
        const d = order.createdAt ? new Date(order.createdAt) : new Date();
        const yy = String(d.getFullYear()).slice(-2);
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        const dateKey = `${yy}${mm}${dd}`;

        dateCounts[dateKey] = (dateCounts[dateKey] || 0) + 1;
        const seq = String(dateCounts[dateKey]).padStart(4, "0");
        const newOrderId = `MD-ORD-${dateKey}-${seq}`;

        await Order.updateOne(
          { _id: order._id },
          { $set: { orderId: newOrderId } }
        );
      }
    }
    console.log("✅ Migrated all existing order IDs to MD-ORD-YYMMDD-XXXX format");
  } catch (err) {
    console.warn("Order ID migration notice:", err.message);
  }
};

export const connectDB = async () => {
  const primaryDbUrl = process.env.DB_URL;
  const directAtlasUrl = "mongodb://ujjwalAndNitinDb:Tn99S9ZWR6oZjJOE@ac-dt3n1gn-shard-00-00.5kjnxzp.mongodb.net:27017,ac-dt3n1gn-shard-00-01.5kjnxzp.mongodb.net:27017,ac-dt3n1gn-shard-00-02.5kjnxzp.mongodb.net:27017/milkapp?ssl=true&replicaSet=atlas-13c5sm-shard-0&authSource=admin&retryWrites=true&w=majority";

  const dbCandidates = [primaryDbUrl, directAtlasUrl, "mongodb://127.0.0.1:27017/milkapp"].filter(Boolean);

  mongoose.connection.on("disconnected", () => {
    console.warn("⚠️ MongoDB connection disconnected. Auto-reconnecting...");
  });
  mongoose.connection.on("reconnected", () => {
    console.log("✅ MongoDB reconnected successfully!");
  });
  mongoose.connection.on("error", (err) => {
    console.warn("⚠️ MongoDB connection notice:", err.message);
  });

  for (const url of dbCandidates) {
    try {
      const conn = await mongoose.connect(url, {
        serverSelectionTimeoutMS: 8000,
        connectTimeoutMS: 8000,
        maxPoolSize: 20,
        minPoolSize: 5,
        maxIdleTimeMS: 30000,
        socketTimeoutMS: 45000,
        family: 4,
      });
      const isAtlas = conn.connection.host.includes("mongodb.net");
      if (isAtlas) {
        console.log(`✅ LIVE MONGODB ATLAS CONNECTED: ${conn.connection.host} (DB: ${conn.connection.name})`);
      } else {
        console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);
      }
      await seedDefaultData();
      return conn;
    } catch (err) {
      console.warn("DB candidate connection notice (%s):", err.message);
    }
  }

  // Fast In-Memory Database Fallback
  try {
    mongoMemoryInstance = await MongoMemoryServer.create();
    const memoryUri = mongoMemoryInstance.getUri();
    const memoryConn = await mongoose.connect(memoryUri);
    console.log(`✅ Database Connected Successfully! (${memoryUri})`);
    await seedDefaultData();
    return memoryConn;
  } catch (memErr) {
    console.error("❌ Failed to start database:", memErr.message);
  }
};
