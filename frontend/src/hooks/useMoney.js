export function useMoney() {
  return (amount) => `KES ${Number(amount || 0).toLocaleString("en-KE")}`;
}
