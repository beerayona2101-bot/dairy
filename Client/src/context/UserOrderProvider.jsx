import React, { createContext, useState, useMemo, useEffect, useContext, useCallback } from "react";
import { getUserOrders } from "../services/orderService";
import { UserAuthContext, AdminAuthContext } from "./AuthProvider";
import wsManager from "../socket/WebSocketManager";

export const UserOrderContext = createContext();

export default function UserOrderProvider({ children }) {

    const { authUser } = useContext(UserAuthContext);

    const [userOrders, setUserOrders] = useState([]);
    const [orderLoading, setOrderLoading] = useState(true);
    const [notification, setNotification] = useState([]);

    const fetchOrders = useCallback(async () => {
        const userId = authUser?._id || authUser?.id;
        if (!userId) {
            setUserOrders([]);
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
    }, [authUser?._id, authUser?.id]);

    useEffect(() => {
        const userId = authUser?._id || authUser?.id;
        if (userId) {
            setNotification(authUser?.notifications || []);
            fetchOrders();
        } else {
            setUserOrders([]);
            setNotification([]);
            setOrderLoading(false);
        }
    }, [authUser?._id, authUser?.id, authUser?.notifications, fetchOrders]);

    const handleUserNotification = useCallback((notifPayload) => {
        if (!notifPayload) return;
        const newNotif = {
            title: notifPayload.title || "Notification",
            description: notifPayload.description || "",
            date: notifPayload.date || new Date().toISOString(),
            isRead: notifPayload.isRead ?? false,
            orderId: notifPayload.orderId,
            type: notifPayload.type || "order",
            _id: notifPayload._id || `notif-${Date.now()}-${Math.random()}`,
        };
        setNotification((prev) => [newNotif, ...prev]);
    }, []);

    const handlePlaceNewOrder = useCallback(({ newOrder }) => {
        if (newOrder) {
            setUserOrders((prevOrders) => [newOrder, ...prevOrders.filter(o => o._id !== newOrder._id)]);
        } else {
            fetchOrders();
        }
    }, [fetchOrders]);

    const handleUserOrderUpdateStatus = useCallback(({ orderId, status }) => {
        if (!orderId || !status) return;
        setUserOrders((prevOrders) =>
            prevOrders?.map((order) =>
                String(order?._id) === String(orderId) ? { ...order, status } : order
            )
        );
        fetchOrders();
    }, [fetchOrders]);

    useEffect(() => {
        const unsubs = [
            wsManager.subscribe("user:notification", handleUserNotification),
            wsManager.subscribe("order:place-new-success", handlePlaceNewOrder),
            wsManager.subscribe("new-order-place-success", fetchOrders),
            wsManager.subscribe("user-order:updated-status", handleUserOrderUpdateStatus),
            wsManager.subscribe("order:global-status-update", handleUserOrderUpdateStatus),
            wsManager.subscribe("order:status-updated", handleUserOrderUpdateStatus),
            wsManager.subscribe("order:accept-success", handleUserOrderUpdateStatus),
            wsManager.subscribe("admin-order:delivered-success", handleUserOrderUpdateStatus),
            wsManager.subscribe("order:reject-success", handleUserOrderUpdateStatus),
            wsManager.subscribe("order.updated", handleUserOrderUpdateStatus),
            wsManager.subscribe("order.created", handlePlaceNewOrder),
        ];

        return () => {
            unsubs.forEach((unsub) => unsub());
        };
    }, [handleUserNotification, handlePlaceNewOrder, handleUserOrderUpdateStatus, fetchOrders]);

    const unreadCount = useMemo(() => {
        return (notification || []).filter((n) => !n.isRead).length;
    }, [notification]);

    const value = useMemo(() => ({
        userOrders,
        orderLoading,
        notification,
        unreadCount,
        setUserOrders,
        setOrderLoading,
        setNotification,
        fetchOrders,
    }), [userOrders, orderLoading, notification, unreadCount, fetchOrders]);

    return (
        <UserOrderContext.Provider value={value}>
            {children}
        </UserOrderContext.Provider>
    );
}
