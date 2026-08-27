import React, { createContext, useState, useMemo, useContext, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { AdminAuthContext } from "./AuthProvider";
import { getAdminOrders, getAllOrders } from "../services/orderService";
import { socket } from "../socket/socket";
import { useSnackbar } from "notistack";

export const AdminOrderContext = createContext();

export default function AdminOrderProvider({ children }) {

    const { enqueueSnackbar } = useSnackbar();
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

        const adminStored = (() => { try { return JSON.parse(localStorage.getItem("Admin")); } catch { return null; } })();
        if (authAdmin?._id || adminStored?._id) {
            setNotification(authAdmin?.notifications || adminStored?.notifications || []);
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
                title,
                description,
                date: date || new Date().toISOString(),
            },
            ...prev,
        ]);

    }, []);

    const handleNewPendingOrder = ({ order }) => {
        setAdminOrders((prevOrders) => [...prevOrders, order]);
        setAllOrders(prevOrders => [order, ...prevOrders]);
    };

    const handleOrderAccept = ({ orderId, status }) => {
        if (!orderId) return;

        setAdminOrders((prevOrders) =>
            prevOrders?.filter((order) => order?._id !== orderId)
        );

        setAllOrders(prevOrders =>
            prevOrders?.map(order =>
                order._id === orderId ? { ...order, status: status || "Confirmed" } : order
            )
        );
    };

    const handleOrderReject = ({ orderId, status }) => {
        if (!orderId) return;

        setAdminOrders((prevOrders) =>
            prevOrders?.filter((order) => order?._id !== orderId)
        );

        setAllOrders(prevOrders =>
            prevOrders?.map(order =>
                order._id === orderId ? { ...order, status: status || "Cancelled" } : order
            )
        );
    };

    const handleOrderDelivered = ({ orderId }) => {
        setAdminOrders((prev) =>
            prev.map((order) =>
                order._id === orderId ? { ...order, status: "Delivered" } : order
            )
        );

        setAllOrders(prev =>
            prev.map(order =>
                order._id === orderId ? { ...order, status: "Delivered" } : order
            )
        );
    }

    useEffect(() => {
        socket.on("order:new-pending-order", handleNewPendingOrder);
        socket.on("order:accept-success", handleOrderAccept);
        socket.on("order:reject-success", handleOrderReject);
        socket.on("admin:notification", handleAdminNotification)
        socket.on("admin-order:delivered-success", handleOrderDelivered);

        return () => {
            socket.off("order:new-pending-order", handleNewPendingOrder);
            socket.off("order:accept-success", handleOrderAccept);
            socket.off("order:reject-success", handleOrderReject);
            socket.off("admin:notification", handleAdminNotification)
            socket.off("admin-order:delivered-success", handleOrderDelivered);
        }
    }, [handleAdminNotification]);

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