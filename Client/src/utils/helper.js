import { getBaseUrl } from "../services/api.js";

export const getDiscountedPrice = (price, discountPercent) => {
  const validPrice = typeof price === "number" && price >= 0 ? price : 0;
  const validDiscount = typeof discountPercent === "number" && discountPercent >= 0 ? discountPercent : 0;

  const discountAmount = (validPrice * validDiscount) / 100;
  const discountedPrice = validPrice - discountAmount;

  return {
    discountedPrice: parseFloat(discountedPrice.toFixed(2)),
    saved: parseFloat(discountAmount.toFixed(2)),
  };
};

export const toOptimizedWebp = (url) => {
  if (typeof url !== "string" || !url) return url;
  if ((url.includes("/images/natural_") || url.includes("/images/madhur_") || url.includes("/images/madhu_")) && url.endsWith(".png")) {
    return url.replace(".png", ".webp");
  }
  return url;
};

const UNIQUE_PRODUCT_IMAGES = {
  "Natural Cow Milk (Full Cream)": "/images/natural_cow_milk.webp",
  "Natural Fresh Whole Cow Milk": "/images/natural_cow_milk.webp",
  "Natural Buffalo Toned Milk": "/images/natural_buffalo_milk.webp",
  "Natural Toned Cow Milk": "/images/natural_cow_milk.webp",
  "Natural Fresh Malai Paneer": "/images/natural_malai_paneer.webp",
  "Natural Organic Desi Cow Ghee": "/images/natural_desi_ghee.webp",
  "Natural Thick Curd": "/images/natural_thick_curd.webp",
  "Natural Salted Cooking Butter": "/images/natural_cooking_butter.webp",
  "Natural Shredded Mozzarella Cheese": "/images/natural_mozzarella_cheese.webp",
  "Natural Sweet Punjabi Malai Lassi": "/images/natural_malai_lassi.webp",
  "Natural Spiced Masala Chaas": "/images/natural_masala_chaas.webp",
  "Natural Pure Fresh Khoya (Mawa)": "/images/natural_khoya_mawa.webp",
  "Natural Creamy Kesar Basundi": "/images/natural_kesar_basundi.webp",
  "Natural Kesar Shrikhand": "/images/natural_kesar_shrikhand.webp",
  "Natural Fresh Dairy Cream": "/images/natural_dairy_cream.webp",
  "Natural Premium Dairy Milk Powder": "/images/natural_milk_powder.webp",
  "Natural Soft Gulab Jamun": "/images/natural_gulab_jamun.webp",
  "Natural Classic Bengali Rasgulla": "/images/natural_bengali_rasgulla.webp",
  "Natural Mathura Kesar Peda": "/images/natural_kesar_peda.webp",

  // Legacy mappings for backward compatibility
  "Madhu Cow Milk (Full Cream)": "/images/natural_cow_milk.webp",
  "Madhu Fresh Whole Cow Milk": "/images/natural_cow_milk.webp",
  "Madhur Fresh Whole Cow Milk": "/images/natural_cow_milk.webp",
  "Madhu Buffalo Toned Milk": "/images/natural_buffalo_milk.webp",
  "Madhur Buffalo Toned Milk": "/images/natural_buffalo_milk.webp",
  "Madhu Toned Cow Milk": "/images/natural_cow_milk.webp",
  "Madhu Fresh Malai Paneer": "/images/natural_malai_paneer.webp",
  "Madhur Fresh Malai Paneer": "/images/natural_malai_paneer.webp",
  "Madhu Organic Desi Cow Ghee": "/images/natural_desi_ghee.webp",
  "Madhur Organic Desi Cow Ghee": "/images/natural_desi_ghee.webp",
  "Madhu Natural Thick Curd": "/images/natural_thick_curd.webp",
  "Madhur Natural Thick Curd": "/images/natural_thick_curd.webp",
  "Madhu Salted Cooking Butter": "/images/natural_cooking_butter.webp",
  "Madhur Salted Cooking Butter": "/images/natural_cooking_butter.webp",
  "Madhu Shredded Mozzarella Cheese": "/images/natural_mozzarella_cheese.webp",
  "Madhur Shredded Mozzarella Cheese": "/images/natural_mozzarella_cheese.webp",
  "Madhu Sweet Punjabi Malai Lassi": "/images/natural_malai_lassi.webp",
  "Madhur Sweet Punjabi Malai Lassi": "/images/natural_malai_lassi.webp",
  "Madhu Spiced Masala Chaas": "/images/natural_masala_chaas.webp",
  "Madhur Spiced Masala Chaas": "/images/natural_masala_chaas.webp",
  "Madhu Pure Fresh Khoya (Mawa)": "/images/natural_khoya_mawa.webp",
  "Madhur Pure Fresh Khoya (Mawa)": "/images/natural_khoya_mawa.webp",
  "Madhu Creamy Kesar Basundi": "/images/natural_kesar_basundi.webp",
  "Madhur Creamy Kesar Basundi": "/images/natural_kesar_basundi.webp",
  "Madhu Kesar Shrikhand": "/images/natural_kesar_shrikhand.webp",
  "Madhur Kesar Shrikhand": "/images/natural_kesar_shrikhand.webp",
  "Madhu Fresh Dairy Cream": "/images/natural_dairy_cream.webp",
  "Madhur Fresh Dairy Cream": "/images/natural_dairy_cream.webp",
  "Madhu Premium Dairy Milk Powder": "/images/natural_milk_powder.webp",
  "Madhur Premium Dairy Milk Powder": "/images/natural_milk_powder.webp",
  "Madhu Soft Gulab Jamun": "/images/natural_gulab_jamun.webp",
  "Madhur Soft Gulab Jamun": "/images/natural_gulab_jamun.webp",
  "Madhu Classic Bengali Rasgulla": "/images/natural_bengali_rasgulla.webp",
  "Madhur Classic Bengali Rasgulla": "/images/natural_bengali_rasgulla.webp",
  "Madhu Mathura Kesar Peda": "/images/natural_kesar_peda.webp",
  "Madhur Mathura Kesar Peda": "/images/natural_kesar_peda.webp",
};

const UNIQUE_PRODUCT_BACKGROUND_IMAGES = {
  // Category exact names & short names
  "Milk": "/images/natural_cow_milk.webp",
  "Paneer": "/images/natural_malai_paneer.webp",
  "Ghee": "/images/natural_desi_ghee.webp",
  "Curd": "/images/natural_thick_curd.webp",
  "Butter": "/images/natural_cooking_butter.webp",
  "Lassi": "/images/natural_malai_lassi.webp",
  "Chaas": "/images/natural_masala_chaas.webp",
  "Shrikhand": "/images/natural_kesar_shrikhand.webp",
  "Basundi": "/images/natural_kesar_basundi.webp",
  "Khoya": "/images/natural_khoya_mawa.webp",
  "Cheese": "/images/natural_mozzarella_cheese.webp",
  "Flavored Milk": "/images/natural_buffalo_milk.webp",
  "Dairy Sweets": "/images/natural_gulab_jamun.webp",
  "Milk Powder": "/images/natural_milk_powder.webp",
  "Cream": "/images/natural_dairy_cream.webp",
  "Badham": "/images/natural_kesar_peda.webp",
  "Sweets": "/images/natural_gulab_jamun.webp",
  "Khoya (Mawa)": "/images/natural_khoya_mawa.webp",
  "Fresh Milk": "/images/natural_cow_milk.webp",
  "Pure Ghee": "/images/natural_desi_ghee.webp",
};

export const getProductImage = (item, fallbackName = "") => {
  let name = "";
  let imageProp = null;

  if (typeof item === "string") {
    imageProp = item;
    name = fallbackName;
  } else if (typeof item === "object" && item !== null) {
    name = item.name || item.title || item.category || item.productName || item.product?.name || item.productId?.name || fallbackName || "";
    imageProp = Array.isArray(item.image) ? item.image[0] : (item.image || item.photo || item.imageURL || item.pngImage || item.showcaseCutout || item.product?.image || item.productId?.image);
  }

  if (Array.isArray(imageProp)) {
    imageProp = imageProp[0];
  }

  // 1. Direct valid local images or non-broken custom uploads
  if (typeof imageProp === "string" && imageProp.trim()) {
    let cleanImg = imageProp.trim();

    if (
      cleanImg !== "null" &&
      cleanImg !== "undefined" &&
      !cleanImg.includes("res.cloudinary.com") &&
      !cleanImg.includes("example.com") &&
      !cleanImg.includes("unsplash.com")
    ) {
      if (cleanImg.includes("madhu_") || cleanImg.includes("madhur_")) {
        cleanImg = cleanImg.replace("madhur_", "natural_").replace("madhu_", "natural_");
      }

      if (cleanImg.startsWith("uploads/")) {
        cleanImg = "/" + cleanImg;
      }
      if (cleanImg.startsWith("/uploads")) {
        const backendHost = getBaseUrl();
        return `${backendHost}${cleanImg}`;
      }
      if (
        cleanImg.startsWith("/images") ||
        cleanImg.startsWith("images/") ||
        cleanImg.startsWith("/assets") ||
        cleanImg.startsWith("assets/") ||
        cleanImg.startsWith("data:") ||
        cleanImg.startsWith("blob:") ||
        cleanImg.startsWith("/src")
      ) {
        const path = cleanImg.startsWith("images/") || cleanImg.startsWith("assets/") ? "/" + cleanImg : cleanImg;
        return toOptimizedWebp(path);
      }
    }
  }

  // 2. Keyword / Name match for local high-res product images (isolated WebP)
  if (name) {
    const cleanName = name.trim();
    if (UNIQUE_PRODUCT_IMAGES[cleanName]) {
      return UNIQUE_PRODUCT_IMAGES[cleanName];
    }

    const n = cleanName.toLowerCase();
    if (n.includes("powder")) return "/images/natural_milk_powder.webp";
    if (n.includes("cow milk") || (n.includes("cow") && n.includes("milk"))) return "/images/natural_cow_milk.webp";
    if (n.includes("toned") || n.includes("buffalo")) return "/images/natural_buffalo_milk.webp";
    if (n.includes("paneer")) return "/images/natural_malai_paneer.webp";
    if (n.includes("ghee")) return "/images/natural_desi_ghee.webp";
    if (n.includes("curd") || n.includes("dahi") || n.includes("doi")) return "/images/natural_thick_curd.webp";
    if (n.includes("butter") && !n.includes("milk")) return "/images/natural_cooking_butter.webp";
    if (n.includes("cheese") || n.includes("mozzarella")) return "/images/natural_mozzarella_cheese.webp";
    if (n.includes("lassi")) return "/images/natural_malai_lassi.webp";
    if (n.includes("chaas") || n.includes("buttermilk") || n.includes("masala chaas")) return "/images/natural_masala_chaas.webp";
    if (n.includes("khoya") || n.includes("mawa")) return "/images/natural_khoya_mawa.webp";
    if (n.includes("basundi")) return "/images/natural_kesar_basundi.webp";
    if (n.includes("shrikhand") || n.includes("amrakhand")) return "/images/natural_kesar_shrikhand.webp";
    if (n.includes("cream") || n.includes("rabri")) return "/images/natural_dairy_cream.webp";
    if (n.includes("gulab") || n.includes("jamun") || n.includes("sweet") || n.includes("mithai")) return "/images/natural_gulab_jamun.webp";
    if (n.includes("rasgulla") || n.includes("rosogolla")) return "/images/natural_bengali_rasgulla.webp";
    if (n.includes("peda")) return "/images/natural_kesar_peda.webp";
    if (n.includes("kalakand") || n.includes("milk cake")) return "/images/natural_khoya_mawa.webp";
    if (n.includes("milk") || n.includes("badam") || n.includes("badham")) return "/images/natural_cow_milk.webp";
  }

  return "/images/natural_cow_milk.webp";
};

export const getCardBackgroundImage = (item, fallbackName = "") => {
  let name = "";
  let imageProp = null;

  if (typeof item === "string") {
    imageProp = item;
    name = fallbackName || item;
  } else if (typeof item === "object" && item !== null) {
    name = item.name || item.title || item.category || item.productName || item.product?.name || item.productId?.name || fallbackName || "";
    imageProp = Array.isArray(item.image) ? item.image[0] : (item.image || item.photo || item.imageURL || item.product?.image || item.productId?.image);
  }

  // 1. Direct Name Match in UNIQUE_PRODUCT_BACKGROUND_IMAGES
  if (name) {
    const cleanName = name.trim();
    if (UNIQUE_PRODUCT_BACKGROUND_IMAGES[cleanName]) {
      return UNIQUE_PRODUCT_BACKGROUND_IMAGES[cleanName];
    }
  }

  // 2. Keyword Match in Name
  if (name) {
    const n = name.trim().toLowerCase();
    if (n.includes("powder")) return "/images/natural_milk_powder.webp";
    if (n.includes("cow milk") || (n.includes("cow") && n.includes("milk"))) return "/images/natural_cow_milk.webp";
    if (n.includes("toned") || n.includes("buffalo")) return "/images/natural_buffalo_milk.webp";
    if (n.includes("paneer")) return "/images/natural_malai_paneer.webp";
    if (n.includes("ghee")) return "/images/natural_desi_ghee.webp";
    if (n.includes("curd") || n.includes("dahi") || n.includes("doi")) return "/images/natural_thick_curd.webp";
    if (n.includes("butter") && !n.includes("milk")) return "/images/natural_cooking_butter.webp";
    if (n.includes("cheese") || n.includes("mozzarella")) return "/images/natural_mozzarella_cheese.webp";
    if (n.includes("lassi")) return "/images/natural_malai_lassi.webp";
    if (n.includes("chaas") || n.includes("buttermilk") || n.includes("masala chaas")) return "/images/natural_masala_chaas.webp";
    if (n.includes("khoya") || n.includes("mawa")) return "/images/natural_khoya_mawa.webp";
    if (n.includes("basundi")) return "/images/natural_kesar_basundi.webp";
    if (n.includes("shrikhand")) return "/images/natural_kesar_shrikhand.webp";
    if (n.includes("cream") || n.includes("rabri")) return "/images/natural_dairy_cream.webp";
    if (n.includes("gulab") || n.includes("jamun") || n.includes("sweet") || n.includes("mithai")) return "/images/natural_gulab_jamun.webp";
    if (n.includes("rasgulla") || n.includes("rosogolla")) return "/images/natural_bengali_rasgulla.webp";
    if (n.includes("peda")) return "/images/natural_kesar_peda.webp";
    if (n.includes("milk") || n.includes("badam")) return "/images/natural_cow_milk.webp";
  }

  if (typeof imageProp === "string" && imageProp.trim()) {
    let cleanImg = imageProp.trim();
    if (cleanImg.includes("madhu_") || cleanImg.includes("madhur_")) {
      cleanImg = cleanImg.replace("madhur_", "natural_").replace("madhu_", "natural_");
    }
    if (!cleanImg.includes("res.cloudinary.com") && !cleanImg.includes("example.com")) {
      const path = cleanImg.startsWith("images/") ? "/" + cleanImg : cleanImg;
      return toOptimizedWebp(path);
    }
  }

  return "/images/natural_cow_milk.webp";
};

export const splitProductName = (rawName = "") => {
  const name = String(rawName || "").trim();
  if (!name) return { mainTitle: "", variantInfo: "" };

  const parenMatch = name.match(/^(.*?)\s*(\([^)]+\))\s*$/);
  if (parenMatch && parenMatch[1]) {
    return {
      mainTitle: parenMatch[1].trim(),
      variantInfo: parenMatch[2].trim(),
    };
  }

  const dashMatch = name.match(/^(.*?)\s*[-–—]\s*(\d+.*)$/);
  if (dashMatch && dashMatch[1]) {
    return {
      mainTitle: dashMatch[1].trim(),
      variantInfo: `(${dashMatch[2].trim()})`,
    };
  }

  return {
    mainTitle: name,
    variantInfo: "",
  };
};

export const formatRating = (rating) => {
  if (rating === undefined || rating === null || rating === "") return "4.9";
  const num = Number(rating);
  if (isNaN(num)) return "4.9";
  return num.toFixed(1);
};
