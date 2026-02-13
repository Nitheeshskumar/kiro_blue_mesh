/**
 * Filters out T sizes that are not suitable for the Indian market
 * @param sizes Array of size strings
 * @returns Filtered array without T sizes
 */
export const filterTSizes = (sizes: string[]): string[] => {
  const tSizesToRemove = ['2T', '3T', '4T', '5T'];
  return sizes.filter(size => !tSizesToRemove.includes(size));
};

/**
 * Filters product data to remove T sizes from the sizes array
 * @param product Product object with sizes array
 * @returns Product object with filtered sizes
 */
export const filterProductTSizes = <T extends { sizes: string[] }>(product: T): T => {
  return {
    ...product,
    sizes: filterTSizes(product.sizes)
  };
};