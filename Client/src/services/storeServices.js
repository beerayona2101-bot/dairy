import api from "./api";

export const getAllStores = async () => {
    const res = await api.get("/store/get-stores");
    return res.data;
};

export const getUserOrderHistory = async (userId) => {
    const res = await api.post("/store/store-order-history", { userId });
    return res.data;
};

export const createCustomerApi = async (customerData) => {
    const res = await api.post("/store/create-customer", customerData);
    return res.data;
};

export const updateCustomerApi = async (userId, customerData) => {
    const res = await api.put(`/store/update-customer/${userId}`, customerData);
    return res.data;
};

export const deleteCustomerApi = async (userId) => {
    const res = await api.delete(`/store/delete-customer/${userId}`);
    return res.data;
};