// frontend/src/types/image.ts
export const getImageUrl = (filename: string) => {
  if (!filename) return "";
  return `${import.meta.env.VITE_IMAGE_URL}/${filename}`;
};
