export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const isOverdue = (tglRencanaKembali: string): boolean => {
  return new Date(tglRencanaKembali) < new Date();
};

export const getDaysOverdue = (tglRencanaKembali: string): number => {
  const today = new Date();
  const rencanaKembali = new Date(tglRencanaKembali);
  const diffTime = today.getTime() - rencanaKembali.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
