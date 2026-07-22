export const padIndex = (index: number, length: number = 2): string => {
  return String(index).padStart(length, '0');
};
