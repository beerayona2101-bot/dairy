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
  "Madhu Cow Milk (Full Cream)": "/images/madhu_cow_milk.webp",
  "Madhu Fresh Whole Cow Milk": "/images/madhu_cow_milk.webp",
  "Madhur Fresh Whole Cow Milk": "/images/madhu_cow_milk.webp",
  "Madhu Buffalo Toned Milk": "/images/madhu_buffalo_milk.webp",
  "Madhur Buffalo Toned Milk": "/images/madhu_buffalo_milk.webp",
  "Madhu Toned Cow Milk": "/images/madhu_cow_milk.webp",
  "Madhu Fresh Malai Paneer": "/images/madhu_malai_paneer.webp",
  "Madhur Fresh Malai Paneer": "/images/madhu_malai_paneer.webp",
  "Madhu Organic Desi Cow Ghee": "/images/madhu_desi_ghee.webp",
  "Madhur Organic Desi Cow Ghee": "/images/madhu_desi_ghee.webp",
  "Madhu Natural Thick Curd": "/images/madhu_thick_curd.webp",
  "Madhur Natural Thick Curd": "/images/madhu_thick_curd.webp",
  "Madhu Salted Cooking Butter": "/images/madhu_cooking_butter.webp",
  "Madhur Salted Cooking Butter": "/images/madhu_cooking_butter.webp",
  "Madhu Shredded Mozzarella Cheese": "/images/madhu_mozzarella_cheese.webp",
  "Madhur Shredded Mozzarella Cheese": "/images/madhu_mozzarella_cheese.webp",
  "Madhu Sweet Punjabi Malai Lassi": "/images/madhu_malai_lassi.webp",
  "Madhur Sweet Punjabi Malai Lassi": "/images/madhu_malai_lassi.webp",
  "Madhu Spiced Masala Chaas": "/images/madhu_masala_chaas.webp",
  "Madhur Spiced Masala Chaas": "/images/madhu_masala_chaas.webp",
  "Madhu Pure Fresh Khoya (Mawa)": "/images/madhu_khoya_mawa.webp",
  "Madhur Pure Fresh Khoya (Mawa)": "/images/madhu_khoya_mawa.webp",
  "Madhu Creamy Kesar Basundi": "/images/madhu_kesar_basundi.webp",
  "Madhur Creamy Kesar Basundi": "/images/madhu_kesar_basundi.webp",
  "Madhu Kesar Shrikhand": "/images/madhu_kesar_shrikhand.webp",
  "Madhur Kesar Shrikhand": "/images/madhu_kesar_shrikhand.webp",
  "Madhu Fresh Dairy Cream": "/images/madhu_dairy_cream.webp",
  "Madhur Fresh Dairy Cream": "/images/madhu_dairy_cream.webp",
  "Madhu Premium Dairy Milk Powder": "/images/madhu_milk_powder.webp",
  "Madhur Premium Dairy Milk Powder": "/images/madhu_milk_powder.webp",
  "Madhu Soft Gulab Jamun": "/images/madhu_gulab_jamun.webp",
  "Madhur Soft Gulab Jamun": "/images/madhu_gulab_jamun.webp",
  "Madhu Classic Bengali Rasgulla": "/images/madhu_bengali_rasgulla.webp",
  "Madhur Classic Bengali Rasgulla": "/images/madhu_bengali_rasgulla.webp",
  "Madhu Mathura Kesar Peda": "/images/madhu_kesar_peda.webp",
  "Madhur Mathura Kesar Peda": "/images/madhu_kesar_peda.webp",
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
      if (cleanImg.startsWith("uploads/")) {
        cleanImg = "/" + cleanImg;
      }
      if (cleanImg.startsWith("/uploads")) {
        const backendHost = "http://localhost:9000";
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

  // 2. Keyword / Name match for local high-res product images
  if (name) {
    const cleanName = name.trim();
    if (UNIQUE_PRODUCT_IMAGES[cleanName]) {
      return UNIQUE_PRODUCT_IMAGES[cleanName];
    }

    const n = cleanName.toLowerCase();
    if (n.includes("powder")) return UNIQUE_PRODUCT_IMAGES["Madhu Premium Dairy Milk Powder"];
    if (n.includes("cow milk") || (n.includes("cow") && n.includes("milk"))) return UNIQUE_PRODUCT_IMAGES["Madhu Fresh Whole Cow Milk"];
    if (n.includes("toned") || n.includes("buffalo")) return UNIQUE_PRODUCT_IMAGES["Madhu Buffalo Toned Milk"];
    if (n.includes("paneer")) return UNIQUE_PRODUCT_IMAGES["Madhu Fresh Malai Paneer"];
    if (n.includes("ghee")) return UNIQUE_PRODUCT_IMAGES["Madhu Organic Desi Cow Ghee"];
    if (n.includes("curd") || n.includes("dahi") || n.includes("doi")) return UNIQUE_PRODUCT_IMAGES["Madhu Natural Thick Curd"];
    if (n.includes("butter") && !n.includes("milk")) return UNIQUE_PRODUCT_IMAGES["Madhu Salted Cooking Butter"];
    if (n.includes("cheese") || n.includes("mozzarella")) return UNIQUE_PRODUCT_IMAGES["Madhu Shredded Mozzarella Cheese"];
    if (n.includes("lassi")) return UNIQUE_PRODUCT_IMAGES["Madhu Sweet Punjabi Malai Lassi"];
    if (n.includes("chaas") || n.includes("buttermilk") || n.includes("masala chaas")) return UNIQUE_PRODUCT_IMAGES["Madhu Spiced Masala Chaas"];
    if (n.includes("khoya") || n.includes("mawa")) return UNIQUE_PRODUCT_IMAGES["Madhu Pure Fresh Khoya (Mawa)"];
    if (n.includes("basundi")) return UNIQUE_PRODUCT_IMAGES["Madhu Creamy Kesar Basundi"];
    if (n.includes("shrikhand")) return UNIQUE_PRODUCT_IMAGES["Madhu Kesar Shrikhand"];
    if (n.includes("cream") || n.includes("rabri")) return UNIQUE_PRODUCT_IMAGES["Madhu Fresh Dairy Cream"];
    if (n.includes("gulab") || n.includes("jamun") || n.includes("sweet") || n.includes("mithai")) return UNIQUE_PRODUCT_IMAGES["Madhu Soft Gulab Jamun"];
    if (n.includes("rasgulla") || n.includes("rosogolla")) return UNIQUE_PRODUCT_IMAGES["Madhu Classic Bengali Rasgulla"];
    if (n.includes("peda")) return UNIQUE_PRODUCT_IMAGES["Madhu Mathura Kesar Peda"];
    if (n.includes("milk") || n.includes("badam")) return UNIQUE_PRODUCT_IMAGES["Madhu Fresh Whole Cow Milk"];
  }

  return "/images/madhu_cow_milk.png";
};
