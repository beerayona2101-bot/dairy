import { useEffect, useMemo, useState, createContext, useContext, useCallback, useRef } from "react";
import PropTypes from "prop-types";
import { UserAuthContext, AdminAuthContext } from "./AuthProvider";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const { authUser } = useContext(UserAuthContext) || {};
    const { authAdmin } = useContext(AdminAuthContext) || {};

    const activeUserId = authUser?._id || authAdmin?._id;

    const getCartKey = useCallback(() => {
        return activeUserId ? `cart_${activeUserId}` : "cart_guest";
    }, [activeUserId]);

    const isInitializedRef = useRef(false);

    const [cartItems, setCartItems] = useState(() => {
        const key = activeUserId ? `cart_${activeUserId}` : "cart_guest";
        try {
            const stored = localStorage.getItem(key);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) return parsed;
            }
        } catch (err) {
            console.warn("Failed to load initial cart:", err);
        }
        return [];
    });

    useEffect(() => {
        const key = getCartKey();
        
        // Merge guest cart if user or admin logged in
        if (activeUserId) {
            const guestCartRaw = localStorage.getItem("cart_guest");
            if (guestCartRaw) {
                try {
                    const guestCart = JSON.parse(guestCartRaw);
                    if (Array.isArray(guestCart) && guestCart.length > 0) {
                        const userCartRaw = localStorage.getItem(key);
                        let userCart = [];
                        if (userCartRaw) {
                            try { userCart = JSON.parse(userCartRaw); } catch {}
                        }
                        
                        const mergedMap = new Map();
                        (userCart || []).forEach(item => {
                            const pId = typeof item.productId === "object"
                                ? String(item.productId?._id || item.productId?.id)
                                : String(item.productId);
                            mergedMap.set(pId, item);
                        });
                        
                        guestCart.forEach(guestItem => {
                            const pId = typeof guestItem.productId === "object"
                                ? String(guestItem.productId?._id || guestItem.productId?.id)
                                : String(guestItem.productId);
                            if (mergedMap.has(pId)) {
                                const existing = mergedMap.get(pId);
                                const newQty = Number((Number(existing.quantity) + Number(guestItem.quantity)).toFixed(3));
                                mergedMap.set(pId, { ...existing, quantity: newQty });
                            } else {
                                mergedMap.set(pId, guestItem);
                            }
                        });
                        
                        const mergedCart = Array.from(mergedMap.values());
                        localStorage.setItem(key, JSON.stringify(mergedCart));
                        localStorage.removeItem("cart_guest");
                        setCartItems(mergedCart);
                        isInitializedRef.current = true;
                        return;
                    }
                } catch (err) {
                    console.warn("Failed to merge guest cart:", err);
                }
            }
        }

        const stored = localStorage.getItem(key);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    setCartItems(parsed);
                }
            } catch (err) {
                console.warn("Failed to parse cart items:", err);
            }
        } else {
            setCartItems([]);
        }
        isInitializedRef.current = true;
    }, [activeUserId, getCartKey]);

    useEffect(() => {
        if (!isInitializedRef.current) return;
        const key = getCartKey();
        try {
            localStorage.setItem(key, JSON.stringify(cartItems));
        } catch (err) {
            console.warn("Failed to save cart items to localStorage:", err);
        }
    }, [cartItems, getCartKey]);

    const removeFromCart = useCallback((productId) => {
        const rawId = typeof productId === "object" ? (productId._id || productId.id) : productId;
        if (!rawId) return;
        const targetId = String(rawId).trim();

        setCartItems(prev => {
            const updated = (Array.isArray(prev) ? prev : []).filter(item => {
                if (!item) return false;
                const existingId = typeof item.productId === "object"
                    ? (item.productId?._id || item.productId?.id)
                    : item.productId;
                return String(existingId).trim() !== targetId;
            });
            const key = getCartKey();
            try { localStorage.setItem(key, JSON.stringify(updated)); } catch {}
            return updated;
        });
    }, [getCartKey]);

    const addToCart = useCallback((productId, quantity, price) => {
        if (!productId) return;
        const rawId = typeof productId === "object" ? (productId._id || productId.id) : productId;
        if (!rawId) return;

        const targetId = String(rawId).trim();
        const formattedQuantity = Number(Number(quantity || 1).toFixed(3));
        if (formattedQuantity <= 0) return;

        setCartItems(prev => {
            const currentItems = Array.isArray(prev) ? prev : [];
            const existingIndex = currentItems.findIndex(item => {
                if (!item) return false;
                const existingId = typeof item.productId === "object"
                    ? (item.productId?._id || item.productId?.id)
                    : item.productId;
                return String(existingId).trim() === targetId;
            });

            let updated;
            if (existingIndex > -1) {
                updated = currentItems.map((item, idx) => {
                    if (idx === existingIndex) {
                        const currentQty = Number(item.quantity) || 0;
                        return {
                            ...item,
                            productId: targetId,
                            quantity: Number((currentQty + formattedQuantity).toFixed(3)),
                            price: price ?? item.price
                        };
                    }
                    return item;
                });
            } else {
                updated = [...currentItems, { productId: targetId, quantity: formattedQuantity, price: Number(price) || 0 }];
            }

            const key = getCartKey();
            try {
                localStorage.setItem(key, JSON.stringify(updated));
            } catch (e) {
                console.warn("Failed to update cart in localStorage:", e);
            }

            return updated;
        });
    }, [getCartKey]);

    const updateCartItem = useCallback((productId, newQuantity) => {
        const rawId = typeof productId === "object" ? (productId._id || productId.id) : productId;
        if (!rawId) return;
        const targetId = String(rawId).trim();
        const formatted = Number(Number(newQuantity).toFixed(3));

        if (formatted <= 0) {
            removeFromCart(targetId);
            return;
        }

        setCartItems(prev => {
            const updated = (Array.isArray(prev) ? prev : []).map(item => {
                if (!item) return item;
                const existingId = typeof item.productId === "object"
                    ? (item.productId?._id || item.productId?.id)
                    : item.productId;
                return String(existingId).trim() === targetId
                    ? { ...item, quantity: formatted }
                    : item;
            });
            const key = getCartKey();
            try { localStorage.setItem(key, JSON.stringify(updated)); } catch {}
            return updated;
        });
    }, [getCartKey, removeFromCart]);

    const clearCart = useCallback(() => {
        setCartItems([]);
        const key = getCartKey();
        localStorage.removeItem(key);
    }, [getCartKey]);

    const value = useMemo(() => ({
        cartItems,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart
    }), [cartItems, addToCart, updateCartItem, removeFromCart, clearCart]);

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

CartProvider.propTypes = {
    children: PropTypes.node.isRequired
};
