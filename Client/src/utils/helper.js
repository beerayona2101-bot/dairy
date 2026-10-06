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

const UNIQUE_PRODUCT_IMAGES = {
  "Natural Cow Milk (Full Cream)": "/images/natural_cow_milk.png",
  "Natural Fresh Whole Cow Milk": "/images/natural_cow_milk.png",
  "Natural Buffalo Toned Milk": "/images/natural_buffalo_milk.png",
  "Natural Toned Cow Milk": "/images/natural_cow_milk.png",
  "Natural Fresh Malai Paneer": "/images/natural_malai_paneer.png",
  "Natural Organic Desi Cow Ghee": "/images/natural_desi_ghee.png",
  "Natural Thick Curd": "/images/natural_thick_curd.png",
  "Natural Salted Cooking Butter": "/images/natural_cooking_butter.png",
  "Natural Shredded Mozzarella Cheese": "/images/natural_mozzarella_cheese.png",
  "Natural Sweet Punjabi Malai Lassi": "/images/natural_malai_lassi.png",
  "Natural Spiced Masala Chaas": "/images/natural_masala_chaas.png",
  "Natural Pure Fresh Khoya (Mawa)": "/images/natural_khoya_mawa.png",
  "Natural Creamy Kesar Basundi": "/images/natural_kesar_basundi.png",
  "Natural Kesar Shrikhand": "/images/natural_kesar_shrikhand.png",
  "Natural Fresh Dairy Cream": "/images/natural_dairy_cream.png",
  "Natural Premium Dairy Milk Powder": "/images/natural_milk_powder.png",
  "Natural Soft Gulab Jamun": "/images/natural_gulab_jamun.png",
  "Natural Classic Bengali Rasgulla": "/images/natural_bengali_rasgulla.png",
  "Natural Mathura Kesar Peda": "/images/natural_kesar_peda.png",

  // Legacy mappings for backward compatibility
  "Madhu Cow Milk (Full Cream)": "/images/natural_cow_milk.png",
  "Madhu Fresh Whole Cow Milk": "/images/natural_cow_milk.png",
  "Madhur Fresh Whole Cow Milk": "/images/natural_cow_milk.png",
  "Madhu Buffalo Toned Milk": "/images/natural_buffalo_milk.png",
  "Madhur Buffalo Toned Milk": "/images/natural_buffalo_milk.png",
  "Madhu Toned Cow Milk": "/images/natural_cow_milk.png",
  "Madhu Fresh Malai Paneer": "/images/natural_malai_paneer.png",
  "Madhur Fresh Malai Paneer": "/images/natural_malai_paneer.png",
  "Madhu Organic Desi Cow Ghee": "/images/natural_desi_ghee.png",
  "Madhur Organic Desi Cow Ghee": "/images/natural_desi_ghee.png",
  "Madhu Natural Thick Curd": "/images/natural_thick_curd.png",
  "Madhur Natural Thick Curd": "/images/natural_thick_curd.png",
  "Madhu Salted Cooking Butter": "/images/natural_cooking_butter.png",
  "Madhur Salted Cooking Butter": "/images/natural_cooking_butter.png",
  "Madhu Shredded Mozzarella Cheese": "/images/natural_mozzarella_cheese.png",
  "Madhur Shredded Mozzarella Cheese": "/images/natural_mozzarella_cheese.png",
  "Madhu Sweet Punjabi Malai Lassi": "/images/natural_malai_lassi.png",
  "Madhur Sweet Punjabi Malai Lassi": "/images/natural_malai_lassi.png",
  "Madhu Spiced Masala Chaas": "/images/natural_masala_chaas.png",
  "Madhur Spiced Masala Chaas": "/images/natural_masala_chaas.png",
  "Madhu Pure Fresh Khoya (Mawa)": "/images/natural_khoya_mawa.png",
  "Madhur Pure Fresh Khoya (Mawa)": "/images/natural_khoya_mawa.png",
  "Madhu Creamy Kesar Basundi": "/images/natural_kesar_basundi.png",
  "Madhur Creamy Kesar Basundi": "/images/natural_kesar_basundi.png",
  "Madhu Kesar Shrikhand": "/images/natural_kesar_shrikhand.png",
  "Madhur Kesar Shrikhand": "/images/natural_kesar_shrikhand.png",
  "Madhu Fresh Dairy Cream": "/images/natural_dairy_cream.png",
  "Madhur Fresh Dairy Cream": "/images/natural_dairy_cream.png",
  "Madhu Premium Dairy Milk Powder": "/images/natural_milk_powder.png",
  "Madhur Premium Dairy Milk Powder": "/images/natural_milk_powder.png",
  "Madhu Soft Gulab Jamun": "/images/natural_gulab_jamun.png",
  "Madhur Soft Gulab Jamun": "/images/natural_gulab_jamun.png",
  "Madhu Classic Bengali Rasgulla": "/images/natural_bengali_rasgulla.png",
  "Madhur Classic Bengali Rasgulla": "/images/natural_bengali_rasgulla.png",
  "Madhu Mathura Kesar Peda": "/images/natural_kesar_peda.png",
  "Madhur Mathura Kesar Peda": "/images/natural_kesar_peda.png",
};

const UNIQUE_PRODUCT_BACKGROUND_IMAGES = {
  // Category exact names & short names
  "Milk": "/images/natural_cow_milk.png",
  "Paneer": "/images/natural_malai_paneer.png",
  "Ghee": "/images/natural_desi_ghee.png",
  "Curd": "/images/natural_thick_curd.png",
  "Butter": "/images/natural_cooking_butter.png",
  "Lassi": "/images/natural_malai_lassi.png",
  "Chaas": "/images/natural_masala_chaas.png",
  "Shrikhand": "/images/natural_kesar_shrikhand.png",
  "Basundi": "/images/natural_kesar_basundi.png",
  "Khoya": "/images/natural_khoya_mawa.png",
  "Cheese": "/images/natural_mozzarella_cheese.png",
  "Flavored Milk": "/images/natural_buffalo_milk.png",
  "Dairy Sweets": "/images/natural_gulab_jamun.png",
  "Milk Powder": "/images/natural_milk_powder.png",
  "Cream": "/images/natural_dairy_cream.png",
  "Badham": "/images/natural_kesar_peda.png",
  "Sweets": "/images/natural_gulab_jamun.png",
  "Khoya (Mawa)": "/images/natural_khoya_mawa.png",
  "Fresh Milk": "/images/natural_cow_milk.png",
  "Pure Ghee": "/images/natural_desi_ghee.png",
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
        const backendHost = typeof window !== "undefined" && window.location?.hostname
          ? `${window.location.protocol}//${window.location.hostname}:9000`
          : "http://localhost:9000";
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
        return cleanImg.startsWith("images/") || cleanImg.startsWith("assets/") ? "/" + cleanImg : cleanImg;
      }
    }
  }

  // 2. Keyword / Name match for local high-res product images (isolated PNG without background)
  if (name) {
    const cleanName = name.trim();
    if (UNIQUE_PRODUCT_IMAGES[cleanName]) {
      return UNIQUE_PRODUCT_IMAGES[cleanName];
    }

    const n = cleanName.toLowerCase();
    if (n.includes("powder")) return "/images/natural_milk_powder.png";
    if (n.includes("cow milk") || (n.includes("cow") && n.includes("milk"))) return "/images/natural_cow_milk.png";
    if (n.includes("toned") || n.includes("buffalo")) return "/images/natural_buffalo_milk.png";
    if (n.includes("paneer")) return "/images/natural_malai_paneer.png";
    if (n.includes("ghee")) return "/images/natural_desi_ghee.png";
    if (n.includes("curd") || n.includes("dahi") || n.includes("doi")) return "/images/natural_thick_curd.png";
    if (n.includes("butter") && !n.includes("milk")) return "/images/natural_cooking_butter.png";
    if (n.includes("cheese") || n.includes("mozzarella")) return "/images/natural_mozzarella_cheese.png";
    if (n.includes("lassi")) return "/images/natural_malai_lassi.png";
    if (n.includes("chaas") || n.includes("buttermilk") || n.includes("masala chaas")) return "/images/natural_masala_chaas.png";
    if (n.includes("khoya") || n.includes("mawa")) return "/images/natural_khoya_mawa.png";
    if (n.includes("basundi")) return "/images/natural_kesar_basundi.png";
    if (n.includes("shrikhand")) return "/images/natural_kesar_shrikhand.png";
    if (n.includes("cream") || n.includes("rabri")) return "/images/natural_dairy_cream.png";
    if (n.includes("gulab") || n.includes("jamun") || n.includes("sweet") || n.includes("mithai")) return "/images/natural_gulab_jamun.png";
    if (n.includes("rasgulla") || n.includes("rosogolla")) return "/images/natural_bengali_rasgulla.png";
    if (n.includes("peda")) return "/images/natural_kesar_peda.png";
    if (n.includes("milk") || n.includes("badam")) return "/images/natural_cow_milk.png";
  }

  return "/images/natural_cow_milk.png";
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
    if (n.includes("powder")) return "/images/natural_milk_powder.png";
    if (n.includes("cow milk") || (n.includes("cow") && n.includes("milk"))) return "/images/natural_cow_milk.png";
    if (n.includes("toned") || n.includes("buffalo")) return "/images/natural_buffalo_milk.png";
    if (n.includes("paneer")) return "/images/natural_malai_paneer.png";
    if (n.includes("ghee")) return "/images/natural_desi_ghee.png";
    if (n.includes("curd") || n.includes("dahi") || n.includes("doi")) return "/images/natural_thick_curd.png";
    if (n.includes("butter") && !n.includes("milk")) return "/images/natural_cooking_butter.png";
    if (n.includes("cheese") || n.includes("mozzarella")) return "/images/natural_mozzarella_cheese.png";
    if (n.includes("lassi")) return "/images/natural_malai_lassi.png";
    if (n.includes("chaas") || n.includes("buttermilk") || n.includes("masala chaas")) return "/images/natural_masala_chaas.png";
    if (n.includes("khoya") || n.includes("mawa")) return "/images/natural_khoya_mawa.png";
    if (n.includes("basundi")) return "/images/natural_kesar_basundi.png";
    if (n.includes("shrikhand")) return "/images/natural_kesar_shrikhand.png";
    if (n.includes("cream") || n.includes("rabri")) return "/images/natural_dairy_cream.png";
    if (n.includes("gulab") || n.includes("jamun") || n.includes("sweet") || n.includes("mithai")) return "/images/natural_gulab_jamun.png";
    if (n.includes("rasgulla") || n.includes("rosogolla")) return "/images/natural_bengali_rasgulla.png";
    if (n.includes("peda")) return "/images/natural_kesar_peda.png";
    if (n.includes("milk") || n.includes("badam")) return "/images/natural_cow_milk.png";
  }

  if (typeof imageProp === "string" && imageProp.trim()) {
    let cleanImg = imageProp.trim();
    if (cleanImg.includes("madhu_") || cleanImg.includes("madhur_")) {
      return cleanImg.replace("madhur_", "natural_").replace("madhu_", "natural_");
    }
    if (!cleanImg.includes("res.cloudinary.com") && !cleanImg.includes("example.com")) {
      return cleanImg.startsWith("images/") ? "/" + cleanImg : cleanImg;
    }
  }

  return "/images/natural_cow_milk.png";
};
