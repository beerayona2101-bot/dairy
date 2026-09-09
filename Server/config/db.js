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

let mongoMemoryInstance = null;

const initialProducts = [
  {
    name: "Madhur Cow Milk (Full Cream)",
    category: "Milk",
    description: "Pure, unadulterated fresh cow milk rich in calcium, protein, and natural vitamins.",
    image: ["https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&q=80"],
    quantityUnit: "Litre",
    stock: 117,
    manufacturingCost: 40,
    thresholdVal: 15,
    price: 65,
    discount: 10,
    type: "Full Cream",
    shelfLife: "7 Days"
  },
  {
    name: "Madhur Buffalo Toned Milk",
    category: "Milk",
    description: "Rich, thick, and creamy buffalo milk—ideal for tea, coffee, curd, and sweets.",
    image: ["https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600&q=80"],
    quantityUnit: "Litre",
    stock: 89,
    manufacturingCost: 45,
    thresholdVal: 10,
    price: 72,
    discount: 5,
    type: "Full Cream",
    shelfLife: "7 Days"
  },
  {
    name: "Madhur Toned Cow Milk",
    category: "Milk",
    description: "Low-fat pasteurized cow milk packed with calcium for daily balanced fitness.",
    image: ["https://images.unsplash.com/photo-1528750997573-59b89d66f4f7?w=600&q=80"],
    quantityUnit: "Litre",
    stock: 95,
    manufacturingCost: 35,
    thresholdVal: 12,
    price: 54,
    discount: 5,
    type: "Low Fat",
    shelfLife: "7 Days"
  },
  {
    name: "Madhur Fresh Malai Paneer",
    category: "Paneer",
    description: "Soft, velvety fresh cottage cheese made using traditional slow curdling.",
    image: ["https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&q=80"],
    quantityUnit: "Pack",
    stock: 80,
    manufacturingCost: 60,
    thresholdVal: 10,
    price: 110,
    discount: 10,
    type: "Organic",
    shelfLife: "10 Days"
  },
  {
    name: "Madhur Organic Desi Cow Ghee",
    category: "Ghee",
    description: "Authentic bilona method pure cow ghee with rich granular aroma and texture.",
    image: ["https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=600&q=80"],
    quantityUnit: "Pack",
    stock: 50,
    manufacturingCost: 400,
    thresholdVal: 5,
    price: 650,
    discount: 15,
    type: "Organic",
    shelfLife: "180 Days"
  },
  {
    name: "Madhur Buffalo Desi Ghee",
    category: "Ghee",
    description: "Pure white buffalo ghee cooked traditionally for high smoke point cooking.",
    image: ["https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=600&q=80"],
    quantityUnit: "Pack",
    stock: 45,
    manufacturingCost: 380,
    thresholdVal: 5,
    price: 620,
    discount: 10,
    type: "Regular",
    shelfLife: "180 Days"
  },
  {
    name: "Madhur Natural Thick Curd (Dahi)",
    category: "Curd",
    description: "Creamy set curd naturally fermented with active probiotics for digestion.",
    image: ["https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&q=80"],
    quantityUnit: "Pack",
    stock: 100,
    manufacturingCost: 25,
    thresholdVal: 15,
    price: 45,
    discount: 5,
    type: "Regular",
    shelfLife: "10 Days"
  },
  {
    name: "Madhur Cooking Butter",
    category: "Butter",
    description: "Unsalted pure cream butter perfect for baking, parathas, and gourmet dishes.",
    image: ["https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=600&q=80"],
    quantityUnit: "Pack",
    stock: 60,
    manufacturingCost: 40,
    thresholdVal: 10,
    price: 58,
    discount: 5,
    type: "Regular",
    shelfLife: "30 Days"
  },
  {
    name: "Madhur Sweet Malai Lassi",
    category: "Lassi",
    description: "Chilled, thick sweet lassi blended with cardamom and topped with fresh malai.",
    image: ["https://images.unsplash.com/photo-1571006682858-a457224f984f?w=600&q=80"],
    quantityUnit: "Pack",
    stock: 65,
    manufacturingCost: 20,
    thresholdVal: 10,
    price: 40,
    discount: 10,
    type: "Regular",
    shelfLife: "7 Days"
  },
  {
    name: "Madhur Spiced Masala Chaas",
    category: "Chaas",
    description: "Refreshing digestive buttermilk with roasted cumin, rock salt, coriander, and mint.",
    image: ["https://images.unsplash.com/photo-1626078436894-39945037d45e?w=600&q=80"],
    quantityUnit: "Pack",
    stock: 150,
    manufacturingCost: 12,
    thresholdVal: 20,
    price: 25,
    discount: 10,
    type: "Regular",
    shelfLife: "7 Days"
  },
  {
    name: "Madhur Kesar Shrikhand",
    category: "Shrikhand",
    description: "Traditional strained yoghurt sweet infused with pure saffron and green cardamom.",
    image: ["https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&q=80"],
    quantityUnit: "Pack",
    stock: 40,
    manufacturingCost: 70,
    thresholdVal: 8,
    price: 120,
    discount: 10,
    type: "Regular",
    shelfLife: "20 Days"
  },
  {
    name: "Madhur Kesar Basundi",
    category: "Basundi",
    description: "Rich condensed sweet milk cooked with saffron strands, almonds, and pistachios.",
    image: ["https://images.unsplash.com/photo-1579372786545-d24232daf58c?w=600&q=80"],
    quantityUnit: "Pack",
    stock: 35,
    manufacturingCost: 80,
    thresholdVal: 6,
    price: 140,
    discount: 10,
    type: "Regular",
    shelfLife: "15 Days"
  },
  {
    name: "Madhur Khoya (Mawa)",
    category: "Khoya",
    description: "Pure evaporated solid milk dough for authentic sweet making at home.",
    image: ["https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=600&q=80"],
    quantityUnit: "Pack",
    stock: 50,
    manufacturingCost: 120,
    thresholdVal: 10,
    price: 180,
    discount: 5,
    type: "Regular",
    shelfLife: "15 Days"
  },
  {
    name: "Madhur Mozzarella Cheese",
    category: "Cheese",
    description: "Stretchable, high-melt fresh mozzarella cheese block for pizzas and pasta.",
    image: ["https://images.unsplash.com/photo-1552767059-ce182ead8c1b?w=600&q=80"],
    quantityUnit: "Pack",
    stock: 75,
    manufacturingCost: 90,
    thresholdVal: 10,
    price: 150,
    discount: 10,
    type: "Regular",
    shelfLife: "30 Days"
  },
  {
    name: "Madhur Elaichi Shrikhand",
    category: "Shrikhand",
    description: "Creamy strained yogurt dessert flavored with freshly ground aromatic cardamom.",
    image: ["https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&q=80"],
    quantityUnit: "Pack",
    stock: 45,
    manufacturingCost: 65,
    thresholdVal: 8,
    price: 115,
    discount: 10,
    type: "Regular",
    shelfLife: "20 Days"
  },
  {
    name: "Madhur Mango Malai Lassi",
    category: "Lassi",
    description: "Rich blended yogurt drink infused with Alphonso mango pulp and cream.",
    image: ["https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&q=80"],
    quantityUnit: "Pack",
    stock: 70,
    manufacturingCost: 25,
    thresholdVal: 10,
    price: 48,
    discount: 10,
    type: "Regular",
    shelfLife: "7 Days"
  },
  {
    name: "Madhur Badam Flavored Milk",
    category: "Flavored Milk",
    description: "Sterilized almond milk beverage with saffron bits and real crushed almonds.",
    image: ["https://images.unsplash.com/photo-1528750997573-59b89d66f4f7?w=600&q=80"],
    quantityUnit: "Pack",
    stock: 90,
    manufacturingCost: 28,
    thresholdVal: 15,
    price: 50,
    discount: 5,
    type: "High Protein",
    shelfLife: "30 Days"
  },
  {
    name: "Madhur Chocolate Flavored Milk",
    category: "Flavored Milk",
    description: "Delicious cocoa flavored milk treat beloved by kids and adults alike.",
    image: ["https://images.unsplash.com/photo-1556881286-fc6915169721?w=600&q=80"],
    quantityUnit: "Pack",
    stock: 85,
    manufacturingCost: 25,
    thresholdVal: 15,
    price: 45,
    discount: 5,
    type: "Regular",
    shelfLife: "30 Days"
  },
  {
    name: "Madhur Creamy Malai Rabri",
    category: "Dairy Sweets",
    description: "Rich thickened sweetened milk layered with malai, pistachios, and saffron.",
    image: ["https://images.unsplash.com/photo-1579372786545-d24232daf58c?w=600&q=80"],
    quantityUnit: "Pack",
    stock: 40,
    manufacturingCost: 75,
    thresholdVal: 8,
    price: 135,
    discount: 10,
    type: "Regular",
    shelfLife: "10 Days"
  },
  {
    name: "Madhur Milk Powder (Premium)",
    category: "Milk Powder",
    description: "Spray dried instant whole milk powder for tea, coffee, and bakery recipes.",
    image: ["https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=600&q=80"],
    quantityUnit: "Pack",
    stock: 60,
    manufacturingCost: 150,
    thresholdVal: 10,
    price: 240,
    discount: 10,
    type: "Regular",
    shelfLife: "180 Days"
  },
  {
    name: "Madhur Mishti Doi",
    category: "Curd",
    description: "Traditional Bengali caramel sweetened thick fermented yogurt dessert.",
    image: ["https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&q=80"],
    quantityUnit: "Pack",
    stock: 65,
    manufacturingCost: 30,
    thresholdVal: 10,
    price: 55,
    discount: 5,
    type: "Regular",
    shelfLife: "10 Days"
  },
  {
    name: "Madhur Fresh Cream (Heavy)",
    category: "Cream",
    description: "Rich whipping cream with 40% fat content for desserts, soups, and gravies.",
    image: ["https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&q=80"],
    quantityUnit: "Pack",
    stock: 55,
    manufacturingCost: 45,
    thresholdVal: 10,
    price: 75,
    discount: 5,
    type: "Full Cream",
    shelfLife: "15 Days"
  }
];

const defaultCustomers = [
  {
    fullName: "Rahul Sharma",
    firstName: "Rahul",
    lastName: "Sharma",
    username: "rahul_s",
    email: "user@madhurdairy.com",
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
    const adminEmail = "admin@madhurdairy.com";
    const existingAdmin = await Admin.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const hashedAdminPassword = await bcryptjs.hash("Admin@12345", 10);
      await Admin.create({
        name: "Madhur Admin",
        username: "admin_madhur",
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
      console.log("✅ Admin Account Ready: admin@madhurdairy.com / Admin@12345");
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

    // 3. Seed Products if count is less than 22
    const productCount = await Product.countDocuments();
    if (productCount < initialProducts.length) {
      await Product.deleteMany({});
      await Product.insertMany(initialProducts);
      console.log(`✅ Seeded ${initialProducts.length} dairy products into database`);
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

  for (const url of dbCandidates) {
    try {
      const conn = await mongoose.connect(url, {
        serverSelectionTimeoutMS: 8000,
        connectTimeoutMS: 8000,
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