import { useEffect, useState } from "react";
import {
  subscribeToPayments,
  upsertPayment,
  type UpsertPaymentInput,
} from "../services/firebase/payment.service";
import type { Payment } from "../types/database";

export function usePayments(
  partyId: string | undefined,
  participantId: string | undefined,
) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!partyId || !participantId) {
      setPayments([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubscribe = subscribeToPayments(
      partyId,
      participantId,
      (data) => {
        setPayments(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );
    return unsubscribe;
  }, [partyId, participantId]);

  async function savePayment(input: UpsertPaymentInput) {
    if (!partyId || !participantId)
      throw new Error("Participante não selecionado.");
    await upsertPayment(partyId, participantId, input);
  }

  return { payments, loading, error, savePayment };
}
