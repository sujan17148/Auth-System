export const formatDate = (isoDate: string | undefined): string => {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months 0-indexed
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
};
