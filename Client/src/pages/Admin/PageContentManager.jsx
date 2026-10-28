import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { PageContentContext } from "../../context/PageContentProvider";
import { updatePageContentService } from "../../services/pageContentService";
import { socket } from "../../socket/socket";
import { useSnackbar } from "notistack";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Image as ImageIcon,
  Save,
  Plus,
  Trash2,
  HelpCircle,
  Layers,
  Layout as LayoutIcon,
  Upload,
  FileText,
  Phone,
  MapPin,
  Star,
  Truck,
  Heart,
  ShieldCheck,
  Sun,
  Moon,
  Clock,
  MessageCircle,
  CheckCircle2,
  X,
  ExternalLink,
  Leaf,
  Monitor,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { convertToBase64 } from "../../utils/InventoryHelpers/imageBase64Converter";
import bannerWelcomeImg from "../../assets/banner_welcome_sunrise.jpg";
import bannerMilkImg from "../../assets/banner_farm_fresh_milk.jpg";
import bannerProductsImg from "../../assets/banner_pure_healthy_products.jpg";
import bannerDeliveryImg from "../../assets/banner_farm_to_home_delivery.jpg";
import dairyImgDefault from "../../assets/dairyImage.png";
import step1ImgDefault from "../../assets/freshMilk.jpg";
import step2ImgDefault from "../../assets/hygienicProcessing.jpg";
import step3ImgDefault from "../../assets/productImage.jpg";
import step4ImgDefault from "../../assets/deliveryTruck.jpg";
import AdminAccordion from "../../components/AdminComponents/Common/AdminAccordion";
import BackButton from "../../components/Common/BackButton";

// --- REUSABLE PER-ITEM SINGLE IMAGE UPLOAD COMPONENT ---
function ItemImageUploader({ label, value, fallbackDefault, onChange }) {
  const displaySrc = value || fallbackDefault;

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await convertToBase64(file);
        onChange(base64);
      } catch (err) {
        console.error("Failed to read image file:", err);
      }
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-[#0756B5] dark:text-blue-400" />
          <span>{label || "Upload Item Image"}</span>
        </label>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-[10px] text-red-500 hover:text-red-700 dark:hover:text-red-400 font-semibold flex items-center gap-0.5 cursor-pointer"
          >
            <X className="w-3 h-3" /> Remove custom image
          </button>
        )}
      </div>

      <div className="flex items-center gap-3 p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        {/* Thumbnail Preview */}
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-900 border border-gray-200 dark:border-gray-700 shrink-0 flex items-center justify-center group shadow-xs">
          {displaySrc ? (
            <img
              src={displaySrc}
              alt="Thumbnail preview"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          ) : (
            <ImageIcon className="w-6 h-6 text-gray-400" />
          )}
          {value && (
            <div className="absolute bottom-0 inset-x-0 bg-emerald-600/90 text-[8px] font-bold text-white text-center py-0.5 uppercase tracking-wider">
              Custom
            </div>
          )}
        </div>

        {/* Upload Controls */}
        <div className="flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0756B5] hover:bg-[#054593] text-white text-xs font-bold shadow-xs cursor-pointer transition hover:scale-[1.02] active:scale-95">
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Image</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
            <span className="text-[10px] text-gray-500 dark:text-gray-400">
              (PNG, JPG, WebP supported)
            </span>
          </div>

          <input
            type="text"
            placeholder="Or paste direct image URL (https://...)"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-2.5 py-1 text-[11px] rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:border-[#0756B5]"
          />
        </div>
      </div>
    </div>
  );
}

// Default 4 slides matching HomeWelcomeHero
const defaultHeroSlides = [
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
    ctaText: "Explore Fresh Dairy",
    ctaLink: "/products",
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
    ctaText: "Order Fresh Milk",
    ctaLink: "/products/milk",
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
    ctaText: "Explore Dairy Range",
    ctaLink: "/products",
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
    ctaText: "Start Subscription",
    ctaLink: "/products",
  },
];

const defaultCategoryCards = [
  { title: "Milk", description: "Pure cow & buffalo milk, rich in natural calcium and vitamins.", image: "", link: "/products/milk" },
  { title: "Paneer", description: "Soft malai paneer crafted daily with fresh whole milk.", image: "", link: "/products/paneer" },
  { title: "Ghee", description: "Golden clarified butter prepared by slow bilona simmering.", image: "", link: "/products/ghee" },
  { title: "Curd", description: "Thick, silky probiotic set curd for daily gut wellness.", image: "", link: "/products/curd" },
  { title: "Butter", description: "Farm-churned yellow & white butter, rich and savory.", image: "", link: "/products/butter" },
  { title: "Lassi", description: "Cooling refreshing churned yogurt beverage in classic flavors.", image: "", link: "/products/lassi" },
  { title: "Chaas", description: "Spiced masala buttermilk infused with roasted cumin and mint.", image: "", link: "/products/chaas" },
  { title: "Dairy Sweets", description: "Festive gulab jamun, rasgulla & peda made from pure khoya.", image: "", link: "/products/dairy-sweets" },
];

const defaultWhyChooseBenefits = [
  { title: "Fresh & Natural Dairy", description: "Delivered straight from local partner farms to your doorstep — untouched, pure, and 100% preservative-free.", color: "#0756B5", image: "", iconName: "Droplets" },
  { title: "Ethically Sourced Milk", description: "Our dairy farmers practice humane animal care, nourishing cows with clean water and pesticide-free green fodder.", color: "#E11D48", image: "", iconName: "Heart" },
  { title: "4°C Hygienic Processing", description: "Strict cold-chain pasteurization and food-grade packaging preserve natural vitamins without chemical additives.", color: "#075C2A", image: "", iconName: "ShieldCheck" },
  { title: "Comprehensive Dairy Range", description: "From morning cow & buffalo milk to thick probiotic curd, malai paneer, aromatic bilona ghee, and traditional sweets.", color: "#7C3AED", image: "", iconName: "Layers" },
  { title: "Fair & Honest Pricing", description: "Direct farm-to-family model removes middleman margins, guaranteeing fair rates for farmers and great value for you.", color: "#D97706", image: "", iconName: "BadgePercent" },
  { title: "Punctual 7 AM Delivery", description: "Chilled morning delivery right at your door 365 days a year, ensuring breakfast is always fresh and never delayed.", color: "#0284C7", image: "", iconName: "Truck" },
];

const defaultFarmSteps = [
  { step: "01", title: "Ethical Milking at Sunrise", description: "Fresh milk sourced at dawn from healthy, grass-fed cows on certified partner farms.", badge: "PASTURE TO PAIL", image: "" },
  { step: "02", title: "100+ Daily Lab Tests", description: "Strict testing for density, SNF, fat percentage, and zero chemical adulteration.", badge: "SCIENTIFIC RIGOR", image: "" },
  { step: "03", title: "4°C Cold Processing", description: "Low-temperature pasteurization and airtight eco-packaging preserving natural goodness.", badge: "HYGIENIC FRESHNESS", image: "" },
  { step: "04", title: "7 AM Doorstep Delivery", description: "Dispatched in refrigerated cold-chain vehicles directly to your kitchen before breakfast.", badge: "AT YOUR DOOR", image: "" },
];

const defaultReviews = [
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
];

export default function PageContentManager() {
  const { enqueueSnackbar } = useSnackbar();
  const { pageContent, refreshPageContent } = useContext(PageContentContext);
  const queryClient = useQueryClient();

  // Active section tab matching user's requested 8-item sequence
  const [activeTab, setActiveTab] = useState("hero");
  const [saving, setSaving] = useState(false);
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);
  const [heroSubView, setHeroSubView] = useState("web"); // "web" | "shared"
  const [activeSharedSlide, setActiveSharedSlide] = useState(1); // 1, 2, or 3 (Shared slides between mobile & web)

  const [formData, setFormData] = useState({
    // 1. Hero Carousels
    heroCarouselSlides: defaultHeroSlides,
    // 2. Featured Products
    featuredProductsSection: {
      titleBlack: "Featured",
      titleHighlight: "Products",
      subtitle: "Pure, organic & nutrient-dense dairy delivered within hours of milking.",
      viewAllText: "View All Products",
      viewAllLink: "/products",
      bottomCtaText: "Explore Complete Dairy Catalog",
      bottomCtaLink: "/products",
    },
    // 3. Explore Categories
    exploreCategoriesSection: {
      titleBlack: "Explore Our",
      titleHighlight: "Categories",
      subtitle: "Browse our farm-fresh lineup crafted for taste, health, and purity.",
      viewAllText: "View All Categories",
      viewAllLink: "/products",
    },
    homeCategoryCards: defaultCategoryCards,
    // 4. About Brand Preview ("Next Card")
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
    // 5. Why Choose Us
    whyChooseUs: {
      titleBlack: "Why Choose",
      titleHighlight: "Natural Milk Dairy",
      subtitle: "We uphold strict quality, ethical animal care, and uncompromising hygiene at every single step.",
      benefits: defaultWhyChooseBenefits,
    },
    // 6. Farm to Table
    farmToTable: {
      titleBlack: "Farm to Table,",
      titleHighlight: "Within Hours",
      subtitle: "Follow how pure milk travels from green village pastures to your morning table.",
      steps: defaultFarmSteps,
    },
    // 7. Loved by "num" Families
    customerTrust: {
      titlePrefix: "Loved by Over",
      familiesCount: "50,000+ Families",
      subtitle: "Pure freshness and dependable service that thousands of homes wake up to every single day.",
      metrics: [
        { value: "4.9 / 5.0", label: "Average Customer Rating", color: "text-amber-400" },
        { value: "50,000+", label: "Happy Families Served", color: "text-[#0756B5]" },
        { value: "100+", label: "Daily Quality Checks", color: "text-emerald-500" },
        { value: "99.8%", label: "On-Time Morning Deliveries", color: "text-[#00ACC1]" },
      ],
      reviews: defaultReviews,
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
    // Branding & Contact info
    companyName: "Natural Milk Dairy",
    companyTagline: "Farm-Fresh, Pure & Nutritious Dairy Delivered Daily to Your Doorstep",
    companyDescription: "Natural Milk Dairy brings you 100% unadulterated milk, ghee, paneer, and sweets directly from our trusted farms.",
    faqs: [],
  });

  // Populate from DB when context updates
  useEffect(() => {
    if (pageContent) {
      setFormData((prev) => ({
        ...prev,
        ...pageContent,
        heroCarouselSlides:
          Array.isArray(pageContent.heroCarouselSlides) && pageContent.heroCarouselSlides.length > 0
            ? pageContent.heroCarouselSlides
            : prev.heroCarouselSlides,
        featuredProductsSection: {
          ...prev.featuredProductsSection,
          ...(pageContent.featuredProductsSection || {}),
        },
        exploreCategoriesSection: {
          ...prev.exploreCategoriesSection,
          ...(pageContent.exploreCategoriesSection || {}),
        },
        homeCategoryCards:
          Array.isArray(pageContent.homeCategoryCards) && pageContent.homeCategoryCards.length > 0
            ? pageContent.homeCategoryCards
            : prev.homeCategoryCards,
        aboutBrandPreview: {
          ...prev.aboutBrandPreview,
          ...(pageContent.aboutBrandPreview || {}),
          bullets: Array.isArray(pageContent.aboutBrandPreview?.bullets) && pageContent.aboutBrandPreview.bullets.length > 0
            ? pageContent.aboutBrandPreview.bullets
            : prev.aboutBrandPreview.bullets,
        },
        whyChooseUs: {
          ...prev.whyChooseUs,
          ...(pageContent.whyChooseUs || {}),
          benefits:
            Array.isArray(pageContent.whyChooseUs?.benefits) && pageContent.whyChooseUs.benefits.length > 0
              ? pageContent.whyChooseUs.benefits
              : prev.whyChooseUs.benefits,
        },
        farmToTable: {
          ...prev.farmToTable,
          ...(pageContent.farmToTable || {}),
          steps:
            Array.isArray(pageContent.farmToTable?.steps) && pageContent.farmToTable.steps.length > 0
              ? pageContent.farmToTable.steps
              : prev.farmToTable.steps,
        },
        customerTrust: {
          ...prev.customerTrust,
          ...(pageContent.customerTrust || {}),
          metrics:
            Array.isArray(pageContent.customerTrust?.metrics) && pageContent.customerTrust.metrics.length > 0
              ? pageContent.customerTrust.metrics
              : prev.customerTrust.metrics,
          reviews:
            Array.isArray(pageContent.customerTrust?.reviews) && pageContent.customerTrust.reviews.length > 0
              ? pageContent.customerTrust.reviews
              : prev.customerTrust.reviews,
        },
        homeContactCta: {
          ...prev.homeContactCta,
          ...(pageContent.homeContactCta || {}),
        },
      }));
    }
  }, [pageContent]);

  // --- SAVE ALL CHANGES ---
  const handleSave = async () => {
    setSaving(true);
    try {
      const { _id, __v, createdAt, updatedAt, ...cleanPayload } = formData;
      const res = await updatePageContentService(cleanPayload);
      if (res?.success) {
        enqueueSnackbar("Homepage content and images saved successfully!", { variant: "success" });
        if (res.pageContent) {
          setFormData((prev) => ({
            ...prev,
            ...res.pageContent,
            _id: undefined,
            __v: undefined,
          }));
        }
        socket.emit("page-content:update", { pageContent: res.pageContent });
        queryClient.invalidateQueries({ queryKey: ["pageContent"] });
        queryClient.setQueryData(["pageContent"], res.pageContent);
        refreshPageContent();
      } else {
        enqueueSnackbar(res?.message || "Failed to update content.", { variant: "error" });
      }
    } catch (err) {
      enqueueSnackbar(err?.response?.data?.message || "Server error while saving content.", { variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  // --- NAVIGATION TABS (Strictly matching the 8 Homepage Sections in exact sequence) ---
  const TABS = [
    { id: "hero", label: "1. Hero Carousels", icon: <Sun className="w-4 h-4 text-amber-500" /> },
    { id: "featured", label: "2. Featured Products", icon: <Star className="w-4 h-4 text-[#0756B5]" /> },
    { id: "categories", label: "3. Explore Categories", icon: <Layers className="w-4 h-4 text-purple-500" /> },
    { id: "about-card", label: "4. About Brand Preview", icon: <Leaf className="w-4 h-4 text-emerald-500" /> },
    { id: "why-choose", label: "5. Why Choose Us", icon: <ShieldCheck className="w-4 h-4 text-[#075C2A]" /> },
    { id: "farm-table", label: "6. Farm to Table", icon: <Truck className="w-4 h-4 text-sky-500" /> },
    { id: "trust", label: "7. Families & Reviews", icon: <Heart className="w-4 h-4 text-rose-500" /> },
    { id: "last-cta", label: "8. Shop & WhatsApp CTA", icon: <MessageCircle className="w-4 h-4 text-[#25D366]" /> },
    { id: "branding", label: "Store Info & Branding", icon: <FileText className="w-4 h-4 text-slate-500" /> },
    { id: "faqs", label: "FAQs", icon: <HelpCircle className="w-4 h-4 text-amber-600" /> },
  ];

  return (
    <div className="p-3 sm:p-6 space-y-6 bg-slate-50 dark:bg-slate-900/60 min-h-screen text-slate-900 dark:text-slate-100">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xs border border-slate-200 dark:border-slate-700">
        <div className="flex items-start sm:items-center gap-3">
          <BackButton fallbackPath="/admin/dashboard" className="shrink-0 mt-0.5 sm:mt-0" />
          <div>
            <h1 className="text-xl sm:text-2xl font-black flex items-center gap-2.5 text-[#0756B5] dark:text-blue-400">
              <LayoutIcon className="w-6 h-6" /> Homepage CRM Content Manager
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Live edit all 8 homepage sections and upload images for each card/item.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            to="/"
            target="_blank"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold transition text-slate-700 dark:text-slate-200"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Live Home</span>
          </Link>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#0756B5] hover:bg-[#054593] text-white font-extrabold text-xs sm:text-sm shadow-md shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? "Saving Changes..." : "Save All Changes"}</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 overflow-x-auto pb-2 scrollbar-hide">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-[#0756B5] text-white shadow-md shadow-blue-500/20"
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* =========================================================================
          SECTION 1: HERO CAROUSELS (4 SLIDES)
      ========================================================================= */}
      {activeTab === "hero" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Sub-view switcher for distinct Carousel Options */}
          <div className="flex flex-wrap items-center gap-2.5 p-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
            <span className="text-xs font-black text-slate-500 dark:text-slate-400 px-2 uppercase tracking-wider">
              Select Carousel Option:
            </span>
            <button
              type="button"
              onClick={() => setHeroSubView("web")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition cursor-pointer ${
                heroSubView === "web"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                  : "bg-slate-100 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
              }`}
            >
              <Monitor className="w-4 h-4" />
              <span>Option 1: Web Homepage Welcome Carousel (Web Only)</span>
            </button>
            <button
              type="button"
              onClick={() => setHeroSubView("shared")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition cursor-pointer ${
                heroSubView === "shared"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                  : "bg-slate-100 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Option 2: Shared Campaign Carousels (3 Slides: Mobile & Web)</span>
            </button>
          </div>

          {/* =========================================================================
              OPTION 1: WEB HOMEPAGE WELCOME CAROUSEL (WEB ONLY)
          ========================================================================= */}
          {heroSubView === "web" && (() => {
            const webSlide = formData.heroCarouselSlides[0] || defaultHeroSlides[0] || {};
            const updateWebSlide = (field, val) => {
              setFormData((prev) => {
                const copy = [...(prev.heroCarouselSlides || defaultHeroSlides)];
                while (copy.length < 4) {
                  copy.push(defaultHeroSlides[copy.length] || {});
                }
                copy[0] = { ...copy[0], [field]: val };
                return { ...prev, heroCarouselSlides: copy };
              });
            };

            const nowHour = new Date().getHours();
            const liveTiming =
              nowHour >= 5 && nowHour < 12
                ? { text: "Good Morning", icon: Sun, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800" }
                : nowHour >= 12 && nowHour < 17
                ? { text: "Good Afternoon", icon: Sun, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800" }
                : { text: "Good Evening", icon: Moon, color: "text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800" };
            const LiveIcon = liveTiming.icon;

            return (
              <AdminAccordion
                title="Option 1: Web Homepage Welcome Carousel (Web Desktop Only)"
                subtitle="Exclusive introductory slide for Web Homepage with automatic time-based greeting (Good Morning / Afternoon / Evening)"
                icon={<Monitor className="w-5 h-5 text-indigo-500" />}
                defaultExpanded={true}
              >
                <div className="space-y-6">
                  {/* Scope Notice & Dynamic Timing Status */}
                  <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/60 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-indigo-600 text-white tracking-wide uppercase">
                          Web Only Slide
                        </span>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Not displayed in Mobile App (mobile uses top app greeting bar)
                        </span>
                      </div>
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-xl border text-xs font-bold ${liveTiming.bg} ${liveTiming.color}`}>
                        <LiveIcon className="w-3.5 h-3.5" />
                        <span>Live Preview Now: {liveTiming.text}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      💡 <strong>Dynamic Timing Note:</strong> If the Badge Greeting Tag is left empty or set to <em>"Good Morning"</em>, <em>"auto"</em>, <em>"Good Afternoon"</em>, or <em>"Good Evening"</em>, it automatically adapts dynamically based on the visitor's local device time:
                      <br />
                      • <strong>5:00 AM – 11:59 AM:</strong> Good Morning ☀️ &nbsp;|&nbsp;
                      • <strong>12:00 PM – 4:59 PM:</strong> Good Afternoon ☀️ &nbsp;|&nbsp;
                      • <strong>5:00 PM – 4:59 AM:</strong> Good Evening 🌙
                    </p>
                  </div>

                  <div className="space-y-5 bg-slate-50/70 dark:bg-slate-900/40 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                    {/* Slide 1 Image Upload */}
                    <ItemImageUploader
                      label="Web Welcome Carousel Background Image"
                      value={webSlide.image}
                      fallbackDefault={bannerWelcomeImg}
                      onChange={(img) => updateWebSlide("image", img)}
                    />

                    {/* Badge Greeting Tag & Quick Presets */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Welcome Badge Greeting Note
                        </label>
                        <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                          Type "auto" for dynamic time-based greeting
                        </span>
                      </div>
                      <input
                        type="text"
                        value={webSlide.badgeText ?? "Good Morning"}
                        onChange={(e) => updateWebSlide("badgeText", e.target.value)}
                        placeholder="Good Morning (or type 'auto' for dynamic timing)"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-semibold focus:outline-none focus:border-indigo-500"
                      />
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        <span className="text-[11px] text-slate-500 font-medium">Quick Presets:</span>
                        <button
                          type="button"
                          onClick={() => updateWebSlide("badgeText", "auto")}
                          className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 transition cursor-pointer"
                        >
                          ⚡ Auto Dynamic Timing
                        </button>
                        <button
                          type="button"
                          onClick={() => updateWebSlide("badgeText", "Good Morning")}
                          className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 hover:bg-amber-200 transition cursor-pointer"
                        >
                          ☀️ Good Morning
                        </button>
                        <button
                          type="button"
                          onClick={() => updateWebSlide("badgeText", "Good Afternoon")}
                          className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 hover:bg-amber-200 transition cursor-pointer"
                        >
                          ☀️ Good Afternoon
                        </button>
                        <button
                          type="button"
                          onClick={() => updateWebSlide("badgeText", "Good Evening")}
                          className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 transition cursor-pointer"
                        >
                          🌙 Good Evening
                        </button>
                      </div>
                    </div>

                    {/* Eyebrow & Main Heading */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          Eyebrow Text (e.g. "Welcome to")
                        </label>
                        <input
                          type="text"
                          value={webSlide.eyebrow ?? "Welcome to"}
                          onChange={(e) => updateWebSlide("eyebrow", e.target.value)}
                          placeholder="Welcome to"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-semibold focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          Main Headline (Green Serif Title)
                        </label>
                        <input
                          type="text"
                          value={webSlide.mainHeading || webSlide.title || "Natural Milk Dairy"}
                          onChange={(e) => {
                            updateWebSlide("mainHeading", e.target.value);
                            updateWebSlide("title", e.target.value);
                          }}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-bold focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    {/* Description Paragraph */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Welcome Description / Intro Statement
                      </label>
                      <textarea
                        rows={2}
                        value={webSlide.description || ""}
                        onChange={(e) => updateWebSlide("description", e.target.value)}
                        placeholder="Direct from our ethical farms to your home. Pure, hygienic & fresh dairy for you and your family."
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-medium focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    {/* CTA Button Text & Link */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          CTA Button Text
                        </label>
                        <input
                          type="text"
                          value={webSlide.ctaText || webSlide.buttonText || "Explore Fresh Dairy"}
                          onChange={(e) => {
                            updateWebSlide("ctaText", e.target.value);
                            updateWebSlide("buttonText", e.target.value);
                          }}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-semibold focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          CTA Button Link
                        </label>
                        <input
                          type="text"
                          value={webSlide.ctaLink || webSlide.buttonLink || "/products"}
                          onChange={(e) => {
                            updateWebSlide("ctaLink", e.target.value);
                            updateWebSlide("buttonLink", e.target.value);
                          }}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-semibold focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </AdminAccordion>
            );
          })()}

          {/* =========================================================================
              OPTION 2: SHARED CAMPAIGN CAROUSELS (3 SLIDES - MOBILE & WEB)
          ========================================================================= */}
          {heroSubView === "shared" && (() => {
            const currentShared = formData.heroCarouselSlides[activeSharedSlide] || defaultHeroSlides[activeSharedSlide] || {};
            const fallbackImg =
              activeSharedSlide === 1
                ? bannerMilkImg
                : activeSharedSlide === 2
                ? bannerProductsImg
                : bannerDeliveryImg;

            const updateCurrentShared = (field, val) => {
              setFormData((prev) => {
                const copy = [...(prev.heroCarouselSlides || defaultHeroSlides)];
                while (copy.length < 4) {
                  copy.push(defaultHeroSlides[copy.length] || {});
                }
                copy[activeSharedSlide] = { ...copy[activeSharedSlide], [field]: val };
                return { ...prev, heroCarouselSlides: copy };
              });
            };

            const sharedTitles = [
              { idx: 1, label: "Slide 1: Farm Fresh Milk (7 AM Delivery)", defaultTitle: "Farm Fresh Milk" },
              { idx: 2, label: "Slide 2: Pure & Healthy Dairy Range", defaultTitle: "Pure & Healthy" },
              { idx: 3, label: "Slide 3: Farm to Home Direct Dispatch", defaultTitle: "From Our Farm" },
            ];

            return (
              <AdminAccordion
                title="Option 2: Shared Campaign Carousels (3 Slides — Mobile App & Web)"
                subtitle="Promotional campaign banners synchronized identically across BOTH the Web Homepage and the Mobile App"
                icon={<Smartphone className="w-5 h-5 text-emerald-600" />}
                defaultExpanded={true}
              >
                <div className="space-y-6">
                  {/* Scope Notice */}
                  <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-emerald-600 text-white tracking-wide uppercase">
                        Mobile & Web Synced (3 Slides)
                      </span>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Changes here apply in real-time to both Web users and Mobile App users.
                      </span>
                    </div>
                  </div>

                  {/* 3 Shared Slides Tabs */}
                  <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-3 overflow-x-auto">
                    {sharedTitles.map((item) => {
                      const slideData = formData.heroCarouselSlides[item.idx] || {};
                      const slideTitle = slideData.mainHeading || slideData.title || item.defaultTitle;
                      return (
                        <button
                          key={`shared-slide-tab-${item.idx}`}
                          type="button"
                          onClick={() => setActiveSharedSlide(item.idx)}
                          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                            activeSharedSlide === item.idx
                              ? "bg-emerald-600 text-white shadow-sm"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                          }`}
                        >
                          <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-black">
                            {item.idx}
                          </span>
                          <span>{item.label.split(":")[0]}: {slideTitle}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Active Shared Slide Editor */}
                  <div className="space-y-5 bg-slate-50/70 dark:bg-slate-900/40 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black px-2.5 py-1 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                        Editing Shared Campaign Slide {activeSharedSlide} of 3 (Mobile & Web)
                      </span>
                    </div>

                    {/* Image Uploader */}
                    <ItemImageUploader
                      label={`Shared Slide ${activeSharedSlide} Background Image`}
                      value={currentShared.image}
                      fallbackDefault={fallbackImg}
                      onChange={(img) => updateCurrentShared("image", img)}
                    />

                    {/* Badge & Eyebrow */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          Badge Tag (e.g. 100% PURE & UNTOUCHED / ARTISANAL & NUTRITIOUS)
                        </label>
                        <input
                          type="text"
                          value={currentShared.badgeText || ""}
                          onChange={(e) => updateCurrentShared("badgeText", e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-semibold focus:outline-none focus:border-emerald-600"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          Eyebrow Text (Optional)
                        </label>
                        <input
                          type="text"
                          value={currentShared.eyebrow || ""}
                          onChange={(e) => updateCurrentShared("eyebrow", e.target.value)}
                          placeholder="Optional eyebrow text"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-semibold focus:outline-none focus:border-emerald-600"
                        />
                      </div>
                    </div>

                    {/* Main Heading & Sub Heading */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          Main Headline (Green Serif Title)
                        </label>
                        <input
                          type="text"
                          value={currentShared.mainHeading || currentShared.title || ""}
                          onChange={(e) => {
                            updateCurrentShared("mainHeading", e.target.value);
                            updateCurrentShared("title", e.target.value);
                          }}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-bold focus:outline-none focus:border-emerald-600"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          Secondary Headline (e.g. "Every Day at 7 AM" / "Dairy Products")
                        </label>
                        <input
                          type="text"
                          value={currentShared.subHeading || currentShared.subtitle || ""}
                          onChange={(e) => {
                            updateCurrentShared("subHeading", e.target.value);
                            updateCurrentShared("subtitle", e.target.value);
                          }}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-bold focus:outline-none focus:border-emerald-600"
                        />
                      </div>
                    </div>

                    {/* Description Paragraph */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Slide Description / Value Proposition (Desktop & Tablets)
                      </label>
                      <textarea
                        rows={2}
                        value={currentShared.description || ""}
                        onChange={(e) => updateCurrentShared("description", e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-medium focus:outline-none focus:border-emerald-600"
                      />
                    </div>

                    {/* Mobile Subtitle */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Mobile Subtitle (Compact one-liner for mobile phone viewports)
                      </label>
                      <input
                        type="text"
                        value={currentShared.mobileSubtitle || ""}
                        onChange={(e) => updateCurrentShared("mobileSubtitle", e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-medium focus:outline-none focus:border-emerald-600"
                      />
                    </div>

                    {/* CTA Button Text & Link */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          CTA Button Text
                        </label>
                        <input
                          type="text"
                          value={currentShared.ctaText || currentShared.buttonText || ""}
                          onChange={(e) => {
                            updateCurrentShared("ctaText", e.target.value);
                            updateCurrentShared("buttonText", e.target.value);
                          }}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-semibold focus:outline-none focus:border-emerald-600"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          CTA Button Link
                        </label>
                        <input
                          type="text"
                          value={currentShared.ctaLink || currentShared.buttonLink || ""}
                          onChange={(e) => {
                            updateCurrentShared("ctaLink", e.target.value);
                            updateCurrentShared("buttonLink", e.target.value);
                          }}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-semibold focus:outline-none focus:border-emerald-600"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </AdminAccordion>
            );
          })()}
        </motion.div>
      )}

      {/* =========================================================================
          SECTION 2: FEATURED PRODUCTS
      ========================================================================= */}
      {activeTab === "featured" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <AdminAccordion
            title="Featured Products Section Settings"
            subtitle="Customize the titles, descriptions, and links for handpicked products"
            icon={<Star className="w-5 h-5 text-[#0756B5]" />}
            defaultExpanded={true}
          >
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Black Title Text
                  </label>
                  <input
                    type="text"
                    value={formData.featuredProductsSection?.titleBlack || "Featured"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        featuredProductsSection: { ...prev.featuredProductsSection, titleBlack: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-semibold focus:outline-none focus:border-[#0756B5]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Highlight Title Text (Blue)
                  </label>
                  <input
                    type="text"
                    value={formData.featuredProductsSection?.titleHighlight || "Products"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        featuredProductsSection: { ...prev.featuredProductsSection, titleHighlight: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-semibold focus:outline-none focus:border-[#0756B5]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Subtitle Description
                </label>
                <input
                  type="text"
                  value={formData.featuredProductsSection?.subtitle || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      featuredProductsSection: { ...prev.featuredProductsSection, subtitle: e.target.value },
                    }))
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-medium focus:outline-none focus:border-[#0756B5]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Top Right Link Text
                  </label>
                  <input
                    type="text"
                    value={formData.featuredProductsSection?.viewAllText || "View All Products"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        featuredProductsSection: { ...prev.featuredProductsSection, viewAllText: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-medium focus:outline-none focus:border-[#0756B5]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Top Right Destination Route
                  </label>
                  <input
                    type="text"
                    value={formData.featuredProductsSection?.viewAllLink || "/products"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        featuredProductsSection: { ...prev.featuredProductsSection, viewAllLink: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-medium focus:outline-none focus:border-[#0756B5]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-slate-700">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Bottom Catalog Button Text
                  </label>
                  <input
                    type="text"
                    value={formData.featuredProductsSection?.bottomCtaText || "Explore Complete Dairy Catalog"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        featuredProductsSection: { ...prev.featuredProductsSection, bottomCtaText: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-medium focus:outline-none focus:border-[#0756B5]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Bottom Catalog Button Link
                  </label>
                  <input
                    type="text"
                    value={formData.featuredProductsSection?.bottomCtaLink || "/products"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        featuredProductsSection: { ...prev.featuredProductsSection, bottomCtaLink: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-medium focus:outline-none focus:border-[#0756B5]"
                  />
                </div>
              </div>
            </div>
          </AdminAccordion>
        </motion.div>
      )}

      {/* =========================================================================
          SECTION 3: EXPLORE OUR CATEGORIES (CARDS WITH IMAGE & TEXT)
      ========================================================================= */}
      {activeTab === "categories" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <AdminAccordion
            title="Explore Our Categories Section & Category Cards"
            subtitle="Section headers plus individual image upload and description for each category card"
            icon={<Layers className="w-5 h-5 text-purple-500" />}
            defaultExpanded={true}
          >
            <div className="space-y-6">
              {/* Header texts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Black Heading Prefix (e.g. "Explore Our")
                  </label>
                  <input
                    type="text"
                    value={formData.exploreCategoriesSection?.titleBlack || "Explore Our"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        exploreCategoriesSection: { ...prev.exploreCategoriesSection, titleBlack: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-semibold focus:outline-none focus:border-[#0756B5]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Highlight Heading Text (e.g. "Categories")
                  </label>
                  <input
                    type="text"
                    value={formData.exploreCategoriesSection?.titleHighlight || "Categories"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        exploreCategoriesSection: { ...prev.exploreCategoriesSection, titleHighlight: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-semibold focus:outline-none focus:border-[#0756B5]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Subtitle Description
                  </label>
                  <input
                    type="text"
                    value={formData.exploreCategoriesSection?.subtitle || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        exploreCategoriesSection: { ...prev.exploreCategoriesSection, subtitle: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-medium focus:outline-none focus:border-[#0756B5]"
                  />
                </div>
              </div>

              {/* Category Cards List Header */}
              <div className="flex justify-between items-center">
                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                  Total Category Cards ({formData.homeCategoryCards.length})
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      homeCategoryCards: [
                        ...prev.homeCategoryCards,
                        { title: "New Category", description: "Farm fresh delight.", image: "", link: "/products" },
                      ],
                    }))
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-xs font-bold border border-purple-200 dark:border-purple-800 hover:bg-purple-100 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Category Card
                </button>
              </div>

              {/* Grid of Category Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.homeCategoryCards.map((cat, idx) => (
                  <div
                    key={`cat-editor-${idx}`}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 space-y-3 relative group shadow-xs"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          homeCategoryCards: prev.homeCategoryCards.filter((_, i) => i !== idx),
                        }))
                      }
                      className="absolute top-3 right-3 text-slate-400 hover:text-red-500 transition cursor-pointer p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40"
                      title="Delete Category Card"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {/* Single Image Upload for this category card */}
                    <ItemImageUploader
                      label={`Card #${idx + 1} Image`}
                      value={cat.image}
                      onChange={(img) =>
                        setFormData((prev) => {
                          const list = [...prev.homeCategoryCards];
                          list[idx] = { ...list[idx], image: img };
                          return { ...prev, homeCategoryCards: list };
                        })
                      }
                    />

                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-0.5">
                        Category Title (e.g. Milk, Paneer, Ghee, Curd)
                      </label>
                      <input
                        type="text"
                        value={cat.title || ""}
                        onChange={(e) =>
                          setFormData((prev) => {
                            const list = [...prev.homeCategoryCards];
                            list[idx] = { ...list[idx], title: e.target.value };
                            return { ...prev, homeCategoryCards: list };
                          })
                        }
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-0.5">
                        Card Description
                      </label>
                      <textarea
                        rows={2}
                        value={cat.description || ""}
                        onChange={(e) =>
                          setFormData((prev) => {
                            const list = [...prev.homeCategoryCards];
                            list[idx] = { ...list[idx], description: e.target.value };
                            return { ...prev, homeCategoryCards: list };
                          })
                        }
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 font-medium"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AdminAccordion>
        </motion.div>
      )}

      {/* =========================================================================
          SECTION 4: ABOUT BRAND PREVIEW CARD ("NEXT CARD")
      ========================================================================= */}
      {activeTab === "about-card" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <AdminAccordion
            title="Next Card: About Brand Preview (Rooted in Purity, Crafted with Care)"
            subtitle="Card image upload, story description, checkmark bullet highlights, and action buttons"
            icon={<Leaf className="w-5 h-5 text-emerald-500" />}
            defaultExpanded={true}
          >
            <div className="space-y-5">
              {/* Image Upload for this About Card */}
              <ItemImageUploader
                label="About Brand Card Showcase Image"
                value={formData.aboutBrandPreview?.image}
                fallbackDefault={dairyImgDefault}
                onChange={(img) =>
                  setFormData((prev) => ({
                    ...prev,
                    aboutBrandPreview: { ...prev.aboutBrandPreview, image: img },
                  }))
                }
              />

              {/* Headings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Black Heading Text (e.g. "Rooted in Purity,")
                  </label>
                  <input
                    type="text"
                    value={formData.aboutBrandPreview?.titleBlack || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        aboutBrandPreview: { ...prev.aboutBrandPreview, titleBlack: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-bold focus:outline-none focus:border-[#0756B5]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Highlight Heading Text (e.g. "Crafted with Care")
                  </label>
                  <input
                    type="text"
                    value={formData.aboutBrandPreview?.titleHighlight || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        aboutBrandPreview: { ...prev.aboutBrandPreview, titleHighlight: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-bold focus:outline-none focus:border-[#0756B5]"
                  />
                </div>
              </div>

              {/* Brand Story Description */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Brand Story Description Paragraph
                </label>
                <textarea
                  rows={3}
                  value={formData.aboutBrandPreview?.description || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      aboutBrandPreview: { ...prev.aboutBrandPreview, description: e.target.value },
                    }))
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-medium focus:outline-none focus:border-[#0756B5]"
                />
              </div>

              {/* 3 Checkmark Bullet Highlights */}
              <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Checkmark Bullet Highlights</span>
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        aboutBrandPreview: {
                          ...prev.aboutBrandPreview,
                          bullets: [...(prev.aboutBrandPreview?.bullets || []), "New brand trust highlight"],
                        },
                      }))
                    }
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
                  >
                    + Add Bullet
                  </button>
                </div>

                {(formData.aboutBrandPreview?.bullets || []).map((bullet, idx) => (
                  <div key={`bullet-${idx}`} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <input
                      type="text"
                      value={bullet}
                      onChange={(e) =>
                        setFormData((prev) => {
                          const bullets = [...(prev.aboutBrandPreview?.bullets || [])];
                          bullets[idx] = e.target.value;
                          return {
                            ...prev,
                            aboutBrandPreview: { ...prev.aboutBrandPreview, bullets },
                          };
                        })
                      }
                      className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          aboutBrandPreview: {
                            ...prev.aboutBrandPreview,
                            bullets: prev.aboutBrandPreview.bullets.filter((_, i) => i !== idx),
                          },
                        }))
                      }
                      className="text-slate-400 hover:text-red-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Button & Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-slate-700">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Action Button Text
                  </label>
                  <input
                    type="text"
                    value={formData.aboutBrandPreview?.buttonText || "Learn More About Our Story"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        aboutBrandPreview: { ...prev.aboutBrandPreview, buttonText: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-semibold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Action Button Link
                  </label>
                  <input
                    type="text"
                    value={formData.aboutBrandPreview?.buttonLink || "/about"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        aboutBrandPreview: { ...prev.aboutBrandPreview, buttonLink: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-semibold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Card Floating Bottom Left Badge
                  </label>
                  <input
                    type="text"
                    value={formData.aboutBrandPreview?.bottomBadgeLeft || "Sourced Fresh Daily"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        aboutBrandPreview: { ...prev.aboutBrandPreview, bottomBadgeLeft: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Card Floating Bottom Right Badge
                  </label>
                  <input
                    type="text"
                    value={formData.aboutBrandPreview?.bottomBadgeRight || "✓ 100% Certified Pure"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        aboutBrandPreview: { ...prev.aboutBrandPreview, bottomBadgeRight: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-medium"
                  />
                </div>
              </div>
            </div>
          </AdminAccordion>
        </motion.div>
      )}

      {/* =========================================================================
          SECTION 5: WHY CHOOSE NATURAL MILK DAIRY (6 BENEFIT CARDS)
      ========================================================================= */}
      {activeTab === "why-choose" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <AdminAccordion
            title="Why Choose Natural Milk Dairy (6 Benefit Cards)"
            subtitle="Section title, subtitle, and 6 benefit cards with icon/image upload"
            icon={<ShieldCheck className="w-5 h-5 text-[#075C2A]" />}
            defaultExpanded={true}
          >
            <div className="space-y-6">
              {/* Header texts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Black Heading Prefix (e.g. "Why Choose")
                  </label>
                  <input
                    type="text"
                    value={formData.whyChooseUs?.titleBlack || "Why Choose"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        whyChooseUs: { ...prev.whyChooseUs, titleBlack: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-semibold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Highlight Heading Text (e.g. "Natural Milk Dairy")
                  </label>
                  <input
                    type="text"
                    value={formData.whyChooseUs?.titleHighlight || "Natural Milk Dairy"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        whyChooseUs: { ...prev.whyChooseUs, titleHighlight: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-semibold"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Subtitle Description
                  </label>
                  <input
                    type="text"
                    value={formData.whyChooseUs?.subtitle || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        whyChooseUs: { ...prev.whyChooseUs, subtitle: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-medium"
                  />
                </div>
              </div>

              {/* 6 Benefit Cards */}
              <div className="flex justify-between items-center">
                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                  Benefit Cards ({formData.whyChooseUs?.benefits?.length || 0})
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      whyChooseUs: {
                        ...prev.whyChooseUs,
                        benefits: [
                          ...(prev.whyChooseUs?.benefits || []),
                          { title: "New Benefit", description: "High quality standards.", color: "#0756B5", image: "", iconName: "Droplets" },
                        ],
                      },
                    }))
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-[#075C2A] dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Benefit Card
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(formData.whyChooseUs?.benefits || []).map((b, idx) => (
                  <div
                    key={`benefit-${idx}`}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 space-y-3 relative shadow-xs"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          whyChooseUs: {
                            ...prev.whyChooseUs,
                            benefits: prev.whyChooseUs.benefits.filter((_, i) => i !== idx),
                          },
                        }))
                      }
                      className="absolute top-3 right-3 text-slate-400 hover:text-red-500 p-1"
                      title="Remove Benefit"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {/* Single image/icon upload for this card */}
                    <ItemImageUploader
                      label={`Card #${idx + 1} Custom Icon / Image`}
                      value={b.image}
                      onChange={(img) =>
                        setFormData((prev) => {
                          const benefits = [...(prev.whyChooseUs?.benefits || [])];
                          benefits[idx] = { ...benefits[idx], image: img };
                          return { ...prev, whyChooseUs: { ...prev.whyChooseUs, benefits } };
                        })
                      }
                    />

                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-0.5">Benefit Title</label>
                      <input
                        type="text"
                        value={b.title || ""}
                        onChange={(e) =>
                          setFormData((prev) => {
                            const benefits = [...(prev.whyChooseUs?.benefits || [])];
                            benefits[idx] = { ...benefits[idx], title: e.target.value };
                            return { ...prev, whyChooseUs: { ...prev.whyChooseUs, benefits } };
                          })
                        }
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-0.5">Description</label>
                      <textarea
                        rows={2}
                        value={b.description || ""}
                        onChange={(e) =>
                          setFormData((prev) => {
                            const benefits = [...(prev.whyChooseUs?.benefits || [])];
                            benefits[idx] = { ...benefits[idx], description: e.target.value };
                            return { ...prev, whyChooseUs: { ...prev.whyChooseUs, benefits } };
                          })
                        }
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 font-medium"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AdminAccordion>
        </motion.div>
      )}

      {/* =========================================================================
          SECTION 6: FARM TO TABLE WITHIN HOURS (4 STEP CARDS)
      ========================================================================= */}
      {activeTab === "farm-table" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <AdminAccordion
            title="Farm to Table Within Hours (4 Journey Step Cards)"
            subtitle="Section headings plus individual step photos, titles, badges, and descriptions"
            icon={<Truck className="w-5 h-5 text-sky-500" />}
            defaultExpanded={true}
          >
            <div className="space-y-6">
              {/* Headings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Black Heading Prefix (e.g. "Farm to Table,")
                  </label>
                  <input
                    type="text"
                    value={formData.farmToTable?.titleBlack || "Farm to Table,"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        farmToTable: { ...prev.farmToTable, titleBlack: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-semibold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Highlight Heading Text (e.g. "Within Hours")
                  </label>
                  <input
                    type="text"
                    value={formData.farmToTable?.titleHighlight || "Within Hours"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        farmToTable: { ...prev.farmToTable, titleHighlight: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-semibold"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Subtitle Description
                  </label>
                  <input
                    type="text"
                    value={formData.farmToTable?.subtitle || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        farmToTable: { ...prev.farmToTable, subtitle: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-medium"
                  />
                </div>
              </div>

              {/* 4 Steps */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {(formData.farmToTable?.steps || []).map((s, idx) => {
                  const fallbackStepImg =
                    idx === 0
                      ? step1ImgDefault
                      : idx === 1
                      ? step2ImgDefault
                      : idx === 2
                      ? step3ImgDefault
                      : step4ImgDefault;

                  return (
                    <div
                      key={`step-${idx}`}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 space-y-3 relative shadow-xs"
                    >
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300">
                        Step {s.step || `0${idx + 1}`}
                      </span>

                      {/* Single photo upload for this step */}
                      <ItemImageUploader
                        label={`Step ${s.step || idx + 1} Photo`}
                        value={s.image}
                        fallbackDefault={fallbackStepImg}
                        onChange={(img) =>
                          setFormData((prev) => {
                            const steps = [...(prev.farmToTable?.steps || [])];
                            steps[idx] = { ...steps[idx], image: img };
                            return { ...prev, farmToTable: { ...prev.farmToTable, steps } };
                          })
                        }
                      />

                      <div>
                        <label className="text-[11px] font-bold text-slate-500 block mb-0.5">Step Title</label>
                        <input
                          type="text"
                          value={s.title || ""}
                          onChange={(e) =>
                            setFormData((prev) => {
                              const steps = [...(prev.farmToTable?.steps || [])];
                              steps[idx] = { ...steps[idx], title: e.target.value };
                              return { ...prev, farmToTable: { ...prev.farmToTable, steps } };
                            })
                          }
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 font-bold"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-500 block mb-0.5">Badge Tag</label>
                        <input
                          type="text"
                          value={s.badge || ""}
                          onChange={(e) =>
                            setFormData((prev) => {
                              const steps = [...(prev.farmToTable?.steps || [])];
                              steps[idx] = { ...steps[idx], badge: e.target.value };
                              return { ...prev, farmToTable: { ...prev.farmToTable, steps } };
                            })
                          }
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 font-semibold uppercase"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-500 block mb-0.5">Description</label>
                        <textarea
                          rows={2}
                          value={s.description || ""}
                          onChange={(e) =>
                            setFormData((prev) => {
                              const steps = [...(prev.farmToTable?.steps || [])];
                              steps[idx] = { ...steps[idx], description: e.target.value };
                              return { ...prev, farmToTable: { ...prev.farmToTable, steps } };
                            })
                          }
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 font-medium"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </AdminAccordion>
        </motion.div>
      )}

      {/* =========================================================================
          SECTION 7: LOVED BY "NUM" FAMILIES & REVIEWS
      ========================================================================= */}
      {activeTab === "trust" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <AdminAccordion
            title="Loved by 'num' Families & Customer Reviews"
            subtitle="Dynamic families count, trust metrics, customer review cards with avatar upload, and certifications"
            icon={<Heart className="w-5 h-5 text-rose-500" />}
            defaultExpanded={true}
          >
            <div className="space-y-6">
              {/* Dynamic Loved By "num" Families Headline Settings */}
              <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/50 space-y-4">
                <h4 className="text-xs font-black uppercase text-rose-700 dark:text-rose-300 tracking-wider">
                  Headline & Dynamic Family Count
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Black Prefix (e.g. "Loved by Over")
                    </label>
                    <input
                      type="text"
                      value={formData.customerTrust?.titlePrefix || "Loved by Over"}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          customerTrust: { ...prev.customerTrust, titlePrefix: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Highlight "num" Families Text (e.g. "50,000+ Families")
                    </label>
                    <input
                      type="text"
                      value={formData.customerTrust?.familiesCount || "50,000+ Families"}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          customerTrust: { ...prev.customerTrust, familiesCount: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-black text-[#0756B5] dark:text-blue-400"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Subtitle Description
                    </label>
                    <input
                      type="text"
                      value={formData.customerTrust?.subtitle || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          customerTrust: { ...prev.customerTrust, subtitle: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* 4 Trust Metrics */}
              <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 block">
                  Trust Metric Numbers (4 Badges)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {(formData.customerTrust?.metrics || []).map((m, idx) => (
                    <div
                      key={`metric-edit-${idx}`}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 space-y-2"
                    >
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block">Value</label>
                        <input
                          type="text"
                          value={m.value || ""}
                          onChange={(e) =>
                            setFormData((prev) => {
                              const metrics = [...(prev.customerTrust?.metrics || [])];
                              metrics[idx] = { ...metrics[idx], value: e.target.value };
                              return { ...prev, customerTrust: { ...prev.customerTrust, metrics } };
                            })
                          }
                          className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 font-black"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block">Label</label>
                        <input
                          type="text"
                          value={m.label || ""}
                          onChange={(e) =>
                            setFormData((prev) => {
                              const metrics = [...(prev.customerTrust?.metrics || [])];
                              metrics[idx] = { ...metrics[idx], label: e.target.value };
                              return { ...prev, customerTrust: { ...prev.customerTrust, metrics } };
                            })
                          }
                          className="w-full px-2 py-1 text-[11px] rounded border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 font-medium"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer Testimonial Cards */}
              <div className="space-y-4 pt-3 border-t border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                    Customer Testimonial Cards ({formData.customerTrust?.reviews?.length || 0})
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        customerTrust: {
                          ...prev.customerTrust,
                          reviews: [
                            ...(prev.customerTrust?.reviews || []),
                            {
                              name: "Happy Customer",
                              location: "Nashik",
                              verified: true,
                              rating: 5,
                              title: "Delicious and Pure!",
                              comment: "Best daily milk we ever tried.",
                              product: "Fresh Cow Milk",
                              avatar: "",
                            },
                          ],
                        },
                      }))
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-bold border border-rose-200 dark:border-rose-800 hover:bg-rose-100 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Customer Review
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(formData.customerTrust?.reviews || []).map((rev, idx) => (
                    <div
                      key={`rev-${idx}`}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 space-y-3 relative shadow-xs"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            customerTrust: {
                              ...prev.customerTrust,
                              reviews: prev.customerTrust.reviews.filter((_, i) => i !== idx),
                            },
                          }))
                        }
                        className="absolute top-3 right-3 text-slate-400 hover:text-red-500 p-1"
                        title="Delete Review"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      {/* Reviewer Avatar Image Upload */}
                      <ItemImageUploader
                        label={`Reviewer #${idx + 1} Avatar`}
                        value={rev.avatar}
                        onChange={(img) =>
                          setFormData((prev) => {
                            const reviews = [...(prev.customerTrust?.reviews || [])];
                            reviews[idx] = { ...reviews[idx], avatar: img };
                            return { ...prev, customerTrust: { ...prev.customerTrust, reviews } };
                          })
                        }
                      />

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Name</label>
                          <input
                            type="text"
                            value={rev.name || ""}
                            onChange={(e) =>
                              setFormData((prev) => {
                                const reviews = [...(prev.customerTrust?.reviews || [])];
                                reviews[idx] = { ...reviews[idx], name: e.target.value };
                                return { ...prev, customerTrust: { ...prev.customerTrust, reviews } };
                              })
                            }
                            className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Location</label>
                          <input
                            type="text"
                            value={rev.location || ""}
                            onChange={(e) =>
                              setFormData((prev) => {
                                const reviews = [...(prev.customerTrust?.reviews || [])];
                                reviews[idx] = { ...reviews[idx], location: e.target.value };
                                return { ...prev, customerTrust: { ...prev.customerTrust, reviews } };
                              })
                            }
                            className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 font-medium"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Review Headline</label>
                        <input
                          type="text"
                          value={rev.title || ""}
                          onChange={(e) =>
                            setFormData((prev) => {
                              const reviews = [...(prev.customerTrust?.reviews || [])];
                              reviews[idx] = { ...reviews[idx], title: e.target.value };
                              return { ...prev, customerTrust: { ...prev.customerTrust, reviews } };
                            })
                          }
                          className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 font-semibold"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Customer Comment</label>
                        <textarea
                          rows={2}
                          value={rev.comment || ""}
                          onChange={(e) =>
                            setFormData((prev) => {
                              const reviews = [...(prev.customerTrust?.reviews || [])];
                              reviews[idx] = { ...reviews[idx], comment: e.target.value };
                              return { ...prev, customerTrust: { ...prev.customerTrust, reviews } };
                            })
                          }
                          className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 font-medium"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </AdminAccordion>
        </motion.div>
      )}

      {/* =========================================================================
          SECTION 8: LAST CARD (SHOP PRODUCTS, CONTACT US, WHATSAPP CTA)
      ========================================================================= */}
      {activeTab === "last-cta" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <AdminAccordion
            title="Last Card: Shop Products, Contact Us & WhatsApp CTA"
            subtitle="Configure CTA headline, shop button, contact button, WhatsApp chat setup, and quick info strip"
            icon={<MessageCircle className="w-5 h-5 text-[#25D366]" />}
            defaultExpanded={true}
          >
            <div className="space-y-5">
              {/* Optional background banner */}
              <ItemImageUploader
                label="Custom Background Image / Pattern (Optional)"
                value={formData.homeContactCta?.bgImage}
                onChange={(img) =>
                  setFormData((prev) => ({
                    ...prev,
                    homeContactCta: { ...prev.homeContactCta, bgImage: img },
                  }))
                }
              />

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  CTA Card Main Headline
                </label>
                <input
                  type="text"
                  value={formData.homeContactCta?.headline || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      homeContactCta: { ...prev.homeContactCta, headline: e.target.value },
                    }))
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-extrabold text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Supporting Description Paragraph
                </label>
                <textarea
                  rows={2}
                  value={formData.homeContactCta?.description || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      homeContactCta: { ...prev.homeContactCta, description: e.target.value },
                    }))
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-medium"
                />
              </div>

              {/* 3 Buttons: Shop, Contact, WhatsApp */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-200 dark:border-slate-700">
                {/* Shop Button */}
                <div className="p-3.5 rounded-xl border border-blue-200 dark:border-slate-700 bg-blue-50/50 dark:bg-slate-800 space-y-2">
                  <span className="text-[11px] font-black text-[#0756B5] dark:text-blue-400 block uppercase">
                    1. Shop Button
                  </span>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block">Text</label>
                    <input
                      type="text"
                      value={formData.homeContactCta?.shopButtonText || "Shop Products Now"}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          homeContactCta: { ...prev.homeContactCta, shopButtonText: e.target.value },
                        }))
                      }
                      className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block">Link</label>
                    <input
                      type="text"
                      value={formData.homeContactCta?.shopButtonLink || "/products"}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          homeContactCta: { ...prev.homeContactCta, shopButtonLink: e.target.value },
                        }))
                      }
                      className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 font-medium"
                    />
                  </div>
                </div>

                {/* Contact Us Button */}
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 space-y-2">
                  <span className="text-[11px] font-black text-slate-700 dark:text-slate-300 block uppercase">
                    2. Contact Button
                  </span>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block">Text</label>
                    <input
                      type="text"
                      value={formData.homeContactCta?.contactButtonText || "Contact Us"}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          homeContactCta: { ...prev.homeContactCta, contactButtonText: e.target.value },
                        }))
                      }
                      className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block">Link</label>
                    <input
                      type="text"
                      value={formData.homeContactCta?.contactButtonLink || "/contact-us"}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          homeContactCta: { ...prev.homeContactCta, contactButtonLink: e.target.value },
                        }))
                      }
                      className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 font-medium"
                    />
                  </div>
                </div>

                {/* WhatsApp Button */}
                <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-slate-700 bg-emerald-50/50 dark:bg-slate-800 space-y-2">
                  <span className="text-[11px] font-black text-[#25D366] block uppercase">
                    3. WhatsApp Button
                  </span>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block">Button Text</label>
                    <input
                      type="text"
                      value={formData.homeContactCta?.whatsappText || "WhatsApp Us"}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          homeContactCta: { ...prev.homeContactCta, whatsappText: e.target.value },
                        }))
                      }
                      className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block">WhatsApp Phone Number</label>
                    <input
                      type="text"
                      value={formData.homeContactCta?.whatsappPhone || "919490644434"}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          homeContactCta: { ...prev.homeContactCta, whatsappPhone: e.target.value },
                        }))
                      }
                      className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block">Pre-filled Chat Message</label>
                    <input
                      type="text"
                      value={formData.homeContactCta?.whatsappMessage || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          homeContactCta: { ...prev.homeContactCta, whatsappMessage: e.target.value },
                        }))
                      }
                      className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Quick Info Strip */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-200 dark:border-slate-700">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-[#0756B5]" /> Support Phone
                  </label>
                  <input
                    type="text"
                    value={formData.homeContactCta?.supportPhone || "+91 94906 44434"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        homeContactCta: { ...prev.homeContactCta, supportPhone: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-500" /> Working Hours
                  </label>
                  <input
                    type="text"
                    value={formData.homeContactCta?.workingHours || "Everyday, 5:00 AM - 12:00 PM"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        homeContactCta: { ...prev.homeContactCta, workingHours: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-500" /> Location / City
                  </label>
                  <input
                    type="text"
                    value={formData.homeContactCta?.locationText || "Nashik, Maharashtra"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        homeContactCta: { ...prev.homeContactCta, locationText: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-medium"
                  />
                </div>
              </div>
            </div>
          </AdminAccordion>
        </motion.div>
      )}

      {/* =========================================================================
          SECTION 9: GENERAL STORE BRANDING
      ========================================================================= */}
      {activeTab === "branding" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <AdminAccordion
            title="Store Branding & Metadata"
            subtitle="Company name, tagline, and store description"
            icon={<FileText className="w-5 h-5 text-slate-500" />}
            defaultExpanded={true}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Company / Dairy Brand Name
                  </label>
                  <input
                    type="text"
                    value={formData.companyName || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, companyName: e.target.value }))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-semibold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Brand Tagline
                  </label>
                  <input
                    type="text"
                    value={formData.companyTagline || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, companyTagline: e.target.value }))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-medium"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Company Description
                </label>
                <textarea
                  rows={3}
                  value={formData.companyDescription || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, companyDescription: e.target.value }))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-medium"
                />
              </div>
            </div>
          </AdminAccordion>
        </motion.div>
      )}

      {/* =========================================================================
          SECTION 10: FAQS MANAGEMENT
      ========================================================================= */}
      {activeTab === "faqs" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Frequently Asked Questions ({(formData.faqs || []).length})
            </h2>
            <button
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  faqs: [...(prev.faqs || []), { question: "New FAQ Question?", answer: "FAQ answer goes here." }],
                }))
              }
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-[#075C2A] dark:text-emerald-300 font-bold text-xs cursor-pointer hover:bg-emerald-100"
            >
              <Plus className="w-3.5 h-3.5" /> Add Question
            </button>
          </div>

          <div className="space-y-4">
            {(formData.faqs || []).map((faq, idx) => (
              <div
                key={`faq-${idx}`}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 space-y-3 relative shadow-xs"
              >
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      faqs: prev.faqs.filter((_, i) => i !== idx),
                    }))
                  }
                  className="absolute top-3 right-3 text-slate-400 hover:text-red-500 transition"
                  title="Remove FAQ"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-0.5">Question</label>
                  <input
                    type="text"
                    value={faq.question || ""}
                    onChange={(e) =>
                      setFormData((prev) => {
                        const faqs = [...prev.faqs];
                        faqs[idx] = { ...faqs[idx], question: e.target.value };
                        return { ...prev, faqs };
                      })
                    }
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 font-bold"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-0.5">Answer</label>
                  <textarea
                    rows={2}
                    value={faq.answer || ""}
                    onChange={(e) =>
                      setFormData((prev) => {
                        const faqs = [...prev.faqs];
                        faqs[idx] = { ...faqs[idx], answer: e.target.value };
                        return { ...prev, faqs };
                      })
                    }
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 font-medium"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

