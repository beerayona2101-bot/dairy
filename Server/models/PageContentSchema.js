import mongoose from "mongoose";

const PageContentSchema = new mongoose.Schema(
  {
    companyName: { type: String, default: "Madhur Dairy And Daily Needs" },
    companyTagline: { type: String, default: "Farm-Fresh, Pure & Nutritious Dairy Delivered Daily to Your Doorstep" },
    companyDescription: {
      type: String,
      default:
        "Madhur Dairy brings you 100% unadulterated milk, ghee, paneer, and sweets directly from our trusted farms. High quality, hygienic packaging, and daily morning delivery.",
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
  },
  { timestamps: true }
);

export default mongoose.model("PageContent", PageContentSchema);
