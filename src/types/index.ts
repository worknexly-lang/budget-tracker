export const expenseCategories = [
  "Groceries",
  "Rent",
  "Transport",
  "Entertainment",
  "Utilities",
  "Shopping",
  "Food",
  "Travel",
  "Bills",
  "Other",
] as const;

export type ExpenseCategory = (typeof expenseCategories)[number];

export type Category = ExpenseCategory | "Income";

export type Transaction = {
  id: string;
  type: "income" | "expense";
  category: Category;
  amount: number;
  description: string;
  date: string;
};
