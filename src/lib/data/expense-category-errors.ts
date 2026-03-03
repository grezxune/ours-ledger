const DUPLICATE_EXPENSE_CATEGORY_MESSAGE = "An expense category with this name already exists.";

/**
 * Returns true when category creation failed because the normalized name already exists.
 */
export function isDuplicateExpenseCategoryError(error: unknown): boolean {
  return error instanceof Error && error.message.includes(DUPLICATE_EXPENSE_CATEGORY_MESSAGE);
}
