import mongoose from "mongoose";

const PageContentSchema = new mongoose.Schema(
  {
    companyName: { type: String, default: "MADHU Dairy And Daily Needs" },
    companyTagline: { type: String, default: "Farm-Fresh, Pure & Nutritious Dairy Delivered Daily to Your Doorstep" },
    companyDescription: {
      type: String,
      default:
        "MADHU Dairy brings you 100% unadulterated milk, ghee, paneer, and sweets directly from our trusted farms. High quality, hygienic packaging, and daily morning delivery.",
    },
    heroBannerImage: { type: String, default: "" },
    landingHeroImage: { type: String, default: "https://res.cloudinary.com/dyahibuzy/image/upload/v1750157405/happyFamily_uuyftj.png" },
    homeCategoryCards: [
      {
        title: { type: String },
        image: { type: String },
      },
    ],
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
    aboutUs: {
      badgeText: { type: String, default: "✨ 100% PURE & FARM-FRESH DAIRY" },
      title: { type: String, default: "About Madhu Dairy & Daily Needs" },
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
          "Shed no. A-31, Madhu Dairy & Daily Needs, NAVNATH NAGAR, MIDC Ambad, Nashik, Maharashtra - 422010",
      },
      phone: { type: String, default: "+91 94906 44434" },
      email: { type: String, default: "beerayona143@gmail.com" },
      whatsappNumber: { type: String, default: "919490644434" },
      googleMaps: {
        type: String,
        default: "https://maps.google.com/?q=Madhu+Dairy+Ambad+Nashik",
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model("PageContent", PageContentSchema);
