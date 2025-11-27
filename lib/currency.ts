export const formatRupees = (amount: number): string => {
  return `₹${Math.abs(amount).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

export const formatRupeesWithSymbol = (amount: number): string => {
  const sign = amount > 0 ? "+" : "-"
  return `${amount > 0 ? "+" : ""} ${formatRupees(Math.abs(amount))}`
}
