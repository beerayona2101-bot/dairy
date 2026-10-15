import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const categoriesConfig = [
  {
    category: "Milk",
    image: "/images/natural_cow_milk.png",
    items: [
      { name: "Natural Farm Fresh Cow Milk (Full Cream - 1 Litre)", unit: "Litre", price: 68, cost: 42, type: "Full Cream", shelf: "3 Days", disc: 10, stock: 120, desc: "Pure, unadulterated farm-fresh whole cow milk rich in calcium, protein, and natural vitamins.", img: "/images/natural_cow_milk.png" },
      { name: "Natural Farm Fresh Cow Milk (Full Cream - 500ml)", unit: "Pack", price: 36, cost: 22, type: "Full Cream", shelf: "3 Days", disc: 5, stock: 140, desc: "Farm-fresh whole cow milk in a convenient 500ml daily pack for small households.", img: "/images/natural_cow_milk.png" },
      { name: "Natural Farm Fresh Cow Milk (Family Pack - 2 Litre)", unit: "Pack", price: 130, cost: 82, type: "Full Cream", shelf: "3 Days", disc: 12, stock: 65, desc: "Economical 2-litre family pouch of rich unadulterated whole cow milk delivered daily.", img: "/images/natural_cow_milk.png" },
      { name: "Natural Creamy Buffalo Milk (High Fat - 1 Litre)", unit: "Litre", price: 76, cost: 48, type: "Buffalo High Fat", shelf: "3 Days", disc: 8, stock: 95, desc: "Rich, thick, and creamy buffalo milk—ideal for making thick curd, rich tea, coffee, and sweets.", img: "/images/natural_buffalo_milk.png" },
      { name: "Natural Creamy Buffalo Milk (High Fat - 500ml)", unit: "Pack", price: 40, cost: 25, type: "Buffalo High Fat", shelf: "3 Days", disc: 5, stock: 110, desc: "High-fat creamy buffalo milk in a 500ml pouch for rich morning beverages and desserts.", img: "/images/natural_buffalo_milk.png" },
      { name: "Natural Toned Cow Milk (Low Fat - 1 Litre)", unit: "Litre", price: 56, cost: 36, type: "Toned Low Fat", shelf: "3 Days", disc: 5, stock: 100, desc: "Low-fat pasteurized toned cow milk packed with protein and calcium for balanced fitness.", img: "/images/natural_cow_milk.png" },
      { name: "Natural Toned Cow Milk (Low Fat - 500ml)", unit: "Pack", price: 30, cost: 19, type: "Toned Low Fat", shelf: "3 Days", disc: 5, stock: 125, desc: "Nutrient-balanced toned cow milk in 500ml pouch for calorie-conscious daily diets.", img: "/images/natural_cow_milk.png" },
      { name: "Natural Double Toned Milk (Slim Diet - 1 Litre)", unit: "Litre", price: 52, cost: 32, type: "Double Toned", shelf: "3 Days", disc: 5, stock: 80, desc: "Ultra-low fat double toned milk with only 1.5% fat, tailored for weight management and heart wellness.", img: "/images/natural_cow_milk.png" },
      { name: "Natural Desi Gir Cow A2 Raw Milk (Glass Bottle - 1 Litre)", unit: "Bottle", price: 95, cost: 60, type: "A2 Desi Cow", shelf: "2 Days", disc: 10, stock: 45, desc: "Indigenous Gir Cow A2 certified raw unprocessed milk delivered cold in eco-friendly glass bottles.", img: "/images/natural_cow_milk.png" },
      { name: "Natural Homogenized Standardized Cow Milk (1 Litre)", unit: "Litre", price: 62, cost: 39, type: "Standardized", shelf: "4 Days", disc: 5, stock: 85, desc: "Micro-filtered standardized cow milk with uniform cream distribution for smooth tea and lattes.", img: "/images/natural_cow_milk.png" }
    ]
  },
  {
    category: "Paneer",
    image: "/images/natural_malai_paneer.png",
    items: [
      { name: "Natural Fresh Malai Paneer (200g Pack)", unit: "Pack", price: 115, cost: 72, type: "Fresh Malai", shelf: "7 Days", disc: 10, stock: 85, desc: "Soft, velvety fresh cottage cheese made using traditional slow curdling of pure whole milk.", img: "/images/natural_malai_paneer.png" },
      { name: "Natural Fresh Malai Paneer (500g Value Pack)", unit: "Pack", price: 275, cost: 175, type: "Fresh Malai", shelf: "7 Days", disc: 12, stock: 70, desc: "Mouth-watering fresh malai paneer block for family curries, tikkas, and paneer butter masala.", img: "/images/natural_malai_paneer.png" },
      { name: "Natural Fresh Malai Paneer Block (1kg Wholesale Pack)", unit: "Pack", price: 520, cost: 340, type: "Fresh Malai", shelf: "7 Days", disc: 15, stock: 40, desc: "Generous 1kg soft malai paneer block for festive cooking, dinner parties, and catering.", img: "/images/natural_malai_paneer.png" },
      { name: "Natural Low Fat Diet Paneer (200g Pack)", unit: "Pack", price: 125, cost: 80, type: "Low Fat", shelf: "7 Days", disc: 8, stock: 60, desc: "High-protein, low-fat cottage cheese made from toned milk—perfect for gym enthusiasts and keto diets.", img: "/images/natural_malai_paneer.png" },
      { name: "Natural Low Fat Diet Paneer (500g Pack)", unit: "Pack", price: 295, cost: 190, type: "Low Fat", shelf: "7 Days", disc: 10, stock: 50, desc: "Healthy low-fat paneer packed with 22g protein per 100g, crafted for daily nutritious salads and wraps.", img: "/images/natural_malai_paneer.png" },
      { name: "Natural Spiced Masala Paneer (200g Pack)", unit: "Pack", price: 135, cost: 85, type: "Spiced Masala", shelf: "6 Days", disc: 10, stock: 55, desc: "Artisanal fresh paneer infused with roasted cumin, green chillies, crushed peppercorns, and fresh herbs.", img: "/images/natural_malai_paneer.png" },
      { name: "Natural Desi Gir Cow A2 Paneer (250g Vacuum Pack)", unit: "Pack", price: 195, cost: 125, type: "A2 Organic", shelf: "8 Days", disc: 10, stock: 45, desc: "Pure A2 cottage cheese churned exclusively from indigenous Gir cow milk for optimal gut comfort.", img: "/images/natural_malai_paneer.png" },
      { name: "Natural Desi Gir Cow A2 Paneer (500g Vacuum Pack)", unit: "Pack", price: 375, cost: 240, type: "A2 Organic", shelf: "8 Days", disc: 12, stock: 35, desc: "Premium vacuum-sealed A2 Desi Gir cow paneer retaining peak freshness, aroma, and delicate texture.", img: "/images/natural_malai_paneer.png" },
      { name: "Natural Diced Cooking Paneer Cubes (400g Pack)", unit: "Pack", price: 230, cost: 145, type: "Pre-cut Cubes", shelf: "7 Days", disc: 8, stock: 65, desc: "Evenly diced ready-to-toss fresh paneer cubes that hold their shape perfectly during stir frying.", img: "/images/natural_malai_paneer.png" },
      { name: "Natural Soft Cream Paneer (1kg Block)", unit: "Pack", price: 510, cost: 330, type: "Soft Cream", shelf: "7 Days", disc: 15, stock: 30, desc: "Ultra-soft melt-in-mouth cottage cheese ideal for shahi gravy, snacks, and sweet sandesh.", img: "/images/natural_malai_paneer.png" }
    ]
  },
  {
    category: "Ghee",
    image: "/images/natural_desi_ghee.png",
    items: [
      { name: "Natural Traditional Bilona Cow Ghee (250ml Glass Jar)", unit: "Jar", price: 360, cost: 230, type: "Bilona Cow", shelf: "365 Days", disc: 10, stock: 60, desc: "Hand-churned A2 bilona desi cow ghee prepared by slow-simmering cultured curd butter over wood-fire.", img: "/images/natural_desi_ghee.png" },
      { name: "Natural Traditional Bilona Cow Ghee (500ml Glass Jar)", unit: "Jar", price: 680, cost: 430, type: "Bilona Cow", shelf: "365 Days", disc: 12, stock: 75, desc: "Aromatic granular golden cow ghee with rich Vedic aroma and essential fat-soluble vitamins A, D, and E.", img: "/images/natural_desi_ghee.png" },
      { name: "Natural Traditional Bilona Cow Ghee (1 Litre Glass Jar)", unit: "Jar", price: 1299, cost: 820, type: "Bilona Cow", shelf: "365 Days", disc: 15, stock: 50, desc: "1-Litre jar of artisanal golden cow ghee—the pure essence of nutrition for rotis, dal tadka, and halwa.", img: "/images/natural_desi_ghee.png" },
      { name: "Natural Traditional Bilona Cow Ghee (5 Litre Festive Tin)", unit: "Tin", price: 6199, cost: 3900, type: "Bilona Cow", shelf: "365 Days", disc: 18, stock: 20, desc: "Airtight premium 5-litre tin of bilona cow ghee for auspicious poojas, festive preparations, and sweets.", img: "/images/natural_desi_ghee.png" },
      { name: "Natural Pure Buffalo Desi Ghee (500ml Jar)", unit: "Jar", price: 620, cost: 390, type: "Buffalo Pure", shelf: "365 Days", disc: 10, stock: 65, desc: "Pure white granulated buffalo ghee cooked traditionally for high smoke point frying and rich gravies.", img: "/images/natural_desi_ghee.png" },
      { name: "Natural Pure Buffalo Desi Ghee (1 Litre Jar)", unit: "Jar", price: 1180, cost: 740, type: "Buffalo Pure", shelf: "365 Days", disc: 12, stock: 45, desc: "Full-bodied pure buffalo ghee with dense grainy texture and unmistakable natural richness.", img: "/images/natural_desi_ghee.png" },
      { name: "Natural Desi Gir Cow A2 Cultured Ghee (250ml Jar)", unit: "Jar", price: 499, cost: 310, type: "A2 Cultured", shelf: "365 Days", disc: 10, stock: 55, desc: "Certified pure A2 Gir cow ghee cultured with medicinal bilona method for holistic Ayurvedic wellness.", img: "/images/natural_desi_ghee.png" },
      { name: "Natural Desi Gir Cow A2 Cultured Ghee (500ml Jar)", unit: "Jar", price: 950, cost: 600, type: "A2 Cultured", shelf: "365 Days", disc: 12, stock: 40, desc: "Rich granular Gir Cow A2 clarified butter packed with butyric acid to nourish immunity and gut health.", img: "/images/natural_desi_ghee.png" },
      { name: "Natural Desi Gir Cow A2 Cultured Ghee (1 Litre Jar)", unit: "Jar", price: 1799, cost: 1150, type: "A2 Cultured", shelf: "365 Days", disc: 15, stock: 30, desc: "Prestigious 1-litre apothecary jar of authentic Vedic A2 ghee with unforgettable nutty fragrance.", img: "/images/natural_desi_ghee.png" },
      { name: "Natural Organic Herbal Infused Brahmi Ghee (250ml)", unit: "Jar", price: 450, cost: 280, type: "Herbal Infused", shelf: "180 Days", disc: 8, stock: 35, desc: "Traditional Medhya Rasayana ghee infused with wild organic Brahmi and Shankhpushpi for memory vitality.", img: "/images/natural_desi_ghee.png" }
    ]
  },
  {
    category: "Curd",
    image: "/images/natural_thick_curd.png",
    items: [
      { name: "Natural Thick Farm Fresh Curd (200g Cup)", unit: "Cup", price: 25, cost: 14, type: "Classic Dahi", shelf: "10 Days", disc: 5, stock: 110, desc: "Thick set curd naturally fermented with live active probiotics for daily digestive wellness.", img: "/images/natural_thick_curd.png" },
      { name: "Natural Thick Farm Fresh Curd (400g Pouch)", unit: "Pouch", price: 45, cost: 26, type: "Classic Dahi", shelf: "10 Days", disc: 5, stock: 130, desc: "Pouch of home-style set curd made from pure cow milk, naturally sweet with mild tanginess.", img: "/images/natural_thick_curd.png" },
      { name: "Natural Thick Farm Fresh Curd (1kg Family Bucket)", unit: "Tub", price: 98, cost: 58, type: "Classic Dahi", shelf: "10 Days", disc: 10, stock: 70, desc: "Family-size 1kg bucket of thick creamy dahi for raita, marinades, curries, and daily dining.", img: "/images/natural_thick_curd.png" },
      { name: "Natural Traditional Clay Pot Handi Dahi (500g Handi)", unit: "Pot", price: 75, cost: 44, type: "Clay Pot Set", shelf: "7 Days", disc: 10, stock: 50, desc: "Authentic earthenware handi-set curd that absorbs excess whey, leaving dense velvety earthy dahi.", img: "/images/natural_thick_curd.png" },
      { name: "Natural Authentic Mishti Doi (Sweetened - 100g Cup)", unit: "Cup", price: 35, cost: 20, type: "Sweet Caramel", shelf: "10 Days", disc: 5, stock: 80, desc: "Traditional Bengali caramel sweetened thick fermented yogurt dessert baked in earthen cups.", img: "/images/natural_thick_curd.png" },
      { name: "Natural Authentic Mishti Doi (Sweetened - 200g Cup)", unit: "Cup", price: 65, cost: 38, type: "Sweet Caramel", shelf: "10 Days", disc: 8, stock: 75, desc: "Classic sweetened pink curd slow-cooked with palm jaggery and evaporated condensed milk.", img: "/images/natural_thick_curd.png" },
      { name: "Natural Probiotic Low Fat Set Dahi (400g Tub)", unit: "Tub", price: 55, cost: 32, type: "Probiotic Low Fat", shelf: "12 Days", disc: 8, stock: 65, desc: "Diet-friendly light curd packed with 5 billion active Lactobacillus CFU to reinforce healthy digestion.", img: "/images/natural_thick_curd.png" },
      { name: "Natural Creamy Buffalo Milk Curd (500g Tub)", unit: "Tub", price: 60, cost: 36, type: "Buffalo Cream", shelf: "10 Days", disc: 5, stock: 90, desc: "Lusciously rich buffalo milk dahi that slices with a spoon—perfect for kadhi and savory raita.", img: "/images/natural_thick_curd.png" },
      { name: "Natural Desi Gir Cow A2 Curd (500g Tub)", unit: "Tub", price: 80, cost: 48, type: "A2 Desi Cow", shelf: "8 Days", disc: 10, stock: 55, desc: "Premium curd made from 100% pasture-raised A2 Gir cow milk with pure natural whey proteins.", img: "/images/natural_thick_curd.png" },
      { name: "Natural Greek Style Strained High-Protein Curd (250g)", unit: "Tub", price: 95, cost: 58, type: "Greek Strained", shelf: "14 Days", disc: 10, stock: 45, desc: "Triple-strained thick artisanal yogurt with twice the protein and a decadently rich spoonable body.", img: "/images/natural_thick_curd.png" }
    ]
  },
  {
    category: "Butter",
    image: "/images/natural_cooking_butter.png",
    items: [
      { name: "Natural Pure Salted Table Butter (100g Pack)", unit: "Pack", price: 58, cost: 36, type: "Salted", shelf: "60 Days", disc: 5, stock: 110, desc: "Pure cream salted butter churned from fresh farm milk, perfect for morning toasts and warm parathas.", img: "/images/natural_cooking_butter.png" },
      { name: "Natural Pure Salted Table Butter (250g Pack)", unit: "Pack", price: 138, cost: 86, type: "Salted", shelf: "60 Days", disc: 8, stock: 85, desc: "Creamy golden salted butter with smooth spreadability and authentic farm churned savoriness.", img: "/images/natural_cooking_butter.png" },
      { name: "Natural Pure Salted Table Butter (500g Value Pack)", unit: "Pack", price: 265, cost: 168, type: "Salted", shelf: "60 Days", disc: 10, stock: 65, desc: "Value brick of salted pure butter for family breakfasts, baking, pav bhaji, and cooking.", img: "/images/natural_cooking_butter.png" },
      { name: "Natural Traditional White Makhan Unsalted (200g Tub)", unit: "Tub", price: 120, cost: 74, type: "Unsalted White", shelf: "20 Days", disc: 8, stock: 70, desc: "Traditional home-churned white makhan made from cultured curd malai without added salt or preservatives.", img: "/images/natural_cooking_butter.png" },
      { name: "Natural Traditional White Makhan Unsalted (500g Tub)", unit: "Tub", price: 280, cost: 175, type: "Unsalted White", shelf: "20 Days", disc: 10, stock: 55, desc: "Pristine white desi makhan—the timeless companion to hot sarson ka saag and stuffed parathas.", img: "/images/natural_cooking_butter.png" },
      { name: "Natural Garlic & Fine Herbs Butter (150g Tub)", unit: "Tub", price: 110, cost: 68, type: "Flavored Herb", shelf: "30 Days", disc: 10, stock: 50, desc: "Gourmet blended butter infused with roasted garlic, parsley, oregano, and crushed sea salt.", img: "/images/natural_cooking_butter.png" },
      { name: "Natural Cultured Table Butter Salted (250g Pack)", unit: "Pack", price: 150, cost: 94, type: "Cultured", shelf: "45 Days", disc: 8, stock: 60, desc: "European-style cultured butter slow-ripened with live lactic ferments for deep hazelnut undertones.", img: "/images/natural_cooking_butter.png" },
      { name: "Natural Desi Gir Cow A2 Churned Butter (200g Tub)", unit: "Tub", price: 190, cost: 118, type: "A2 Cultured", shelf: "25 Days", disc: 10, stock: 40, desc: "Rare artisanal butter churned from cultured A2 Gir cow curd, brimming with easy-to-digest nutrition.", img: "/images/natural_cooking_butter.png" },
      { name: "Natural Honey Sweetened Table Butter (150g Tub)", unit: "Tub", price: 125, cost: 78, type: "Sweet Butter", shelf: "30 Days", disc: 10, stock: 45, desc: "Whipped creamy butter sweetened with 100% raw forest honey—heavenly spread for waffles and pancakes.", img: "/images/natural_cooking_butter.png" },
      { name: "Natural Bakery Cooking Butter Unsalted (1kg Block)", unit: "Block", price: 510, cost: 325, type: "Baking Butter", shelf: "60 Days", disc: 15, stock: 35, desc: "High-butterfat 82% unsalted pure butter block designed for pastry chefs, flaky croissants, and cakes.", img: "/images/natural_cooking_butter.png" }
    ]
  },
  {
    category: "Lassi",
    image: "/images/natural_malai_lassi.png",
    items: [
      { name: "Natural Sweet Punjabi Malai Lassi (250ml Bottle)", unit: "Bottle", price: 40, cost: 22, type: "Sweet Malai", shelf: "7 Days", disc: 10, stock: 95, desc: "Chilled thick traditional Punjabi sweet lassi topped with fresh clotted malai and green cardamom.", img: "/images/natural_malai_lassi.png" },
      { name: "Natural Sweet Punjabi Malai Lassi (500ml Bottle)", unit: "Bottle", price: 75, cost: 42, type: "Sweet Malai", shelf: "7 Days", disc: 10, stock: 80, desc: "Hearty 500ml bottle of sweet creamy churned dahi lassi for instant energy and summer refreshment.", img: "/images/natural_malai_lassi.png" },
      { name: "Natural Alphonso Mango Malai Lassi (250ml Bottle)", unit: "Bottle", price: 48, cost: 26, type: "Alphonso Mango", shelf: "7 Days", disc: 10, stock: 100, desc: "Rich blended yogurt drink infused with real Ratnagiri Alphonso mango pulp and thick fresh cream.", img: "/images/natural_malai_lassi.png" },
      { name: "Natural Alphonso Mango Malai Lassi (500ml Bottle)", unit: "Bottle", price: 90, cost: 50, type: "Alphonso Mango", shelf: "7 Days", disc: 12, stock: 85, desc: "Tropical mango lassi in 500ml bottle loaded with natural vitamins and velvety mango goodness.", img: "/images/natural_malai_lassi.png" },
      { name: "Natural Royal Kesar Pista Lassi (250ml Bottle)", unit: "Bottle", price: 55, cost: 30, type: "Kesar Pista", shelf: "7 Days", disc: 10, stock: 90, desc: "Exquisite sweet lassi enriched with pure Kashmiri saffron strands and crunchy roasted pistachios.", img: "/images/natural_malai_lassi.png" },
      { name: "Natural Royal Kesar Pista Lassi (500ml Bottle)", unit: "Bottle", price: 105, cost: 60, type: "Kesar Pista", shelf: "7 Days", disc: 12, stock: 70, desc: "Indulgent saffron-infused royal lassi in 500ml bottle with generous slivers of California pistachios.", img: "/images/natural_malai_lassi.png" },
      { name: "Natural Fresh Gulab Rose Petal Lassi (250ml Bottle)", unit: "Bottle", price: 45, cost: 25, type: "Rose Petal", shelf: "7 Days", disc: 8, stock: 75, desc: "Fragrant refreshing lassi made with natural Damask rose petal preserve and cooling cardamom.", img: "/images/natural_malai_lassi.png" },
      { name: "Natural Cardamom Elaichi Lassi (250ml Bottle)", unit: "Bottle", price: 42, cost: 23, type: "Cardamom Elaichi", shelf: "7 Days", disc: 8, stock: 80, desc: "Classic sweet curd drink subtly scented with freshly ground green cardamom pods.", img: "/images/natural_malai_lassi.png" },
      { name: "Natural Strawberry Swirl Lassi (250ml Bottle)", unit: "Bottle", price: 48, cost: 26, type: "Fresh Strawberry", shelf: "7 Days", disc: 10, stock: 65, desc: "Fruity sweet yogurt drink blended with natural Mahabaleshwar strawberry puree.", img: "/images/natural_malai_lassi.png" },
      { name: "Natural Sugar-Free Diet Lassi (250ml Bottle)", unit: "Bottle", price: 45, cost: 25, type: "Sugar-Free Diet", shelf: "7 Days", disc: 8, stock: 60, desc: "Zero added sugar refreshing lassi sweetened naturally with stevia extract for diabetic-friendly diets.", img: "/images/natural_malai_lassi.png" }
    ]
  },
  {
    category: "Chaas",
    image: "/images/natural_masala_chaas.png",
    items: [
      { name: "Natural Spiced Masala Chaas (200ml Pouch)", unit: "Pouch", price: 18, cost: 10, type: "Spiced Masala", shelf: "7 Days", disc: 5, stock: 150, desc: "Refreshing digestive buttermilk with roasted cumin, rock salt, ginger, and fresh mint leaves.", img: "/images/natural_masala_chaas.png" },
      { name: "Natural Spiced Masala Chaas (500ml Bottle)", unit: "Bottle", price: 38, cost: 22, type: "Spiced Masala", shelf: "7 Days", disc: 10, stock: 120, desc: "Traditional cooling buttermilk packed with electrolytes and natural spices to beat the summer heat.", img: "/images/natural_masala_chaas.png" },
      { name: "Natural Spiced Masala Chaas (1 Litre Family Bottle)", unit: "Bottle", price: 70, cost: 40, type: "Spiced Masala", shelf: "7 Days", disc: 12, stock: 90, desc: "1-Litre family bottle of authentic spiced chaas—light on the stomach and deeply refreshing after lunch.", img: "/images/natural_masala_chaas.png" },
      { name: "Natural Fresh Mint & Jeera Buttermilk (250ml Bottle)", unit: "Bottle", price: 25, cost: 14, type: "Mint & Roasted Jeera", shelf: "7 Days", disc: 8, stock: 110, desc: "Zesty buttermilk blended with garden fresh crushed mint sprigs and slow-roasted cumin powder.", img: "/images/natural_masala_chaas.png" },
      { name: "Natural Fresh Mint & Jeera Buttermilk (500ml Bottle)", unit: "Bottle", price: 48, cost: 27, type: "Mint & Roasted Jeera", shelf: "7 Days", disc: 10, stock: 85, desc: "Cooling mint & jeera chaas in a 500ml bottle for healthy hydration after workouts and meals.", img: "/images/natural_masala_chaas.png" },
      { name: "Natural Smoked Tadka Chaas (250ml Bottle)", unit: "Bottle", price: 28, cost: 16, type: "Smoked Tadka", shelf: "7 Days", disc: 10, stock: 90, desc: "Dhungar-smoked village buttermilk tempered with curry leaves, mustard seeds, and hing.", img: "/images/natural_masala_chaas.png" },
      { name: "Natural Plain Salted Buttermilk (500ml Bottle)", unit: "Bottle", price: 32, cost: 18, type: "Plain Salted", shelf: "7 Days", disc: 5, stock: 105, desc: "Simple unspiced light buttermilk with pure pink Himalayan salt for pure hydration and digestion.", img: "/images/natural_masala_chaas.png" },
      { name: "Natural Plain Salted Buttermilk (1 Litre Bottle)", unit: "Bottle", price: 60, cost: 34, type: "Plain Salted", shelf: "7 Days", disc: 10, stock: 80, desc: "1-Litre bottle of crisp salted buttermilk—low fat, zero cholesterol, and rich in natural whey.", img: "/images/natural_masala_chaas.png" },
      { name: "Natural Ginger Coriander Digestive Chaas (250ml Bottle)", unit: "Bottle", price: 26, cost: 15, type: "Ginger Coriander", shelf: "7 Days", disc: 8, stock: 75, desc: "Ayurvedic digestive buttermilk infused with fresh ginger juice, cilantro, and black salt.", img: "/images/natural_masala_chaas.png" },
      { name: "Natural Crispy Boondi Spiced Chaas (250ml Bottle)", unit: "Bottle", price: 30, cost: 17, type: "Boondi Spiced", shelf: "5 Days", disc: 10, stock: 70, desc: "Tangy spiced buttermilk served with crunchy chickpea boondi for delightful savory sipping.", img: "/images/natural_masala_chaas.png" }
    ]
  },
  {
    category: "Shrikhand",
    image: "/images/natural_kesar_shrikhand.png",
    items: [
      { name: "Natural Royal Kesar Shrikhand (250g Tub)", unit: "Tub", price: 125, cost: 75, type: "Royal Kesar", shelf: "20 Days", disc: 10, stock: 65, desc: "Traditional strained yoghurt dessert sweet infused with pure Kashmiri saffron and green cardamom.", img: "/images/natural_kesar_shrikhand.png" },
      { name: "Natural Royal Kesar Shrikhand (500g Tub)", unit: "Tub", price: 240, cost: 145, type: "Royal Kesar", shelf: "20 Days", disc: 12, stock: 55, desc: "Creamy saffron shrikhand in 500g tub garnished with crushed almonds and aromatic cardamom.", img: "/images/natural_kesar_shrikhand.png" },
      { name: "Natural Royal Kesar Shrikhand (1kg Family Bucket)", unit: "Tub", price: 460, cost: 280, type: "Royal Kesar", shelf: "20 Days", disc: 15, stock: 35, desc: "1kg festive bucket of royal saffron shrikhand—the crowning delight for weddings and festivals.", img: "/images/natural_kesar_shrikhand.png" },
      { name: "Natural Fragrant Elaichi Shrikhand (250g Tub)", unit: "Tub", price: 115, cost: 68, type: "Green Elaichi", shelf: "20 Days", disc: 10, stock: 60, desc: "Creamy strained yogurt dessert delicately flavored with freshly ground aromatic green cardamom.", img: "/images/natural_kesar_shrikhand.png" },
      { name: "Natural Fragrant Elaichi Shrikhand (500g Tub)", unit: "Tub", price: 220, cost: 130, type: "Green Elaichi", shelf: "20 Days", disc: 12, stock: 50, desc: "500g pack of smooth elaichi shrikhand—silky sweet comfort food pairing wonderfully with hot puris.", img: "/images/natural_kesar_shrikhand.png" },
      { name: "Natural Alphonso Mango Amrakhand (250g Tub)", unit: "Tub", price: 130, cost: 78, type: "Alphonso Mango", shelf: "20 Days", disc: 10, stock: 70, desc: "Authentic Maharashtrian Amrakhand made with 100% real Alphonso mango pulp and thick chakka dahi.", img: "/images/natural_kesar_shrikhand.png" },
      { name: "Natural Alphonso Mango Amrakhand (500g Tub)", unit: "Tub", price: 250, cost: 150, type: "Alphonso Mango", shelf: "20 Days", disc: 12, stock: 60, desc: "Rich mango-infused strained yogurt sweet with golden color and heavenly summer taste.", img: "/images/natural_kesar_shrikhand.png" },
      { name: "Natural Dry Fruit Rajbhog Shrikhand (250g Tub)", unit: "Tub", price: 145, cost: 88, type: "Dry Fruit Rajbhog", shelf: "20 Days", disc: 10, stock: 45, desc: "Opulent festive shrikhand loaded with cashews, almonds, pistachios, saffron, and sweet chironji.", img: "/images/natural_kesar_shrikhand.png" },
      { name: "Natural Rich Pista Badam Shrikhand (250g Tub)", unit: "Tub", price: 140, cost: 84, type: "Pista Badam", shelf: "20 Days", disc: 10, stock: 50, desc: "Luxurious thickened dessert packed with roasted pistachio flakes and crunchy California almond bits.", img: "/images/natural_kesar_shrikhand.png" },
      { name: "Natural Low-Sugar Diet Elaichi Shrikhand (250g Tub)", unit: "Tub", price: 135, cost: 80, type: "Low-Sugar Diet", shelf: "18 Days", disc: 8, stock: 40, desc: "Healthier shrikhand crafted with 60% less sugar and extra protein for guilt-free festive indulgence.", img: "/images/natural_kesar_shrikhand.png" }
    ]
  },
  {
    category: "Basundi",
    image: "/images/natural_kesar_basundi.png",
    items: [
      { name: "Natural Creamy Kesar Basundi (250ml Bottle)", unit: "Bottle", price: 140, cost: 85, type: "Kesar Saffron", shelf: "15 Days", disc: 10, stock: 55, desc: "Rich condensed sweet milk slow-cooked with saffron strands, slivered almonds, and green cardamom.", img: "/images/natural_kesar_basundi.png" },
      { name: "Natural Creamy Kesar Basundi (500ml Bottle)", unit: "Bottle", price: 270, cost: 165, type: "Kesar Saffron", shelf: "15 Days", disc: 12, stock: 45, desc: "500ml bottle of authentic slow-evaporated dessert milk loaded with golden saffron and dry fruits.", img: "/images/natural_kesar_basundi.png" },
      { name: "Natural Creamy Kesar Basundi (1 Litre Jar)", unit: "Jar", price: 520, cost: 320, type: "Kesar Saffron", shelf: "15 Days", disc: 15, stock: 30, desc: "1-Litre celebratory jar of thick kesar basundi—rich in milk solids for weddings and family poojas.", img: "/images/natural_kesar_basundi.png" },
      { name: "Natural Cardamom Elaichi Basundi (250ml Bottle)", unit: "Bottle", price: 130, cost: 78, type: "Elaichi Cardamom", shelf: "15 Days", disc: 10, stock: 50, desc: "Silky thickened sweet milk flavored with pure hand-pounded green cardamom and nutmeg essence.", img: "/images/natural_kesar_basundi.png" },
      { name: "Natural Cardamom Elaichi Basundi (500ml Bottle)", unit: "Bottle", price: 250, cost: 150, type: "Elaichi Cardamom", shelf: "15 Days", disc: 12, stock: 40, desc: "Traditional 500ml elaichi basundi with creamy layers of laccha malai cooked slowly over low flame.", img: "/images/natural_kesar_basundi.png" },
      { name: "Natural Crunchy Almond Badam Basundi (250ml Bottle)", unit: "Bottle", price: 150, cost: 90, type: "Almond Badam", shelf: "15 Days", disc: 10, stock: 45, desc: "Decadent reduced milk dessert infused with roasted almond paste and crunchy blanched almond slivers.", img: "/images/natural_kesar_basundi.png" },
      { name: "Natural Pista Malai Basundi (250ml Bottle)", unit: "Bottle", price: 155, cost: 95, type: "Pistachio Malai", shelf: "15 Days", disc: 10, stock: 40, desc: "Gourmet basundi brimming with rich green pistachios and soft clotted malai ribbons.", img: "/images/natural_kesar_basundi.png" },
      { name: "Natural Festive Charoli Dry Fruit Basundi (500ml)", unit: "Bottle", price: 290, cost: 175, type: "Festive Charoli", shelf: "15 Days", disc: 12, stock: 35, desc: "Traditional wedding basundi garnished with roasted charoli nuts, cashews, and saffron threads.", img: "/images/natural_kesar_basundi.png" },
      { name: "Natural Rose Petal Gulkand Basundi (250ml Bottle)", unit: "Bottle", price: 145, cost: 88, type: "Rose Gulkand", shelf: "15 Days", disc: 8, stock: 35, desc: "Subtly aromatic dessert milk infused with organic rose gulkand preserve and toasted almonds.", img: "/images/natural_kesar_basundi.png" },
      { name: "Natural Traditional Thick Malai Rabri Basundi (500ml)", unit: "Bottle", price: 295, cost: 180, type: "Thick Rabri", shelf: "12 Days", disc: 12, stock: 30, desc: "Ultra-thick rabri style basundi with shredded milk flakes and rich caramelized dairy flavor.", img: "/images/natural_kesar_basundi.png" }
    ]
  },
  {
    category: "Khoya",
    image: "/images/natural_khoya_mawa.png",
    items: [
      { name: "Natural Pure Fresh Hariyali Khoya (250g Pack)", unit: "Pack", price: 180, cost: 115, type: "Hariyali Mawa", shelf: "15 Days", disc: 5, stock: 65, desc: "Pure soft evaporated solid milk dough—the gold standard for making melt-in-mouth gulab jamuns.", img: "/images/natural_khoya_mawa.png" },
      { name: "Natural Pure Fresh Hariyali Khoya (500g Pack)", unit: "Pack", price: 350, cost: 220, type: "Hariyali Mawa", shelf: "15 Days", disc: 8, stock: 55, desc: "Fresh creamy 500g hariyali mawa for making authentic Indian festival sweets, halwa, and pedas.", img: "/images/natural_khoya_mawa.png" },
      { name: "Natural Pure Fresh Hariyali Khoya (1kg Block)", unit: "Block", price: 680, cost: 430, type: "Hariyali Mawa", shelf: "15 Days", disc: 12, stock: 35, desc: "1kg block of soft fresh mawa made purely from whole farm milk without flour, starch, or additives.", img: "/images/natural_khoya_mawa.png" },
      { name: "Natural Traditional Batti Khoya (250g Block)", unit: "Block", price: 190, cost: 120, type: "Batti Mawa", shelf: "20 Days", disc: 5, stock: 60, desc: "Firm, condensed batti khoya ideal for grating into burfi, kaju katli fillings, and mawa laddoos.", img: "/images/natural_khoya_mawa.png" },
      { name: "Natural Traditional Batti Khoya (500g Block)", unit: "Block", price: 370, cost: 235, type: "Batti Mawa", shelf: "20 Days", disc: 8, stock: 50, desc: "Dense hard-pack 500g mawa block cooked slowly to moisture-free perfection for long shelf life.", img: "/images/natural_khoya_mawa.png" },
      { name: "Natural Traditional Batti Khoya (1kg Block)", unit: "Block", price: 720, cost: 450, type: "Batti Mawa", shelf: "20 Days", disc: 12, stock: 30, desc: "Generous 1kg batti mawa slab for Diwali sweet making, confectioneries, and commercial kitchens.", img: "/images/natural_khoya_mawa.png" },
      { name: "Natural Granular Danedar Mawa (250g Pack)", unit: "Pack", price: 195, cost: 125, type: "Danedar Kalakand", shelf: "15 Days", disc: 6, stock: 50, desc: "Coarse granular textured mawa specially crafted for making authentic Alwar milk cake and kalakand.", img: "/images/natural_khoya_mawa.png" },
      { name: "Natural Granular Danedar Mawa (500g Pack)", unit: "Pack", price: 380, cost: 240, type: "Danedar Kalakand", shelf: "15 Days", disc: 10, stock: 40, desc: "500g pack of curdled granular mawa providing ideal chewiness and grain structure for artisanal sweets.", img: "/images/natural_khoya_mawa.png" },
      { name: "Natural Desi Cow Milk Khoya (250g Pack)", unit: "Pack", price: 220, cost: 140, type: "Desi Cow A2", shelf: "15 Days", disc: 10, stock: 45, desc: "Golden-hued rare khoya produced entirely from pure cow milk—light on the palate and easy to digest.", img: "/images/natural_khoya_mawa.png" },
      { name: "Natural Buffalo Milk Rich Fat Khoya (500g Pack)", unit: "Pack", price: 390, cost: 250, type: "Buffalo Rich", shelf: "15 Days", disc: 8, stock: 35, desc: "Ultra-rich white mawa with high natural butterfat for decadent shahi gravies and royal sweets.", img: "/images/natural_khoya_mawa.png" }
    ]
  },
  {
    category: "Cheese",
    image: "/images/natural_mozzarella_cheese.png",
    items: [
      { name: "Natural Mozzarella Cheese Block (200g Pack)", unit: "Pack", price: 150, cost: 95, type: "Mozzarella Block", shelf: "45 Days", disc: 10, stock: 80, desc: "Stretchable, high-melt fresh mozzarella block crafted from pure milk for home-baked pizzas and pasta.", img: "/images/natural_mozzarella_cheese.png" },
      { name: "Natural Mozzarella Cheese Block (500g Pack)", unit: "Pack", price: 350, cost: 220, type: "Mozzarella Block", shelf: "45 Days", disc: 12, stock: 65, desc: "500g mozzarella cheese block offering phenomenal stretch, golden browning, and mild milky flavor.", img: "/images/natural_mozzarella_cheese.png" },
      { name: "Natural Shredded Pizza Mozzarella (200g Pouch)", unit: "Pouch", price: 165, cost: 105, type: "Shredded Pizza", shelf: "40 Days", disc: 10, stock: 90, desc: "Ready-to-sprinkle shredded mozzarella for effortless pizza toppings, garlic bread, and baked casseroles.", img: "/images/natural_mozzarella_cheese.png" },
      { name: "Natural Shredded Pizza Mozzarella (500g Pouch)", unit: "Pouch", price: 380, cost: 240, type: "Shredded Pizza", shelf: "40 Days", disc: 12, stock: 70, desc: "500g value pouch of fine shredded mozzarella that melts into bubbly golden cheesy blankets.", img: "/images/natural_mozzarella_cheese.png" },
      { name: "Natural Pure Cheddar Cheese Block (200g Pack)", unit: "Pack", price: 175, cost: 110, type: "Cheddar Block", shelf: "60 Days", disc: 8, stock: 60, desc: "Aged natural cheddar cheese with sharp savory tang and smooth slicing texture for cheese platters.", img: "/images/natural_mozzarella_cheese.png" },
      { name: "Natural Pure Cheddar Cheese Block (500g Pack)", unit: "Pack", price: 410, cost: 260, type: "Cheddar Block", shelf: "60 Days", disc: 10, stock: 45, desc: "500g block of artisanal mature cheddar for gourmet burgers, mac & cheese, and fondue dips.", img: "/images/natural_mozzarella_cheese.png" },
      { name: "Natural Processed Cheese Slices (200g - 10 Slices)", unit: "Pack", price: 140, cost: 88, type: "Cheese Slices", shelf: "90 Days", disc: 10, stock: 85, desc: "Individually wrapped creamy cheese slices that melt like velvet inside grilled sandwiches and burgers.", img: "/images/natural_mozzarella_cheese.png" },
      { name: "Natural Processed Cheese Slices (400g - 20 Slices)", unit: "Pack", price: 265, cost: 165, type: "Cheese Slices", shelf: "90 Days", disc: 12, stock: 60, desc: "20-slice economy pack of wholesome dairy cheese slices beloved by school kids and sandwich lovers.", img: "/images/natural_mozzarella_cheese.png" },
      { name: "Natural Herb & Garlic Cheese Spread (200g Tub)", unit: "Tub", price: 130, cost: 82, type: "Cheese Spread", shelf: "60 Days", disc: 10, stock: 55, desc: "Smooth creamy spreadable cheese whipped with roasted garlic bits, oregano, and black pepper.", img: "/images/natural_mozzarella_cheese.png" },
      { name: "Natural Creamy Plain Cheese Cubes (200g Pack)", unit: "Pack", price: 145, cost: 92, type: "Snack Cubes", shelf: "60 Days", disc: 8, stock: 70, desc: "Bite-sized individual cheese cubes—the nutritious, protein-packed snack for active kids and lunchboxes.", img: "/images/natural_mozzarella_cheese.png" }
    ]
  },
  {
    category: "Flavored Milk",
    image: "/images/natural_buffalo_milk.png",
    items: [
      { name: "Natural Royal Badam Flavored Milk (200ml Glass Bottle)", unit: "Bottle", price: 50, cost: 28, type: "Royal Badam", shelf: "60 Days", disc: 5, stock: 95, desc: "Sterilized almond milk beverage infused with Kashmiri saffron strands and real crushed almond nuts.", img: "/images/natural_buffalo_milk.png" },
      { name: "Natural Dutch Chocolate Flavored Milk (200ml Bottle)", unit: "Bottle", price: 45, cost: 25, type: "Dutch Chocolate", shelf: "60 Days", disc: 5, stock: 100, desc: "Rich Dutch cocoa flavored pasteurized chilled milk treat beloved by children and chocolate enthusiasts.", img: "/images/natural_buffalo_milk.png" },
      { name: "Natural Cardamom Elaichi Flavored Milk (200ml Bottle)", unit: "Bottle", price: 45, cost: 25, type: "Cardamom Elaichi", shelf: "60 Days", disc: 5, stock: 85, desc: "Nourishing milk drink infused with aromatic freshly ground green cardamom pods and honey notes.", img: "/images/natural_buffalo_milk.png" },
      { name: "Natural Fresh Strawberry Flavored Milk (200ml Bottle)", unit: "Bottle", price: 45, cost: 25, type: "Strawberry", shelf: "60 Days", disc: 5, stock: 80, desc: "Luscious strawberry milk blended with real fruit pulp—refreshing, smooth, and delightfully pink.", img: "/images/natural_buffalo_milk.png" },
      { name: "Natural Kesar Pista Flavored Milk (200ml Bottle)", unit: "Bottle", price: 55, cost: 30, type: "Kesar Pista", shelf: "60 Days", disc: 8, stock: 90, desc: "Rich golden saffron and roasted pistachio milk beverage packed with calcium, vitamins, and energy.", img: "/images/natural_buffalo_milk.png" },
      { name: "Natural Sweet Rose Flavored Milk (200ml Bottle)", unit: "Bottle", price: 42, cost: 23, type: "Sweet Rose", shelf: "60 Days", disc: 5, stock: 75, desc: "Delicate floral milk beverage perfumed with pure Damascus rose water and natural cane sugar.", img: "/images/natural_buffalo_milk.png" },
      { name: "Natural Royal Badam Flavored Milk (1 Litre Family Pack)", unit: "Pack", price: 220, cost: 130, type: "Royal Badam", shelf: "60 Days", disc: 12, stock: 50, desc: "1-Litre family bottle of nourishing almond milk beverage with real almond nibs for breakfasts.", img: "/images/natural_buffalo_milk.png" },
      { name: "Natural Dutch Chocolate Flavored Milk (1 Litre Family Pack)", unit: "Pack", price: 199, cost: 118, type: "Dutch Chocolate", shelf: "60 Days", disc: 12, stock: 55, desc: "Family-size 1-Litre chocolate milk—nutrient-packed refreshment ready to serve chilled anytime.", img: "/images/natural_buffalo_milk.png" },
      { name: "Natural French Vanilla Flavored Milk (200ml Bottle)", unit: "Bottle", price: 45, cost: 25, type: "French Vanilla", shelf: "60 Days", disc: 5, stock: 70, desc: "Smooth dairy beverage infused with natural Madagascar vanilla bean extract for subtle creamy comfort.", img: "/images/natural_buffalo_milk.png" },
      { name: "Natural Cold Coffee Latte Flavored Milk (200ml Bottle)", unit: "Bottle", price: 50, cost: 28, type: "Cold Coffee", shelf: "60 Days", disc: 5, stock: 85, desc: "Energizing blend of farm milk and slow-brewed Arabica coffee beans for instant morning revitalization.", img: "/images/natural_buffalo_milk.png" }
    ]
  },
  {
    category: "Dairy Sweets",
    image: "/images/natural_gulab_jamun.png",
    items: [
      { name: "Natural Pure Desi Ghee Gulab Jamun (500g Box)", unit: "Box", price: 195, cost: 120, type: "Pure Desi Ghee", shelf: "15 Days", disc: 10, stock: 75, desc: "Melt-in-mouth mawa dumplings slow fried in pure desi ghee and soaked in cardamom saffron sugar syrup.", img: "/images/natural_gulab_jamun.png" },
      { name: "Natural Pure Desi Ghee Gulab Jamun (1kg Festive Tin)", unit: "Tin", price: 370, cost: 230, type: "Pure Desi Ghee", shelf: "20 Days", disc: 12, stock: 50, desc: "Generous 1kg tin of golden soft gulab jamuns prepared with pure dairy khoya and fragrant rose syrup.", img: "/images/natural_gulab_jamun.png" },
      { name: "Natural Classic Bengali Spongy Rasgulla (500g Box)", unit: "Box", price: 180, cost: 110, type: "Spongy Chenna", shelf: "12 Days", disc: 10, stock: 80, desc: "Authentic spongy cottage cheese chenna balls simmered gently in light clear cardamom flavored syrup.", img: "/images/natural_bengali_rasgulla.png" },
      { name: "Natural Classic Bengali Spongy Rasgulla (1kg Tin)", unit: "Tin", price: 340, cost: 210, type: "Spongy Chenna", shelf: "15 Days", disc: 12, stock: 60, desc: "1kg sealed tin of pristine white spongy rasgullas with melt-in-mouth juicy sweetness.", img: "/images/natural_bengali_rasgulla.png" },
      { name: "Natural Authentic Mathura Kesar Peda (250g Box)", unit: "Box", price: 150, cost: 90, type: "Mathura Peda", shelf: "20 Days", disc: 8, stock: 70, desc: "Traditional caramelized mawa peda infused with pure saffron strands, cardamom, and roasted ghee.", img: "/images/natural_kesar_peda.png" },
      { name: "Natural Authentic Mathura Kesar Peda (500g Box)", unit: "Box", price: 290, cost: 175, type: "Mathura Peda", shelf: "20 Days", disc: 10, stock: 55, desc: "500g festive box of Mathura pedas made by caramelizing pure farm milk slowly over cast iron pans.", img: "/images/natural_kesar_peda.png" },
      { name: "Natural Creamy Malai Rabri (250g Cup)", unit: "Cup", price: 135, cost: 82, type: "Malai Rabri", shelf: "10 Days", disc: 10, stock: 60, desc: "Rich thickened sweetened milk layered with clotted malai folds, roasted pistachios, and saffron.", img: "/images/natural_kesar_basundi.png" },
      { name: "Natural Creamy Malai Rabri (500g Tub)", unit: "Tub", price: 260, cost: 160, type: "Malai Rabri", shelf: "10 Days", disc: 12, stock: 45, desc: "500g tub of thick artisanal laccha rabri—the quintessential topping for hot jalebis and gulab jamuns.", img: "/images/natural_kesar_basundi.png" },
      { name: "Natural Traditional Milk Cake Kalakand (250g Box)", unit: "Box", price: 160, cost: 98, type: "Milk Cake", shelf: "15 Days", disc: 8, stock: 65, desc: "Dual-toned caramelized granular milk cake with rich fudgy texture made from pure reduced cow milk.", img: "/images/natural_khoya_mawa.png" },
      { name: "Natural Traditional Milk Cake Kalakand (500g Box)", unit: "Box", price: 310, cost: 190, type: "Milk Cake", shelf: "15 Days", disc: 10, stock: 45, desc: "500g gift pack of authentic Alwar milk cake infused with pure desi ghee and crunchy dry fruits.", img: "/images/natural_khoya_mawa.png" }
    ]
  },
  {
    category: "Milk Powder",
    image: "/images/natural_milk_powder.png",
    items: [
      { name: "Natural Instant Whole Milk Powder (200g Pouch)", unit: "Pouch", price: 115, cost: 72, type: "Whole Milk", shelf: "365 Days", disc: 5, stock: 85, desc: "Spray-dried instant whole milk powder retaining all natural nutrients, vitamins, and creamy taste.", img: "/images/natural_milk_powder.png" },
      { name: "Natural Instant Whole Milk Powder (500g Pouch)", unit: "Pouch", price: 260, cost: 165, type: "Whole Milk", shelf: "365 Days", disc: 10, stock: 70, desc: "500g pantry pack of whole milk powder—dissolves instantly in warm water for coffee, tea, and cooking.", img: "/images/natural_milk_powder.png" },
      { name: "Natural Instant Whole Milk Powder (1kg Bag)", unit: "Bag", price: 499, cost: 315, type: "Whole Milk", shelf: "365 Days", disc: 12, stock: 55, desc: "1kg value pack of full cream milk powder for bakeries, dessert makers, and emergency travel needs.", img: "/images/natural_milk_powder.png" },
      { name: "Natural Instant Whole Milk Powder (5kg Catering Bucket)", unit: "Bucket", price: 2350, cost: 1480, type: "Whole Milk", shelf: "365 Days", disc: 15, stock: 25, desc: "Commercial airtight bucket of premium spray-dried whole milk powder for hotels and catering.", img: "/images/natural_milk_powder.png" },
      { name: "Natural Skimmed Milk Powder Low Fat (250g Pouch)", unit: "Pouch", price: 130, cost: 82, type: "Skimmed Diet", shelf: "365 Days", disc: 8, stock: 65, desc: "Low-fat, high-protein skimmed milk powder (less than 1% fat) ideal for fitness smoothies and baking.", img: "/images/natural_milk_powder.png" },
      { name: "Natural Skimmed Milk Powder Low Fat (500g Pouch)", unit: "Pouch", price: 245, cost: 155, type: "Skimmed Diet", shelf: "365 Days", disc: 10, stock: 50, desc: "500g pouch of protein-rich skimmed milk powder with zero added sugar and high soluble calcium.", img: "/images/natural_milk_powder.png" },
      { name: "Natural Skimmed Milk Powder Low Fat (1kg Bag)", unit: "Bag", price: 470, cost: 295, type: "Skimmed Diet", shelf: "365 Days", disc: 12, stock: 40, desc: "1kg bag of diet skimmed milk powder that blends smoothly into oatmeals, shakes, and protein breads.", img: "/images/natural_milk_powder.png" },
      { name: "Natural Premium Dairy Whitener for Tea & Coffee (200g)", unit: "Pouch", price: 105, cost: 65, type: "Dairy Whitener", shelf: "365 Days", disc: 5, stock: 90, desc: "Special formulation dairy whitener engineered to give instant creamy thickness to tea and coffee.", img: "/images/natural_milk_powder.png" },
      { name: "Natural Premium Dairy Whitener for Tea & Coffee (500g)", unit: "Pouch", price: 235, cost: 145, type: "Dairy Whitener", shelf: "365 Days", disc: 8, stock: 75, desc: "500g dairy whitener pouch with quick dissolvability and zero residue—perfect for offices and travel.", img: "/images/natural_milk_powder.png" },
      { name: "Natural Premium Dairy Whitener for Tea & Coffee (1kg)", unit: "Bag", price: 445, cost: 280, type: "Dairy Whitener", shelf: "365 Days", disc: 10, stock: 60, desc: "Economical 1kg pack of dairy tea and coffee whitener delivering rich comforting beverages every cup.", img: "/images/natural_milk_powder.png" }
    ]
  },
  {
    category: "Cream",
    image: "/images/natural_dairy_cream.png",
    items: [
      { name: "Natural Fresh Heavy Cream 40% (250ml Pack)", unit: "Pack", price: 75, cost: 46, type: "Heavy Cream 40%", shelf: "15 Days", disc: 5, stock: 75, desc: "Rich farm dairy cream with 40% butterfat content for creamy restaurant-style gravies and soups.", img: "/images/natural_dairy_cream.png" },
      { name: "Natural Fresh Heavy Cream 40% (500ml Pack)", unit: "Pack", price: 145, cost: 90, type: "Heavy Cream 40%", shelf: "15 Days", disc: 8, stock: 60, desc: "500ml carton of pure heavy cream—adds luxurious richness to butter chicken, pasta, and ganache.", img: "/images/natural_dairy_cream.png" },
      { name: "Natural Fresh Heavy Cream 40% (1 Litre Bottle)", unit: "Bottle", price: 275, cost: 172, type: "Heavy Cream 40%", shelf: "15 Days", disc: 10, stock: 45, desc: "1-Litre commercial pack of premium pasteurized heavy cream for culinary professionals and gourmets.", img: "/images/natural_dairy_cream.png" },
      { name: "Natural Whipping Cream for Cakes (500ml Pack)", unit: "Pack", price: 185, cost: 115, type: "Whipping Cream", shelf: "30 Days", disc: 10, stock: 65, desc: "High-stability dairy whipping cream that whips to stiff peaks with gorgeous glossy texture for pastries.", img: "/images/natural_dairy_cream.png" },
      { name: "Natural Whipping Cream for Cakes (1 Litre Pack)", unit: "Pack", price: 350, cost: 220, type: "Whipping Cream", shelf: "30 Days", disc: 12, stock: 50, desc: "1-Litre baker pack of whipping cream with excellent hold and velvety mouthfeel for birthday cakes.", img: "/images/natural_dairy_cream.png" },
      { name: "Natural Low Fat Cooking Cream 20% (250ml Pack)", unit: "Pack", price: 68, cost: 42, type: "Cooking Cream 20%", shelf: "20 Days", disc: 5, stock: 70, desc: "Light cooking cream with 20% fat—smooth and heat-stable without curdling in acidic tomato gravies.", img: "/images/natural_dairy_cream.png" },
      { name: "Natural Low Fat Cooking Cream 20% (500ml Pack)", unit: "Pack", price: 130, cost: 80, type: "Cooking Cream 20%", shelf: "20 Days", disc: 8, stock: 55, desc: "Healthy 500ml light cream for guilt-free creamy soups, dal makhani, and white pasta sauces.", img: "/images/natural_dairy_cream.png" },
      { name: "Natural Traditional Clotted Malai Cream (200g Tub)", unit: "Tub", price: 95, cost: 58, type: "Clotted Malai", shelf: "8 Days", disc: 10, stock: 50, desc: "Hand-skimmed thick malai layers collected from slow-boiled whole milk—the authentic Indian kitchen luxury.", img: "/images/natural_dairy_cream.png" },
      { name: "Natural Traditional Clotted Malai Cream (400g Tub)", unit: "Tub", price: 180, cost: 110, type: "Clotted Malai", shelf: "8 Days", disc: 12, stock: 40, desc: "400g tub of rich clotted malai cream for spreading over warm rotis with jaggery or making homemade ghee.", img: "/images/natural_dairy_cream.png" },
      { name: "Natural Cultured Fresh Sour Cream (200g Tub)", unit: "Tub", price: 85, cost: 52, type: "Cultured Sour Cream", shelf: "18 Days", disc: 8, stock: 45, desc: "Tangy cultured sour cream made with lactic ferments—the ultimate companion for tacos, baked potatoes, and dips.", img: "/images/natural_dairy_cream.png" }
    ]
  },
  {
    category: "Badham",
    image: "/images/natural_cow_milk.png",
    items: [
      { name: "Natural Crushed Badam Almond Milk (200ml Glass Bottle)", unit: "Bottle", price: 50, cost: 28, type: "Crushed Badam", shelf: "45 Days", disc: 5, stock: 90, desc: "Nourishing badam milk enriched with real crushed Mamra almonds, saffron strands, and green cardamom.", img: "/images/natural_cow_milk.png" },
      { name: "Natural Crushed Badam Almond Milk (500ml Glass Bottle)", unit: "Bottle", price: 115, cost: 65, type: "Crushed Badam", shelf: "45 Days", disc: 10, stock: 70, desc: "500ml family bottle of thick nutritious almond drink with generous bite-sized almond chunks.", img: "/images/natural_cow_milk.png" },
      { name: "Natural Crushed Badam Almond Milk (1 Litre Family Pack)", unit: "Pack", price: 220, cost: 125, type: "Crushed Badam", shelf: "45 Days", disc: 12, stock: 50, desc: "1-Litre carton of energy-rich almond drink packed with plant and dairy protein for sports and growth.", img: "/images/natural_cow_milk.png" },
      { name: "Natural Royal Saffron Kesar Badam Drink (200ml Bottle)", unit: "Bottle", price: 58, cost: 32, type: "Saffron Kesar Badam", shelf: "45 Days", disc: 8, stock: 85, desc: "Royal blend of pure Kashmiri saffron and California almonds steeped in farm milk—served cold or warm.", img: "/images/natural_cow_milk.png" },
      { name: "Natural Royal Saffron Kesar Badam Drink (500ml Bottle)", unit: "Bottle", price: 135, cost: 76, type: "Saffron Kesar Badam", shelf: "45 Days", disc: 10, stock: 60, desc: "Golden saffron almond milk in a 500ml glass bottle for festive occasions, breakfast, and vitality.", img: "/images/natural_cow_milk.png" },
      { name: "Natural Wild Honey Sweetened Badam Milk (200ml Bottle)", unit: "Bottle", price: 55, cost: 30, type: "Wild Honey Badam", shelf: "45 Days", disc: 8, stock: 65, desc: "Naturally sweetened with raw wild forest honey instead of refined sugar, loaded with crushed almonds.", img: "/images/natural_cow_milk.png" },
      { name: "Natural Sugar-Free Roasted Badam Milk (200ml Bottle)", unit: "Bottle", price: 52, cost: 29, type: "Sugar-Free Badam", shelf: "45 Days", disc: 8, stock: 60, desc: "Low-glycemic almond beverage with roasted nuts and pure stevia for diabetic and keto consumers.", img: "/images/natural_cow_milk.png" },
      { name: "Natural Instant Badam Drink Mix Powder (200g Jar)", unit: "Jar", price: 145, cost: 82, type: "Instant Badam Mix", shelf: "180 Days", disc: 10, stock: 75, desc: "Ready-to-mix almond drink powder containing ground almonds, saffron, nutmeg, and cardamom.", img: "/images/natural_milk_powder.png" },
      { name: "Natural Instant Badam Drink Mix Powder (500g Jar)", unit: "Jar", price: 340, cost: 195, type: "Instant Badam Mix", shelf: "180 Days", disc: 12, stock: 55, desc: "Economical 500g jar of premium badam milk mix for making instant fragrant hot or cold almond milk.", img: "/images/natural_milk_powder.png" },
      { name: "Natural Double Nut Badam Pista Royal Drink (200ml)", unit: "Bottle", price: 60, cost: 34, type: "Badam Pista Royale", shelf: "45 Days", disc: 10, stock: 80, desc: "Opulent beverage featuring both crushed California almonds and Iranian pistachios in rich boiled milk.", img: "/images/natural_cow_milk.png" }
    ]
  }
];

let counter = 1;
const products = [];

categoriesConfig.forEach((catGroup) => {
  catGroup.items.forEach((item, index) => {
    const hexId = "6aad10510f632ce0" + counter.toString(16).padStart(8, "0");
    counter++;

    products.push({
      _id: hexId,
      name: item.name,
      category: catGroup.category,
      description: item.desc,
      image: [item.img],
      minQuantity: 1,
      quantityUnit: item.unit,
      stock: item.stock,
      manufacturingCost: item.cost,
      thresholdVal: 10,
      price: item.price,
      type: item.type,
      likes: [],
      shelfLife: item.shelf,
      discount: item.disc,
      pngImage: item.img,
      nutritionMetrics: [
        { name: "Protein", value: "8.5g" },
        { name: "Calcium", value: "150mg" },
        { name: "Fat", value: "6.0g" }
      ],
      rating: [4.8, 4.9, 5.0][index % 3],
      __v: 0,
      createdAt: "2026-09-18T10:20:01.877Z",
      updatedAt: "2026-09-24T11:30:45.677Z",
      totalQuantitySold: 120 + index * 15
    });
  });
});

console.log(`Generated ${products.length} products across ${categoriesConfig.length} categories.`);

// Output file 1: Client/src/data/fallbackProducts.js
const clientFallbackPath = path.resolve(__dirname, "fallbackProducts.js");
const clientContent = `export const fallbackProducts = ${JSON.stringify(products, null, 2)};\n`;
fs.writeFileSync(clientFallbackPath, clientContent, "utf-8");
console.log("Wrote", clientFallbackPath);

// Output file 2: server/config/initialProducts.js
const serverInitialPath = path.resolve(__dirname, "../../../server/config/initialProducts.js");
const serverContent = `export const initialProducts = ${JSON.stringify(products, null, 2)};\n`;
fs.writeFileSync(serverInitialPath, serverContent, "utf-8");
console.log("Wrote", serverInitialPath);
