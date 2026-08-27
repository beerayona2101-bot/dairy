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
    name: "Madhur Fresh Whole Cow Milk",
    category: "Milk",
    description: "Pure, farm-fresh whole cow milk from Madhur Dairy—rich in calcium and essential nutrients.",
    image: ["/images/madhur_cow_milk.png"],
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
    name: "Madhur Buffalo Toned Milk",
    category: "Milk",
    description: "Rich and thick buffalo milk by Madhur Dairy, ideal for making curd, tea, and coffee.",
    image: ["/images/madhur_buffalo_milk.png"],
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
    name: "Madhur Fresh Malai Paneer",
    category: "Paneer",
    description: "Soft, velvety and fresh cottage cheese by Madhur Dairy. High in protein for delicious cooking.",
    image: ["/images/madhur_malai_paneer.png"],
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
    name: "Madhur Organic Desi Cow Ghee",
    category: "Ghee",
    description: "Traditional Bilona A2 Desi Cow Ghee by Madhur Dairy with rich granular aroma and health benefits.",
    image: ["/images/madhur_desi_ghee.png"],
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
    name: "Madhur Natural Thick Curd",
    category: "Curd",
    description: "Creamy set dahi by Madhur Dairy made with active probiotic cultures for gut health.",
    image: ["/images/madhur_thick_curd.png"],
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
    name: "Madhur Salted Cooking Butter",
    category: "Butter",
    description: "Pure pasteurized yellow butter by Madhur Dairy with a pinch of salt. Great for spreading and cooking.",
    image: ["/images/madhur_cooking_butter.png"],
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
    name: "Madhur Shredded Mozzarella Cheese",
    category: "Cheese",
    description: "100% pure cow milk mozzarella cheese by Madhur Dairy with ideal stretchiness and melt for pizza.",
    image: ["/images/madhur_mozzarella_cheese.png"],
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
    name: "Madhur Sweet Punjabi Malai Lassi",
    category: "Lassi",
    description: "Thick, creamy chilled Punjabi lassi by Madhur Dairy topped with rich malai.",
    image: ["/images/madhur_malai_lassi.png"],
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

  // 8. Chaas / Buttermilk
  {
    name: "Madhur Spiced Masala Chaas",
    category: "Chaas",
    description: "Refreshing traditional chaas by Madhur Dairy blended with roasted cumin, mint, and rock salt.",
    image: ["/images/madhur_masala_chaas.png"],
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
    name: "Madhur Pure Fresh Khoya (Mawa)",
    category: "Khoya",
    description: "Rich traditional milk solids by Madhur Dairy, slowly reduced to perfection for festive sweet making.",
    image: ["/images/madhur_khoya_mawa.png"],
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
    name: "Madhur Creamy Kesar Basundi",
    category: "Basundi",
    description: "Rich reduced milk dessert by Madhur Dairy infused with Kashmiri saffron, cardamom, and chopped almonds.",
    image: ["/images/madhur_kesar_basundi.png"],
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
    name: "Madhur Kesar Shrikhand",
    category: "Shrikhand",
    description: "Authentic sweet shrikhand by Madhur Dairy prepared from strained yoghurt with pure Kashmiri saffron.",
    image: ["/images/madhur_kesar_shrikhand.png"],
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
    name: "Madhur Fresh Dairy Cream",
    category: "Cream",
    description: "Rich fresh dairy cream by Madhur Dairy, perfect for whipping, baking, and gourmet gravy preparations.",
    image: ["https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80"],
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
    name: "Madhur Premium Dairy Milk Powder",
    category: "Milk Powder",
    description: "Instant solubility whole milk powder by Madhur Dairy. Packed with calcium and essential vitamins.",
    image: ["https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80"],
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

  // 14. Gulab Jamun
  {
    name: "Madhur Soft Gulab Jamun",
    category: "Gulab Jamun",
    description: "Mouth-melting soft khoa gulab jamun by Madhur Dairy soaked in aromatic rose sugar syrup.",
    image: ["https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80"],
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

  // 15. Rasgulla
  {
    name: "Madhur Classic Bengali Rasgulla",
    category: "Rasgulla",
    description: "Soft, spongy chhena balls by Madhur Dairy soaked in light sugar syrup.",
    image: ["https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=600&q=80"],
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

  // 16. Peda
  {
    name: "Madhur Mathura Kesar Peda",
    category: "Peda",
    description: "Authentic Mathura style khoa peda by Madhur Dairy garnished with cardamom and pistachio.",
    image: ["https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80"],
    minQuantity: 1,
    quantityUnit: "Pack",
    stock: 50,
    manufacturingCost: 95,
    thresholdVal: 5,
    price: 160,
    type: "Festive Sweet",
    totalQuantitySold: 280,
    nutrition: { Protein: "6.5g", Carbohydrates: "52g", Fat: "11.0g" },
    shelfLife: "20 Days",
    expiryDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    discount: 10
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

    console.log("Seeding all 16 Madhur Dairy categories & products with unique branded images...");
    await Product.insertMany(sampleProducts);

    console.log(`Successfully seeded ${sampleProducts.length} Madhur Dairy products covering all 16 categories!`);
  } catch (err) {
    console.error("Error during seeding:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
    process.exit(0);
  }
};

seedDB();
