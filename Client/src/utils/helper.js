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
  "Madhur Fresh Whole Cow Milk": "https://res.cloudinary.com/cf1z70hh/image/upload/v1786969530/madhur_dairy_products/ftq2d0zfpaw96wiu0cvv.jpg",
  "Madhur Buffalo Toned Milk": "https://res.cloudinary.com/cf1z70hh/image/upload/v1786969528/madhur_dairy_products/m1andk2jgffuklldfaw5.jpg",
  "Madhur Fresh Malai Paneer": "https://res.cloudinary.com/cf1z70hh/image/upload/v1786969545/madhur_dairy_products/fjzgvoiujr6wco1s8frv.jpg",
  "Madhur Organic Desi Cow Ghee": "https://res.cloudinary.com/cf1z70hh/image/upload/v1786969537/madhur_dairy_products/eg07fuoa6yyz16kp2duy.jpg",
  "Madhur Natural Thick Curd": "https://res.cloudinary.com/cf1z70hh/image/upload/v1786969548/madhur_dairy_products/tpk19n9emretjunded8t.jpg",
  "Madhur Salted Cooking Butter": "https://res.cloudinary.com/cf1z70hh/image/upload/v1786969529/madhur_dairy_products/uftolohqiilawevlbgmu.jpg",
  "Madhur Shredded Mozzarella Cheese": "https://res.cloudinary.com/cf1z70hh/image/upload/v1786969547/madhur_dairy_products/chq0qfbl2ttirwsb74zv.jpg",
  "Madhur Sweet Punjabi Malai Lassi": "https://res.cloudinary.com/cf1z70hh/image/upload/v1786969544/madhur_dairy_products/umhuttcbgjekli62ibjr.jpg",
  "Madhur Spiced Masala Chaas": "https://res.cloudinary.com/cf1z70hh/image/upload/v1786969546/madhur_dairy_products/kkludx8awoi1fca0fd5b.jpg",
  "Madhur Pure Fresh Khoya (Mawa)": "https://res.cloudinary.com/cf1z70hh/image/upload/v1786969543/madhur_dairy_products/sihobwplxrwso3zfbtkd.jpg",
  "Madhur Creamy Kesar Basundi": "https://res.cloudinary.com/cf1z70hh/image/upload/v1786969540/madhur_dairy_products/u64iwoyr5mlfcwmync6c.jpg",
  "Madhur Kesar Shrikhand": "https://res.cloudinary.com/cf1z70hh/image/upload/v1786969542/madhur_dairy_products/tae6as2rrwwcfeudvcwd.jpg",
  "Madhur Fresh Dairy Cream": "https://res.cloudinary.com/cf1z70hh/image/upload/v1786969531/madhur_dairy_products/w5qjc7dlwh80lzgvfdj3.jpg",
  "Madhur Premium Dairy Milk Powder": "https://res.cloudinary.com/cf1z70hh/image/upload/v1786969547/madhur_dairy_products/kfdrncte8psxmqrryiyz.jpg",
  "Madhur Soft Gulab Jamun": "https://res.cloudinary.com/cf1z70hh/image/upload/v1786969538/madhur_dairy_products/ib5rbqpl14iwzsn8ye50.jpg",
  "Madhur Classic Bengali Rasgulla": "https://res.cloudinary.com/cf1z70hh/image/upload/v1786969527/madhur_dairy_products/a5fyz1ce2lxul5uz5wx0.jpg",
  "Madhur Mathura Kesar Peda": "https://res.cloudinary.com/cf1z70hh/image/upload/v1786969541/madhur_dairy_products/shjs3gz3eblnlg7kvsc7.jpg",
};

export const getProductImage = (item, fallbackName = "") => {
  if (!item) return UNIQUE_PRODUCT_IMAGES[fallbackName] || "https://res.cloudinary.com/cf1z70hh/image/upload/v1786969530/madhur_dairy_products/ftq2d0zfpaw96wiu0cvv.jpg";

  let name = "";
  let imageProp = null;

  if (typeof item === "string") {
    if (UNIQUE_PRODUCT_IMAGES[item]) return UNIQUE_PRODUCT_IMAGES[item];
    imageProp = item;
    name = fallbackName;
  } else if (typeof item === "object") {
    name = item.name || item.title || item.productName || fallbackName || "";
    imageProp = item.image || item.photo || item.imageURL;
  }

  // 1. Check exact product name match
  if (name && UNIQUE_PRODUCT_IMAGES[name]) {
    return UNIQUE_PRODUCT_IMAGES[name];
  }

  // 2. Check case-insensitive / partial product name match
  if (name) {
    const cleanName = name.toLowerCase().trim();
    for (const [key, url] of Object.entries(UNIQUE_PRODUCT_IMAGES)) {
      if (cleanName.includes(key.toLowerCase()) || key.toLowerCase().includes(cleanName)) {
        return url;
      }
    }
  }

  // 3. Category/Keywords smart matcher if name has keywords
  if (name) {
    const n = name.toLowerCase();
    if (n.includes("milk powder") || n.includes("powder")) return UNIQUE_PRODUCT_IMAGES["Madhur Premium Dairy Milk Powder"];
    if (n.includes("cow milk")) return UNIQUE_PRODUCT_IMAGES["Madhur Fresh Whole Cow Milk"];
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
  }

  // 4. Valid image string check (ignore legacy shared defaults)
  if (typeof imageProp === "string" && imageProp.trim()) {
    if (!imageProp.includes("madhur_dairy_milk.png") && !imageProp.includes("madhur_dairy_paneer.png") && !imageProp.includes("madhur_dairy_ghee.png")) {
      return imageProp;
    }
  }

  if (Array.isArray(imageProp) && imageProp.length > 0) {
    const first = imageProp[0];
    if (typeof first === "string" && first.trim() && !first.includes("madhur_dairy_milk.png") && !first.includes("madhur_dairy_paneer.png") && !first.includes("madhur_dairy_ghee.png")) {
      return first;
    }
    if (first && typeof first === "object" && typeof first.url === "string" && first.url.trim()) return first.url;
  }

  return "/images/madhur_cow_milk.png";
};
