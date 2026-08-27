import { useEffect, useMemo, useState, createContext, useContext, useCallback } from "react";
import PropTypes from "prop-types";
import { UserAuthContext } from "./AuthProvider";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const { authUser } = useContext(UserAuthContext);
    const [cartItems, setCartItems] = useState([]);

    const getCartKey = useCallback(() => {
        return authUser?._id ? `cart_${authUser._id}` : "cart_guest";
    }, [authUser?._id]);

    useEffect(() => {
        const key = getCartKey();
        const stored = localStorage.getItem(key);
        if (stored) {
            try {
                setCartItems(JSON.parse(stored));
            } catch (err) {
                console.warn("Failed to parse cart items:", err);
                setCartItems([]);
            }
        } else {
            setCartItems([]);
        }
    }, [authUser, getCartKey]);

    useEffect(() => {
        const key = getCartKey();
        localStorage.setItem(key, JSON.stringify(cartItems));
    }, [cartItems, getCartKey]);

    const addToCart = (productId, quantity, price) => {
        const formattedQuantity = Number(Number(quantity).toFixed(3));
        if (formattedQuantity <= 0) return;

        setCartItems(prev => {
            const existing = prev.find(item => item.productId === productId);
            if (existing) {
                return prev.map(item =>
                    item.productId === productId
                        ? {
                            ...item,
                            quantity: Number((item.quantity + formattedQuantity).toFixed(3))
                        }
                        : item
                );
            }
            return [...prev, { productId, quantity: formattedQuantity, price }];
        });
    };

    const updateCartItem = (productId, newQuantity) => {
        const formatted = Number(Number(newQuantity).toFixed(3));
        if (formatted <= 0) {
            removeFromCart(productId);
            return;
        }

        setCartItems(prev =>
            prev.map(item =>
                item.productId === productId
                    ? { ...item, quantity: formatted }
                    : item
            )
        );
    };

    const removeFromCart = (productId) => {
        setCartItems(prev => prev.filter(item => item.productId !== productId));
    };

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
    }), [cartItems, clearCart]);

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

CartProvider.propTypes = {
    children: PropTypes.node.isRequired
};
