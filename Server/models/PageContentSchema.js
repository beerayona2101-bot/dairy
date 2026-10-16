import mongoose from "mongoose";

const PageContentSchema = new mongoose.Schema(
  {
    companyName: { type: String, default: "Natural Milk Dairy" },
    companyTagline: { type: String, default: "Farm-Fresh, Pure & Nutritious Dairy Delivered Daily to Your Doorstep" },
    companyDescription: {
      type: String,
      default:
        "Natural Milk Dairy brings you 100% unadulterated milk, ghee, paneer, and sweets directly from our trusted farms. High quality, hygienic packaging, and daily morning delivery.",
    },
    heroBannerImage: { type: String, default: "" },
    
    // 1. HERO CAROUSEL SLIDES (Homepage Hero)
    heroCarouselSlides: [
      {
        image: { type: String, default: "" },
        badgeText: { type: String, default: "" },
        badgeIcon: { type: String, default: "Sun" },
        eyebrow: { type: String, default: "" },
        mainHeading: { type: String, default: "" },
        subHeading: { type: String, default: "" },
        title: { type: String, default: "" },
        subtitle: { type: String, default: "" },
        description: { type: String, default: "" },
        mobileSubtitle: { type: String, default: "" },
        pills: [
          {
            icon: { type: String, default: "Leaf" },
            label: { type: String, default: "" },
          },
        ],
        ctaText: { type: String, default: "Explore Fresh Dairy" },
        ctaLink: { type: String, default: "/products" },
        buttonText: { type: String, default: "Explore Products" },
        buttonLink: { type: String, default: "/products" },
      },
    ],
    landingHeroImage: { type: String, default: "https://res.cloudinary.com/dyahibuzy/image/upload/v1750157405/happyFamily_uuyftj.png" },

    // 2. FEATURED PRODUCTS SECTION
    featuredProductsSection: {
      titleBlack: { type: String, default: "Featured" },
      titleHighlight: { type: String, default: "Products" },
      subtitle: {
        type: String,
        default: "Pure, organic & nutrient-dense dairy delivered within hours of milking.",
      },
      viewAllText: { type: String, default: "View All Products" },
      viewAllLink: { type: String, default: "/products" },
      bottomCtaText: { type: String, default: "Explore Complete Dairy Catalog" },
      bottomCtaLink: { type: String, default: "/products" },
    },

    // 3. EXPLORE OUR CATEGORIES SECTION & CARDS
    exploreCategoriesSection: {
      titleBlack: { type: String, default: "Explore Our" },
      titleHighlight: { type: String, default: "Categories" },
      subtitle: {
        type: String,
        default: "Browse our farm-fresh lineup crafted for taste, health, and purity.",
      },
      viewAllText: { type: String, default: "View All Categories" },
      viewAllLink: { type: String, default: "/products" },
    },
    homeCategoryCards: [
      {
        title: { type: String },
        description: { type: String, default: "" },
        image: { type: String, default: "" },
        link: { type: String, default: "" },
      },
    ],

    // 4. ABOUT BRAND PREVIEW CARD ("Rooted in Purity, Crafted with Care")
    aboutBrandPreview: {
      titleBlack: { type: String, default: "Rooted in Purity," },
      titleHighlight: { type: String, default: "Crafted with Care" },
      description: {
        type: String,
        default:
          "At Natural Milk Dairy, we partner directly with trusted local farmers to deliver untouched, unadulterated milk and handcrafted dairy straight to thousands of happy homes every morning by 7 AM.",
      },
      bullets: [
        {
          type: String,
        },
      ],
      buttonText: { type: String, default: "Learn More About Our Story" },
      buttonLink: { type: String, default: "/about" },
      image: { type: String, default: "" },
      bottomBadgeLeft: { type: String, default: "Sourced Fresh Daily" },
      bottomBadgeRight: { type: String, default: "✓ 100% Certified Pure" },
    },

    // 5. WHY CHOOSE NATURAL MILK DAIRY (6 Benefit Cards)
    whyChooseUs: {
      titleBlack: { type: String, default: "Why Choose" },
      titleHighlight: { type: String, default: "Natural Milk Dairy" },
      subtitle: {
        type: String,
        default:
          "We uphold strict quality, ethical animal care, and uncompromising hygiene at every single step.",
      },
      benefits: [
        {
          title: { type: String },
          description: { type: String },
          color: { type: String, default: "#0756B5" },
          image: { type: String, default: "" },
          iconName: { type: String, default: "Droplets" },
        },
      ],
    },

    // 6. FARM TO TABLE WITHIN HOURS (4 Journey Step Cards)
    farmToTable: {
      titleBlack: { type: String, default: "Farm to Table," },
      titleHighlight: { type: String, default: "Within Hours" },
      subtitle: {
        type: String,
        default:
          "Follow how pure milk travels from green village pastures to your morning table.",
      },
      steps: [
        {
          step: { type: String, default: "01" },
          title: { type: String },
          description: { type: String },
          badge: { type: String, default: "PASTURE TO PAIL" },
          image: { type: String, default: "" },
        },
      ],
    },

    // 7. LOVED BY "NUM" FAMILIES & REVIEWS
    customerTrust: {
      titlePrefix: { type: String, default: "Loved by Over" },
      familiesCount: { type: String, default: "50,000+ Families" },
      subtitle: {
        type: String,
        default:
          "Pure freshness and dependable service that thousands of homes wake up to every single day.",
      },
      metrics: [
        {
          value: { type: String, default: "" },
          label: { type: String, default: "" },
          color: { type: String, default: "#0756B5" },
          iconName: { type: String, default: "Star" },
        },
      ],
      reviews: [
        {
          name: { type: String, default: "" },
          location: { type: String, default: "" },
          verified: { type: Boolean, default: true },
          rating: { type: Number, default: 5 },
          title: { type: String, default: "" },
          comment: { type: String, default: "" },
          product: { type: String, default: "" },
          avatar: { type: String, default: "" },
        },
      ],
      certifications: [{ type: String }],
    },

    // 8. LAST CARD (Shop Products, Contact Us, WhatsApp CTA)
    homeContactCta: {
      headline: {
        type: String,
        default: "Freshness Delivered to Your Door Every Morning",
      },
      description: {
        type: String,
        default:
          "Taste the unadulterated difference of 100% pure A2 milk, slow-simmered desi ghee, and handcrafted paneer. Order today for guaranteed doorstep delivery before 7 AM.",
      },
      shopButtonText: { type: String, default: "Shop Products Now" },
      shopButtonLink: { type: String, default: "/products" },
      contactButtonText: { type: String, default: "Contact Us" },
      contactButtonLink: { type: String, default: "/contact-us" },
      whatsappText: { type: String, default: "WhatsApp Us" },
      whatsappPhone: { type: String, default: "919490644434" },
      whatsappMessage: {
        type: String,
        default: "Hello! I would like to inquire about daily milk and dairy delivery.",
      },
      supportPhone: { type: String, default: "+91 94906 44434" },
      workingHours: { type: String, default: "Everyday, 5:00 AM - 12:00 PM" },
      locationText: { type: String, default: "Nashik, Maharashtra" },
      bgImage: { type: String, default: "" },
    },

    // Legacy fields preserved for backward compatibility
    landingShowcaseCards: [
      {
        title: { type: String },
        description: { type: String },
        image: { type: String },
        features: [{ type: String }],
      },
    ],
    goodnessOfferings: [
      {
        title: { type: String },
        description: { type: String },
        image: { type: String },
      },
    ],
    faqs: [
      {
        question: { type: String },
        answer: { type: String },
      },
    ],
    showcase3DCards: [
      {
        title: { type: String },
        description: { type: String },
        pngImage: { type: String },
        badge: { type: String, default: "⭐ BESTSELLER" },
        price: { type: Number, default: 60 },
        discount: { type: Number, default: 10 },
        enabled: { type: Boolean, default: true },
        sortOrder: { type: Number, default: 0 },
      },
    ],
    aboutUs: {
      badgeText: { type: String, default: "✨ 100% PURE & FARM-FRESH DAIRY" },
      title: { type: String, default: "About Natural Milk Dairy" },
      subtitle: {
        type: String,
        default:
          "Delivering unadulterated farm-fresh milk, pure ghee, paneer, and daily kitchen essentials straight to thousands of happy families every morning by 7 AM.",
      },
      journeyTitle: { type: String, default: "WHO WE ARE" },
      journeySubtitle: { type: String, default: "Our Journey & Mission" },
      stats: [
        {
          value: { type: String, default: "100%" },
          label: { type: String, default: "Pure & Fresh Milk" },
          icon: { type: String, default: "🥛" },
          color: { type: String, default: "#477A50" },
        },
        {
          value: { type: String, default: "7 AM" },
          label: { type: String, default: "Doorstep Delivery" },
          icon: { type: String, default: "🚚" },
          color: { type: String, default: "#00ACC1" },
        },
        {
          value: { type: String, default: "100+" },
          label: { type: String, default: "Quality Tests" },
          icon: { type: String, default: "🔬" },
          color: { type: String, default: "#6C5CE7" },
        },
        {
          value: { type: String, default: "50,000+" },
          label: { type: String, default: "Happy Families" },
          icon: { type: String, default: "❤️" },
          color: { type: String, default: "#FF7675" },
        },
      ],
    },
    contactUs: {
      badgeText: { type: String, default: "GET IN TOUCH" },
      title: { type: String, default: "Contact Information" },
      supportText: {
        type: String,
        default:
          "We are here to assist you. Please fill out the form to get in touch or ask your query directly.",
      },
      address: {
        type: String,
        default:
          "Shed no. A-31, Natural Milk Dairy, NAVNATH NAGAR, MIDC Ambad, Nashik, Maharashtra - 422010",
      },
      phone: { type: String, default: "+91 94906 44434" },
      email: { type: String, default: "beerayona143@gmail.com" },
      whatsappNumber: { type: String, default: "919490644434" },
      googleMaps: {
        type: String,
        default: "https://maps.google.com/?q=Natural+Milk+Dairy+Ambad+Nashik",
      },
    },
  },
  { timestamps: true, bufferCommands: false }
);

export default mongoose.model("PageContent", PageContentSchema);
