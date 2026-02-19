export const ENTITY_TYPE_OPTIONS = [
  { label: "Household", value: "household" },
  { label: "Business", value: "business" },
] as const;

export const CURRENCY_OPTIONS = [
  { label: "USD - US Dollar", value: "USD" },
  { label: "EUR - Euro", value: "EUR" },
  { label: "GBP - British Pound", value: "GBP" },
  { label: "CAD - Canadian Dollar", value: "CAD" },
  { label: "AUD - Australian Dollar", value: "AUD" },
  { label: "JPY - Japanese Yen", value: "JPY" },
  { label: "CHF - Swiss Franc", value: "CHF" },
  { label: "INR - Indian Rupee", value: "INR" },
  { label: "MXN - Mexican Peso", value: "MXN" },
  { label: "BRL - Brazilian Real", value: "BRL" },
] as const;

export const BUDGET_PERIOD_OPTIONS = [
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
  { label: "Yearly", value: "yearly" },
] as const;
