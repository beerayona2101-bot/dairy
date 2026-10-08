import PageContent from "../models/PageContentSchema.js";
import { uploadToCloudinary } from "../config/cloudinary.js";

const defaultInitialContent = {
  companyName: "Natural Milk Dairy",
  companyTagline: "Farm-Fresh, Pure & Nutritious Dairy Delivered Daily to Your Doorstep",
  companyDescription:
    "Natural Milk Dairy brings you 100% unadulterated milk, ghee, paneer, and sweets directly from our trusted farms. High quality, hygienic packaging, and daily morning delivery.",
  heroBannerImage: "/assets/hero_carousel_slide_1.png",
  heroCarouselSlides: [
    {
      image: "/assets/hero_carousel_slide_1.png",
      title: "Welcome to Natural Milk Dairy",
      subtitle: "Experience 100% unadulterated farm-fresh milk, ghee, paneer, and sweets sourced directly from ethical farms.",
      buttonText: "Explore Products",
      buttonLink: "/products",
    },
    {
      image: "/assets/hero_carousel_slide_2.png",
      title: "100% Pure, Organic & Farm-Fresh A2 Milk",
      subtitle: "Delivered fresh to your doorstep every morning with zero preservatives and pristine hygiene.",
      buttonText: "Order Fresh Milk",
      buttonLink: "/products",
    },
    {
      image: "/assets/hero_carousel_slide_3.png",
      title: "Traditional Ghee, Artisanal Paneer & Delicacies",
      subtitle: "Crafted with pure whole milk and traditional recipes for authentic nutrition, rich aroma and taste.",
      buttonText: "Shop Dairy Products",
      buttonLink: "/products",
    },
  ],
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
      question: "Why is Natural Milk Dairy and Daily Needs best for me?",
      answer: "Natural Milk Dairy and Daily Needs provides 100% pure, unadulterated dairy products with no preservatives, artificial colors, or harmful additives.",
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
    let content = await PageContent.findOne().lean();
    if (!content) {
      content = await PageContent.create(defaultInitialContent);
    } else if (!content.heroCarouselSlides || content.heroCarouselSlides.length === 0) {
      content.heroCarouselSlides = defaultInitialContent.heroCarouselSlides;
      await PageContent.updateOne({ _id: content._id }, { $set: { heroCarouselSlides: defaultInitialContent.heroCarouselSlides } });
    }
    // Remove aggressive caching so saved changes are immediately visible
    res.set("Cache-Control", "no-cache, no-store, must-revalidate");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");
    return res.status(200).json({ success: true, pageContent: content });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePageContent = async (req, res) => {
  try {
    const { _id, __v, createdAt, updatedAt, ...cleanUpdateData } = req.body;

    // Helper: only upload if it's a base64 data URL, otherwise keep existing URL as-is
    const smartUpload = async (imageData, folder = "dairy_app") => {
      if (!imageData || typeof imageData !== "string") return imageData;
      // Already a hosted URL or local path — no upload needed
      if (
        imageData.startsWith("http://") ||
        imageData.startsWith("https://") ||
        imageData.startsWith("/uploads/") ||
        imageData.startsWith("/assets/")
      ) {
        return imageData;
      }
      // Base64 — upload to Cloudinary / disk
      if (imageData.startsWith("data:image")) {
        try {
          const uploaded = await uploadToCloudinary(imageData, folder);
          return uploaded || imageData;
        } catch (err) {
          console.error("Image upload failed, keeping raw data:", err.message);
          return imageData;
        }
      }
      return imageData;
    };

    if (cleanUpdateData.heroBannerImage) {
      cleanUpdateData.heroBannerImage = await smartUpload(cleanUpdateData.heroBannerImage, "dairy_app");
    }
    if (Array.isArray(cleanUpdateData.heroCarouselSlides)) {
      cleanUpdateData.heroCarouselSlides = await Promise.all(
        cleanUpdateData.heroCarouselSlides.map(async (slide) => ({
          image: await smartUpload(slide.image || "", "dairy_app"),
          title: slide.title || "",
          subtitle: slide.subtitle || "",
          buttonText: slide.buttonText || "Explore Products",
          buttonLink: slide.buttonLink || "/products",
        }))
      );
    }
    if (cleanUpdateData.landingHeroImage) {
      cleanUpdateData.landingHeroImage = await smartUpload(cleanUpdateData.landingHeroImage, "dairy_app");
    }

    if (Array.isArray(cleanUpdateData.homeCategoryCards)) {
      cleanUpdateData.homeCategoryCards = await Promise.all(
        cleanUpdateData.homeCategoryCards.map(async (item) => ({
          title: item.title || "",
          image: await smartUpload(item.image || "", "dairy_app"),
        }))
      );
    }

    if (Array.isArray(cleanUpdateData.landingShowcaseCards)) {
      cleanUpdateData.landingShowcaseCards = await Promise.all(
        cleanUpdateData.landingShowcaseCards.map(async (item) => ({
          title: item.title || "",
          description: item.description || "",
          image: await smartUpload(item.image || "", "dairy_app"),
          features: Array.isArray(item.features) ? item.features : [],
        }))
      );
    }

    if (Array.isArray(cleanUpdateData.goodnessOfferings)) {
      cleanUpdateData.goodnessOfferings = await Promise.all(
        cleanUpdateData.goodnessOfferings.map(async (item) => ({
          title: item.title || "",
          description: item.description || "",
          image: await smartUpload(item.image || "", "dairy_app"),
        }))
      );
    }

    if (Array.isArray(cleanUpdateData.faqs)) {
      cleanUpdateData.faqs = cleanUpdateData.faqs.map((item) => ({
        question: item.question || "",
        answer: item.answer || "",
      }));
    }

    // Process showcase3DCards — upload pngImage if it's a new base64
    if (Array.isArray(cleanUpdateData.showcase3DCards)) {
      cleanUpdateData.showcase3DCards = await Promise.all(
        cleanUpdateData.showcase3DCards.map(async (item, idx) => ({
          title: item.title || "",
          description: item.description || "",
          pngImage: await smartUpload(item.pngImage || "", "dairy_app_3d"),
          badge: item.badge || "✨ FRESH DAILY",
          price: Number(item.price) || 60,
          discount: Number(item.discount) || 10,
          enabled: item.enabled !== false,
          sortOrder: typeof item.sortOrder === "number" ? item.sortOrder : idx,
        }))
      );
    }

    // Process nested aboutUs stats (no images, just text)
    if (cleanUpdateData.aboutUs && Array.isArray(cleanUpdateData.aboutUs.stats)) {
      cleanUpdateData.aboutUs.stats = cleanUpdateData.aboutUs.stats.map((s) => ({
        value: s.value || "",
        label: s.label || "",
        icon: s.icon || "",
        color: s.color || "#6C5CE7",
      }));
    }

    let content = await PageContent.findOne();

    if (!content) {
      content = await PageContent.create({ ...defaultInitialContent, ...cleanUpdateData });
    } else {
      content = await PageContent.findByIdAndUpdate(
        content._id,
        { $set: cleanUpdateData },
        { new: true, runValidators: false }
      );
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
