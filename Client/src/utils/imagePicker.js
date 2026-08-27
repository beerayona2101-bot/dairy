export const getRandomImage = (images) => {
  if (!Array.isArray(images) || images.length === 0) return ""; 
  const index = Math.floor(Math.random() * images.length);
  return images[index];
};
