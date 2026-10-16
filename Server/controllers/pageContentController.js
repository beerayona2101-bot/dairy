import mongoose from "mongoose";
import PageContent from "../models/PageContentSchema.js";
import { uploadToCloudinary } from "../config/cloudinary.js";

const defaultInitialContent = {
  companyName: "Natural Milk Dairy",
  companyTagline: "Farm-Fresh, Pure & Nutritious Dairy Delivered Daily to Your Doorstep",
  companyDescription:
    "Natural Milk Dairy brings you 100% unadulterated milk, ghee, paneer, and sweets directly from our trusted farms. High quality, hygienic packaging, and daily morning delivery.",
  heroBannerImage: "/assets/banner_welcome_sunrise.jpg",

  // 1. Hero Carousel (4 Slides)
  heroCarouselSlides: [
    {
      image: "",
      badgeText: "Good Morning",
      badgeIcon: "Sun",
      eyebrow: "Welcome to",
      mainHeading: "Natural Milk Dairy",
      subHeading: "",
      title: "Natural Milk Dairy",
      subtitle: "Welcome to Natural Milk Dairy",
      description: "Direct from our ethical farms to your home. Pure, hygienic & fresh dairy for you and your family.",
      mobileSubtitle: "Fresh & Natural • Hygienic & Safe • Daily Delivery",
      pills: [
        { icon: "Leaf", label: "Fresh & Natural" },
        { icon: "Droplets", label: "Hygienic & Safe" },
        { icon: "Truck", label: "Daily Delivery" },
      ],
      ctaText: "Explore Fresh Dairy",
      ctaLink: "/products",
      buttonText: "Explore Fresh Dairy",
      buttonLink: "/products",
    },
    {
      image: "",
      badgeText: "100% PURE & UNTOUCHED",
      badgeIcon: "Sparkles",
      eyebrow: "",
      mainHeading: "Farm Fresh Milk",
      subHeading: "Every Day at 7 AM",
      title: "Farm Fresh Milk",
      subtitle: "Every Day at 7 AM",
      description: "Direct from our farms to your home. Untouched by hand, chilled within hours, and laboratory tested.",
      mobileSubtitle: "Direct from our farms to your home.",
      pills: [
        { icon: "Leaf", label: "100% Natural" },
        { icon: "Award", label: "Quality Assured" },
        { icon: "Truck", label: "On-Time Delivery" },
      ],
      ctaText: "Order Fresh Milk",
      ctaLink: "/products/milk",
      buttonText: "Order Fresh Milk",
      buttonLink: "/products/milk",
    },
    {
      image: "",
      badgeText: "ARTISANAL & NUTRITIOUS",
      badgeIcon: "ShieldCheck",
      eyebrow: "",
      mainHeading: "Pure & Healthy",
      subHeading: "Dairy Products",
      title: "Pure & Healthy",
      subtitle: "Dairy Products",
      description: "Goodness for a Healthier Tomorrow. Thick curd, soft malai paneer, and aromatic bilona cow ghee.",
      mobileSubtitle: "Goodness for a Healthier Tomorrow.",
      pills: [
        { icon: "Milk", label: "Whole Farm Milk" },
        { icon: "Sparkles", label: "Pure Desi Ghee" },
        { icon: "ShieldCheck", label: "Fresh Soft Paneer" },
      ],
      ctaText: "Explore Dairy Range",
      ctaLink: "/products",
      buttonText: "Explore Dairy Range",
      buttonLink: "/products",
    },
    {
      image: "",
      badgeText: "DAILY MORNING DISPATCH",
      badgeIcon: "Clock",
      eyebrow: "",
      mainHeading: "From Our Farm",
      subHeading: "To Your Home",
      title: "From Our Farm",
      subtitle: "To Your Home",
      description: "Trusted by thousands of happy customers. Guaranteed morning arrival at your doorstep before 7:00 AM.",
      mobileSubtitle: "Trusted by thousands of happy customers.",
      pills: [
        { icon: "Truck", label: "Cold-Chain Fleet" },
        { icon: "Clock", label: "Morning 7 AM" },
        { icon: "Award", label: "Free Doorstep Delivery" },
      ],
      ctaText: "Start Subscription",
      ctaLink: "/products",
      buttonText: "Start Subscription",
      buttonLink: "/products",
    },
  ],

  // 2. Featured Products Section
  featuredProductsSection: {
    titleBlack: "Featured",
    titleHighlight: "Products",
    subtitle: "Pure, organic & nutrient-dense dairy delivered within hours of milking.",
    viewAllText: "View All Products",
    viewAllLink: "/products",
    bottomCtaText: "Explore Complete Dairy Catalog",
    bottomCtaLink: "/products",
  },

  // 3. Explore Categories Section & Cards
  exploreCategoriesSection: {
    titleBlack: "Explore Our",
    titleHighlight: "Categories",
    subtitle: "Browse our farm-fresh lineup crafted for taste, health, and purity.",
    viewAllText: "View All Categories",
    viewAllLink: "/products",
  },
  homeCategoryCards: [
    {
      title: "Milk",
      description: "Pure cow & buffalo milk, rich in natural calcium and vitamins.",
      image: "",
      link: "/products/milk",
    },
    {
      title: "Paneer",
      description: "Soft malai paneer crafted daily with fresh whole milk.",
      image: "",
      link: "/products/paneer",
    },
    {
      title: "Ghee",
      description: "Golden clarified butter prepared by slow bilona simmering.",
      image: "",
      link: "/products/ghee",
    },
    {
      title: "Curd",
      description: "Thick, silky probiotic set curd for daily gut wellness.",
      image: "",
      link: "/products/curd",
    },
    {
      title: "Butter",
      description: "Farm-churned yellow & white butter, rich and savory.",
      image: "",
      link: "/products/butter",
    },
    {
      title: "Lassi",
      description: "Cooling refreshing churned yogurt beverage in classic flavors.",
      image: "",
      link: "/products/lassi",
    },
    {
      title: "Chaas",
      description: "Spiced masala buttermilk infused with roasted cumin and mint.",
      image: "",
      link: "/products/chaas",
    },
    {
      title: "Dairy Sweets",
      description: "Festive gulab jamun, rasgulla & peda made from pure khoya.",
      image: "",
      link: "/products/dairy-sweets",
    },
  ],

  // 4. About Brand Preview Card
  aboutBrandPreview: {
    titleBlack: "Rooted in Purity,",
    titleHighlight: "Crafted with Care",
    description:
      "At Natural Milk Dairy, we partner directly with trusted local farmers to deliver untouched, unadulterated milk and handcrafted dairy straight to thousands of happy homes every morning by 7 AM.",
    bullets: [
      "Ethically sourced from grass-fed cows with humane care",
      "Over 100+ lab tests daily to guarantee zero adulterants",
      "Strict 4°C hygienic cold-chain without chemical preservatives",
    ],
    buttonText: "Learn More About Our Story",
    buttonLink: "/about",
    image: "",
    bottomBadgeLeft: "Sourced Fresh Daily",
    bottomBadgeRight: "✓ 100% Certified Pure",
  },

  // 5. Why Choose Natural Milk Dairy (6 Benefits)
  whyChooseUs: {
    titleBlack: "Why Choose",
    titleHighlight: "Natural Milk Dairy",
    subtitle: "We uphold strict quality, ethical animal care, and uncompromising hygiene at every single step.",
    benefits: [
      {
        title: "Fresh & Natural Dairy",
        description: "Delivered straight from local partner farms to your doorstep — untouched, pure, and 100% preservative-free.",
        color: "#0756B5",
        image: "",
        iconName: "Droplets",
      },
      {
        title: "Ethically Sourced Milk",
        description: "Our dairy farmers practice humane animal care, nourishing cows with clean water and pesticide-free green fodder.",
        color: "#E11D48",
        image: "",
        iconName: "Heart",
      },
      {
        title: "4°C Hygienic Processing",
        description: "Strict cold-chain pasteurization and food-grade packaging preserve natural vitamins without chemical additives.",
        color: "#075C2A",
        image: "",
        iconName: "ShieldCheck",
      },
      {
        title: "Comprehensive Dairy Range",
        description: "From morning cow & buffalo milk to thick probiotic curd, malai paneer, aromatic bilona ghee, and traditional sweets.",
        color: "#7C3AED",
        image: "",
        iconName: "Layers",
      },
      {
        title: "Fair & Honest Pricing",
        description: "Direct farm-to-family model removes middleman margins, guaranteeing fair rates for farmers and great value for you.",
        color: "#D97706",
        image: "",
        iconName: "BadgePercent",
      },
      {
        title: "Punctual 7 AM Delivery",
        description: "Chilled morning delivery right at your door 365 days a year, ensuring breakfast is always fresh and never delayed.",
        color: "#0284C7",
        image: "",
        iconName: "Truck",
      },
    ],
  },

  // 6. Farm to Table Within Hours
  farmToTable: {
    titleBlack: "Farm to Table,",
    titleHighlight: "Within Hours",
    subtitle: "Follow how pure milk travels from green village pastures to your morning table.",
    steps: [
      {
        step: "01",
        title: "Ethical Milking at Sunrise",
        description: "Fresh milk sourced at dawn from healthy, grass-fed cows on certified partner farms.",
        badge: "PASTURE TO PAIL",
        image: "",
      },
      {
        step: "02",
        title: "100+ Daily Lab Tests",
        description: "Strict testing for density, SNF, fat percentage, and zero chemical adulteration.",
        badge: "SCIENTIFIC RIGOR",
        image: "",
      },
      {
        step: "03",
        title: "4°C Cold Processing",
        description: "Low-temperature pasteurization and airtight eco-packaging preserving natural goodness.",
        badge: "HYGIENIC FRESHNESS",
        image: "",
      },
      {
        step: "04",
        title: "7 AM Doorstep Delivery",
        description: "Dispatched in refrigerated cold-chain vehicles directly to your kitchen before breakfast.",
        badge: "AT YOUR DOOR",
        image: "",
      },
    ],
  },

  // 7. Customer Trust & Loved by "num" Families
  customerTrust: {
    titlePrefix: "Loved by Over",
    familiesCount: "50,000+ Families",
    subtitle: "Pure freshness and dependable service that thousands of homes wake up to every single day.",
    metrics: [
      { value: "4.9 / 5.0", label: "Average Customer Rating", color: "text-amber-400", iconName: "Star" },
      { value: "50,000+", label: "Happy Families Served", color: "text-[#0756B5]", iconName: "Users" },
      { value: "100+", label: "Daily Quality Checks", color: "text-emerald-500", iconName: "ShieldCheck" },
      { value: "99.8%", label: "On-Time Morning Deliveries", color: "text-[#00ACC1]", iconName: "ThumbsUp" },
    ],
    reviews: [
      {
        name: "Sunita Deshmukh",
        location: "Ambad, Nashik",
        verified: true,
        rating: 5,
        title: "Pure taste with a thick malai layer",
        comment: "The natural sweetness and thick malai layer on this milk reminds me of our family farm. The paneer is so fresh that it stays soft without boiling. Truly dependable quality.",
        product: "Natural Cow Milk & Malai Paneer",
        avatar: "",
      },
      {
        name: "Rajesh Kulkarni",
        location: "Nashik City",
        verified: true,
        rating: 5,
        title: "Punctual delivery before 6:30 AM",
        comment: "Subscribed for 9 months now. The delivery person quietly places the chilled bottles at our doorstep before 6:30 AM without fail. The aroma of their desi ghee is exceptional.",
        product: "Pure Desi Ghee & Fresh Milk",
        avatar: "",
      },
      {
        name: "Dr. Ananya Patil",
        location: "Gangapur Road, Nashik",
        verified: true,
        rating: 5,
        title: "Complete peace of mind for my children",
        comment: "As a doctor and mother, finding unadulterated milk free of synthetic hormones was essential. The transparency and strict 4°C processing make Natural Milk Dairy our #1 choice.",
        product: "A2 Buffalo Milk & Thick Curd",
        avatar: "",
      },
    ],
    certifications: [
      "FSSAI Certified Processing Facility",
      "Zero Chemical Adulteration Guarantee",
      "Grass-Fed & Hormone-Free Herd",
      "Food-Grade Tamper-Evident Packaging",
    ],
  },

  // 8. Last Card (Shop Products, Contact Us, WhatsApp CTA)
  homeContactCta: {
    headline: "Freshness Delivered to Your Door Every Morning",
    description:
      "Taste the unadulterated difference of 100% pure A2 milk, slow-simmered desi ghee, and handcrafted paneer. Order today for guaranteed doorstep delivery before 7 AM.",
    shopButtonText: "Shop Products Now",
    shopButtonLink: "/products",
    contactButtonText: "Contact Us",
    contactButtonLink: "/contact-us",
    whatsappText: "WhatsApp Us",
    whatsappPhone: "919490644434",
    whatsappMessage: "Hello! I would like to inquire about daily milk and dairy delivery.",
    supportPhone: "+91 94906 44434",
    workingHours: "Everyday, 5:00 AM - 12:00 PM",
    locationText: "Nashik, Maharashtra",
    bgImage: "",
  },

  landingHeroImage: "/assets/landing_hero_bg_hd.png",
  landingShowcaseCards: [],
  goodnessOfferings: [],
  faqs: [],
  aboutUs: {
    badgeText: "✨ 100% PURE & FARM-FRESH DAIRY",
    title: "About Natural Milk Dairy",
    subtitle:
      "Delivering unadulterated farm-fresh milk, pure ghee, paneer, and daily kitchen essentials straight to thousands of happy families every morning by 7 AM.",
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
    supportText:
      "We are here to assist you. Please fill out the form to get in touch or ask your query directly.",
    address:
      "Shed no. A-31, Natural Milk Dairy, NAVNATH NAGAR, MIDC Ambad, Nashik, Maharashtra - 422010",
    phone: "+91 94906 44434",
    email: "beerayona143@gmail.com",
    whatsappNumber: "919490644434",
    googleMaps: "https://maps.google.com/?q=Natural+Milk+Dairy+Ambad+Nashik",
  },
};

export const getPageContent = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      res.set("Cache-Control", "no-cache, no-store, must-revalidate");
      res.set("Pragma", "no-cache");
      res.set("Expires", "0");
      return res.status(200).json({ success: true, pageContent: defaultInitialContent });
    }
    let content = await PageContent.findOne().lean();
    if (!content) {
      content = await PageContent.create(defaultInitialContent);
    } else if (!content.heroCarouselSlides || content.heroCarouselSlides.length === 0) {
      content.heroCarouselSlides = defaultInitialContent.heroCarouselSlides;
      await PageContent.updateOne(
        { _id: content._id },
        { $set: { heroCarouselSlides: defaultInitialContent.heroCarouselSlides } }
      );
    }
    // Remove aggressive caching so saved changes are immediately visible
    res.set("Cache-Control", "no-cache, no-store, must-revalidate");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");
    return res.status(200).json({ success: true, pageContent: content });
  } catch (error) {
    console.warn("Notice reading PageContent from DB, serving default content fallback:", error.message);
    res.set("Cache-Control", "no-cache, no-store, must-revalidate");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");
    return res.status(200).json({ success: true, pageContent: defaultInitialContent });
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

    // 1. Hero Carousel Slides Images
    if (cleanUpdateData.heroBannerImage) {
      cleanUpdateData.heroBannerImage = await smartUpload(cleanUpdateData.heroBannerImage, "dairy_hero");
    }
    if (Array.isArray(cleanUpdateData.heroCarouselSlides)) {
      cleanUpdateData.heroCarouselSlides = await Promise.all(
        cleanUpdateData.heroCarouselSlides.map(async (slide) => ({
          ...slide,
          image: await smartUpload(slide.image || "", "dairy_hero"),
        }))
      );
    }
    if (cleanUpdateData.landingHeroImage) {
      cleanUpdateData.landingHeroImage = await smartUpload(cleanUpdateData.landingHeroImage, "dairy_hero");
    }

    // 3. Category Cards Images
    if (Array.isArray(cleanUpdateData.homeCategoryCards)) {
      cleanUpdateData.homeCategoryCards = await Promise.all(
        cleanUpdateData.homeCategoryCards.map(async (item) => ({
          ...item,
          image: await smartUpload(item.image || "", "dairy_categories"),
        }))
      );
    }

    // 4. About Brand Preview Image
    if (cleanUpdateData.aboutBrandPreview && cleanUpdateData.aboutBrandPreview.image) {
      cleanUpdateData.aboutBrandPreview.image = await smartUpload(
        cleanUpdateData.aboutBrandPreview.image,
        "dairy_about"
      );
    }

    // 5. Why Choose Us Benefit Cards Images
    if (cleanUpdateData.whyChooseUs && Array.isArray(cleanUpdateData.whyChooseUs.benefits)) {
      cleanUpdateData.whyChooseUs.benefits = await Promise.all(
        cleanUpdateData.whyChooseUs.benefits.map(async (b) => ({
          ...b,
          image: await smartUpload(b.image || "", "dairy_benefits"),
        }))
      );
    }

    // 6. Farm to Table Journey Step Images
    if (cleanUpdateData.farmToTable && Array.isArray(cleanUpdateData.farmToTable.steps)) {
      cleanUpdateData.farmToTable.steps = await Promise.all(
        cleanUpdateData.farmToTable.steps.map(async (s) => ({
          ...s,
          image: await smartUpload(s.image || "", "dairy_journey"),
        }))
      );
    }

    // 7. Customer Trust Reviews Avatar Images
    if (cleanUpdateData.customerTrust && Array.isArray(cleanUpdateData.customerTrust.reviews)) {
      cleanUpdateData.customerTrust.reviews = await Promise.all(
        cleanUpdateData.customerTrust.reviews.map(async (r) => ({
          ...r,
          avatar: await smartUpload(r.avatar || "", "dairy_reviews"),
        }))
      );
    }

    // 8. Last Card (Home Contact CTA) Background Image
    if (cleanUpdateData.homeContactCta && cleanUpdateData.homeContactCta.bgImage) {
      cleanUpdateData.homeContactCta.bgImage = await smartUpload(
        cleanUpdateData.homeContactCta.bgImage,
        "dairy_cta"
      );
    }

    // Legacy fields handling
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
