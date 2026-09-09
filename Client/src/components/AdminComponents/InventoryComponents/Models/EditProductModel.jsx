import { Dialog, DialogActions } from "@mui/material";
import { Image, Tag, Archive, Package, AlertCircle, FlaskConical, X, Percent, Hourglass } from "lucide-react";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import DescriptionIcon from "@mui/icons-material/Description";
import { useEffect, useState } from "react";
import { socket } from "../../../../socket/socket";
import { convertToBase64 } from "../../../../utils/InventoryHelpers/imageBase64Converter";
import NutritionInput from "../NutritionalInfo";
import { useSnackbar } from "notistack";
import PropTypes from "prop-types";
import { getProductImage } from "../../../../utils/helper";
import ShowcaseProfileEditor, { generateAiNutritionalProfile } from "../ShowcaseProfileEditor";

const categories = [
  "Milk",
  "Curd (Dahi)",
  "Paneer",
  "Butter",
  "Ghee (Clarified Butter)",
  "Cheese",
  "Cream",
  "Buttermilk (Chaas)",
  "Lassi",
  "Flavored Milk",
  "Milk Powder",
  "Condensed Milk",
  "Khoa / Mawa",
  "Yogurt",
  "Ice Cream",
  "Shrikhand",
  "Whey Protein",
  "Dairy-Based Sweets",
];

const quantityUnits = ["Litre", "Ml", "Kg", "Gram", "Pack"];

import { useModalBackNavigation } from "../../../../hooks/useModalBackNavigation";

export default function EditProductModel({ open, onClose, selectedProduct }) {
  const { enqueueSnackbar } = useSnackbar();
  useModalBackNavigation(open, () => onClose(false));

  const [productDetails, setProductDetails] = useState({
    _id: "",
    name: "",
    category: "",
    description: "",
    image: "",
    shelfLife: 0,
    quantityUnit: "Litre",
    stock: 0,
    thresholdVal: 0,
    price: 0,
    manufacturingCost: 0,
    nutrition: {},
    discount: 0,
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [selectedPngFile, setSelectedPngFile] = useState(null);
  const [pngImagePreview, setPngImagePreview] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const parseNumericField = (val, fallback = 0) => {
    if (typeof val === "number") return isNaN(val) ? fallback : val;
    if (!val && val !== 0) return fallback;
    const cleaned = String(val).replace(/[^0-9.]/g, "");
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? fallback : parsed;
  };

  useEffect(() => {
    if (selectedProduct && open) {
      const prodImg = getProductImage(selectedProduct);
      const prodPng = selectedProduct?.pngImage || selectedProduct?.showcaseCutout || "";
      const rawShelfLife = selectedProduct?.shelfLife ?? 0;
      const parsedShelfLife = typeof rawShelfLife === "number"
        ? rawShelfLife
        : (parseFloat(String(rawShelfLife).replace(/[^0-9.]/g, "")) || 0);

      const defaultMetrics = selectedProduct?.nutritionMetrics || selectedProduct?.nutrition?.nutritionMetrics || generateAiNutritionalProfile(selectedProduct?.name || selectedProduct?.category);

      setProductDetails({
        _id: selectedProduct?._id || "",
        name: selectedProduct?.name || "",
        category: selectedProduct?.category || "",
        description: selectedProduct?.description || "",
        image: prodImg,
        pngImage: prodPng,
        shelfLife: parsedShelfLife,
        quantityUnit: selectedProduct?.quantityUnit || "Litre",
        stock: parseNumericField(selectedProduct?.stock, 0),
        thresholdVal: parseNumericField(selectedProduct?.thresholdVal, 10),
        price: parseNumericField(selectedProduct?.price, 0),
        manufacturingCost: parseNumericField(selectedProduct?.manufacturingCost, 0),
        nutrition: selectedProduct?.nutrition || {},
        nutritionMetrics: defaultMetrics,
        discount: parseNumericField(selectedProduct?.discount, 0),
      });
      setImagePreview(prodImg);
      setPngImagePreview(prodPng);
      setSelectedFile(null);
      setSelectedPngFile(null);
    }
  }, [selectedProduct, open]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setProductDetails((prev) => ({
        ...prev,
        image: previewUrl,
      }));
    }
  };

  const handlePngPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedPngFile(file);
      const previewUrl = URL.createObjectURL(file);
      setPngImagePreview(previewUrl);
      setProductDetails((prev) => ({
        ...prev,
        pngImage: previewUrl,
      }));
    }
  };

  const validateInputs = () => {
    const { name, category, price, stock, quantityUnit, thresholdVal, description } = productDetails;
    if (!name || !category || price === "" || price === undefined || stock === "" || stock === undefined || !quantityUnit || thresholdVal === "" || thresholdVal === undefined || !description) {
      enqueueSnackbar("Please fill out all required product fields.", { variant: "warning" });
      return false;
    }
    const numPrice = Number(price);
    const numStock = Number(stock);
    const numThreshold = Number(thresholdVal);
    const numDiscount = Number(productDetails.discount || 0);

    if (isNaN(numPrice) || isNaN(numStock) || isNaN(numThreshold) || isNaN(numDiscount)) {
      enqueueSnackbar("Price, Stock, Discount, and Threshold must be valid numbers.", { variant: "info" });
      return false;
    }
    return true;
  };

  useEffect(() => {
    if (!open) return;

    const handleFailed = (data) => {
      enqueueSnackbar(data?.message || "Failed to update product", { variant: "error" });
      setIsUpdating(false);
    };

    const handleUpdated = (data) => {
      enqueueSnackbar(data?.message || "Product updated successfully!", { variant: "success" });
      setIsUpdating(false);
      onClose();
    };

    socket.on("update-product:failed", handleFailed);
    socket.on("update-product:updated", handleUpdated);

    return () => {
      socket.off("update-product:failed", handleFailed);
      socket.off("update-product:updated", handleUpdated);
    };
  }, [open, onClose, enqueueSnackbar]);

  const handleEditProduct = async (e) => {
    e.preventDefault();
    if (!validateInputs()) return;

    setIsUpdating(true);

    let finalImage = productDetails.image;
    if (selectedFile) {
      finalImage = await convertToBase64(selectedFile);
    } else if (Array.isArray(selectedProduct?.image)) {
      finalImage = selectedProduct.image;
    }

    let finalPngImage = productDetails.pngImage;
    if (selectedPngFile) {
      finalPngImage = await convertToBase64(selectedPngFile);
    }

    const parsedShelfLife = typeof productDetails.shelfLife === "number"
      ? productDetails.shelfLife
      : (parseFloat(String(productDetails.shelfLife).replace(/[^0-9.]/g, "")) || 0);

    const payload = {
      ...productDetails,
      price: Number(productDetails.price || 0),
      stock: Number(productDetails.stock || 0),
      thresholdVal: Number(productDetails.thresholdVal || 0),
      shelfLife: parsedShelfLife,
      discount: Number(productDetails.discount || 0),
      manufacturingCost: Number(productDetails.manufacturingCost || 0),
      image: finalImage,
      pngImage: finalPngImage,
      nutritionMetrics: productDetails.nutritionMetrics,
    };

    try {
      const overrides = JSON.parse(localStorage.getItem("MADHU_showcase_custom_overrides")) || {};
      overrides[selectedProduct?._id || selectedProduct?.id || productDetails.name] = {
        title: productDetails.name,
        description: productDetails.description,
        image: finalPngImage || finalImage,
        priceInr: `₹${productDetails.price}`,
        nutritionMetrics: productDetails.nutritionMetrics,
      };
      localStorage.setItem("MADHU_showcase_custom_overrides", JSON.stringify(overrides));
    } catch (err) {}

    socket.emit("update-product", payload);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      slotProps={{
        paper: {
          className: "!relative !bg-white dark:!bg-gray-900 !rounded-2xl !shadow-2xl !w-full !max-w-2xl !scrollbar-hide",
        },
        backdrop: {
          className: "!bg-black/50 !backdrop-blur-xs",
        },
      }}
    >
      {/* Sticky Title */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800">
        <h2 className="text-xl font-bold text-center text-gray-900 dark:text-gray-100 flex items-center justify-center gap-2">
          ✏️ Edit Product Details
        </h2>
        <button
          onClick={onClose}
          disabled={isUpdating}
          className="absolute top-5 right-5 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="overflow-y-auto max-h-[75vh] scrollbar-hide px-6 py-4 flex-1 bg-white dark:bg-gray-900 space-y-4">
        <form onSubmit={handleEditProduct} className="space-y-5 text-sm">
          {/* Dual Image Upload Options: Option 1 (Normal Photo) & Option 2 (Cutout PNG) */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-3">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-800 dark:text-white flex items-center gap-2">
                <Image className="w-4 h-4 text-blue-600" />
                Product Images (2 Image Options)
              </h3>
              <span className="text-[11px] font-bold text-gray-500">Normal JPG + Cutout PNG</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option 1: Normal Product Photo (JPG/PNG/WEBP) */}
              <div className="flex flex-col items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-200">1. Normal Photo (JPG / WEBP)</span>
                <div className="relative w-20 h-20">
                  <img
                    src={imagePreview || "https://img.freepik.com/free-vector/dairy-products-poster_1284-18867.jpg?semt=ais_hybrid&w=740"}
                    alt="Normal Product Preview"
                    className="w-20 h-20 rounded-xl object-cover border border-gray-200 dark:border-gray-700 shadow-xs"
                  />
                  <label
                    htmlFor="editPhotoInput"
                    className="absolute bottom-0 right-0 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 p-1.5 rounded-full cursor-pointer shadow-sm hover:scale-105 transition"
                    title="Upload normal photo"
                  >
                    <Image className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    id="editPhotoInput"
                    name="image"
                    className="hidden"
                    disabled={isUpdating}
                    onChange={handlePhotoChange}
                  />
                </div>
                <input
                  type="text"
                  placeholder="Or paste normal image URL..."
                  value={typeof productDetails?.image === 'string' && !selectedFile ? productDetails.image : ''}
                  onChange={(e) => {
                    const url = e.target.value;
                    setSelectedFile(null);
                    setImagePreview(url);
                    setProductDetails((prev) => ({ ...prev, image: url }));
                  }}
                  disabled={isUpdating}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:border-[#1E88E5]"
                />
              </div>

              {/* Option 2: Transparent Cutout Image (PNG Only for 3D Showcase Card) */}
              <div className="flex flex-col items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-xl border border-purple-200 dark:border-gray-700">
                <span className="text-xs font-bold text-[#6C5CE7] dark:text-purple-300">2. Transparent Cutout (PNG Only)</span>
                <div className="relative w-20 h-20">
                  <img
                    src={pngImagePreview || productDetails?.pngImage || productDetails?.image || "/assets/showcase/milk_hd.png"}
                    alt="PNG Cutout Preview"
                    className="w-20 h-20 rounded-xl object-contain bg-purple-50/50 dark:bg-gray-900 border border-purple-200 dark:border-gray-700 shadow-xs p-1"
                  />
                  <label
                    htmlFor="editPngPhotoInput"
                    className="absolute bottom-0 right-0 bg-[#6C5CE7] text-white p-1.5 rounded-full cursor-pointer shadow-sm hover:scale-105 transition"
                    title="Upload transparent PNG cutout"
                  >
                    <Image className="w-3.5 h-3.5 text-white" />
                  </label>
                  <input
                    type="file"
                    accept="image/png"
                    id="editPngPhotoInput"
                    name="pngImage"
                    className="hidden"
                    disabled={isUpdating}
                    onChange={handlePngPhotoChange}
                  />
                </div>
                <input
                  type="text"
                  placeholder="Or paste PNG cutout URL..."
                  value={typeof productDetails?.pngImage === 'string' && !selectedPngFile ? productDetails.pngImage : ''}
                  onChange={(e) => {
                    const url = e.target.value;
                    setSelectedPngFile(null);
                    setPngImagePreview(url);
                    setProductDetails((prev) => ({ ...prev, pngImage: url }));
                  }}
                  disabled={isUpdating}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:border-[#6C5CE7]"
                />
              </div>
            </div>
          </div>

          {/* Product Name and Category */}
          <div className="flex flex-col md:flex-row items-center justify-between w-full gap-4">
            <div className="w-full md:w-1/2">
              <InputWithLabel
                label="Product Name"
                name="name"
                value={productDetails?.name}
                placeholder="Ex: Fresh Milk"
                icon={<Tag className="text-gray-400 w-4 h-4" />}
                onChange={handleInputChange}
                disabled={isUpdating}
              />
            </div>
            <div className="flex flex-col w-full md:w-1/2">
              <label
                htmlFor="category"
                className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1"
              >
                Category
              </label>

              <div className="relative">
                <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                <select
                  id="category"
                  name="category"
                  value={productDetails?.category}
                  onChange={handleInputChange}
                  disabled={isUpdating}
                  className={`pl-9 pr-3 py-2.5 w-full rounded-xl border border-gray-300 dark:border-gray-600 
                    bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs font-medium
                    focus:outline-none focus:border-[#1E88E5] focus:ring-2 focus:ring-[#1E88E5]/20 transition ${
                      isUpdating ? "cursor-not-allowed opacity-60" : ""
                    }`}
                >
                  <option value="" disabled hidden>
                    Select a category
                  </option>
                  {categories.map((cat, index) => (
                    <option
                      key={index}
                      value={cat}
                      className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                    >
                      {cat}
                    </option>
                  ))}
                  {productDetails?.category && !categories.includes(productDetails.category) && (
                    <option value={productDetails.category}>{productDetails.category}</option>
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Product Description */}
          <div>
            <label htmlFor="description" className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
              Description
            </label>
            <div className="flex items-start gap-2 border border-gray-300 dark:border-gray-600 rounded-xl p-2.5 bg-white dark:bg-gray-800 focus-within:border-[#1E88E5] focus-within:ring-2 focus-within:ring-[#1E88E5]/20 transition">
              <DescriptionIcon className="text-gray-400 !text-lg mt-0.5" />
              <textarea
                id="description"
                name="description"
                rows={3}
                value={productDetails?.description}
                placeholder="Enter product description"
                disabled={isUpdating}
                className="flex-1 bg-transparent focus:outline-none text-gray-900 dark:text-white text-xs font-medium"
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Showcase 5-Metric Nutritional & Health Profile Editor (AI + Custom Edit) */}
          <ShowcaseProfileEditor
            productName={productDetails?.name}
            category={productDetails?.category}
            currentImage={productDetails?.image}
            onImageChange={(newImgUrl) => {
              setSelectedFile(null);
              setImagePreview(newImgUrl);
              setProductDetails((prev) => ({ ...prev, image: newImgUrl }));
            }}
            nutritionMetrics={productDetails?.nutritionMetrics}
            onMetricsChange={(newMetrics) =>
              setProductDetails((prev) => ({
                ...prev,
                nutritionMetrics: newMetrics,
              }))
            }
            disabled={isUpdating}
          />

          {/* Manufacturing Cost */}
          <InputWithLabel
            label="Manufacturing Cost for admin"
            name="manufacturingCost"
            value={productDetails?.manufacturingCost}
            placeholder="Ex. 40"
            icon={<CurrencyRupeeIcon className="text-gray-400 !text-lg" />}
            onChange={handleInputChange}
            disabled={isUpdating}
          />

          {/* Shelf life and Selling Price */}
          <div className="flex flex-col md:flex-row items-center justify-between w-full gap-4">
            <div className="w-full md:w-1/2">
              <InputWithLabel
                label="Product's Shelflife (Days)"
                name="shelfLife"
                value={productDetails?.shelfLife}
                placeholder="Ex: 3"
                icon={<Hourglass className="text-gray-400 w-4 h-4" />}
                onChange={handleInputChange}
                disabled={isUpdating}
              />
            </div>
            <div className="w-full md:w-1/2">
              <InputWithLabel
                label="Selling Price (₹)"
                name="price"
                value={productDetails?.price}
                placeholder="Ex: 65"
                icon={<CurrencyRupeeIcon className="text-gray-400 !text-lg" />}
                onChange={handleInputChange}
                disabled={isUpdating}
              />
            </div>
          </div>

          {/* Stock and Quantity Unit */}
          <div className="flex flex-col md:flex-row items-center justify-between w-full gap-4">
            <div className="w-full md:w-1/2">
              <InputWithLabel
                label="Stock"
                name="stock"
                value={productDetails?.stock}
                placeholder="Ex: 100"
                icon={<Archive className="text-gray-400 w-4 h-4" />}
                onChange={handleInputChange}
                disabled={isUpdating}
              />
            </div>
            <div className="w-full md:w-1/2">
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="quantityUnit"
                  className="text-xs font-semibold text-gray-700 dark:text-gray-300"
                >
                  Quantity Unit
                </label>
                <div className="relative">
                  <FlaskConical className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                  <select
                    id="quantityUnit"
                    name="quantityUnit"
                    value={productDetails?.quantityUnit}
                    onChange={handleInputChange}
                    disabled={isUpdating}
                    className={`pl-9 pr-3 py-2.5 w-full rounded-xl border border-gray-300 dark:border-gray-600 
                      bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs font-medium
                      focus:outline-none focus:border-[#1E88E5] focus:ring-2 focus:ring-[#1E88E5]/20 transition ${
                        isUpdating ? "cursor-not-allowed opacity-60" : ""
                      }`}
                  >
                    {quantityUnits.map((unit, index) => (
                      <option
                        key={index}
                        value={unit}
                        className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                      >
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Threshold Value and Discount */}
          <div className="flex flex-col md:flex-row items-center justify-between w-full gap-4">
            <div className="w-full md:w-1/2">
              <InputWithLabel
                label="Threshold Value"
                name="thresholdVal"
                value={productDetails?.thresholdVal}
                placeholder="Ex: 15"
                icon={<AlertCircle className="text-gray-400 w-4 h-4" />}
                onChange={handleInputChange}
                disabled={isUpdating}
              />
            </div>
            <div className="w-full md:w-1/2">
              <InputWithLabel
                label="Discount (%)"
                name="discount"
                value={productDetails?.discount}
                placeholder="Ex: 10"
                icon={<Percent className="text-gray-400 w-4 h-4" />}
                onChange={handleInputChange}
                disabled={isUpdating}
              />
            </div>
          </div>
        </form>
      </div>

      <DialogActions className="sticky bottom-0 z-10 bg-white dark:bg-gray-900 !px-6 !py-4 rounded-b-2xl border-t border-gray-100 dark:border-gray-800">
        <button
          onClick={onClose}
          disabled={isUpdating}
          className="px-5 py-2 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={handleEditProduct}
          disabled={isUpdating}
          className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition cursor-pointer shadow-xs"
        >
          {isUpdating ? "Saving Changes..." : "Save Product Details"}
        </button>
      </DialogActions>
    </Dialog>
  );
}

function isAddingClass(isUpdating) {
  return isUpdating ? "opacity-60 cursor-not-allowed" : "";
}

function InputWithLabel({ label, name, placeholder, icon, onChange, disabled, value }) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
        {label}
      </label>
      <div className="flex items-center gap-2 border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2 bg-white dark:bg-gray-800 focus-within:border-[#1E88E5] focus-within:ring-2 focus-within:ring-[#1E88E5]/20 transition">
        {icon}
        <input
          type="text"
          name={name}
          value={value ?? ""}
          placeholder={placeholder}
          disabled={disabled}
          className={`flex-1 bg-transparent focus:outline-none text-gray-900 dark:text-white border-0 focus:ring-0 p-0 text-xs font-medium ${
            disabled ? "cursor-not-allowed opacity-60" : ""
          }`}
          onChange={onChange}
        />
      </div>
    </div>
  );
}

InputWithLabel.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  icon: PropTypes.node,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

EditProductModel.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  selectedProduct: PropTypes.object,
};
