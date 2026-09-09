import React, { useEffect, useMemo, useState, createContext, useCallback } from "react";
import { getUserById, verifyUserSessionApi } from "../services/userService";
import { getAdminById, verifyAdminSessionApi } from "../services/adminService";
import wsManager from "../socket/WebSocketManager";
import { getSavedAddresses, addToWishlist } from "../services/userProfileService";
import { getGuestWishlist, clearGuestWishlist } from "../utils/guestWishlist";

export const UserAuthContext = createContext();
export const AdminAuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // Purge legacy persistent localStorage authentication keys to ensure tab-close reset behavior
    useEffect(() => {
        try {
            localStorage.removeItem("User");
            localStorage.removeItem("Admin");
        } catch {}
    }, []);

    const [authUser, setAuthUser] = useState(null);
    const [authAdmin, setAuthAdmin] = useState(null);
    const [authUserLoading, setAuthUserLoading] = useState(true);
    const [authAdminLoading, setAuthAdminLoading] = useState(true);
    const [openLoginDialog, setOpenLoginDialog] = useState(false);

    const [deliveryAddress, setDeliveryAddressState] = useState(null);

    const setDeliveryAddress = useCallback((addr) => {
        setDeliveryAddressState(addr);
        if (addr) {
            sessionStorage.setItem("deliveryAddress", JSON.stringify(addr));
        } else {
            sessionStorage.removeItem("deliveryAddress");
        }
    }, []);

    const fetchUserData = useCallback(async (initialUserData = null) => {
        const token = sessionStorage.getItem("userToken");
        if (!token) {
            setAuthUser(null);
            setAuthUserLoading(false);
            return;
        }

        if (initialUserData) {
            setAuthUser(initialUserData);
            setAuthUserLoading(false);
        }

        try {
            if (!initialUserData) setAuthUserLoading(true);
            const sessionData = await verifyUserSessionApi();
            if (sessionData?.success && sessionData?.user) {
                const user = sessionData.user;
                setAuthUser(user);

                // Merge guest wishlist into user account if any guest items exist
                const guestWishlist = getGuestWishlist();
                if (guestWishlist.length > 0 && user._id) {
                    for (const prodId of guestWishlist) {
                        try {
                            await addToWishlist(user._id, prodId);
                        } catch (err) {
                            console.warn("Failed to merge guest wishlist item:", prodId, err);
                        }
                    }
                    clearGuestWishlist();
                }

                if (user._id) {
                    const addressData = await getSavedAddresses(user._id).catch(() => null);
                    const addresses = addressData?.userAddresses || [];
                    if (addresses.length > 0) {
                        let stored = null;
                        try { stored = JSON.parse(sessionStorage.getItem("deliveryAddress")); } catch {}
                        const matched = stored ? addresses.find(a => a._id === stored._id) : null;
                        const chosen = matched || stored || addresses[0];
                        setDeliveryAddressState(chosen);
                    } else {
                        setDeliveryAddressState(null);
                    }
                }
            } else if (!initialUserData) {
                sessionStorage.removeItem("userToken");
                sessionStorage.removeItem("userRole");
                setAuthUser(null);
            }
        } catch (err) {
            console.warn("Could not sync user session from server:", err?.message);
            if (!initialUserData) {
                sessionStorage.removeItem("userToken");
                sessionStorage.removeItem("userRole");
                setAuthUser(null);
            }
        } finally {
            setAuthUserLoading(false);
        }
    }, []);

    const fetchAdminData = useCallback(async (initialAdminData = null) => {
        const token = sessionStorage.getItem("adminToken");
        if (!token) {
            setAuthAdmin(null);
            setAuthAdminLoading(false);
            return;
        }

        if (initialAdminData) {
            setAuthAdmin(initialAdminData);
            setAuthAdminLoading(false);
        }

        try {
            if (!initialAdminData) setAuthAdminLoading(true);
            const sessionData = await verifyAdminSessionApi();
            if (sessionData?.success && sessionData?.admin) {
                setAuthAdmin(sessionData.admin);
            } else if (!initialAdminData) {
                sessionStorage.removeItem("adminToken");
                sessionStorage.removeItem("adminRole");
                setAuthAdmin(null);
            }
        } catch {
            if (!initialAdminData) {
                sessionStorage.removeItem("adminToken");
                sessionStorage.removeItem("adminRole");
                setAuthAdmin(null);
            }
        } finally {
            setAuthAdminLoading(false);
        }
    }, []);

    // Session validation on mount
    useEffect(() => {
        const userToken = sessionStorage.getItem("userToken");
        const adminToken = sessionStorage.getItem("adminToken");

        if (userToken) {
            fetchUserData();
        } else {
            setAuthUser(null);
            setAuthUserLoading(false);
        }

        if (adminToken) {
            fetchAdminData();
        } else {
            setAuthAdmin(null);
            setAuthAdminLoading(false);
        }
    }, [fetchUserData, fetchAdminData]);

    const handleUserLogout = useCallback(() => {
        if (wsManager && authUser?._id) {
            wsManager.emit("client:logout", { userId: authUser._id });
        }
        setAuthUser(null);
        setDeliveryAddressState(null);
        sessionStorage.removeItem("userToken");
        sessionStorage.removeItem("userRole");
        sessionStorage.removeItem("deliveryAddress");
    }, [authUser?._id]);

    const handleAdminLogout = useCallback(() => {
        if (wsManager && authAdmin?._id) {
            wsManager.emit("client:logout", { adminId: authAdmin._id });
        }
        setAuthAdmin(null);
        sessionStorage.removeItem("adminToken");
        sessionStorage.removeItem("adminRole");
    }, [authAdmin?._id]);

    const value1 = useMemo(() => ({
        authAdmin,
        authAdminLoading,
        setAuthAdmin,
        setAuthAdminLoading,
        handleAdminLogout,
        fetchAdminData
    }), [authAdmin, authAdminLoading, handleAdminLogout, fetchAdminData]);

    const value2 = useMemo(() => ({
        authUser,
        deliveryAddress,
        authUserLoading,
        openLoginDialog,
        setAuthUser,
        setDeliveryAddress,
        setAuthUserLoading,
        setOpenLoginDialog,
        handleUserLogout,
        fetchUserData
    }), [authUser, deliveryAddress, authUserLoading, openLoginDialog, handleUserLogout, fetchUserData]);

    return (
        <AdminAuthContext.Provider value={value1}>
            <UserAuthContext.Provider value={value2}>
                {children}
            </UserAuthContext.Provider>
        </AdminAuthContext.Provider>
    );
};
