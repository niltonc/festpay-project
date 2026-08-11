import {
  collection,
  deleteDoc,
  doc,
  DocumentData,
  getDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "./config";
import { wrapError } from "./errors";
import { timestampToISOString } from "../../utils/dates";
import type { Participant } from "../../types/database";

function participantsCol(partyId: string) {
  return collection(db, "parties", partyId, "participants");
}

function fromDoc(
  partyId: string,
  snap: QueryDocumentSnapshot<DocumentData>,
): Participant {
  const data = snap.data();
  return {
    id: snap.id,
    party_id: partyId,
    name: data.name,
    phone: data.phone ?? undefined,
    created_at: timestampToISOString(data.created_at),
  };
}

export interface CreateParticipantInput {
  name: string;
  phone?: string;
}

export async function createParticipant(
  partyId: string,
  input: CreateParticipantInput,
): Promise<Participant> {
  try {
    const ref = doc(participantsCol(partyId));
    await setDoc(ref, { ...input, created_at: serverTimestamp() });
    return { id: ref.id, party_id: partyId, ...input };
  } catch (error) {
    throw wrapError(error);
  }
}

export async function getParticipants(partyId: string): Promise<Participant[]> {
  try {
    const snap = await getDocs(participantsCol(partyId));
    return snap.docs.map((d) => fromDoc(partyId, d));
  } catch (error) {
    throw wrapError(error);
  }
}

export async function getParticipant(
  partyId: string,
  participantId: string,
): Promise<Participant | null> {
  try {
    const snap = await getDoc(doc(participantsCol(partyId), participantId));
    return snap.exists()
      ? fromDoc(partyId, snap as QueryDocumentSnapshot<DocumentData>)
      : null;
  } catch (error) {
    throw wrapError(error);
  }
}

export function subscribeToParticipants(
  partyId: string,
  onData: (participants: Participant[]) => void,
  onError?: (error: Error) => void,
) {
  return onSnapshot(
    participantsCol(partyId),
    (snap) => onData(snap.docs.map((d) => fromDoc(partyId, d))),
    (error) => onError?.(wrapError(error)),
  );
}

export async function updateParticipant(
  partyId: string,
  participantId: string,
  updates: Partial<CreateParticipantInput>,
): Promise<void> {
  try {
    await updateDoc(doc(participantsCol(partyId), participantId), {
      ...updates,
    });
  } catch (error) {
    throw wrapError(error);
  }
}

export async function deleteParticipant(
  partyId: string,
  participantId: string,
): Promise<void> {
  try {
    const paymentsSnap = await getDocs(
      collection(
        db,
        "parties",
        partyId,
        "participants",
        participantId,
        "payments",
      ),
    );
    await Promise.all(paymentsSnap.docs.map((d) => deleteDoc(d.ref)));
    await deleteDoc(doc(participantsCol(partyId), participantId));
  } catch (error) {
    throw wrapError(error);
  }
}
