import React, { createContext, useState, useMemo, useEffect, useContext, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserOrders } from "../services/orderService";
import { getUserNotifications } from "../services/notificationService";
import { UserAuthContext } from "./AuthProvider";
import wsManager from "../socket/WebSocketManager";

export const UserOrderContext = createContext();

export default function UserOrderProvider({ children }) {
    const { authUser } = useContext(UserAuthContext);
    const queryClient = useQueryClient();
    const userId = authUser?._id || authUser?.id;

    const [localOrders, setLocalOrders] = useState(null);
    const [notification, setNotification] = useState([]);

    const { data: queryOrders = [], isLoading: queryLoading, refetch: fetchOrders } = useQuery({
        queryKey: ['userOrders', userId],
        queryFn: async () => {
            if (!userId) return [];
            const res = await getUserOrders(userId);
            return res?.success ? res.orders || [] : [];
        },
        enabled: Boolean(userId),
        staleTime: 1000 * 60 * 3,
        gcTime: 1000 * 60 * 20,
    });

    const userOrders = localOrders ?? queryOrders;
    const orderLoading = queryLoading && !userOrders.length;

    const setUserOrders = useCallback((updater) => {
        setLocalOrders((prev) => {
            const current = prev ?? queryOrders;
            const next = typeof updater === 'function' ? updater(current) : updater;
            if (userId) {
                queryClient.setQueryData(['userOrders', userId], next);
            }
            return next;
        });
    }, [queryOrders, queryClient, userId]);

    useEffect(() => {
        if (userId) {
            setNotification(authUser?.notifications || []);
            getUserNotifications(userId).then((res) => {
                if (res?.success && Array.isArray(res.notifications)) {
                    setNotification(res.notifications);
                }
            }).catch(() => {});
        } else {
            setLocalOrders([]);
            setNotification([]);
        }
    }, [userId, authUser?.notifications]);

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
            setUserOrders((prevOrders) => [newOrder, ...(prevOrders || []).filter(o => o._id !== newOrder._id)]);
        } else {
            fetchOrders();
        }
    }, [fetchOrders, setUserOrders]);

    const handleUserOrderUpdateStatus = useCallback(({ orderId, status }) => {
        if (!orderId || !status) return;
        setUserOrders((prevOrders) =>
            (prevOrders || [])?.map((order) =>
                (String(order?._id) === String(orderId) || String(order?.orderId) === String(orderId)) ? { ...order, status } : order
            )
        );
        fetchOrders();
    }, [fetchOrders, setUserOrders]);

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
        setOrderLoading: () => {},
        setNotification,
        fetchOrders,
    }), [userOrders, orderLoading, notification, unreadCount, fetchOrders, setUserOrders]);

    return (
        <UserOrderContext.Provider value={value}>
            {children}
        </UserOrderContext.Provider>
    );
}
