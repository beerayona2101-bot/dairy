import React, { createContext, useState, useMemo, useEffect, useContext, useCallback } from "react";
import { getUserOrders } from "../services/orderService";
import { UserAuthContext, AdminAuthContext } from "./AuthProvider";
import { socket } from "../socket/socket";
import { useSnackbar } from "notistack";

export const UserOrderContext = createContext();

export default function UserOrderProvider({ children }) {

    const { enqueueSnackbar } = useSnackbar();
    const { authUser } = useContext(UserAuthContext);
    const { authAdmin } = useContext(AdminAuthContext);
    const activeUser = authUser || authAdmin;

    const [userOrders, setUserOrders] = useState([]);
    const [orderLoading, setOrderLoading] = useState(true);
    const [notification, setNotification] = useState([]);

    const fetchOrders = useCallback(async () => {
        const localUser = JSON.parse(localStorage.getItem("User")) || JSON.parse(localStorage.getItem("Admin"));
        const userId = activeUser?._id || activeUser?.id || localUser?._id || localUser?.id;
        if (!userId) {
            setOrderLoading(false);
            return;
        }
        try {
            setOrderLoading(true);
            const res = await getUserOrders(userId);
            if (res?.success) {
                setUserOrders(res.orders || []);
            }
        } catch (err) {
            console.error("Error fetching orders:", err);
        } finally {
            setOrderLoading(false);
        }
    }, [activeUser?._id, activeUser?.id]);

    useEffect(() => {
        const localUser = JSON.parse(localStorage.getItem("User")) || JSON.parse(localStorage.getItem("Admin"));
        const userId = activeUser?._id || activeUser?.id || localUser?._id || localUser?.id;
        if (userId) {
            setNotification(activeUser?.notifications || []);
            fetchOrders();
        } else {
            setOrderLoading(false);
        }
    }, [activeUser?._id, activeUser?.id, activeUser?.notifications, fetchOrders]);

    const handleUserNotification = useCallback(({ title, description, date }) => {
        setNotification((prev) => [
            {
                title,
                description,
                date: date || new Date().toISOString(),
            },
            ...prev,
        ]);
        enqueueSnackbar(description, { variant: "info" });
    }, [enqueueSnackbar]);

    const handlePlaceNewOrder = useCallback(({ newOrder }) => {
        if (newOrder) {
            setUserOrders((prevOrders) => [newOrder, ...prevOrders.filter(o => o._id !== newOrder._id)]);
        } else {
            fetchOrders();
        }
    }, [fetchOrders]);

    const handleUserOrderUpdateStatus = useCallback(({ orderId, status }) => {
        setUserOrders((prevOrders) =>
            prevOrders?.map((order) =>
                order?._id === orderId ? { ...order, status } : order
            )
        );
        fetchOrders();
    }, [fetchOrders]);

    useEffect(() => {
        socket.on("user:notification", handleUserNotification);
        socket.on("order:place-new-success", handlePlaceNewOrder);
        socket.on("new-order-place-success", fetchOrders);
        socket.on("user-order:updated-status", handleUserOrderUpdateStatus);

        return () => {
            socket.off("user:notification", handleUserNotification);
            socket.off("order:place-new-success", handlePlaceNewOrder);
            socket.off("new-order-place-success", fetchOrders);
            socket.off("user-order:updated-status", handleUserOrderUpdateStatus);
        }
    }, [handleUserNotification, handlePlaceNewOrder, handleUserOrderUpdateStatus, fetchOrders]);

    const value = useMemo(() => ({
        userOrders,
        orderLoading,
        notification,
        setUserOrders,
        setOrderLoading,
        setNotification,
    }), [userOrders, orderLoading, notification]);

    return (
        <UserOrderContext.Provider value={value}>
            {children}
        </UserOrderContext.Provider>
    );
}
