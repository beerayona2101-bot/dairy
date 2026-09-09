export const slugify = (text) => {
  return (text || "")?.toLowerCase().trim().replace(/\s+/g, "-");
};

export const unslugify = (slug) => {
  return (slug || "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};
