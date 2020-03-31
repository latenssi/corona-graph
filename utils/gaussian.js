// export function gaussianPDF(mean, variance, x) {
//   const std = Math.sqrt(variance);
//   const m = std * Math.sqrt(2 * Math.PI);
//   const e = Math.exp(-Math.pow(x - mean, 2) / (2 * variance));
//   return e/m
// }

const sqrt2PI = Math.sqrt(2 * Math.PI);
const sqrt2PI25 = sqrt2PI / 2.5;

export function normalDist(mean, std) {
  const m = 1 / (std * sqrt2PI);
  return x => m * Math.exp(-Math.pow((x - mean) / std, 2) / 2);
}

export function adjNormDist(mean, a, b) {
  const std = (a / b) * 0.4;
  const normDist = normalDist(mean, std);
  const factor = sqrt2PI25 * a;
  return x => normDist(x) * factor;
}

export function gaussianPDF(mean, variance, x, scale) {
  const e = Math.exp(-Math.pow(x - mean, 2) / (2 * variance));
  return e * scale;
}

// export function gaussianPDF(mean, variance, x, scale) {
//   const e = Math.exp(-Math.pow(x - mean, 2) / (2 * variance));
//   return e * scale;
// }
