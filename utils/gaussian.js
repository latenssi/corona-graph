// export function gaussianPDF(mean, variance, x) {
//   const std = Math.sqrt(variance);
//   const m = std * Math.sqrt(2 * Math.PI);
//   const e = Math.exp(-Math.pow(x - mean, 2) / (2 * variance));
//   return e/m
// }

export function gaussianPDF(mean, variance, x, scale) {
  const e = Math.exp(-Math.pow(x - mean, 2) / (2 * variance));
  return e * scale;
}
