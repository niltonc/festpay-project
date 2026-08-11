import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  DocumentData,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "./config";
import { wrapError } from "./errors";
import { timestampToISOString } from "../../utils/dates";
import { getInstallmentStatus } from "../../utils/calculations";
import type { Payment } from "../../types/database";

function paymentsCol(partyId: string, participantId: string) {
  return collection(
    db,
    "parties",
    partyId,
    "participants",
    participantId,
    "payments",
  );
}

function fromDoc(
  participantId: string,
  snap: QueryDocumentSnapshot<DocumentData>,
): Payment {
  const data = snap.data();
  return {
    id: snap.id,
    participant_id: participantId,
    month_number: data.month_number,
    amount_due: data.amount_due,
    amount_paid: data.amount_paid,
    payment_date: data.payment_date ?? null,
    notes: data.notes ?? null,
    status: data.status,
    updated_at: timestampToISOString(data.updated_at),
  };
}

export interface UpsertPaymentInput {
  month_number: number;
  amount_due: number;
  amount_paid: number;
  payment_date?: string | null;
  notes?: string | null;
}

export async function getPayments(
  partyId: string,
  participantId: string,
): Promise<Payment[]> {
  try {
    const snap = await getDocs(paymentsCol(partyId, participantId));
    return snap.docs.map((d) => fromDoc(participantId, d));
  } catch (error) {
    throw wrapError(error);
  }
}

export function subscribeToPayments(
  partyId: string,
  participantId: string,
  onData: (payments: Payment[]) => void,
  onError?: (error: Error) => void,
) {
  return onSnapshot(
    paymentsCol(partyId, participantId),
    (snap) => onData(snap.docs.map((d) => fromDoc(participantId, d))),
    (error) => onError?.(wrapError(error)),
  );
}

// Creates or updates the payment for a given participant/month (one payment
// record per month), computing its status from the amounts.
export async function upsertPayment(
  partyId: string,
  participantId: string,
  input: UpsertPaymentInput,
): Promise<void> {
  try {
    const status = getInstallmentStatus(input.amount_due, input.amount_paid);
    const existingSnap = await getDocs(
      query(
        paymentsCol(partyId, participantId),
        where("month_number", "==", input.month_number),
      ),
    );
    const payload = {
      month_number: input.month_number,
      amount_due: input.amount_due,
      amount_paid: input.amount_paid,
      payment_date: input.payment_date ?? null,
      notes: input.notes ?? null,
      status,
      updated_at: serverTimestamp(),
    };
    if (!existingSnap.empty) {
      await updateDoc(existingSnap.docs[0].ref, payload);
    } else {
      await addDoc(paymentsCol(partyId, participantId), payload);
    }
  } catch (error) {
    throw wrapError(error);
  }
}

export async function deletePayment(
  partyId: string,
  participantId: string,
  paymentId: string,
): Promise<void> {
  try {
    await deleteDoc(doc(paymentsCol(partyId, participantId), paymentId));
  } catch (error) {
    throw wrapError(error);
  }
}
