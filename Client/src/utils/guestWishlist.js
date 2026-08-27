export const getGuestWishlist = () => {
    try {
        const stored = localStorage.getItem("guestWishlist");
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
};

export const toggleGuestWishlist = (productId) => {
    if (!productId) return { updated: getGuestWishlist(), added: false };
    const current = getGuestWishlist();
    const strId = String(productId);
    let updated;
    let added = false;
    
    if (current.map(String).includes(strId)) {
        updated = current.filter(id => String(id) !== strId);
        added = false;
    } else {
        updated = [...current, productId];
        added = true;
    }
    
    localStorage.setItem("guestWishlist", JSON.stringify(updated));
    window.dispatchEvent(new Event("guestWishlistUpdated"));
    return { updated, added };
};

export const clearGuestWishlist = () => {
    localStorage.removeItem("guestWishlist");
    window.dispatchEvent(new Event("guestWishlistUpdated"));
};
