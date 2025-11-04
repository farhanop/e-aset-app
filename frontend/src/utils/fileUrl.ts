// frontend/src/utils/fileUrl.ts
export const getQrUrl = (filename?: string | null) => {
  if (!filename) return "";
  return `${import.meta.env.VITE_QR_BASE_URL}/${filename}`;
};

export const getDocumentUrl = (filename?: string | null) => {
  if (!filename) return "";
  return `${import.meta.env.VITE_DOCUMENT_BASE_URL}/${filename}`;
};