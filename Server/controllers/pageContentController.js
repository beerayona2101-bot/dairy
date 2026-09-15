import PageContent from "../models/PageContentSchema.js";
import { uploadToCloudinary } from "../config/cloudinary.js";

const defaultInitialContent = {
  companyName: "MADHU Dairy And Daily Needs",
  companyTagline: "Farm-Fresh, Pure & Nutritious Dairy Delivered Daily to Your Doorstep",
  companyDescription:
    "MADHU Dairy brings you 100% unadulterated milk, ghee, paneer, and sweets directly from our trusted farms. High quality, hygienic packaging, and daily morning delivery.",
  heroBannerImage: "/assets/home_welcome_hero_bg.png",
  landingHeroImage: "/assets/landing_hero_bg_hd.png",
  homeCategoryCards: [
    {
      title: "Milk",
      image: "https://res.cloudinary.com/dyahibuzy/image/upload/v1750157394/milk_cycuqe.jpg",
    },
    {
      title: "Paneer",
      image: "https://res.cloudinary.com/dyahibuzy/image/upload/v1750157396/paneer_lnj9jf.jpg",
    },
    {
      title: "Ghee",
      image: "https://res.cloudinary.com/dyahibuzy/image/upload/v1750157372/ghee_yuhqxs.jpg",
    },
    {
      title: "Curd",
      image: "https://res.cloudinary.com/dyahibuzy/image/upload/v1750157359/curd_hmrvio.jpg",
    },
    {
      title: "Butter",
      image: "https://res.cloudinary.com/dyahibuzy/image/upload/v1750157358/butter_qhvv0q.jpg",
    },
    {
      title: "Cheese",
      image: "https://res.cloudinary.com/dyahibuzy/image/upload/v1750157359/cream_qal4ea.jpg",
    },
  ],
  landingShowcaseCards: [
    {
      title: "Milk",
      description: "Pure, unadulterated milk from grass-fed cows—rich in calcium and essential nutrients for stronger bones.",
      image: "https://res.cloudinary.com/dyahibuzy/image/upload/v1750157394/milk_cycuqe.jpg",
      features: ["Pasteurized for safety", "Rich in calcium and vitamins", "No artificial hormones", "Daily fresh delivery"],
    },
    {
      title: "Paneer",
      description: "Fresh homemade paneer made with traditional methods—packed with protein, perfect for muscle growth and vegetarian diets.",
      image: "https://res.cloudinary.com/dyahibuzy/image/upload/v1750157396/paneer_lnj9jf.jpg",
      features: ["High protein content", "Soft and fresh texture", "Ideal for cooking and grilling", "No preservatives"],
    },
    {
      title: "Ghee",
      description: "Pure clarified butter with aromatic flavor, used in cooking and traditional remedies.",
      image: "https://res.cloudinary.com/dyahibuzy/image/upload/v1750157372/ghee_yuhqxs.jpg",
      features: ["Slow-cooked for purity", "High smoke point for cooking", "Rich in antioxidants", "Lactose-free"],
    },
    {
      title: "Curd",
      description: "Thick, creamy curd loaded with probiotics—great for gut health and perfect for daily consumption.",
      image: "https://res.cloudinary.com/dyahibuzy/image/upload/v1750157359/curd_hmrvio.jpg",
      features: ["Contains live probiotics", "Improves gut health", "Rich in calcium", "Great for summer diets"],
    },
    {
      title: "Butter",
      description: "Traditional buttermilk with a cooling effect—natural digestive drink, ideal for hot days and healthy living.",
      image: "https://res.cloudinary.com/dyahibuzy/image/upload/v1750157358/butter_qhvv0q.jpg",
      features: ["Helps in digestion", "Low in fat, high in taste", "Refreshing summer drink", "Made from real curd"],
    },
    {
      title: "Cheese",
      description: "Artisanal cheese varieties crafted from pure milk, perfect for cooking, snacking, and gourmet recipes.",
      image: "https://res.cloudinary.com/dyahibuzy/image/upload/v1750157359/cream_qal4ea.jpg",
      features: ["Aged to perfection", "Rich in calcium and protein", "Available in multiple varieties", "No artificial preservatives"],
    },
  ],
  goodnessOfferings: [
    {
      image: "/assets/freshProducts.jpg",
      title: "Fresh & Natural Products",
      description: "We deliver milk and dairy products directly from local farms to your doorstep — fresh, pure, and free from harmful preservatives.",
    },
    {
      image: "/assets/freshMilk.jpg",
      title: "Ethically Sourced Milk",
      description: "Our dairy farmers follow ethical practices in caring for the cows, ensuring they are healthy and well-fed, which results in high-quality milk.",
    },
    {
      image: "/assets/hygienicProcessing.jpg",
      title: "Hygienic Processing",
      description: "All our products go through strict hygiene and quality control checks to ensure you receive clean and safe dairy every time.",
    },
    {
      image: "/assets/productImage.jpg",
      title: "Wide Range of Products",
      description: "From fresh milk, curd, paneer, ghee to flavored products — we have something for every dairy lover.",
    },
    {
      image: "/assets/lowPrice.jpg",
      title: "Affordable Prices",
      description: "Top-quality dairy products at prices that won't hurt your pocket.",
    },
    {
      image: "/assets/deliveryTruck.jpg",
      title: "Farm-to-Home Delivery",
      description: "We eliminate middlemen to ensure our customers get fresh products at the right price, delivered within hours of milking.",
    },
  ],
  faqs: [
    {
      question: "Why is MADHU Dairy and Daily Needs best for me?",
      answer: "MADHU Dairy and Daily Needs provides 100% pure, unadulterated dairy products with no preservatives, artificial colors, or harmful additives.",
    },
    {
      question: "How do you ensure quality?",
      answer: "We maintain strict quality control at every step from farm to table. Our milk is tested at multiple stages and processed in hygienic conditions.",
    },
    {
      question: "Are your products organic?",
      answer: "Yes, all our dairy products are made from milk obtained from cows that are raised without artificial hormones or antibiotics.",
    },
    {
      question: "What makes your milk different from others?",
      answer: "Our milk comes from indigenous cow breeds that produce A2 milk which is easier to digest and healthier.",
    },
    {
      question: "How often do you deliver?",
      answer: "We deliver fresh products daily in most urban areas. For rural areas, deliveries are made 3-4 times a week.",
    },
  ],
  aboutUs: {
    badgeText: "✨ 100% PURE & FARM-FRESH DAIRY",
    title: "About Madhu Dairy & Daily Needs",
    subtitle: "Delivering unadulterated farm-fresh milk, pure ghee, paneer, and daily kitchen essentials straight to thousands of happy families every morning by 7 AM.",
    journeyTitle: "WHO WE ARE",
    journeySubtitle: "Our Journey & Mission",
    stats: [
      { value: "100%", label: "Pure & Fresh Milk", icon: "🥛", color: "#477A50" },
      { value: "7 AM", label: "Doorstep Delivery", icon: "🚚", color: "#00ACC1" },
      { value: "100+", label: "Quality Tests", icon: "🔬", color: "#6C5CE7" },
      { value: "50,000+", label: "Happy Families", icon: "❤️", color: "#FF7675" },
    ],
  },
  contactUs: {
    badgeText: "GET IN TOUCH",
    title: "Contact Information",
    supportText: "We are here to assist you. Please fill out the form to get in touch or ask your query directly.",
    address: "Shed no. A-31, Madhu Dairy & Daily Needs, NAVNATH NAGAR, MIDC Ambad, Nashik, Maharashtra - 422010",
    phone: "+91 94906 44434",
    email: "beerayona143@gmail.com",
    whatsappNumber: "919490644434",
    googleMaps: "https://maps.google.com/?q=Madhu+Dairy+Ambad+Nashik",
  },
};

export const getPageContent = async (req, res) => {
  try {
    let content = await PageContent.findOne();
    if (!content) {
      content = await PageContent.create(defaultInitialContent);
    } else {
      let needsSave = false;
      if (!content.homeCategoryCards) {
        content.homeCategoryCards = defaultInitialContent.homeCategoryCards;
        needsSave = true;
      }
      if (!content.landingShowcaseCards) {
        content.landingShowcaseCards = defaultInitialContent.landingShowcaseCards;
        needsSave = true;
      }
      if (!content.aboutUs) {
        content.aboutUs = defaultInitialContent.aboutUs;
        needsSave = true;
      }
      if (!content.contactUs) {
        content.contactUs = defaultInitialContent.contactUs;
        needsSave = true;
      }
      if (needsSave) {
        await content.save();
      }
    }
    return res.status(200).json({ success: true, pageContent: content });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePageContent = async (req, res) => {
  try {
    const { _id, __v, createdAt, updatedAt, ...cleanUpdateData } = req.body;

    if (cleanUpdateData.heroBannerImage) {
      cleanUpdateData.heroBannerImage = await uploadToCloudinary(cleanUpdateData.heroBannerImage, "dairy_app");
    }
    if (cleanUpdateData.landingHeroImage) {
      cleanUpdateData.landingHeroImage = await uploadToCloudinary(cleanUpdateData.landingHeroImage, "dairy_app");
    }

    if (Array.isArray(cleanUpdateData.homeCategoryCards)) {
      cleanUpdateData.homeCategoryCards = await Promise.all(
        cleanUpdateData.homeCategoryCards.map(async (item) => ({
          title: item.title || "",
          image: await uploadToCloudinary(item.image || "", "dairy_app"),
        }))
      );
    }

    if (Array.isArray(cleanUpdateData.landingShowcaseCards)) {
      cleanUpdateData.landingShowcaseCards = await Promise.all(
        cleanUpdateData.landingShowcaseCards.map(async (item) => ({
          title: item.title || "",
          description: item.description || "",
          image: await uploadToCloudinary(item.image || "", "dairy_app"),
          features: Array.isArray(item.features) ? item.features : [],
        }))
      );
    }

    if (Array.isArray(cleanUpdateData.goodnessOfferings)) {
      cleanUpdateData.goodnessOfferings = await Promise.all(
        cleanUpdateData.goodnessOfferings.map(async (item) => ({
          title: item.title || "",
          description: item.description || "",
          image: await uploadToCloudinary(item.image || "", "dairy_app"),
        }))
      );
    }

    if (Array.isArray(cleanUpdateData.faqs)) {
      cleanUpdateData.faqs = cleanUpdateData.faqs.map((item) => ({
        question: item.question || "",
        answer: item.answer || "",
      }));
    }

    let content = await PageContent.findOne();

    if (!content) {
      content = await PageContent.create({ ...defaultInitialContent, ...cleanUpdateData });
    } else {
      content = await PageContent.findByIdAndUpdate(content._id, { $set: cleanUpdateData }, { new: true });
    }

    return res.status(200).json({
      success: true,
      message: "Page content updated successfully!",
      pageContent: content,
    });
  } catch (error) {
    console.error("Error updating page content:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
