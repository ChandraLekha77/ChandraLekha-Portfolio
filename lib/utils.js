export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function formatNumber(num) {
  return new Intl.NumberFormat("en-US").format(num);
}
