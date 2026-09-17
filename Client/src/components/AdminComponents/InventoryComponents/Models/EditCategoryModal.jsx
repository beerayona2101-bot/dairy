import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Dialog } from "@mui/material";
import { Image, Tag, X } from "lucide-react";
import DescriptionIcon from "@mui/icons-material/Description";
import { convertToBase64 } from "../../../../utils/InventoryHelpers/imageBase64Converter";
import { useModalBackNavigation } from "../../../../hooks/useModalBackNavigation";

export default function EditCategoryModal({ open, onClose, categoryData, onSave }) {
  useModalBackNavigation(open, onClose);

  const [title, setTitle] = useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [features, setFeatures] = useState([]);
  const [newFeatureInput, setNewFeatureInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (categoryData) {
      setTitle(categoryData.title || categoryData.category || categoryData.name || "");
      setImage(categoryData.image || "");
      setDescription(categoryData.description || "");
      setFeatures(Array.isArray(categoryData.features) ? categoryData.features : []);
    } else {
      setTitle("");
      setImage("");
      setDescription("");
      setFeatures([
        "100% Pure & Farm Fresh",
        "No Preservatives or Chemicals",
        "Chilled Delivery by 7 AM",
      ]);
    }
    setNewFeatureInput("");
  }, [categoryData, open]);

  const handleImageFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setUploadingImage(true);
      const base64 = await convertToBase64(file);
      setImage(base64);
    } catch (err) {
      console.warn("Failed to process category image file.", err);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddFeature = () => {
    if (!newFeatureInput.trim()) return;
    setFeatures((prev) => [...prev, newFeatureInput.trim()]);
    setNewFeatureInput("");
  };

  const handleRemoveFeature = (idx) => {
    setFeatures((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      await onSave({
        originalTitle: categoryData?.title || categoryData?.category || categoryData?.name || title.trim(),
        title: title.trim(),
        image: image.trim(),
        description: description.trim(),
        features: features.filter((f) => f.trim() !== ""),
      });
      onClose();
    } catch (err) {
      console.error("Failed to save category:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      slotProps={{
        paper: {
          className: "!relative !bg-white dark:!bg-gray-800 !rounded-2xl !shadow-xl !w-full !max-w-2xl !scrollbar-hide !m-4"
        },
        backdrop: {
          className: "!bg-black/40 !backdrop-blur-sm"
        }
      }}
    >
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 px-6 pt-6 pb-4 rounded-t-2xl border-b border-gray-100 dark:border-gray-700 flex items-center justify-center relative">
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <span>📋</span>
          <span>{categoryData ? "Edit Category" : "Add New Category"}</span>
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-xl p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer"
        >
          <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[80vh] scrollbar-hide">
        {/* Image Upload Box */}
        <div className="flex flex-col items-center gap-2">
          <div className="relative w-24 h-24 mx-auto">
            <img
              src={image || "https://img.freepik.com/free-vector/dairy-products-poster_1284-18867.jpg?semt=ais_hybrid&w=740"}
              alt="Category Preview"
              className="w-24 h-24 rounded-2xl object-cover border border-gray-300 dark:border-gray-600 shadow-sm"
            />
            <label
              htmlFor="categoryPhotoInput"
              className="absolute bottom-0 right-0 bg-white border border-gray-200 p-1.5 rounded-full cursor-pointer shadow-md hover:scale-105 transition"
              title="Upload image file"
            >
              <Image className="w-5 h-5 text-[#6C5CE7]" />
            </label>
            <input
              type="file"
              accept="image/*"
              id="categoryPhotoInput"
              name="image"
              className="hidden"
              disabled={uploadingImage}
              onChange={handleImageFileChange}
            />
          </div>
          <div className="w-full max-w-sm text-center">
            <input
              type="text"
              placeholder="Or paste image URL (https://...)"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full text-xs text-center px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-[#6C5CE7]"
            />
          </div>
        </div>

        {/* Input Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Category Name
            </label>
            <div className="flex items-center gap-2 px-3 py-2.5 border rounded-lg border-gray-300 dark:border-gray-600 focus-within:ring-2 focus-within:ring-[#6C5CE7] bg-white dark:bg-gray-900">
              <Tag className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Ex: Milk"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full text-sm bg-transparent outline-none text-gray-900 dark:text-gray-100 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <div className="flex items-start gap-2 px-3 py-2.5 border rounded-lg border-gray-300 dark:border-gray-600 focus-within:ring-2 focus-within:ring-[#6C5CE7] bg-white dark:bg-gray-900">
              <DescriptionIcon className="w-5 h-5 text-gray-400 mt-1" />
              <textarea
                rows={3}
                placeholder="Enter something category description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-sm bg-transparent outline-none text-gray-900 dark:text-gray-100 resize-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Category Highlights & Features
            </label>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                placeholder="Add highlight (e.g. 100% Pure & Organic)"
                value={newFeatureInput}
                onChange={(e) => setNewFeatureInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddFeature();
                  }
                }}
                className="flex-1 text-sm px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 outline-none"
              />
              <button
                type="button"
                onClick={handleAddFeature}
                className="px-4 py-2 bg-[#6C5CE7] hover:bg-[#5b4cc4] text-white rounded-lg text-sm font-semibold transition cursor-pointer"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {features.map((feat, idx) => (
                <span
                  key={`feat-${idx}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 dark:bg-purple-900/40 text-purple-700 dark:text-purple-200 border border-purple-200 dark:border-purple-800 rounded-full text-xs font-medium"
                >
                  {feat}
                  <button type="button" onClick={() => handleRemoveFeature(idx)} className="hover:text-zinc-900 dark:hover:text-white cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || uploadingImage}
            className="px-6 py-2.5 rounded-lg bg-[#6C5CE7] hover:bg-[#5b4cc4] text-white font-semibold text-sm shadow-md transition cursor-pointer disabled:opacity-50"
          >
            {loading ? "Saving..." : (categoryData ? "Save Changes" : "Add Category")}
          </button>
        </div>
      </form>
    </Dialog>
  );
}

EditCategoryModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  categoryData: PropTypes.object,
  onSave: PropTypes.func.isRequired,
};
