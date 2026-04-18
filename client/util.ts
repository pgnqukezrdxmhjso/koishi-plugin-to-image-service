export const propelSizeUnit = (size = 0, unit = 0) => {
  if (size <= 1024 || unit >= 5) {
    return +size.toFixed(2) + ["", "K", "M", "G", "T", "P"][unit] + "B";
  }
  return propelSizeUnit(size / 1024, unit + 1);
};
