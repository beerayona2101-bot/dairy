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
  CheckCircle,
  FileText,
  Grid,
} from "lucide-react";
import { convertToBase64 } from "../../utils/InventoryHelpers/imageBase64Converter";
import homeHeroBgDefault from "../../assets/home_welcome_hero_bg.png";
import landingHeroBgHDDefault from "../../assets/landing_hero_bg_hd.png";
import { products, faqs as defaultFaqs, offerings as defaultOfferings } from "../../data/products";
import AdminAccordion from "../../components/AdminComponents/Common/AdminAccordion";

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
        companyName: pageContent.companyName || "Madhur Dairy And Daily Needs",
        companyTagline: pageContent.companyTagline || "",
        companyDescription: pageContent.companyDescription || "",
        heroBannerImage: pageContent.heroBannerImage || "",
        landingHeroImage: pageContent.landingHeroImage || "",
        homeCategoryCards: (pageContent.homeCategoryCards && pageContent.homeCategoryCards.length > 0)
          ? pageContent.homeCategoryCards
          : defaultHomeCards,
        landingShowcaseCards: (pageContent.landingShowcaseCards && pageContent.landingShowcaseCards.length > 0)
          ? pageContent.landingShowcaseCards
          : ((pageContent.landingCategories && pageContent.landingCategories.length > 0)
            ? pageContent.landingCategories
            : defaultShowcaseCards),
        goodnessOfferings: (pageContent.goodnessOfferings && pageContent.goodnessOfferings.length > 0)
          ? pageContent.goodnessOfferings
          : defaultOfferings,
        faqs: (pageContent.faqs && pageContent.faqs.length > 0)
          ? pageContent.faqs
          : defaultFaqs,
      });
    }
  }, [pageContent]);

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleHeroBannerUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const base64 = await convertToBase64(file);
      setFormData((prev) => ({ ...prev, heroBannerImage: base64 }));
    }
  };

  const handleLandingHeroUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const base64 = await convertToBase64(file);
      setFormData((prev) => ({ ...prev, landingHeroImage: base64 }));
    }
  };

  // --- 1. HOME CATEGORY CARDS HANDLERS ---
  const handleHomeCardChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.homeCategoryCards];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, homeCategoryCards: updated };
    });
  };

  const handleHomeCardImageUpload = async (index, file) => {
    if (file) {
      const base64 = await convertToBase64(file);
      handleHomeCardChange(index, "image", base64);
    }
  };

  const addHomeCard = () => {
    setFormData((prev) => ({
      ...prev,
      homeCategoryCards: [
        ...prev.homeCategoryCards,
        {
          title: "New Item",
          image: "https://res.cloudinary.com/dyahibuzy/image/upload/v1750157394/milk_cycuqe.jpg",
        },
      ],
    }));
  };

  const removeHomeCard = (index) => {
    setFormData((prev) => ({
      ...prev,
      homeCategoryCards: prev.homeCategoryCards.filter((_, i) => i !== index),
    }));
  };

  // --- 2. LANDING SHOWCASE CARDS HANDLERS ---
  const handleShowcaseChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.landingShowcaseCards];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, landingShowcaseCards: updated };
    });
  };

  const handleShowcaseImageUpload = async (index, file) => {
    if (file) {
      const base64 = await convertToBase64(file);
      handleShowcaseChange(index, "image", base64);
    }
  };

  const handleShowcaseFeatureChange = (cardIdx, featIdx, value) => {
    setFormData((prev) => {
      const updated = [...prev.landingShowcaseCards];
      const features = [...(updated[cardIdx].features || [])];
      features[featIdx] = value;
      updated[cardIdx] = { ...updated[cardIdx], features };
      return { ...prev, landingShowcaseCards: updated };
    });
  };

  const addShowcaseFeature = (cardIdx) => {
    setFormData((prev) => {
      const updated = [...prev.landingShowcaseCards];
      const features = [...(updated[cardIdx].features || []), "Fresh Quality"];
      updated[cardIdx] = { ...updated[cardIdx], features };
      return { ...prev, landingShowcaseCards: updated };
    });
  };

  const removeShowcaseFeature = (cardIdx, featIdx) => {
    setFormData((prev) => {
      const updated = [...prev.landingShowcaseCards];
      const features = updated[cardIdx].features.filter((_, idx) => idx !== featIdx);
      updated[cardIdx] = { ...updated[cardIdx], features };
      return { ...prev, landingShowcaseCards: updated };
    });
  };

  const addShowcaseCard = () => {
    setFormData((prev) => ({
      ...prev,
      landingShowcaseCards: [
        ...prev.landingShowcaseCards,
        {
          title: "New Showcase Product",
          description: "Delicious and fresh dairy product with high nutritional value.",
          image: "https://res.cloudinary.com/dyahibuzy/image/upload/v1750157396/paneer_lnj9jf.jpg",
          features: ["100% Organic", "Rich Taste", "Daily Fresh"],
        },
      ],
    }));
  };

  const removeShowcaseCard = (index) => {
    setFormData((prev) => ({
      ...prev,
      landingShowcaseCards: prev.landingShowcaseCards.filter((_, i) => i !== index),
    }));
  };

  // --- 3. GOODNESS OFFERINGS HANDLERS ---
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

  // --- 4. FAQ HANDLERS ---
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
        enqueueSnackbar("Page content & images saved & updated live!", { variant: "success" });
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
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold flex items-center gap-2 text-[#1E88E5] dark:text-blue-400">
            <LayoutIcon className="w-6 h-6" /> Landing & Home Page Content Manager
          </h1>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1 hidden sm:block">
            Customize Home Page category cards, Landing Page showcase cards, hero banners, and images.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1E88E5] hover:bg-[#1565C0] text-white font-bold text-sm shadow-md transition hover:scale-105 cursor-pointer disabled:opacity-50"
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
      <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 p-4 rounded-2xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Layers className="w-5 h-5 text-[#1E88E5] dark:text-blue-400 shrink-0" />
          <p className="text-xs md:text-sm text-gray-700 dark:text-gray-300 font-medium">
            <strong className="text-[#1E88E5] dark:text-blue-300">Category & Landing Showcase Cards:</strong> Are now directly managed under <strong className="underline">Admin → Inventory → Total Categories</strong> for unified category & product management.
          </p>
        </div>
        <Link
          to="/admin/inventory"
          className="px-3.5 py-1.5 rounded-xl bg-[#1E88E5] hover:bg-[#1565C0] text-white text-xs font-bold shadow-xs whitespace-nowrap"
        >
          Go to Inventory →
        </Link>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { id: "branding", label: "Banners & Branding", icon: <ImageIcon className="w-4 h-4" /> },
          { id: "goodness", label: "Why Choose Us Cards", icon: <Sparkles className="w-4 h-4" /> },
          { id: "faqs", label: "FAQs Management", icon: <HelpCircle className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm transition cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-[#1E88E5] text-white shadow-sm"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>





      {/* TAB 3: BANNERS & BRANDING */}
      {activeTab === "branding" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <AdminAccordion
            title="Company Info & Tagline"
            subtitle="Store name, brand slogan, and description"
            icon={<FileText className="w-5 h-5 text-[#1E88E5]" />}
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
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-xs font-medium focus:outline-none focus:border-[#1E88E5]"
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
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-xs font-medium focus:outline-none focus:border-[#1E88E5]"
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
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-xs font-medium focus:outline-none focus:border-[#1E88E5]"
                />
              </div>
            </div>
          </AdminAccordion>

          <AdminAccordion
            title="Hero Banners & Background Images"
            subtitle="Manage Home Page hero background graphic"
            icon={<ImageIcon className="w-5 h-5 text-amber-500" />}
            defaultExpanded={true}
          >
            <div className="max-w-2xl">
              {/* Home Hero Banner */}
              <div className="bg-gray-50/50 dark:bg-gray-900/40 p-4 rounded-xl border border-gray-200 dark:border-gray-700 space-y-4">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-amber-500" /> Home Page Hero Banner Image
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
                    <label className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-[#1E88E5] dark:text-blue-300 font-bold text-xs cursor-pointer hover:bg-blue-100 flex items-center gap-1">
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

      {/* TAB 4: GOODNESS OFFERINGS */}
      {activeTab === "goodness" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <AdminAccordion
            title="'Why Choose Us' Feature Cards"
            subtitle="Manage promotional feature cards and images"
            icon={<Sparkles className="w-5 h-5 text-amber-500" />}
            badgeCount={formData.goodnessOfferings.length}
            defaultExpanded={true}
            headerExtra={
              <button
                onClick={addGoodnessOffering}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Feature Card
              </button>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              {formData.goodnessOfferings.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-gray-50/50 dark:bg-gray-900/40 p-4 rounded-xl border border-gray-200 dark:border-gray-700 space-y-4 relative"
                >
                  <button
                    onClick={() => removeGoodnessOffering(idx)}
                    className="absolute top-3 right-3 text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer z-10"
                    title="Remove Card"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="relative h-36 w-full rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="text-[11px] font-bold text-gray-500 block mb-1">Title</label>
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => handleGoodnessChange(idx, "title", e.target.value)}
                        className="w-full px-2.5 py-1 text-xs font-bold rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-gray-500 block mb-1">Description</label>
                      <textarea
                        rows={2}
                        value={item.description}
                        onChange={(e) => handleGoodnessChange(idx, "description", e.target.value)}
                        className="w-full px-2.5 py-1 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-gray-500 block mb-1">Image Source (URL or File)</label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          placeholder="Image URL"
                          value={item.image}
                          onChange={(e) => handleGoodnessChange(idx, "image", e.target.value)}
                          className="flex-1 px-2 py-1 text-[11px] rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                        />
                        <label className="p-1.5 rounded-lg bg-blue-50 text-[#1E88E5] dark:bg-blue-900/40 dark:text-blue-300 font-bold text-xs cursor-pointer hover:bg-blue-100 flex items-center gap-1">
                          <Upload className="w-3.5 h-3.5" /> File
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleGoodnessImageUpload(idx, e.target.files[0])}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </AdminAccordion>
        </motion.div>
      )}

      {/* TAB 5: FAQs MANAGEMENT */}
      {activeTab === "faqs" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <AdminAccordion
            title="Frequently Asked Questions (FAQs)"
            subtitle="Add, edit, or remove store FAQ items"
            icon={<HelpCircle className="w-5 h-5 text-blue-500" />}
            badgeCount={formData.faqs.length}
            defaultExpanded={true}
            headerExtra={
              <button
                onClick={addFaq}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add FAQ
              </button>
            }
          >
            <div className="space-y-4 max-w-4xl mx-auto pt-2">
              {formData.faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="bg-gray-50/50 dark:bg-gray-900/40 p-4 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3 relative"
                >
                  <button
                    onClick={() => removeFaq(idx)}
                    className="absolute top-3 right-3 text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer"
                    title="Remove FAQ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1">
                      Question #{idx + 1}
                    </label>
                    <input
                      type="text"
                      value={faq.question}
                      onChange={(e) => handleFaqChange(idx, "question", e.target.value)}
                      className="w-full px-3 py-1.5 text-xs font-bold rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1">Answer</label>
                    <textarea
                      rows={2}
                      value={faq.answer}
                      onChange={(e) => handleFaqChange(idx, "answer", e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                    />
                  </div>
                </div>
              ))}
            </div>
          </AdminAccordion>
        </motion.div>
      )}
    </div>
  );
}
