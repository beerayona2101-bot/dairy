import React, { useState, useEffect, useContext, useCallback } from "react";
import { Link } from "react-router-dom";
import { PageContentContext } from "../../context/PageContentProvider";
import { updatePageContentService } from "../../services/pageContentService";
import { socket } from "../../socket/socket";
import { useSnackbar } from "notistack";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
  Image as ImageIcon,
  Save,
  Plus,
  Trash2,
  HelpCircle,
  Sparkles,
  Layers,
  Layout as LayoutIcon,
  Upload,
  FileText,
  Info,
  PhoneCall,
  MapPin,
  Mail,
  Phone,
  MessageSquare,
  CreditCard,
  Eye,
  EyeOff,
  GripVertical,
  Tag,
  DollarSign,
  Percent,
  ToggleLeft,
  ToggleRight,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { convertToBase64 } from "../../utils/InventoryHelpers/imageBase64Converter";
import homeHeroBgDefault from "../../assets/hero_carousel_slide_1.png";
import bannerSlide2Default from "../../assets/hero_carousel_slide_2.png";
import bannerSlide3Default from "../../assets/hero_carousel_slide_3.png";
import { products, faqs as defaultFaqs, offerings as defaultOfferings } from "../../data/products";
import AdminAccordion from "../../components/AdminComponents/Common/AdminAccordion";
import BackButton from "../../components/Common/BackButton";

const defaultHeroCarouselSlides = [
  {
    image: homeHeroBgDefault,
    title: "Welcome to Natural Milk Dairy",
    subtitle: "Experience 100% unadulterated farm-fresh milk, ghee, paneer, and sweets sourced directly from ethical farms.",
    buttonText: "Explore Products",
    buttonLink: "/products",
  },
  {
    image: bannerSlide2Default,
    title: "100% Pure, Organic & Farm-Fresh A2 Milk",
    subtitle: "Delivered fresh to your doorstep every morning with zero preservatives and pristine hygiene.",
    buttonText: "Order Fresh Milk",
    buttonLink: "/products",
  },
  {
    image: bannerSlide3Default,
    title: "Traditional Ghee, Artisanal Paneer & Sweets",
    subtitle: "Crafted with pure whole milk and traditional recipes for authentic nutrition, rich aroma and taste.",
    buttonText: "Shop Dairy Products",
    buttonLink: "/products",
  },
];

export default function PageContentManager() {
  const { enqueueSnackbar } = useSnackbar();
  const { pageContent, refreshPageContent } = useContext(PageContentContext);
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("branding");
  const [saving, setSaving] = useState(false);
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);

  const [formData, setFormData] = useState({
    companyName: "",
    companyTagline: "",
    companyDescription: "",
    heroBannerImage: "",
    heroCarouselSlides: defaultHeroCarouselSlides,
    landingHeroImage: "",
    homeCategoryCards: [],
    landingShowcaseCards: [],
    goodnessOfferings: [],
    faqs: [],
    showcase3DCards: [],
    aboutUs: {
      badgeText: "✨ 100% PURE & FARM-FRESH DAIRY",
      title: "About Natural Milk Dairy",
      subtitle: "Delivering unadulterated farm-fresh milk, pure ghee, paneer, and daily kitchen essentials straight to thousands of happy families every morning by 7 AM.",
      journeyTitle: "WHO WE ARE",
      journeySubtitle: "Our Journey & Mission",
      stats: [
        { value: "100%", label: "Pure & Fresh Milk", icon: "🥛", color: "#477A50" },
        { value: "7 AM", label: "Doorstep Delivery", icon: "🚚", color: "#00ACC1" },
        { value: "100+", label: "Quality Tests", icon: "🔬", color: "#075C2A" },
        { value: "50,000+", label: "Happy Families", icon: "❤️", color: "#FF7675" },
      ],
    },
    contactUs: {
      badgeText: "GET IN TOUCH",
      title: "Contact Information",
      supportText: "We are here to assist you. Please fill out the form to get in touch or ask your query directly.",
      address: "Shed no. A-31, Natural Milk Dairy, NAVNATH NAGAR, MIDC Ambad, Nashik, Maharashtra - 422010",
      phone: "+91 94906 44434",
      email: "beerayona143@gmail.com",
      whatsappNumber: "919490644434",
      googleMaps: "https://maps.google.com/?q=Natural+Milk+Dairy+Ambad+Nashik",
    },
  });

  const defaultHomeCards = products.slice(0, 6).map((p) => ({
    title: p.title,
    image: p.image,
  }));

  const defaultShowcaseCards = products.slice(0, 6).map((p) => ({
    title: p.title,
    description: p.description,
    image: p.image,
    features: p.features || [],
  }));


  useEffect(() => {
    if (pageContent) {
      setFormData({
        companyName: pageContent.companyName || "Natural Milk Dairy And Daily Needs",
        companyTagline: pageContent.companyTagline || "",
        companyDescription: pageContent.companyDescription || "",
        heroBannerImage: pageContent.heroBannerImage || "",
        heroCarouselSlides:
          Array.isArray(pageContent.heroCarouselSlides) && pageContent.heroCarouselSlides.length > 0
            ? [0, 1, 2].map((i) => ({
                image: pageContent.heroCarouselSlides[i]?.image || defaultHeroCarouselSlides[i].image,
                title: pageContent.heroCarouselSlides[i]?.title !== undefined ? pageContent.heroCarouselSlides[i].title : defaultHeroCarouselSlides[i].title,
                subtitle: pageContent.heroCarouselSlides[i]?.subtitle !== undefined ? pageContent.heroCarouselSlides[i].subtitle : defaultHeroCarouselSlides[i].subtitle,
                buttonText: pageContent.heroCarouselSlides[i]?.buttonText || defaultHeroCarouselSlides[i].buttonText,
                buttonLink: pageContent.heroCarouselSlides[i]?.buttonLink || defaultHeroCarouselSlides[i].buttonLink,
              }))
            : defaultHeroCarouselSlides,
        landingHeroImage: pageContent.landingHeroImage || "",
        homeCategoryCards: (pageContent.homeCategoryCards && pageContent.homeCategoryCards.length > 0)
          ? pageContent.homeCategoryCards
          : defaultHomeCards,
        landingShowcaseCards: (pageContent.landingShowcaseCards && pageContent.landingShowcaseCards.length > 0)
          ? pageContent.landingShowcaseCards
          : defaultShowcaseCards,
        goodnessOfferings: (pageContent.goodnessOfferings && pageContent.goodnessOfferings.length > 0)
          ? pageContent.goodnessOfferings
          : defaultOfferings,
        faqs: (pageContent.faqs && pageContent.faqs.length > 0)
          ? pageContent.faqs
          : defaultFaqs,
        showcase3DCards: pageContent.showcase3DCards || [],
        aboutUs: pageContent.aboutUs || {
          badgeText: "✨ 100% PURE & FARM-FRESH DAIRY",
          title: "About Natural Milk Dairy",
          subtitle: "Delivering unadulterated farm-fresh milk, pure ghee, paneer, and daily kitchen essentials straight to thousands of happy families every morning by 7 AM.",
          journeyTitle: "WHO WE ARE",
          journeySubtitle: "Our Journey & Mission",
          stats: [
            { value: "100%", label: "Pure & Fresh Milk", icon: "🥛", color: "#477A50" },
            { value: "7 AM", label: "Doorstep Delivery", icon: "🚚", color: "#00ACC1" },
            { value: "100+", label: "Quality Tests", icon: "🔬", color: "#075C2A" },
            { value: "50,000+", label: "Happy Families", icon: "❤️", color: "#FF7675" },
          ],
        },
        contactUs: pageContent.contactUs || {
          badgeText: "GET IN TOUCH",
          title: "Contact Information",
          supportText: "We are here to assist you. Please fill out the form to get in touch or ask your query directly.",
          address: "Shed no. A-31, Natural Milk Dairy, NAVNATH NAGAR, MIDC Ambad, Nashik, Maharashtra - 422010",
          phone: "+91 94906 44434",
          email: "beerayona143@gmail.com",
          whatsappNumber: "919490644434",
          googleMaps: "https://maps.google.com/?q=Natural+Milk+Dairy+Ambad+Nashik",
        },
      });
    }
  }, [pageContent]);

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAboutUsChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      aboutUs: { ...prev.aboutUs, [field]: value },
    }));
  };

  const handleAboutStatChange = (index, field, value) => {
    setFormData((prev) => {
      const stats = [...(prev.aboutUs?.stats || [])];
      stats[index] = { ...stats[index], [field]: value };
      return {
        ...prev,
        aboutUs: { ...prev.aboutUs, stats },
      };
    });
  };

  const addAboutStat = () => {
    setFormData((prev) => ({
      ...prev,
      aboutUs: {
        ...prev.aboutUs,
        stats: [
          ...(prev.aboutUs?.stats || []),
          { value: "100%", label: "New Stat Badge", icon: "⭐", color: "#1E88E5" },
        ],
      },
    }));
  };

  const removeAboutStat = (index) => {
    setFormData((prev) => ({
      ...prev,
      aboutUs: {
        ...prev.aboutUs,
        stats: (prev.aboutUs?.stats || []).filter((_, i) => i !== index),
      },
    }));
  };

  const handleContactUsChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      contactUs: { ...prev.contactUs, [field]: value },
    }));
  };

  const handleHeroBannerUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const base64 = await convertToBase64(file);
      setFormData((prev) => ({ ...prev, heroBannerImage: base64 }));
    }
  };

  // --- HERO CAROUSEL (3 SLIDES) HANDLERS ---
  const handleHeroSlideChange = (index, field, value) => {
    setFormData((prev) => {
      const existing =
        Array.isArray(prev.heroCarouselSlides) && prev.heroCarouselSlides.length >= 3
          ? [...prev.heroCarouselSlides]
          : [...defaultHeroCarouselSlides];
      existing[index] = { ...existing[index], [field]: value };
      return {
        ...prev,
        heroCarouselSlides: existing,
        ...(index === 0 && field === "image" ? { heroBannerImage: value } : {}),
      };
    });
  };

  const handleHeroSlideImageUpload = async (index, file) => {
    if (file) {
      const base64 = await convertToBase64(file);
      handleHeroSlideChange(index, "image", base64);
    }
  };

  const handleResetSlide = (index) => {
    const defaultSlide = defaultHeroCarouselSlides[index];
    setFormData((prev) => {
      const existing =
        Array.isArray(prev.heroCarouselSlides) && prev.heroCarouselSlides.length >= 3
          ? [...prev.heroCarouselSlides]
          : [...defaultHeroCarouselSlides];
      existing[index] = { ...defaultSlide };
      return {
        ...prev,
        heroCarouselSlides: existing,
        ...(index === 0 ? { heroBannerImage: defaultSlide.image } : {}),
      };
    });
  };

  // --- GOODNESS OFFERINGS HANDLERS ---
  const handleGoodnessChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.goodnessOfferings];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, goodnessOfferings: updated };
    });
  };

  const handleGoodnessImageUpload = async (index, file) => {
    if (file) {
      const base64 = await convertToBase64(file);
      handleGoodnessChange(index, "image", base64);
    }
  };

  const addGoodnessOffering = () => {
    setFormData((prev) => ({
      ...prev,
      goodnessOfferings: [
        ...prev.goodnessOfferings,
        {
          title: "Pure Quality Assured",
          description: "Sourced with strict quality standards.",
          image: "https://res.cloudinary.com/dyahibuzy/image/upload/v1750157383/freshness_gmygrg.jpg",
        },
      ],
    }));
  };

  const removeGoodnessOffering = (index) => {
    setFormData((prev) => ({
      ...prev,
      goodnessOfferings: prev.goodnessOfferings.filter((_, i) => i !== index),
    }));
  };

  // --- FAQ HANDLERS ---
  const handleFaqChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.faqs];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, faqs: updated };
    });
  };

  const addFaq = () => {
    setFormData((prev) => ({
      ...prev,
      faqs: [
        ...prev.faqs,
        {
          question: "New FAQ Question?",
          answer: "Answer to the new question.",
        },
      ],
    }));
  };

  const removeFaq = (index) => {
    setFormData((prev) => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index),
    }));
  };


  // --- SAVE CONTENT ---
  const handleSave = async () => {
    setSaving(true);
    try {
      const { _id, __v, createdAt, updatedAt, ...cleanPayload } = formData;
      const res = await updatePageContentService(cleanPayload);
      if (res?.success) {
        enqueueSnackbar("Page content saved & updated live across the app!", { variant: "success" });

        // Update formData with server-resolved content (base64 → Cloudinary URLs)
        if (res.pageContent) {
          setFormData((prev) => ({
            ...prev,
            ...res.pageContent,
            // Strip Mongoose internal fields
            _id: undefined,
            __v: undefined,
          }));
        }

        // Immediately push to all live clients via WebSocket
        socket.emit("page-content:update", { pageContent: res.pageContent });

        // Force-invalidate React Query cache so any refetch gets fresh data
        queryClient.invalidateQueries({ queryKey: ["pageContent"] });
        queryClient.setQueryData(["pageContent"], res.pageContent);

        // Trigger context refresh
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

  return (
    <div className="p-4 md:p-6 space-y-6 bg-gray-50 dark:bg-gray-900/50 min-h-screen text-gray-900 dark:text-gray-100">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-800 p-4 md:p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-start sm:items-center gap-3">
          <BackButton fallbackPath="/admin/dashboard" className="shrink-0 mt-0.5 sm:mt-0" />
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold flex items-center gap-2 text-[#075C2A] dark:text-emerald-400">
              <LayoutIcon className="w-6 h-6" /> Page Content & Store Info Manager
            </h1>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1 hidden sm:block">
              Customize Home Page banners, About Us content, Contact Us details, Why Choose Us cards, and FAQs.
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#075C2A] hover:bg-[#064e23] text-white font-bold text-sm shadow-md transition hover:scale-105 cursor-pointer disabled:opacity-50"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{saving ? "Saving Changes..." : "Save All Changes"}</span>
        </button>
      </div>

      {/* Category Management Info Banner */}
      <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 p-4 rounded-2xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Layers className="w-5 h-5 text-[#075C2A] dark:text-emerald-400 shrink-0" />
          <p className="text-xs md:text-sm text-gray-700 dark:text-gray-300 font-medium">
            <strong className="text-[#075C2A] dark:text-emerald-300">Category Showcase Cards:</strong> Are managed under <strong className="underline">Admin → Inventory → Total Categories</strong>.
          </p>
        </div>
        <Link
          to="/admin/inventory"
          className="px-3.5 py-1.5 rounded-xl bg-[#075C2A] hover:bg-[#064e23] text-white text-xs font-bold shadow-xs whitespace-nowrap"
        >
          Go to Inventory →
        </Link>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { id: "branding", label: "Banners & Branding", icon: <ImageIcon className="w-4 h-4" /> },
          { id: "about", label: "About Us Page", icon: <Info className="w-4 h-4" /> },
          { id: "contact", label: "Contact Us Page", icon: <PhoneCall className="w-4 h-4" /> },
          { id: "goodness", label: "Why Choose Us Cards", icon: <Sparkles className="w-4 h-4" /> },
          { id: "faqs", label: "FAQs Management", icon: <HelpCircle className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm transition cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-[#075C2A] text-white shadow-sm"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: BANNERS & BRANDING */}
      {activeTab === "branding" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <AdminAccordion
            title="Company Info & Tagline"
            subtitle="Store name, brand slogan, and description"
            icon={<FileText className="w-5 h-5 text-[#075C2A]" />}
            defaultExpanded={true}
          >
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleTextChange}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-xs font-medium focus:outline-none focus:border-[#075C2A]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Tagline
                  </label>
                  <input
                    type="text"
                    name="companyTagline"
                    value={formData.companyTagline}
                    onChange={handleTextChange}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-xs font-medium focus:outline-none focus:border-[#075C2A]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Company Description
                </label>
                <textarea
                  rows={3}
                  name="companyDescription"
                  value={formData.companyDescription}
                  onChange={handleTextChange}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-xs font-medium focus:outline-none focus:border-[#075C2A]"
                />
              </div>
            </div>
          </AdminAccordion>

          <AdminAccordion
            title="Home Page Hero Carousel (3 Slides)"
            subtitle="Manage images, titles, descriptions, and button links for the 3 home hero carousel slides"
            icon={<ImageIcon className="w-5 h-5 text-[#075C2A]" />}
            defaultExpanded={true}
          >
            <div className="max-w-4xl space-y-6">
              {/* Slide Selector Tabs */}
              <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-3 overflow-x-auto">
                {[0, 1, 2].map((idx) => {
                  const slideData =
                    (formData.heroCarouselSlides && formData.heroCarouselSlides[idx]) ||
                    defaultHeroCarouselSlides[idx];
                  const isActive = activeHeroSlide === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveHeroSlide(idx)}
                      className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                        isActive
                          ? "bg-[#075C2A] text-white shadow-md shadow-[#075C2A]/20"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-black ${
                          isActive
                            ? "bg-white text-[#075C2A]"
                            : "bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <span>Slide {idx + 1}</span>
                      <span
                        className={`text-[10px] truncate max-w-[120px] ${
                          isActive ? "text-emerald-100" : "text-gray-400"
                        }`}
                      >
                        {slideData?.title ? `• ${slideData.title.slice(0, 18)}...` : ""}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Active Slide Editor Form */}
              {(() => {
                const currentSlide =
                  (formData.heroCarouselSlides && formData.heroCarouselSlides[activeHeroSlide]) ||
                  defaultHeroCarouselSlides[activeHeroSlide];

                return (
                  <div className="bg-gray-50/70 dark:bg-gray-900/40 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-5">
                    {/* Header with Title and Reset */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-[#075C2A]/10 text-[#075C2A] dark:text-emerald-300 font-extrabold text-xs">
                          Slide {activeHeroSlide + 1} of 3
                        </span>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                          Configure Slide {activeHeroSlide + 1} Content
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleResetSlide(activeHeroSlide)}
                        className="text-xs text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 underline font-medium transition cursor-pointer"
                      >
                        Reset this slide to default
                      </button>
                    </div>

                    {/* Live Slide Preview Banner */}
                    <div className="relative h-48 sm:h-56 w-full rounded-2xl overflow-hidden bg-slate-900 border border-gray-300 dark:border-gray-700 shadow-inner group">
                      <img
                        src={currentSlide?.image || defaultHeroCarouselSlides[activeHeroSlide].image}
                        alt={`Slide ${activeHeroSlide + 1} Preview`}
                        className="w-full h-full object-cover brightness-105"
                      />
                      {/* Preview Text Overlay */}
                      <div className="absolute inset-0 p-4 sm:p-6 flex flex-col justify-center max-w-lg pointer-events-none space-y-2">
                        <span className="text-[10px] uppercase tracking-wider font-bold bg-[#075C2A] text-white px-2 py-0.5 rounded w-max">
                          Live Hero Preview
                        </span>
                        <h3 className="text-sm sm:text-base font-extrabold text-white drop-shadow-md line-clamp-2">
                          {currentSlide?.title || "Slide Title"}
                        </h3>
                        <p className="text-xs text-gray-200 line-clamp-2 drop-shadow">
                          {currentSlide?.subtitle || "Slide subtitle description goes here..."}
                        </p>
                        <span className="mt-1 px-3 py-1 rounded-lg bg-[#86c024] text-black font-extrabold text-xs w-max shadow">
                          {currentSlide?.buttonText || "Explore Products"} →
                        </span>
                      </div>
                    </div>

                    {/* Image Controls */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
                        Background Image (URL or Upload File)
                      </label>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <input
                          type="text"
                          placeholder="Paste image URL (Cloudinary, /assets/..., or web link)"
                          value={currentSlide?.image || ""}
                          onChange={(e) => handleHeroSlideChange(activeHeroSlide, "image", e.target.value)}
                          className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:border-[#075C2A]"
                        />
                        <label className="px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-[#075C2A] dark:text-emerald-300 font-bold text-xs cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/50 flex items-center justify-center gap-1.5 transition shrink-0 border border-emerald-200 dark:border-emerald-800">
                          <Upload className="w-3.5 h-3.5" /> Upload Image
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) handleHeroSlideImageUpload(activeHeroSlide, file);
                            }}
                          />
                        </label>
                      </div>
                    </div>

                    {/* Title & Subtitle */}
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                          Slide Headline / Title
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Welcome to Natural Milk Dairy"
                          value={currentSlide?.title || ""}
                          onChange={(e) => handleHeroSlideChange(activeHeroSlide, "title", e.target.value)}
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 font-semibold focus:outline-none focus:border-[#075C2A]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                          Slide Subtitle / Description
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Enter a descriptive subtitle for this slide..."
                          value={currentSlide?.subtitle || ""}
                          onChange={(e) => handleHeroSlideChange(activeHeroSlide, "subtitle", e.target.value)}
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 font-medium focus:outline-none focus:border-[#075C2A]"
                        />
                      </div>
                    </div>

                    {/* Button Text & Button Link */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                          Action Button Text
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Explore Products"
                          value={currentSlide?.buttonText || ""}
                          onChange={(e) => handleHeroSlideChange(activeHeroSlide, "buttonText", e.target.value)}
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 font-medium focus:outline-none focus:border-[#075C2A]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                          Action Button Link (Route or URL)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. /products or /about"
                          value={currentSlide?.buttonLink || ""}
                          onChange={(e) => handleHeroSlideChange(activeHeroSlide, "buttonLink", e.target.value)}
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 font-medium focus:outline-none focus:border-[#075C2A]"
                        />
                      </div>
                    </div>

                    {/* Navigation between slides */}
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                      <button
                        type="button"
                        disabled={activeHeroSlide === 0}
                        onClick={() => setActiveHeroSlide((prev) => Math.max(0, prev - 1))}
                        className="px-3 py-1.5 rounded-xl border border-gray-300 dark:border-gray-600 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      >
                        ← Previous Slide
                      </button>
                      <span className="text-xs text-gray-400 font-medium">
                        Slide {activeHeroSlide + 1} of 3
                      </span>
                      <button
                        type="button"
                        disabled={activeHeroSlide === 2}
                        onClick={() => setActiveHeroSlide((prev) => Math.min(2, prev + 1))}
                        className="px-3 py-1.5 rounded-xl border border-gray-300 dark:border-gray-600 text-xs font-bold text-[#075C2A] hover:bg-emerald-50 dark:hover:bg-emerald-900/30 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      >
                        Next Slide →
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </AdminAccordion>
        </motion.div>
      )}

      {/* TAB 2: ABOUT US PAGE */}
      {activeTab === "about" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <AdminAccordion
            title="About Us Headers & Mission"
            subtitle="Customize the titles, badge text, and mission statement on the About Us page"
            icon={<Info className="w-5 h-5 text-[#075C2A]" />}
            defaultExpanded={true}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Badge Text / Slogan
                  </label>
                  <input
                    type="text"
                    value={formData.aboutUs?.badgeText || ""}
                    onChange={(e) => handleAboutUsChange("badgeText", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-xs font-medium focus:outline-none focus:border-[#075C2A]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Main Headline Title
                  </label>
                  <input
                    type="text"
                    value={formData.aboutUs?.title || ""}
                    onChange={(e) => handleAboutUsChange("title", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-xs font-medium focus:outline-none focus:border-[#075C2A]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Main Subtitle / Intro Paragraph
                </label>
                <textarea
                  rows={3}
                  value={formData.aboutUs?.subtitle || ""}
                  onChange={(e) => handleAboutUsChange("subtitle", e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-xs font-medium focus:outline-none focus:border-[#075C2A]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Journey Section Title
                  </label>
                  <input
                    type="text"
                    value={formData.aboutUs?.journeyTitle || ""}
                    onChange={(e) => handleAboutUsChange("journeyTitle", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-xs font-medium focus:outline-none focus:border-[#075C2A]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Journey Section Subtitle
                  </label>
                  <input
                    type="text"
                    value={formData.aboutUs?.journeySubtitle || ""}
                    onChange={(e) => handleAboutUsChange("journeySubtitle", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-xs font-medium focus:outline-none focus:border-[#075C2A]"
                  />
                </div>
              </div>
            </div>
          </AdminAccordion>

          <AdminAccordion
            title="About Us Stat Badges & Achievements"
            subtitle="Manage key trust metrics (e.g. 100% Pure, 7 AM Delivery, 50,000+ Happy Families)"
            icon={<Sparkles className="w-5 h-5 text-[#075C2A]" />}
            defaultExpanded={true}
          >
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
                  Total Stat Badges: {formData.aboutUs?.stats?.length || 0}
                </span>
                <button
                  type="button"
                  onClick={addAboutStat}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-[#075C2A] dark:text-emerald-300 font-bold text-xs border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Stat Badge
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(formData.aboutUs?.stats || []).map((stat, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 space-y-3 relative group"
                  >
                    <button
                      type="button"
                      onClick={() => removeAboutStat(idx)}
                      className="absolute top-3 right-3 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition"
                      title="Delete Stat"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-bold text-gray-500 block mb-0.5">Value (Number/Text)</label>
                        <input
                          type="text"
                          value={stat.value}
                          onChange={(e) => handleAboutStatChange(idx, "value", e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-gray-500 block mb-0.5">Icon / Emoji</label>
                        <input
                          type="text"
                          value={stat.icon}
                          onChange={(e) => handleAboutStatChange(idx, "icon", e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-gray-500 block mb-0.5">Label / Description</label>
                      <input
                        type="text"
                        value={stat.label}
                        onChange={(e) => handleAboutStatChange(idx, "label", e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 font-medium"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AdminAccordion>
        </motion.div>
      )}

      {/* TAB 3: CONTACT US PAGE */}
      {activeTab === "contact" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <AdminAccordion
            title="Contact Us Information & Support Options"
            subtitle="Manage office address, support phone, email, and WhatsApp contact details"
            icon={<PhoneCall className="w-5 h-5 text-[#075C2A]" />}
            defaultExpanded={true}
          >
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Badge Text
                  </label>
                  <input
                    type="text"
                    value={formData.contactUs?.badgeText || ""}
                    onChange={(e) => handleContactUsChange("badgeText", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-xs font-medium focus:outline-none focus:border-[#075C2A]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Page Headline Title
                  </label>
                  <input
                    type="text"
                    value={formData.contactUs?.title || ""}
                    onChange={(e) => handleContactUsChange("title", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-xs font-medium focus:outline-none focus:border-[#075C2A]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Support Note / Help Paragraph
                </label>
                <textarea
                  rows={2}
                  value={formData.contactUs?.supportText || ""}
                  onChange={(e) => handleContactUsChange("supportText", e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-xs font-medium focus:outline-none focus:border-[#075C2A]"
                />
              </div>

              <div className="space-y-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#075C2A]" /> Full Office & Factory Address
                  </label>
                  <input
                    type="text"
                    value={formData.contactUs?.address || ""}
                    onChange={(e) => handleContactUsChange("address", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-xs font-medium focus:outline-none focus:border-[#075C2A]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-[#075C2A]" /> Support Phone
                    </label>
                    <input
                      type="text"
                      value={formData.contactUs?.phone || ""}
                      onChange={(e) => handleContactUsChange("phone", e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-xs font-medium focus:outline-none focus:border-[#075C2A]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1 flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-[#0756B5]" /> Support Email
                    </label>
                    <input
                      type="email"
                      value={formData.contactUs?.email || ""}
                      onChange={(e) => handleContactUsChange("email", e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-xs font-medium focus:outline-none focus:border-[#075C2A]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1 flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-[#075C2A]" /> WhatsApp Number
                    </label>
                    <input
                      type="text"
                      value={formData.contactUs?.whatsappNumber || ""}
                      onChange={(e) => handleContactUsChange("whatsappNumber", e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-xs font-medium focus:outline-none focus:border-[#075C2A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Google Maps Link / Directions URL
                  </label>
                  <input
                    type="text"
                    value={formData.contactUs?.googleMaps || ""}
                    onChange={(e) => handleContactUsChange("googleMaps", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-xs font-medium focus:outline-none focus:border-[#075C2A]"
                  />
                </div>
              </div>
            </div>
          </AdminAccordion>
        </motion.div>
      )}

      {/* TAB 4: WHY CHOOSE US CARDS */}
      {activeTab === "goodness" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300">
              Why Choose Us Feature Cards ({formData.goodnessOfferings.length})
            </h2>
            <button
              onClick={addGoodnessOffering}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-[#075C2A] font-bold text-xs cursor-pointer hover:bg-emerald-100"
            >
              <Plus className="w-3.5 h-3.5" /> Add Card
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formData.goodnessOfferings.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 space-y-3 relative group"
              >
                <button
                  type="button"
                  onClick={() => removeGoodnessOffering(idx)}
                  className="absolute top-3 right-3 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition"
                  title="Remove Card"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="flex items-start gap-4 mb-3">
                  {/* Image Preview */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shrink-0 flex items-center justify-center">
                    {item.image ? (
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-500 block">Card Image</label>
                    <input
                      type="text"
                      value={item.image || ""}
                      onChange={(e) => handleGoodnessChange(idx, "image", e.target.value)}
                      placeholder="Paste image URL..."
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 font-medium focus:outline-none focus:border-[#075C2A]"
                    />
                    <label className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-[#075C2A] dark:text-emerald-300 font-bold text-[11px] cursor-pointer hover:bg-emerald-100 transition">
                      <Upload className="w-3 h-3" /> Upload Image
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleGoodnessImageUpload(idx, e.target.files?.[0])}
                      />
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-500 block mb-0.5">Title</label>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => handleGoodnessChange(idx, "title", e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 font-bold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-500 block mb-0.5">Description</label>
                  <textarea
                    rows={2}
                    value={item.description}
                    onChange={(e) => handleGoodnessChange(idx, "description", e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 font-medium"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* TAB 5: FAQS MANAGEMENT */}
      {activeTab === "faqs" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300">
              Frequently Asked Questions ({formData.faqs.length})
            </h2>
            <button
              onClick={addFaq}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-[#075C2A] font-bold text-xs cursor-pointer hover:bg-emerald-100"
            >
              <Plus className="w-3.5 h-3.5" /> Add Question
            </button>
          </div>

          <div className="space-y-4">
            {formData.faqs.map((faq, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 space-y-3 relative group"
              >
                <button
                  type="button"
                  onClick={() => removeFaq(idx)}
                  className="absolute top-3 right-3 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition"
                  title="Remove FAQ"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-500 block mb-0.5">Question</label>
                  <input
                    type="text"
                    value={faq.question}
                    onChange={(e) => handleFaqChange(idx, "question", e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 font-bold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-500 block mb-0.5">Answer</label>
                  <textarea
                    rows={2}
                    value={faq.answer}
                    onChange={(e) => handleFaqChange(idx, "answer", e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 font-medium"
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
