import {
  collection,
  deleteDoc,
  doc,
  DocumentData,
  getDocs,
  onSnapshot,
  setDoc,
  updateDoc,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "./config";
import { wrapError } from "./errors";
import type { Expense } from "../../types/database";

function expensesCol(partyId: string) {
  return collection(db, "parties", partyId, "expenses");
}

function fromDoc(
  partyId: string,
  snap: QueryDocumentSnapshot<DocumentData>,
): Expense {
  const data = snap.data();
  return {
    id: snap.id,
    party_id: partyId,
    category: data.category,
    description: data.description,
    amount: data.amount,
    is_paid: data.is_paid,
  };
}

export interface CreateExpenseInput {
  category: string;
  description: string;
  amount: number;
  is_paid: boolean;
}

export async function createExpense(
  partyId: string,
  input: CreateExpenseInput,
): Promise<Expense> {
  try {
    const ref = doc(expensesCol(partyId));
    await setDoc(ref, { ...input, party_id: partyId });
    return { id: ref.id, party_id: partyId, ...input };
  } catch (error) {
    throw wrapError(error);
  }
}

export async function getExpenses(partyId: string): Promise<Expense[]> {
  try {
    const snap = await getDocs(expensesCol(partyId));
    return snap.docs.map((d) => fromDoc(partyId, d));
  } catch (error) {
    throw wrapError(error);
  }
}

export function subscribeToExpenses(
  partyId: string,
  onData: (expenses: Expense[]) => void,
  onError?: (error: Error) => void,
) {
  return onSnapshot(
    expensesCol(partyId),
    (snap) => onData(snap.docs.map((d) => fromDoc(partyId, d))),
    (error) => onError?.(wrapError(error)),
  );
}

export async function updateExpense(
  partyId: string,
  expenseId: string,
  updates: Partial<CreateExpenseInput>,
): Promise<void> {
  try {
    await updateDoc(doc(expensesCol(partyId), expenseId), { ...updates });
  } catch (error) {
    throw wrapError(error);
  }
}

export async function deleteExpense(
  partyId: string,
  expenseId: string,
): Promise<void> {
  try {
    await deleteDoc(doc(expensesCol(partyId), expenseId));
  } catch (error) {
    throw wrapError(error);
  }
}
