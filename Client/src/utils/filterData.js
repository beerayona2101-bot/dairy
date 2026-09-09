import { slugify } from "./slugify";

export const searchProducts = (products, productId) => {
  if (!productId || !Array.isArray(products)) return products ?? [];

  const rawQuery = String(productId).trim();
  if (!rawQuery) return products ?? [];

  const keyword = rawQuery.replace(/-/g, " ").toLowerCase();
  const searchSlug = slugify(rawQuery);

  const isExactCategory = (category) => {
    if (!category) return false;
    const catStr = String(category).trim();
    return slugify(catStr) === searchSlug || catStr.toLowerCase() === keyword;
  };

  const categoryMatchExists = products.some((product) =>
    isExactCategory(product?.category)
  );

  if (categoryMatchExists) {
    return products.filter((product) => isExactCategory(product?.category));
  }

  return products.filter((product) => {
    const nameMatch = product?.name?.toLowerCase()?.includes(keyword) ?? false;
    const categoryMatch = product?.category?.toLowerCase()?.includes(keyword) ?? false;
    const priceMatch = String(product?.price || "")?.includes(keyword) || false;
    return nameMatch || categoryMatch || priceMatch;
  });
};

export const recommendProducts = (products, productId) => {
  if (!productId || !Array.isArray(products) || products.length === 0) return [];

  const targetProduct = products.find((p) => {
    if (!p) return false;
    const targetSlug = slugify(String(productId));
    const pSlug = slugify(p.name || p.title || "");
    const cleanId = String(productId).toLowerCase().trim().replace(/[^a-z0-9]/g, "");
    const cleanName = String(p.name || p.title || "").toLowerCase().trim().replace(/[^a-z0-9]/g, "");
    return (
      String(p._id) === String(productId) ||
      String(p.id) === String(productId) ||
      pSlug === targetSlug ||
      cleanName === cleanId ||
      cleanId.includes(cleanName) ||
      cleanName.includes(cleanId)
    );
  });

  if (!targetProduct) return [];

  const targetCategory = (targetProduct.category || "").toLowerCase().trim();
  const targetName = (targetProduct.name || targetProduct.title || "").toLowerCase().trim();
  const targetType = (targetProduct.type || "").toLowerCase().trim();

  const getProductSpecificSubCategory = (catStr, nameStr, typeStr) => {
    const combined = `${catStr} ${nameStr} ${typeStr}`.toLowerCase();

    // 1. Flavored Milk (Chocolate Milk, Badam Milk, Kesar Milk, etc.)
    if (combined.includes("flavor") || combined.includes("badam") || combined.includes("chocolate") || combined.includes("flavored") || combined.includes("kesar milk")) {
      return "flavored-milk";
    }
    // 2. Pure Milk (Cow Milk, Buffalo Milk, Toned Milk, Full Cream Milk)
    if (combined.includes("milk") && !combined.includes("powder") && !combined.includes("sweets") && !combined.includes("cake") && !combined.includes("cream")) {
      return "pure-milk";
    }
    // 3. Curd / Dahi
    if (combined.includes("curd") || combined.includes("dahi")) {
      return "curd";
    }
    // 4. Paneer
    if (combined.includes("paneer")) {
      return "paneer";
    }
    // 5. Ghee
    if (combined.includes("ghee")) {
      return "ghee";
    }
    // 6. Butter
    if (combined.includes("butter") && !combined.includes("milk")) {
      return "butter";
    }
    // 7. Lassi / Chaas / Buttermilk
    if (combined.includes("lassi") || combined.includes("chaas") || combined.includes("buttermilk") || combined.includes("taak")) {
      return "lassi-chaas";
    }
    // 8. Khoya / Mawa
    if (combined.includes("khoya") || combined.includes("mawa")) {
      return "khoya";
    }
    // 9. Shrikhand / Basundi / Rabri
    if (combined.includes("shrikhand") || combined.includes("basundi") || combined.includes("rabri")) {
      return "shrikhand-rabri";
    }
    // 10. Cheese
    if (combined.includes("cheese")) {
      return "cheese";
    }
    // 11. Sweets
    if (combined.includes("sweet") || combined.includes("gulab") || combined.includes("rasgulla") || combined.includes("peda") || combined.includes("barfi")) {
      return "sweets";
    }
    // 12. Fresh Cream
    if (combined.includes("cream") && !combined.includes("ice")) {
      return "cream";
    }

    return catStr || "other";
  };

  const targetKey = getProductSpecificSubCategory(targetCategory, targetName, targetType);

  const related = products.filter((product) => {
    if (!product) return false;
    
    // Exclude target product itself
    if (
      (targetProduct._id && String(product._id) === String(targetProduct._id)) ||
      (targetProduct.name && String(product.name || product.title).toLowerCase().trim() === String(targetProduct.name || targetProduct.title).toLowerCase().trim())
    ) {
      return false;
    }

    const prodCategory = (product.category || "").toLowerCase().trim();
    const prodName = (product.name || product.title || "").toLowerCase().trim();
    const prodType = (product.type || "").toLowerCase().trim();

    const prodKey = getProductSpecificSubCategory(prodCategory, prodName, prodType);

    // Strictly match ONLY the exact sub-category key
    return prodKey === targetKey;
  });

  return related;
};

export const sortProducts = (products, filterType) => {
  if (!Array.isArray(products)) return [];

  switch (filterType) {
    case "Most Likes":
      return [...products].sort(
        (a, b) => (b.likes?.length ?? 0) - (a.likes?.length ?? 0)
      );

    case "Price: Low to High":
      return [...products].sort(
        (a, b) => (a.price ?? Infinity) - (b.price ?? Infinity)
      );

    case "Price: High to Low":
      return [...products].sort(
        (a, b) => (b.price ?? 0) - (a.price ?? 0)
      );

    case "Quantity: Low to High":
      return [...products].sort(
        (a, b) => (a.minQuantity ?? a.stock ?? Infinity) - (b.minQuantity ?? b.stock ?? Infinity)
      );

    case "Quantity: High to Low":
      return [...products].sort(
        (a, b) => (b.minQuantity ?? b.stock ?? 0) - (a.minQuantity ?? a.stock ?? 0)
      );

    case "Sold: Low to High":
      return [...products].sort(
        (a, b) => (a.totalQuantitySold ?? 0) - (b.totalQuantitySold ?? 0)
      );

    case "Sold: High to Low":
      return [...products].sort(
        (a, b) => (b.totalQuantitySold ?? 0) - (a.totalQuantitySold ?? 0)
      );

    default:
      return products;
  }
};

