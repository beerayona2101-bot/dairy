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
  "Madhur Fresh Whole Cow Milk": "/images/madhur_cow_milk.png",
  "Madhur Buffalo Toned Milk": "/images/madhur_buffalo_milk.png",
  "Madhur Fresh Malai Paneer": "/images/madhur_malai_paneer.png",
  "Madhur Organic Desi Cow Ghee": "/images/madhur_desi_ghee.png",
  "Madhur Natural Thick Curd": "/images/madhur_thick_curd.png",
  "Madhur Salted Cooking Butter": "/images/madhur_cooking_butter.png",
  "Madhur Shredded Mozzarella Cheese": "/images/madhur_mozzarella_cheese.png",
  "Madhur Sweet Punjabi Malai Lassi": "/images/madhur_malai_lassi.png",
  "Madhur Spiced Masala Chaas": "/images/madhur_masala_chaas.png",
  "Madhur Pure Fresh Khoya (Mawa)": "/images/madhur_khoya_mawa.png",
  "Madhur Creamy Kesar Basundi": "/images/madhur_kesar_basundi.png",
  "Madhur Kesar Shrikhand": "/images/madhur_kesar_shrikhand.png",
  "Madhur Fresh Dairy Cream": "/images/madhur_dairy_cream.png",
  "Madhur Premium Dairy Milk Powder": "/images/madhur_milk_powder.png",
  "Madhur Soft Gulab Jamun": "/images/madhur_gulab_jamun.png",
  "Madhur Classic Bengali Rasgulla": "/images/madhur_bengali_rasgulla.png",
  "Madhur Mathura Kesar Peda": "/images/madhur_kesar_peda.png",
};

export const getProductImage = (item, fallbackName = "") => {
  let name = "";
  let imageProp = null;

  if (typeof item === "string") {
    imageProp = item;
    name = fallbackName;
  } else if (typeof item === "object" && item !== null) {
    name = item.name || item.title || item.productName || fallbackName || "";
    imageProp = Array.isArray(item.image) ? item.image[0] : (item.image || item.photo || item.imageURL || item.pngImage || item.showcaseCutout);
  }

  // 1. Direct custom valid image URL if provided
  if (typeof imageProp === "string" && imageProp.trim()) {
    const cleanImg = imageProp.trim();
    if (
      cleanImg !== "null" &&
      cleanImg !== "undefined" &&
      !cleanImg.includes("unsplash.com")
    ) {
      if (
        cleanImg.startsWith("http://") ||
        cleanImg.startsWith("https://") ||
        cleanImg.startsWith("data:") ||
        cleanImg.startsWith("/uploads") ||
        cleanImg.startsWith("uploads/") ||
        cleanImg.startsWith("/images") ||
        cleanImg.startsWith("images/") ||
        cleanImg.startsWith("/assets") ||
        cleanImg.startsWith("assets/") ||
        cleanImg.startsWith("blob:") ||
        cleanImg.startsWith("/src")
      ) {
        return cleanImg;
      }
    }
  }

  // 2. Exact product name match in UNIQUE_PRODUCT_IMAGES map
  if (name && UNIQUE_PRODUCT_IMAGES[name]) {
    return UNIQUE_PRODUCT_IMAGES[name];
  }

  // 3. Check case-insensitive / partial product name match
  if (name) {
    const cleanName = name.toLowerCase().trim();
    for (const [key, url] of Object.entries(UNIQUE_PRODUCT_IMAGES)) {
      if (cleanName.includes(key.toLowerCase()) || key.toLowerCase().includes(cleanName)) {
        return url;
      }
    }
  }

  // 4. Category/Keywords smart matcher if name has keywords
  if (name) {
    const n = name.toLowerCase();
    if (n.includes("milk powder") || n.includes("powder")) return UNIQUE_PRODUCT_IMAGES["Madhur Premium Dairy Milk Powder"];
    if (n.includes("cow milk") || n.includes("whole milk")) return UNIQUE_PRODUCT_IMAGES["Madhur Fresh Whole Cow Milk"];
    if (n.includes("toned milk") || n.includes("buffalo")) return UNIQUE_PRODUCT_IMAGES["Madhur Buffalo Toned Milk"];
    if (n.includes("paneer")) return UNIQUE_PRODUCT_IMAGES["Madhur Fresh Malai Paneer"];
    if (n.includes("ghee")) return UNIQUE_PRODUCT_IMAGES["Madhur Organic Desi Cow Ghee"];
    if (n.includes("curd") || n.includes("dahi")) return UNIQUE_PRODUCT_IMAGES["Madhur Natural Thick Curd"];
    if (n.includes("butter")) return UNIQUE_PRODUCT_IMAGES["Madhur Salted Cooking Butter"];
    if (n.includes("cheese") || n.includes("mozzarella")) return UNIQUE_PRODUCT_IMAGES["Madhur Shredded Mozzarella Cheese"];
    if (n.includes("lassi")) return UNIQUE_PRODUCT_IMAGES["Madhur Sweet Punjabi Malai Lassi"];
    if (n.includes("chaas") || n.includes("buttermilk")) return UNIQUE_PRODUCT_IMAGES["Madhur Spiced Masala Chaas"];
    if (n.includes("khoya") || n.includes("mawa")) return UNIQUE_PRODUCT_IMAGES["Madhur Pure Fresh Khoya (Mawa)"];
    if (n.includes("basundi")) return UNIQUE_PRODUCT_IMAGES["Madhur Creamy Kesar Basundi"];
    if (n.includes("shrikhand")) return UNIQUE_PRODUCT_IMAGES["Madhur Kesar Shrikhand"];
    if (n.includes("cream")) return UNIQUE_PRODUCT_IMAGES["Madhur Fresh Dairy Cream"];
    if (n.includes("gulab") || n.includes("jamun")) return UNIQUE_PRODUCT_IMAGES["Madhur Soft Gulab Jamun"];
    if (n.includes("rasgulla") || n.includes("rosogolla")) return UNIQUE_PRODUCT_IMAGES["Madhur Classic Bengali Rasgulla"];
    if (n.includes("peda")) return UNIQUE_PRODUCT_IMAGES["Madhur Mathura Kesar Peda"];
    if (n.includes("milk")) return UNIQUE_PRODUCT_IMAGES["Madhur Fresh Whole Cow Milk"];
  }

  // 5. Fallback if any imageProp string exists
  if (typeof imageProp === "string" && imageProp.trim() && imageProp !== "null" && imageProp !== "undefined") {
    return imageProp;
  }

  return "/images/madhur_cow_milk.png";
};
