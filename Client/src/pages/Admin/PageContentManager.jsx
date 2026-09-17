import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { PageContentContext } from "../../context/PageContentProvider";
import { updatePageContentService } from "../../services/pageContentService";
import { socket } from "../../socket/socket";
import { useSnackbar } from "notistack";
import { motion } from "framer-motion";
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
} from "lucide-react";
import { convertToBase64 } from "../../utils/InventoryHelpers/imageBase64Converter";
import homeHeroBgDefault from "../../assets/home_welcome_hero_bg.png";
import { products, faqs as defaultFaqs, offerings as defaultOfferings } from "../../data/products";
import AdminAccordion from "../../components/AdminComponents/Common/AdminAccordion";
import BackButton from "../../components/Common/BackButton";

export default function PageContentManager() {
  const { enqueueSnackbar } = useSnackbar();
  const { pageContent, refreshPageContent } = useContext(PageContentContext);

  const [activeTab, setActiveTab] = useState("branding");
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    companyName: "",
    companyTagline: "",
    companyDescription: "",
    heroBannerImage: "",
    landingHeroImage: "",
    homeCategoryCards: [],
    landingShowcaseCards: [],
    goodnessOfferings: [],
    faqs: [],
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
        companyName: pageContent.companyName || "Madhu Dairy And Daily Needs",
        companyTagline: pageContent.companyTagline || "",
        companyDescription: pageContent.companyDescription || "",
        heroBannerImage: pageContent.heroBannerImage || "",
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
        aboutUs: pageContent.aboutUs || {
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
        contactUs: pageContent.contactUs || {
          badgeText: "GET IN TOUCH",
          title: "Contact Information",
          supportText: "We are here to assist you. Please fill out the form to get in touch or ask your query directly.",
          address: "Shed no. A-31, Madhu Dairy & Daily Needs, NAVNATH NAGAR, MIDC Ambad, Nashik, Maharashtra - 422010",
          phone: "+91 94906 44434",
          email: "beerayona143@gmail.com",
          whatsappNumber: "919490644434",
          googleMaps: "https://maps.google.com/?q=Madhu+Dairy+Ambad+Nashik",
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
        socket.emit("page-content:update", { pageContent: res.pageContent });
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
            <h1 className="text-xl md:text-2xl font-extrabold flex items-center gap-2 text-[#6C5CE7] dark:text-purple-400">
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
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6C5CE7] hover:bg-[#5b4cc4] text-white font-bold text-sm shadow-md transition hover:scale-105 cursor-pointer disabled:opacity-50"
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
      <div className="bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/80 p-4 rounded-2xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Layers className="w-5 h-5 text-[#6C5CE7] dark:text-purple-400 shrink-0" />
          <p className="text-xs md:text-sm text-gray-700 dark:text-gray-300 font-medium">
            <strong className="text-[#6C5CE7] dark:text-purple-300">Category Showcase Cards:</strong> Are managed under <strong className="underline">Admin → Inventory → Total Categories</strong>.
          </p>
        </div>
        <Link
          to="/admin/inventory"
          className="px-3.5 py-1.5 rounded-xl bg-[#6C5CE7] hover:bg-[#5b4cc4] text-white text-xs font-bold shadow-xs whitespace-nowrap"
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
                ? "bg-[#6C5CE7] text-white shadow-sm"
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
            icon={<FileText className="w-5 h-5 text-[#6C5CE7]" />}
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
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-xs font-medium focus:outline-none focus:border-[#6C5CE7]"
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
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-xs font-medium focus:outline-none focus:border-[#6C5CE7]"
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
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-xs font-medium focus:outline-none focus:border-[#6C5CE7]"
                />
              </div>
            </div>
          </AdminAccordion>

          <AdminAccordion
            title="Hero Banners & Background Images"
            subtitle="Manage Home Page hero background graphic"
            icon={<ImageIcon className="w-5 h-5 text-[#6C5CE7]" />}
            defaultExpanded={true}
          >
            <div className="max-w-2xl">
              <div className="bg-gray-50/50 dark:bg-gray-900/40 p-4 rounded-xl border border-gray-200 dark:border-gray-700 space-y-4">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#6C5CE7]" /> Home Page Hero Banner Image
                </h3>
                <div className="relative h-44 w-full rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                  <img
                    src={formData.heroBannerImage || homeHeroBgDefault}
                    alt="Home Hero"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400 block">
                    Banner Image Source (URL or File Upload)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Paste banner image URL"
                      value={formData.heroBannerImage}
                      onChange={(e) => setFormData((prev) => ({ ...prev, heroBannerImage: e.target.value }))}
                      className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
                    />
                    <label className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-[#6C5CE7] dark:text-purple-300 font-bold text-xs cursor-pointer hover:bg-purple-100 flex items-center gap-1">
                      <Upload className="w-3.5 h-3.5" /> Upload File
                      <input type="file" accept="image/*" className="hidden" onChange={handleHeroBannerUpload} />
                    </label>
                  </div>
                </div>
              </div>
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
            icon={<Info className="w-5 h-5 text-[#6C5CE7]" />}
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
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-xs font-medium focus:outline-none focus:border-[#6C5CE7]"
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
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-xs font-medium focus:outline-none focus:border-[#6C5CE7]"
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
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-xs font-medium focus:outline-none focus:border-[#6C5CE7]"
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
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-xs font-medium focus:outline-none focus:border-[#6C5CE7]"
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
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-xs font-medium focus:outline-none focus:border-[#6C5CE7]"
                  />
                </div>
              </div>
            </div>
          </AdminAccordion>

          <AdminAccordion
            title="About Us Stat Badges & Achievements"
            subtitle="Manage key trust metrics (e.g. 100% Pure, 7 AM Delivery, 50,000+ Happy Families)"
            icon={<Sparkles className="w-5 h-5 text-[#6C5CE7]" />}
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
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-[#6C5CE7] dark:text-purple-300 font-bold text-xs border border-purple-200 dark:border-purple-800 hover:bg-purple-100 cursor-pointer"
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
            icon={<PhoneCall className="w-5 h-5 text-[#6C5CE7]" />}
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
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-xs font-medium focus:outline-none focus:border-[#6C5CE7]"
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
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-xs font-medium focus:outline-none focus:border-[#6C5CE7]"
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
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-xs font-medium focus:outline-none focus:border-[#6C5CE7]"
                />
              </div>

              <div className="space-y-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-purple-600" /> Full Office & Factory Address
                  </label>
                  <input
                    type="text"
                    value={formData.contactUs?.address || ""}
                    onChange={(e) => handleContactUsChange("address", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-xs font-medium focus:outline-none focus:border-[#6C5CE7]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-[#6C5CE7]" /> Support Phone
                    </label>
                    <input
                      type="text"
                      value={formData.contactUs?.phone || ""}
                      onChange={(e) => handleContactUsChange("phone", e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-xs font-medium focus:outline-none focus:border-[#6C5CE7]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1 flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-purple-600" /> Support Email
                    </label>
                    <input
                      type="email"
                      value={formData.contactUs?.email || ""}
                      onChange={(e) => handleContactUsChange("email", e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-xs font-medium focus:outline-none focus:border-[#6C5CE7]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1 flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-purple-600" /> WhatsApp Number
                    </label>
                    <input
                      type="text"
                      value={formData.contactUs?.whatsappNumber || ""}
                      onChange={(e) => handleContactUsChange("whatsappNumber", e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-xs font-medium focus:outline-none focus:border-[#6C5CE7]"
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
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-xs font-medium focus:outline-none focus:border-[#6C5CE7]"
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
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-[#6C5CE7] font-bold text-xs cursor-pointer hover:bg-purple-100"
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
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-[#6C5CE7] font-bold text-xs cursor-pointer hover:bg-purple-100"
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
