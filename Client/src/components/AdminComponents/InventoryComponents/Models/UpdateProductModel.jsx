import { Dialog } from "@mui/material";
import { useState, useEffect } from "react";
import { Archive, AlertCircle, FlaskConical, RefreshCw, X, Hourglass } from "lucide-react";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import PropTypes from "prop-types";
import { useSnackbar } from "notistack";
import { socket } from "../../../../socket/socket";
import { useModalBackNavigation } from "../../../../hooks/useModalBackNavigation";

const quantityUnits = ["Litre", "Ml", "Kg", "Gram", "Pack"];

export default function UpdateProductModel({ open, onClose, selectedProduct }) {
  const { enqueueSnackbar } = useSnackbar();
  useModalBackNavigation(open, () => onClose(false));

  const [productDetails, setProductDetails] = useState({
    _id: selectedProduct?._id,
    manufacturingCost: 0,
    shelfLife: 0,
    price: 0,
    stock: 0,
    quantityUnit: "Litre",
    thresholdVal: 0,
    discount: 0,
  });

  const [isUpdating, setIsUpdating] = useState(false);

  const parseNumericField = (val, fallback = 0) => {
    if (typeof val === "number") return isNaN(val) ? fallback : val;
    if (!val && val !== 0) return fallback;
    const cleaned = String(val).replace(/[^0-9.]/g, "");
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? fallback : parsed;
  };

  useEffect(() => {
    if (selectedProduct) {
      setProductDetails({
        _id: selectedProduct?._id,
        name: selectedProduct?.name || "",
        category: selectedProduct?.category || "",
        description: selectedProduct?.description || "",
        image: selectedProduct?.image?.[0] || selectedProduct?.image || "",
        manufacturingCost: parseNumericField(selectedProduct?.manufacturingCost, 0),
        shelfLife: parseNumericField(selectedProduct?.shelfLife, 7),
        price: parseNumericField(selectedProduct?.price, 0),
        stock: parseNumericField(selectedProduct?.stock, 0),
        quantityUnit: selectedProduct?.quantityUnit || "Litre",
        thresholdVal: parseNumericField(selectedProduct?.thresholdVal, 10),
        discount: parseNumericField(selectedProduct?.discount, 0),
        nutrition: selectedProduct?.nutrition || {},
      });
    }
  }, [selectedProduct]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateInputs = () => {
    const { stock, quantityUnit, thresholdVal } = productDetails;
    if (stock === undefined || stock === "" || !quantityUnit || thresholdVal === undefined || thresholdVal === "") {
      enqueueSnackbar("Please fill out required stock and threshold fields.", { variant: "warning" });
      return false;
    }
    const numStock = Number(stock);
    const numThreshold = Number(thresholdVal);

    if (isNaN(numStock) || isNaN(numThreshold)) {
      enqueueSnackbar("Stock and Threshold must be numbers.", { variant: "error" });
      return false;
    }
    return true;
  };

  useEffect(() => {
    if (!open) return;

    const handleFailed = (data) => {
      enqueueSnackbar(data?.message || "Failed to update product stock & expiry data", { variant: "error" });
      setIsUpdating(false);
    };

    const handleUpdated = (data) => {
      enqueueSnackbar(data?.message || "Product stock & expiry updated successfully!", { variant: "success" });
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

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!validateInputs()) return;

    setIsUpdating(true);

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
    };

    socket.emit("update-product", payload);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: {
          className: "!bg-white dark:!bg-gray-900 !rounded-2xl !p-6 !shadow-2xl",
        },
        backdrop: {
          className: "!bg-black/50 !backdrop-blur-xs",
        },
      }}
    >
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800 mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> Update Stock & Expiry Data
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Updating stock quantity & expiry info for <span className="font-semibold text-gray-800 dark:text-gray-200">{selectedProduct?.name}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={isUpdating}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition cursor-pointer p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleUpdateProduct} className="space-y-4 text-gray-800 dark:text-white">
        {/* 1. Stock & Quantity Unit */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputWithLabel
            label="Stock Quantity *"
            name="stock"
            value={productDetails?.stock}
            placeholder="Ex: 100"
            icon={<Archive className="text-gray-400 !w-4 !h-4" />}
            onChange={handleInputChange}
            isUpdating={isUpdating}
          />

          <div>
            <label
              htmlFor="quantityUnit"
              className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5"
            >
              <FlaskConical className="text-gray-400 !w-4 !h-4" />
              Quantity Unit
            </label>
            <select
              id="quantityUnit"
              name="quantityUnit"
              value={productDetails?.quantityUnit}
              onChange={handleInputChange}
              disabled={isUpdating}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-xs font-medium focus:outline-none focus:border-[#1E88E5] focus:ring-2 focus:ring-[#1E88E5]/20 transition"
            >
              {quantityUnits.map((unit) => (
                <option key={unit} value={unit} className="bg-white dark:bg-gray-800">
                  {unit}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 2. Product Shelflife & Threshold Value */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputWithLabel
            label="Product Shelflife (Days) *"
            name="shelfLife"
            value={productDetails?.shelfLife}
            placeholder="Ex: 7"
            icon={<Hourglass className="text-gray-400 !w-4 !h-4" />}
            onChange={handleInputChange}
            isUpdating={isUpdating}
          />

          <InputWithLabel
            label="Threshold Alert Stock *"
            name="thresholdVal"
            value={productDetails?.thresholdVal}
            placeholder="Ex: 10"
            icon={<AlertCircle className="text-gray-400 !w-4 !h-4" />}
            onChange={handleInputChange}
            isUpdating={isUpdating}
          />
        </div>

        {/* 3. Manufacturing Cost for admin */}
        <InputWithLabel
          label="Manufacturing Cost (Admin Ref)"
          name="manufacturingCost"
          value={productDetails?.manufacturingCost}
          placeholder="Ex. 40"
          icon={<CurrencyRupeeIcon className="text-gray-400 !text-lg" />}
          onChange={handleInputChange}
          isUpdating={isUpdating}
        />

        {/* Actions Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isUpdating}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isUpdating}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition cursor-pointer shadow-xs"
          >
            {isUpdating ? "Updating Stock & Expiry..." : "Update Stock & Expiry"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}

function InputWithLabel({ label, name, placeholder, icon, onChange, isUpdating, value }) {
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
          disabled={isUpdating}
          className="flex-1 bg-transparent focus:outline-none text-gray-900 dark:text-white border-0 focus:ring-0 p-0 text-xs font-medium"
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
  isUpdating: PropTypes.bool,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

UpdateProductModel.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  selectedProduct: PropTypes.object.isRequired,
};
