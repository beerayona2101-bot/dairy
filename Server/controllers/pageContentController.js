import PageContent from "../models/PageContentSchema.js";

const defaultInitialContent = {
  companyName: "Madhur Dairy And Daily Needs",
  companyTagline: "Farm-Fresh, Pure & Nutritious Dairy Delivered Daily to Your Doorstep",
  companyDescription:
    "Madhur Dairy brings you 100% unadulterated milk, ghee, paneer, and sweets directly from our trusted farms. High quality, hygienic packaging, and daily morning delivery.",
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
      image: "https://res.cloudinary.com/dyahibuzy/image/upload/v1750157383/freshness_gmygrg.jpg",
      title: "Crafted with Ultimate Freshness",
      description: "Freshly prepared and packed to deliver rich taste and real nutrition.",
    },
    {
      image: "https://res.cloudinary.com/dyahibuzy/image/upload/v1750157396/naturally_w4cqwy.jpg",
      title: "Responsibly Sourced from Nature",
      description: "Sourced from trusted farms to ensure purity and natural goodness.",
    },
    {
      image: "https://res.cloudinary.com/dyahibuzy/image/upload/v1750157430/pureIngredients_v9uxem.png",
      title: "Made with 100% Pure Ingredients",
      description: "We use only pure, high-quality ingredients for unmatched flavor and quality.",
    },
  ],
  faqs: [
    {
      question: "Why is Madhur Dairy and Daily Needs best for me?",
      answer: "Madhur Dairy and Daily Needs provides 100% pure, unadulterated dairy products with no preservatives, artificial colors, or harmful additives.",
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
};

export const getPageContent = async (req, res) => {
  try {
    let content = await PageContent.findOne();
    if (!content) {
      content = await PageContent.create(defaultInitialContent);
    } else {
      // Ensure missing arrays get default fields
      let needsSave = false;
      if (!content.homeCategoryCards) {
        content.homeCategoryCards = defaultInitialContent.homeCategoryCards;
        needsSave = true;
      }
      if (!content.landingShowcaseCards) {
        content.landingShowcaseCards = defaultInitialContent.landingShowcaseCards;
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

import { uploadToCloudinary } from "../config/cloudinary.js";

export const updatePageContent = async (req, res) => {
  try {
    const { _id, __v, createdAt, updatedAt, ...cleanUpdateData } = req.body;

    if (cleanUpdateData.heroBannerImage) {
      cleanUpdateData.heroBannerImage = await uploadToCloudinary(cleanUpdateData.heroBannerImage, "evan_homepage_cms");
    }
    if (cleanUpdateData.landingHeroImage) {
      cleanUpdateData.landingHeroImage = await uploadToCloudinary(cleanUpdateData.landingHeroImage, "evan_homepage_cms");
    }

    if (Array.isArray(cleanUpdateData.homeCategoryCards)) {
      cleanUpdateData.homeCategoryCards = await Promise.all(
        cleanUpdateData.homeCategoryCards.map(async (item) => ({
          title: item.title || "",
          image: await uploadToCloudinary(item.image || "", "evan_categories"),
        }))
      );
    }

    if (Array.isArray(cleanUpdateData.landingShowcaseCards)) {
      cleanUpdateData.landingShowcaseCards = await Promise.all(
        cleanUpdateData.landingShowcaseCards.map(async (item) => ({
          title: item.title || "",
          description: item.description || "",
          image: await uploadToCloudinary(item.image || "", "evan_homepage_cms"),
          features: Array.isArray(item.features) ? item.features : [],
        }))
      );
    }

    if (Array.isArray(cleanUpdateData.goodnessOfferings)) {
      cleanUpdateData.goodnessOfferings = await Promise.all(
        cleanUpdateData.goodnessOfferings.map(async (item) => ({
          title: item.title || "",
          description: item.description || "",
          image: await uploadToCloudinary(item.image || "", "evan_homepage_cms"),
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
      message: "Landing & Home Page content updated successfully!",
      pageContent: content,
    });
  } catch (error) {
    console.error("Error updating page content:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
