import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/ProductSchema.js";
import path from "path";
import { fileURLToPath } from "url";
import dns from "dns";

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

const sampleProducts = [
  // 1. Milk
  {
    name: "Madhu Fresh Whole Cow Milk",
    category: "Milk",
    description: "Pure, farm-fresh whole cow milk from Madhu Dairy—rich in calcium and essential nutrients.",
    image: ["/images/madhu_cow_milk.png"],
    minQuantity: 1,
    quantityUnit: "Litre",
    stock: 120,
    manufacturingCost: 40,
    thresholdVal: 15,
    price: 65,
    type: "Full Cream",
    totalQuantitySold: 450,
    nutrition: { Protein: "3.4g", Calcium: "120mg", Fat: "4.1g" },
    shelfLife: "3 Days",
    expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    discount: 10
  },
  {
    name: "Madhu Buffalo Toned Milk",
    category: "Milk",
    description: "Rich and thick buffalo milk by Madhu Dairy, ideal for making curd, tea, and coffee.",
    image: ["/images/madhu_buffalo_milk.png"],
    minQuantity: 1,
    quantityUnit: "Litre",
    stock: 90,
    manufacturingCost: 45,
    thresholdVal: 10,
    price: 72,
    type: "Toned",
    totalQuantitySold: 320,
    nutrition: { Protein: "3.8g", Calcium: "140mg", Fat: "6.0g" },
    shelfLife: "3 Days",
    expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    discount: 5
  },

  // 2. Paneer
  {
    name: "Madhu Fresh Malai Paneer",
    category: "Paneer",
    description: "Soft, velvety and fresh cottage cheese by Madhu Dairy. High in protein for delicious cooking.",
    image: ["/images/madhu_malai_paneer.png"],
    minQuantity: 1,
    quantityUnit: "Pack",
    stock: 80,
    manufacturingCost: 70,
    thresholdVal: 10,
    price: 110,
    type: "High Protein",
    totalQuantitySold: 610,
    nutrition: { Protein: "18.3g", Calcium: "208mg", Fat: "20.8g" },
    shelfLife: "7 Days",
    expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    discount: 10
  },

  // 3. Ghee
  {
    name: "Madhu Organic Desi Cow Ghee",
    category: "Ghee",
    description: "Traditional Bilona A2 Desi Cow Ghee by Madhu Dairy with rich granular aroma and health benefits.",
    image: ["/images/madhu_desi_ghee.png"],
    minQuantity: 1,
    quantityUnit: "Pack",
    stock: 50,
    manufacturingCost: 450,
    thresholdVal: 5,
    price: 650,
    type: "Organic A2",
    totalQuantitySold: 180,
    nutrition: { Fat: "99.8g", Calories: "898kcal" },
    shelfLife: "12 Months",
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    discount: 15
  },

  // 4. Curd
  {
    name: "Madhu Natural Thick Curd",
    category: "Curd",
    description: "Creamy set dahi by Madhu Dairy made with active probiotic cultures for gut health.",
    image: ["/images/madhu_thick_curd.png"],
    minQuantity: 1,
    quantityUnit: "Pack",
    stock: 100,
    manufacturingCost: 25,
    thresholdVal: 15,
    price: 45,
    type: "Probiotic",
    totalQuantitySold: 520,
    nutrition: { Protein: "4.5g", Calcium: "150mg", Fat: "3.5g" },
    shelfLife: "5 Days",
    expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    discount: 5
  },

  // 5. Butter
  {
    name: "Madhu Salted Cooking Butter",
    category: "Butter",
    description: "Pure pasteurized yellow butter by Madhu Dairy with a pinch of salt. Great for spreading and cooking.",
    image: ["/images/madhu_cooking_butter.png"],
    minQuantity: 1,
    quantityUnit: "Pack",
    stock: 60,
    manufacturingCost: 38,
    thresholdVal: 8,
    price: 60,
    type: "Salted",
    totalQuantitySold: 300,
    nutrition: { Fat: "80g", Calories: "717kcal" },
    shelfLife: "6 Months",
    expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
    discount: 5
  },

  // 6. Cheese
  {
    name: "Madhu Shredded Mozzarella Cheese",
    category: "Cheese",
    description: "100% pure cow milk mozzarella cheese by Madhu Dairy with ideal stretchiness and melt for pizza.",
    image: ["/images/madhu_mozzarella_cheese.png"],
    minQuantity: 1,
    quantityUnit: "Pack",
    stock: 55,
    manufacturingCost: 95,
    thresholdVal: 6,
    price: 160,
    type: "High Melt",
    totalQuantitySold: 290,
    nutrition: { Protein: "22.2g", Calcium: "505mg", Fat: "22.4g" },
    shelfLife: "60 Days",
    expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    discount: 15
  },

  // 7. Lassi
  {
    name: "Madhu Sweet Punjabi Malai Lassi",
    category: "Lassi",
    description: "Thick, creamy chilled Punjabi lassi by Madhu Dairy topped with rich malai.",
    image: ["/images/madhu_malai_lassi.png"],
    minQuantity: 1,
    quantityUnit: "Pack",
    stock: 75,
    manufacturingCost: 22,
    thresholdVal: 10,
    price: 40,
    type: "Sweet Creamy",
    totalQuantitySold: 410,
    nutrition: { Protein: "4.0g", Calcium: "130mg", Fat: "4.5g" },
    shelfLife: "4 Days",
    expiryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    discount: 10
  },

  // 8. Chaas
  {
    name: "Madhu Spiced Masala Chaas",
    category: "Chaas",
    description: "Refreshing traditional chaas by Madhu Dairy blended with roasted cumin, mint, and rock salt.",
    image: ["/images/madhu_masala_chaas.png"],
    minQuantity: 1,
    quantityUnit: "Pack",
    stock: 150,
    manufacturingCost: 12,
    thresholdVal: 20,
    price: 25,
    type: "Spiced",
    totalQuantitySold: 890,
    nutrition: { Protein: "1.8g", Calcium: "70mg", Fat: "0.9g" },
    shelfLife: "5 Days",
    expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    discount: 10
  },

  // 9. Khoya
  {
    name: "Madhu Pure Fresh Khoya (Mawa)",
    category: "Khoya",
    description: "Rich traditional milk solids by Madhu Dairy, slowly reduced to perfection for festive sweet making.",
    image: ["/images/madhu_khoya_mawa.png"],
    minQuantity: 1,
    quantityUnit: "Pack",
    stock: 40,
    manufacturingCost: 120,
    thresholdVal: 5,
    price: 180,
    type: "Pure Fresh",
    totalQuantitySold: 250,
    nutrition: { Protein: "15.0g", Calcium: "400mg", Fat: "22.0g" },
    shelfLife: "10 Days",
    expiryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    discount: 10
  },

  // 10. Basundi
  {
    name: "Madhu Creamy Kesar Basundi",
    category: "Basundi",
    description: "Rich reduced milk dessert by Madhu Dairy infused with Kashmiri saffron, cardamom, and chopped almonds.",
    image: ["/images/madhu_kesar_basundi.png"],
    minQuantity: 1,
    quantityUnit: "Pack",
    stock: 35,
    manufacturingCost: 80,
    thresholdVal: 5,
    price: 130,
    type: "Rich Dessert",
    totalQuantitySold: 190,
    nutrition: { Protein: "8.0g", Calcium: "220mg", Fat: "10.0g" },
    shelfLife: "7 Days",
    expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    discount: 12
  },

  // 11. Shrikhand
  {
    name: "Madhu Kesar Shrikhand",
    category: "Shrikhand",
    description: "Authentic sweet shrikhand by Madhu Dairy prepared from strained yoghurt with pure Kashmiri saffron.",
    image: ["/images/madhu_kesar_shrikhand.png"],
    minQuantity: 1,
    quantityUnit: "Pack",
    stock: 45,
    manufacturingCost: 55,
    thresholdVal: 5,
    price: 95,
    type: "Festive Sweet",
    totalQuantitySold: 210,
    nutrition: { Protein: "7.0g", Carbohydrates: "32g", Fat: "6.5g" },
    shelfLife: "15 Days",
    expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    discount: 12
  },

  // 12. Cream
  {
    name: "Madhu Fresh Dairy Cream",
    category: "Cream",
    description: "Rich fresh dairy cream by Madhu Dairy, perfect for whipping, baking, and gourmet gravy preparations.",
    image: ["/images/madhu_dairy_cream.png"],
    minQuantity: 1,
    quantityUnit: "Pack",
    stock: 70,
    manufacturingCost: 35,
    thresholdVal: 10,
    price: 60,
    type: "Fresh Heavy",
    totalQuantitySold: 380,
    nutrition: { Fat: "25.0g", Calories: "245kcal" },
    shelfLife: "15 Days",
    expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    discount: 8
  },

  // 13. Milk Powder
  {
    name: "Madhu Premium Dairy Milk Powder",
    category: "Milk Powder",
    description: "Instant solubility whole milk powder by Madhu Dairy. Packed with calcium and essential vitamins.",
    image: ["/images/madhu_milk_powder.png"],
    minQuantity: 1,
    quantityUnit: "Pack",
    stock: 85,
    manufacturingCost: 110,
    thresholdVal: 10,
    price: 175,
    type: "Instant Skimmed",
    totalQuantitySold: 420,
    nutrition: { Protein: "26.0g", Calcium: "950mg", Fat: "1.0g" },
    shelfLife: "12 Months",
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    discount: 10
  },

  // 14. Flavored Milk
  {
    name: "Madhu Chilled Chocolate Flavored Milk",
    category: "Flavored Milk",
    description: "Nourishing chilled chocolate milk drink by Madhu Dairy, blended with cocoa and rich A2 cow milk.",
    image: ["/images/madhu_buffalo_milk.png"],
    minQuantity: 1,
    quantityUnit: "Pack",
    stock: 80,
    manufacturingCost: 20,
    thresholdVal: 10,
    price: 35,
    type: "Energy Drink",
    totalQuantitySold: 460,
    nutrition: { Protein: "3.5g", Calcium: "130mg", Fat: "3.2g" },
    shelfLife: "15 Days",
    expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    discount: 5
  },

  // 15. Dairy Sweets
  {
    name: "Madhu Soft Gulab Jamun",
    category: "Dairy Sweets",
    description: "Mouth-melting soft khoa gulab jamun by Madhu Dairy soaked in aromatic rose sugar syrup.",
    image: ["/images/madhu_gulab_jamun.png"],
    minQuantity: 1,
    quantityUnit: "Pack",
    stock: 65,
    manufacturingCost: 85,
    thresholdVal: 8,
    price: 140,
    type: "Traditional Sweet",
    totalQuantitySold: 510,
    nutrition: { Carbohydrates: "48g", Fat: "8.5g" },
    shelfLife: "30 Days",
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    discount: 10
  },
  {
    name: "Madhu Classic Bengali Rasgulla",
    category: "Dairy Sweets",
    description: "Soft, spongy chhena balls by Madhu Dairy soaked in light sugar syrup.",
    image: ["/images/madhu_bengali_rasgulla.png"],
    minQuantity: 1,
    quantityUnit: "Pack",
    stock: 60,
    manufacturingCost: 90,
    thresholdVal: 8,
    price: 150,
    type: "Traditional Sweet",
    totalQuantitySold: 340,
    nutrition: { Protein: "4.0g", Carbohydrates: "42g", Fat: "1.2g" },
    shelfLife: "30 Days",
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    discount: 10
  },

  // 16. Badham
  {
    name: "Madhu Royal Badham Milk Drink",
    category: "Badham",
    description: "Nourishing badham almond milk by Madhu Dairy enriched with real crushed almonds and saffron strands.",
    image: ["/images/madhu_kesar_peda.png"],
    minQuantity: 1,
    quantityUnit: "Pack",
    stock: 70,
    manufacturingCost: 30,
    thresholdVal: 10,
    price: 50,
    type: "Almond Milk",
    totalQuantitySold: 390,
    nutrition: { Protein: "4.5g", Calcium: "160mg", Fat: "4.8g" },
    shelfLife: "15 Days",
    expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    discount: 8
  }
];

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

    console.log("Seeding all 16 Madhu Dairy categories & products with unique branded images...");
    await Product.insertMany(sampleProducts);

    console.log(`Successfully seeded ${sampleProducts.length} Madhu Dairy products covering all 16 categories!`);
  } catch (err) {
    console.error("Error during seeding:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
    process.exit(0);
  }
};

seedDB();
