import api from "./api";

export const getPageContentService = async () => {
  const res = await api.get("/page-content/get-content");
  return res.data;
};

export const updatePageContentService = async (contentData) => {
  const res = await api.put("/page-content/update-content", contentData);
  return res.data;
};
