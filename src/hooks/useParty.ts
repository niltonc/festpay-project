import { useEffect, useState } from "react";
import {
  subscribeToParty,
  updateParty,
  type CreatePartyInput,
} from "../services/firebase/party.service";
import type { Party } from "../types/database";

export function useParty(partyId: string | undefined) {
  const [party, setParty] = useState<Party | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!partyId) {
      setParty(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubscribe = subscribeToParty(
      partyId,
      (data) => {
        setParty(data);
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

  async function editParty(updates: Partial<CreatePartyInput>) {
    if (!partyId) return;
    await updateParty(partyId, updates);
  }

  return { party, loading, error, editParty };
}
