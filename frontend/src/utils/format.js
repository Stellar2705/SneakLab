export const rupees = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
export const discount = (p) =>
  p?.mrp > 0 ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0;
