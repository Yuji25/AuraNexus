export const isRelationalJSON = (items) => {
  if (!Array.isArray(items) || items.length === 0) return false;

  const baseKeys = Object.keys(items[0]).sort();

  for (let i = 1; i < items.length; i++) {
    const keys = Object.keys(items[i]).sort();
    if (JSON.stringify(keys) !== JSON.stringify(baseKeys)) {
      return false;
    }
  }

  return true;
};
