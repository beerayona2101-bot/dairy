import React, { createContext, useState, useMemo, useContext, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { AdminAuthContext } from "./AuthProvider";
import { getAdminOrders, getAllOrders } from "../services/orderService";
import wsManager from "../socket/WebSocketManager";

export const AdminOrderContext = createContext();

export default function AdminOrderProvider({ children }) {

    const { authAdmin } = useContext(AdminAuthContext);
    const [adminOrders, setAdminOrders] = useState([]);
    const [allOrders, setAllOrders] = useState([]);
    const [orderLoading, setOrderLoading] = useState(true);
    const [allOrdersLoading, setAllOrdersLoading] = useState(true);
    const [notification, setNotification] = useState([]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await getAdminOrders();
                if (res?.success) {
                    setAdminOrders(res?.orders || []);
                }
            } catch (error) {
                console.warn("Fetch admin orders error:", error?.message);
            } finally {
                setOrderLoading(false);
            }
        };

        const adminId = authAdmin?._id;

        if (adminId) {
            setNotification(authAdmin?.notifications || []);
            wsManager.connect({ role: "admin", adminId, _id: adminId });
            fetchOrders();
        } else {
            setOrderLoading(false);
        }
    }, [authAdmin]);

    const fetchAllOrders = useCallback(async () => {
        try {
            const res = await getAllOrders();
            if (res?.success) {
                setAllOrders(res?.orders || []);
            }
        } catch (error) {
            console.warn("Fetch all orders error:", error?.message);
        } finally {
            setAllOrdersLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAllOrders();
    }, [fetchAllOrders]);

    const handleAdminNotification = useCallback(({ title, description, date }) => {
        setNotification((prev) => [
            {
                title: title || "New Notification",
                description: description || "",
                date: date || new Date().toISOString(),
            },
            ...prev,
        ]);
    }, []);

    const handleNewPendingOrder = useCallback(({ order }) => {
        if (order && order._id) {
            setAdminOrders((prevOrders) => {
                if (prevOrders.some(o => String(o?._id) === String(order?._id))) return prevOrders;
                return [order, ...prevOrders];
            });
            setAllOrders((prevOrders) => {
                if (prevOrders.some(o => String(o?._id) === String(order?._id))) return prevOrders;
                return [order, ...prevOrders];
            });
        }
        fetchAllOrders();
    }, [fetchAllOrders]);

    const handleGenericOrderUpdate = useCallback(({ orderId, status }) => {
        if (!orderId) {
            fetchAllOrders();
            return;
        }

        if (status) {
            setAdminOrders((prevOrders) =>
                status === "Pending"
                    ? prevOrders
                    : prevOrders?.filter((order) => String(order?._id) !== String(orderId))
            );

            setAllOrders((prevOrders) =>
                prevOrders?.map((order) =>
                    String(order._id) === String(orderId) ? { ...order, status } : order
                )
            );
        }

        fetchAllOrders();
    }, [fetchAllOrders]);

    useEffect(() => {
        const unsubs = [
            wsManager.subscribe("order:new-pending-order", handleNewPendingOrder),
            wsManager.subscribe("order:accept-success", handleGenericOrderUpdate),
            wsManager.subscribe("order:reject-success", handleGenericOrderUpdate),
            wsManager.subscribe("admin:notification", handleAdminNotification),
            wsManager.subscribe("admin-order:delivered-success", handleGenericOrderUpdate),
            wsManager.subscribe("admin:order-updated", handleGenericOrderUpdate),
            wsManager.subscribe("order:global-status-update", handleGenericOrderUpdate),
            wsManager.subscribe("user-order:updated-status", handleGenericOrderUpdate),
            wsManager.subscribe("order:status-updated", handleGenericOrderUpdate),
            wsManager.subscribe("order.updated", handleGenericOrderUpdate),
            wsManager.subscribe("order.created", handleNewPendingOrder),
        ];

        return () => {
            unsubs.forEach((unsub) => unsub());
        };
    }, [handleAdminNotification, handleGenericOrderUpdate, handleNewPendingOrder]);

    const value = useMemo(() => ({
        adminOrders,
        allOrders,
        orderLoading,
        allOrdersLoading,
        notification,
        refetchAllOrders: fetchAllOrders,
        setAdminOrders,
        setAllOrders,
        setOrderLoading,
        setAllOrdersLoading,
        setNotification
    }), [adminOrders, orderLoading, allOrders, notification, allOrdersLoading, fetchAllOrders]);

    return (
        <AdminOrderContext.Provider value={value}>
            {children}
        </AdminOrderContext.Provider>
    );
}

AdminOrderProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
