import React, { useEffect, useMemo, useState, createContext, useCallback } from "react";
import { getUserById } from "../services/userService";
import { getAdminById } from "../services/adminService";
import { socket } from "../socket/socket";
import { getSavedAddresses, addToWishlist } from "../services/userProfileService";
import { getGuestWishlist, clearGuestWishlist } from "../utils/guestWishlist";

export const UserAuthContext = createContext();
export const AdminAuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const initialUser = (() => { try { return JSON.parse(localStorage.getItem("User")); } catch { return null; } })();
    const initialAdmin = (() => { try { return JSON.parse(localStorage.getItem("Admin")); } catch { return null; } })();

    const [authUser, setAuthUser] = useState(initialUser || null);
    const [authAdmin, setAuthAdmin] = useState(initialAdmin || null);
    const [authUserLoading, setAuthUserLoading] = useState(false);
    const [authAdminLoading, setAuthAdminLoading] = useState(false);
    const [openLoginDialog, setOpenLoginDialog] = useState(false);

    useEffect(() => {
        if (authUser) {
            localStorage.setItem("User", JSON.stringify(authUser));
        }
    }, [authUser]);

    useEffect(() => {
        if (authAdmin) {
            localStorage.setItem("Admin", JSON.stringify(authAdmin));
        }
    }, [authAdmin]);

    const storedAddress = initialUser?._id ? (() => { try { return JSON.parse(localStorage.getItem("deliveryAddress")); } catch { return null; } })() : null;
    const [deliveryAddress, setDeliveryAddressState] = useState(storedAddress || null);

    const setDeliveryAddress = useCallback((addr) => {
        setDeliveryAddressState(addr);
        if (addr) {
            localStorage.setItem("deliveryAddress", JSON.stringify(addr));
        } else {
            localStorage.removeItem("deliveryAddress");
        }
    }, []);

    const fetchUserData = useCallback(async (userId) => {
        try {
            setAuthUserLoading(true);
            if (userId) {
                // Merge guest wishlist into user account if any guest items exist
                const guestWishlist = getGuestWishlist();
                if (guestWishlist.length > 0) {
                    for (const prodId of guestWishlist) {
                        try {
                            await addToWishlist(userId, prodId);
                        } catch (err) {
                            console.warn("Failed to merge guest wishlist item:", prodId, err);
                        }
                    }
                    clearGuestWishlist();
                }

                const userData = await getUserById(userId);
                const user = userData?.user;

                if (user) {
                    setAuthUser(user);
                }

                const addressData = await getSavedAddresses(userId);
                const addresses = addressData?.userAddresses || [];
                if (addresses.length > 0) {
                    const stored = JSON.parse(localStorage.getItem("deliveryAddress"));
                    const matched = stored ? addresses.find(a => a._id === stored._id) : null;
                    const chosen = matched || stored || addresses[0];
                    setDeliveryAddressState(chosen);
                    localStorage.setItem("deliveryAddress", JSON.stringify(chosen));
                } else {
                    setDeliveryAddressState(null);
                    localStorage.removeItem("deliveryAddress");
                }
            }
        } catch {
            setAuthUser(null);
            setDeliveryAddressState(null);
            localStorage.removeItem("deliveryAddress");
        } finally {
            setAuthUserLoading(false);
        }
    }, []);

    useEffect(() => {
        const localUser = JSON.parse(localStorage.getItem("User"));
        if (localUser?._id) fetchUserData(localUser?._id);
    }, [fetchUserData]);

    const fetchAdminData = useCallback(async (adminId) => {
        try {
            setAuthAdminLoading(true);
            if (adminId) {
                const data = await getAdminById(adminId);
                setAuthAdmin(data?.admin);
            }
        } catch {
            setAuthAdmin(null);
        } finally {
            setAuthAdminLoading(false);
        }
    }, []);

    useEffect(() => {
        const localAdmin = JSON.parse(localStorage.getItem("Admin"));
        if (localAdmin?._id) fetchAdminData(localAdmin?._id);
    }, [fetchAdminData]);

    const handleUserLogout = useCallback(() => {

        if (socket && authUser?._id) {
            socket.emit("client:logout", { userId: authUser._id });
        }
        setAuthUser(null);
        setDeliveryAddressState(null);
        localStorage.removeItem("User");
        localStorage.removeItem("deliveryAddress");
    }, [authUser?._id]);

    const handleAdminLogout = useCallback(() => {

        if (socket && authAdmin?._id) {
            socket.emit("client:logout", { adminId: authAdmin._id });
        }
        setAuthAdmin(null);
        localStorage.removeItem("Admin");
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
}
