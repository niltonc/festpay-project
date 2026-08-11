import { useEffect, useState } from "react";
import {
  subscribeToExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  type CreateExpenseInput,
} from "../services/firebase/expense.service";
import type { Expense } from "../types/database";

export function useExpenses(partyId: string | undefined) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!partyId) {
      setExpenses([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubscribe = subscribeToExpenses(
      partyId,
      (data) => {
        setExpenses(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );
    return unsubscribe;
  }, [partyId]);

  async function addExpense(input: CreateExpenseInput) {
    if (!partyId) throw new Error("Festa não selecionada.");
    return createExpense(partyId, input);
  }

  async function editExpense(
    expenseId: string,
    updates: Partial<CreateExpenseInput>,
  ) {
    if (!partyId) return;
    await updateExpense(partyId, expenseId, updates);
  }

  async function removeExpense(expenseId: string) {
    if (!partyId) return;
    await deleteExpense(partyId, expenseId);
  }

  return { expenses, loading, error, addExpense, editExpense, removeExpense };
}
