import { useEffect, useState } from "react";
import {
  subscribeToParticipants,
  createParticipant,
  deleteParticipant,
  type CreateParticipantInput,
} from "../services/firebase/participant.service";
import type { Participant } from "../types/database";

export function useParticipants(partyId: string | undefined) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!partyId) {
      setParticipants([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubscribe = subscribeToParticipants(
      partyId,
      (data) => {
        setParticipants(data);
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

  async function addParticipant(input: CreateParticipantInput) {
    if (!partyId) throw new Error("Festa não selecionada.");
    return createParticipant(partyId, input);
  }

  async function removeParticipant(participantId: string) {
    if (!partyId) return;
    await deleteParticipant(partyId, participantId);
  }

  return { participants, loading, error, addParticipant, removeParticipant };
}
