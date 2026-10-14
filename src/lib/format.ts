export function formatEGP(value: number, opts?: { decimals?: number }): string {
  const decimals = opts?.decimals ?? (Number.isInteger(value) ? 0 : 2);
  return `${value.toLocaleString("en-EG", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })} EGP`;
}
