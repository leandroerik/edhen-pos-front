export const SYSTEM_VARIANT_KEYS = ['variantId', 'productoId', 'stock', 'precio'];

export const variantLabel = (variant) =>
  Object.entries(variant)
    .filter(([k]) => !SYSTEM_VARIANT_KEYS.includes(k))
    .map(([, v]) => v)
    .join(' / ');
