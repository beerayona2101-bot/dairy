import {
  Dialog,
  DialogActions
} from "@mui/material";
import { Image, Tag, Archive, Package, AlertCircle, FlaskConical, X, Percent, LifeBuoy, Hourglass } from "lucide-react";
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import DescriptionIcon from '@mui/icons-material/Description';
import { useEffect, useState } from "react";
import { socket } from "../../../../socket/socket";
import { convertToBase64 } from "../../../../utils/InventoryHelpers/imageBase64Converter";
import NutritionInput from "../NutritionalInfo";
import ShowcaseProfileEditor, { generateAiNutritionalProfile } from "../ShowcaseProfileEditor";
import { useSnackbar } from "notistack";
import PropTypes from "prop-types";


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

export default function AddProductModel({ open, onClose, initialCategory = "" }) {
  const { enqueueSnackbar } = useSnackbar();
  useModalBackNavigation(open, () => onClose(false));

  const [productDetails, setProductDetails] = useState({
    name: "",
    category: initialCategory || "",
    description: "",
    image: "",
    shelfLife: 0,
    quantityUnit: "",
    stock: 0,
    thresholdVal: 0,
    price: 0,
    manufacturingCost: 0,
    nutrition: {},
    nutritionMetrics: generateAiNutritionalProfile(""),
    discount: 0
  })
  const [selectedFile, setSelectedFile] = useState(null)
  const [selectedPngFile, setSelectedPngFile] = useState(null)
  const [pngImagePreview, setPngImagePreview] = useState("")
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (open) {
      setProductDetails((prev) => ({
        ...prev,
        category: initialCategory || prev.category || "",
        nutritionMetrics: prev.nutritionMetrics && prev.nutritionMetrics.length === 5 ? prev.nutritionMetrics : generateAiNutritionalProfile(prev.name || prev.category || initialCategory),
      }));
    }
  }, [open, initialCategory]);

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
      setProductDetails((prev) => ({
        ...prev,
        image: URL.createObjectURL(file)
      }
      ));
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
        pngImage: previewUrl
      }));
    }
  };

  const validateInputs = () => {
    const { name, category, price, stock, quantityUnit, thresholdVal, description, image } = productDetails;
    if (!name || !category || price === "" || price === undefined || stock === "" || stock === undefined || !quantityUnit || thresholdVal === "" || thresholdVal === undefined || (!selectedFile && !image) || !description) {
      enqueueSnackbar("Please fill all required fields and provide an image.", { variant: "warning" });
      return false;
    }
    const numPrice = Number(price);
    const numStock = Number(stock);
    const numThreshold = Number(thresholdVal);
    const numDiscount = Number(productDetails.discount || 0);

    if (isNaN(numPrice) || isNaN(numStock) || isNaN(numThreshold) || isNaN(numDiscount)) {
      enqueueSnackbar("Price, Stock, Discount, and Threshold must be numbers.", { variant: "info" });
      return false;
    }
    return true;
  };


  useEffect(() => {
    socket.on("add-new-product:failed", (data) => {
      enqueueSnackbar(data?.message, { variant: "error" });
      setIsAdding(false);
    })

    socket.on("added-new-product:to-inventory", (data) => {
      enqueueSnackbar(data?.message, { variant: "success" });
      onClose(false);
      setIsAdding(false)
    })

    return () => {
      socket.off("add-new-product:failed")
      socket.off("added-new-product:to-inventory")
    }
  }, [enqueueSnackbar, onClose])

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!validateInputs()) return;

    setIsAdding(true);
    let base64Image = productDetails.image;
    if (selectedFile) {
      base64Image = await convertToBase64(selectedFile);
    }

    let base64PngImage = productDetails.pngImage;
    if (selectedPngFile) {
      base64PngImage = await convertToBase64(selectedPngFile);
    }

    const productData = {
      image: base64Image,
      productDetails: {
        ...productDetails,
        image: base64Image,
        pngImage: base64PngImage,
        nutritionMetrics: productDetails.nutritionMetrics,
      },
    };

    socket.emit("add-new-product", productData);
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      slotProps={{
        ...{
          paper: {
            className: "!relative !bg-white dark:!bg-gray-500/20 !rounded !shadow-xl !w-full !max-w-2xl !scrollbar-hide"
          },
          backdrop: {
            className: "!bg-black/40 !backdrop-blur-sm"
          }
        }
      }}
    >

      {/* Sticky Title */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-500/20 px-6 pt-6 pb-4 rounded">

        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100">
          🧾 Add New Product
        </h2>
        <button
          onClick={() => onClose(false)}
          className="absolute top-3 right-5 text-xl"
        >
          <X className="text-black dark:text-gray-100 "/>
        </button>
      </div>


      <div className="overflow-y-auto scrollbar-hide px-6  flex-1 bg-white dark:bg-gray-500/20 p-6 sm:p-8 shadow-xl w-full max-w-4xl space-y-4 ">
        <form onSubmit={handleAddProduct} className="space-y-6 text-sm sm:text-base ">
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
                    src={productDetails?.image || "https://img.freepik.com/free-vector/dairy-products-poster_1284-18867.jpg?semt=ais_hybrid&w=740"}
                    alt="Normal Product Preview"
                    className="w-20 h-20 rounded-xl object-cover border border-gray-200 dark:border-gray-700 shadow-xs"
                  />
                  <label
                    htmlFor="addPhotoInput"
                    className="absolute bottom-0 right-0 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 p-1.5 rounded-full cursor-pointer shadow-sm hover:scale-105 transition"
                    title="Upload normal photo"
                  >
                    <Image className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    id="addPhotoInput"
                    name="image"
                    className="hidden"
                    disabled={isAdding}
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
                    setProductDetails((prev) => ({ ...prev, image: url }));
                  }}
                  disabled={isAdding}
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
                    htmlFor="addPngPhotoInput"
                    className="absolute bottom-0 right-0 bg-[#6C5CE7] text-white p-1.5 rounded-full cursor-pointer shadow-sm hover:scale-105 transition"
                    title="Upload transparent PNG cutout"
                  >
                    <Image className="w-3.5 h-3.5 text-white" />
                  </label>
                  <input
                    type="file"
                    accept="image/png"
                    id="addPngPhotoInput"
                    name="pngImage"
                    className="hidden"
                    disabled={isAdding}
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
                  disabled={isAdding}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:border-[#6C5CE7]"
                />
              </div>
            </div>
          </div>

          {/* Product Name and Category */}
          <div className="flex flex-col md:flex-row items-center justify-between w-full gap-6">
            <div className="w-full md:w-1/2 ">
              <InputWithLabel
                label="Product Name"
                name="name"
                placeholder="Ex: Milk"
                icon={<Tag className="text-gray-500" />}
                onChange={handleInputChange}

              />
            </div>
            <div className="flex flex-col w-full md:w-1/2">
              <label
                htmlFor="category"
                className="text-sm text-gray-200/90  font-medium"
              >
                Category
              </label>

              <div className="relative mt-1">
                {/* Icon inside the select field */}
                <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500  pointer-events-none" />

                <select
                  id="category"
                  name="category"
                  onChange={handleInputChange}
                  value={productDetails?.category || ""}
                  className={`pl-10 pr-3 py-2.5 w-full rounded-lg border border-gray-600 dark:border-gray-600 
        bg-gray-50 dark:bg-gray-500/30 text-gray-700 dark:text-white 
        focus:outline-none focus:ring-1 focus:ring-gray-500 scrollbar-hide ${isAdding ? "cursor-not-allowed" : ""
                    }`}
                >
                  <option value="" className="!text-gray-500" disabled hidden>
                    Select a category
                  </option>
                  {categories.map((cat, index) => (
                    <option
                      key={index}
                      value={cat}
                      className="bg-white dark:bg-gray-600 text-gray-800 dark:text-white"
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
            <label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
              Description
            </label>
            <div className="flex items-start gap-2 border rounded-md p-2 bg-gray-50 dark:bg-gray-500/30 dark:border-gray-600">
              <DescriptionIcon className="text-gray-500" />
              <textarea
                type="text"
                id="description"
                name="description"
                rows={5}
                cols={40}
                placeholder="Enter something product"
                className={`${isAdding ? " cursor-not-allowed" : null} flex-1 bg-transparent focus:outline-none text-gray-900 dark:text-white`}
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
              setProductDetails((prev) => ({ ...prev, image: newImgUrl }));
            }}
            nutritionMetrics={productDetails?.nutritionMetrics}
            onMetricsChange={(newMetrics) =>
              setProductDetails((prev) => ({
                ...prev,
                nutritionMetrics: newMetrics,
              }))
            }
            disabled={isAdding}
          />

          <InputWithLabel
            label="Manufacturing Cost for admin"
            name="manufacturingCost"
            placeholder="Ex. 20Rs"
            icon={<CurrencyRupeeIcon className="text-gray-500" />}
            onChange={handleInputChange}
          />

          {/* Product"s Shelflife and Selling Price */}
          <div className="flex flex-col md:flex-row items-center justify-between w-full gap-6">
            <div className="w-full md:w-1/2">
              <InputWithLabel
                label="Product's Shelflife"
                name="shelfLife"
                placeholder="Ex: 4 Days"
                icon={<Hourglass className="text-gray-500" />}
                onChange={handleInputChange}
              />
            </div>
            <div className="w-full md:w-1/2">
              <InputWithLabel
                label="Selling Price (₹)"
                name="price"
                placeholder="Ex: 50"
                icon={<CurrencyRupeeIcon className="text-gray-500" />}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Stock and Quantity Unit */}
          <div className="flex flex-col md:flex-row items-center justify-between w-full gap-6 ">
            <div className="w-full md:w-1/2">
              <InputWithLabel
                label="Stock"
                name="stock"
                placeholder="Ex: 100"
                isAdding={isAdding}
                icon={<Archive className="text-gray-500" />}
                onChange={handleInputChange}
              />
            </div>
            <div className="w-full md:w-1/2">
              <div className="flex flex-col gap-1 relative">
                <label
                  htmlFor="quantityUnit"
                  className="text-sm text-gray-700 dark:text-white font-medium"
                >
                  Quantity Unit
                </label>

                <div className="relative">
                  {/* Icon inside the select field */}
                  <FlaskConical className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500  pointer-events-none" />

                  <select
                    id="quantityUnit"
                    name="quantityUnit"
                    onChange={handleInputChange}
                    defaultValue=""
                    className={`pl-10 pr-3 py-2 w-full rounded-lg border border-gray-600 dark:border-gray-600 
                    bg-gray-50 dark:bg-gray-500/30 text-gray-700 dark:text-white 
                    focus:outline-none focus:ring-1 focus:ring-gray-500 ${isAdding ? "cursor-not-allowed" : ""
                      }`}
                  >
                    <option value="" className="!text-gray-500" disabled hidden>
                      Select unit
                    </option>

                    {quantityUnits.map((unit, index) => (
                      <option
                        key={index}
                        value={unit}
                        className="bg-white dark:bg-gray-600 text-gray-800 dark:text-white"
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
          <div className="flex flex-col md:flex-row items-center justify-between w-full gap-6">
            <div className="w-full md:w-1/2">
              <InputWithLabel
                label="Threshold Value"
                name="thresholdVal"
                placeholder="Ex: 10"
                icon={<AlertCircle className="text-gray-500" />}
                onChange={handleInputChange}
              />
            </div>
            <div className="w-full md:w-1/2">
              <InputWithLabel
                label="Discount (%)"
                name="discount"
                placeholder="Ex: 10%"
                icon={<Percent className="text-gray-500" />}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </form>
      </div>


      <DialogActions className="sticky bottom-0 z-10 bg-white dark:bg-gray-500/20 !px-4 !py-5 rounded">
        <button
          onClick={onClose}
          disabled={isAdding}
          className="bg-gray-200 text-black dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white px-3 py-1 rounded hover:bg-gray-300"
        >
          Cancel
        </button>
        <button onClick={handleAddProduct} disabled={isAdding}
          className="bg-blue-500 dark:bg-orange-600/30 dark:hover:bg-orange-600/40 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
        >
          {isAdding ? "Adding..." : "Add Product"}
        </button>
      </DialogActions>
    </Dialog>
  );
}

function InputWithLabel({ label, name, placeholder, icon, onChange, isAdding }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
        {label}
      </label>
      <div className="flex items-center gap-2 border rounded- p-2 bg-gray-50 dark:bg-gray-500/30 dark:border-gray-600">
        {icon}
        <input
          type="text"
          name={name}
          placeholder={placeholder}
          className={`${isAdding ? " cursor-not-allowed" : null} flex-1 bg-transparent focus:outline-none text-gray-900 dark:text-white`}
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
  isAdding: PropTypes.bool
};
