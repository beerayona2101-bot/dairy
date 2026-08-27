export const groupProductsByCategory = (products = []) => {
    const map = {};

    for (let product of (products || [])) {
        const rawCat = product?.category ? String(product.category).trim() : "Others";
        const category = rawCat || "Others";
        if (!map[category]) {
            map[category] = [];
        }
        map[category].push(product);
    }

    return map;
}
