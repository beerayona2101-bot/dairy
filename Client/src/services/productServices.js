
import api from "./api";

export const getProducts = async () => {
  const res = await api.get("/products/get-products");
  return res.data;
};

export const productLike = async (productId, userId) => {
  const res = await api.put(`/products/like/${productId}`, { userId });
  return res.data;
};
