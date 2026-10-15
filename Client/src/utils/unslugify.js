export const unslugify = (slug) => {
  if (!slug) return "";
  return slug.replace(/-/g, " ").trim();
};
