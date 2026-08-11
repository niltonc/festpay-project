import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import {
  subscribeToParties,
  createParty,
  deleteParty,
  type CreatePartyInput,
} from "../services/firebase/party.service";
import type { Party } from "../types/database";

export function useParties() {
  const { user } = useAuth();
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setParties([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubscribe = subscribeToParties(
      user.uid,
      (data) => {
        setParties(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );
    return unsubscribe;
  }, [user]);

  async function addParty(input: CreatePartyInput) {
    if (!user) throw new Error("Usuário não autenticado.");
    return createParty(user.uid, input);
  }

  async function removeParty(partyId: string) {
    await deleteParty(partyId);
  }

  return { parties, loading, error, addParty, removeParty };
}
