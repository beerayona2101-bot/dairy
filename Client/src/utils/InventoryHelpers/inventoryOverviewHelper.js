export const totalCategories = (fetchedProducts = []) =>
  new Set((fetchedProducts || []).map((product) => product?.category).filter(Boolean)).size;

export const totalProducts = (fetchedProducts = []) => {
  return (fetchedProducts || []).length;
};

export const lowStockCount = (fetchedProducts = []) => {
  return (fetchedProducts || []).filter((product) => {
    if (!product) return false;
    return Number(product.stock || 0) < Number(product.thresholdVal || 10);
  }).length;
};

export const outOfStockProducts = (fetchedProducts = []) => {
  return (fetchedProducts || []).filter((product) => {
    if (!product) return false;
    return Number(product.stock || 0) === 0;
  }).length;
};

export const getExpiryStatusCounts = (fetchedProducts = []) => {
  const now = new Date();
  let expiringSoonCount = 0;
  let expiredCount = 0;

  (fetchedProducts || []).forEach((product) => {
    if (!product || !product.createdAt) return;
    const createdDate = new Date(product.createdAt);
    if (isNaN(createdDate.getTime())) return;
    const hoursDiff = (now - createdDate) / (1000 * 60 * 60);

    if (hoursDiff >= 72) {
      expiredCount++;
    } else if (hoursDiff >= 48) {
      expiringSoonCount++;
    }
  });

  return { expiredCount, expiringSoonCount };
};

