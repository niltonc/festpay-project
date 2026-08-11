import {
  collection,
  deleteDoc,
  doc,
  DocumentData,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "./config";
import { wrapError } from "./errors";
import { timestampToISOString } from "../../utils/dates";
import type { Party, PublicParty } from "../../types/database";

const PARTIES = "parties";
const PUBLIC_PARTIES = "public_parties";

function fromPartyDoc(snap: QueryDocumentSnapshot<DocumentData>): Party {
  const data = snap.data();
  return {
    id: snap.id,
    admin_id: data.admin_id,
    name: data.name,
    event_date: data.event_date,
    total_amount: data.total_amount,
    number_of_months: data.number_of_months,
    start_date: data.start_date,
    due_day: data.due_day,
    share_token: data.share_token,
    created_at: timestampToISOString(data.created_at),
  };
}

function toPublicSubset(
  party: Omit<Party, "admin_id" | "created_at">,
): Omit<PublicParty, never> {
  return {
    party_id: party.id,
    name: party.name,
    event_date: party.event_date,
    total_amount: party.total_amount,
    number_of_months: party.number_of_months,
    start_date: party.start_date,
    due_day: party.due_day,
    share_token: party.share_token,
  };
}

function generateShareToken(): string {
  // 10 url-safe characters, sufficiently unguessable for a share link.
  return Array.from(crypto.getRandomValues(new Uint8Array(8)))
    .map((b) => b.toString(36).padStart(2, "0"))
    .join("")
    .slice(0, 10);
}

export async function generateUniqueShareToken(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const token = generateShareToken();
    const existing = await getDoc(doc(db, PUBLIC_PARTIES, token));
    if (!existing.exists()) return token;
  }
  throw wrapError(
    new Error("Não foi possível gerar um link de compartilhamento único."),
  );
}

export interface CreatePartyInput {
  name: string;
  event_date: string;
  total_amount: number;
  number_of_months: number;
  start_date: string;
  due_day: number;
}

export async function createParty(
  adminId: string,
  input: CreatePartyInput,
): Promise<Party> {
  try {
    const partyRef = doc(collection(db, PARTIES));
    const shareToken = await generateUniqueShareToken();
    const party: Party = {
      id: partyRef.id,
      admin_id: adminId,
      share_token: shareToken,
      ...input,
    };
    await setDoc(partyRef, { ...party, created_at: serverTimestamp() });
    await setDoc(doc(db, PUBLIC_PARTIES, shareToken), toPublicSubset(party));
    return party;
  } catch (error) {
    throw wrapError(error);
  }
}

export async function getParty(partyId: string): Promise<Party | null> {
  try {
    const snap = await getDoc(doc(db, PARTIES, partyId));
    if (!snap.exists()) return null;
    return fromPartyDoc(snap as QueryDocumentSnapshot<DocumentData>);
  } catch (error) {
    throw wrapError(error);
  }
}

export async function getParties(adminId: string): Promise<Party[]> {
  try {
    const q = query(collection(db, PARTIES), where("admin_id", "==", adminId));
    const snap = await getDocs(q);
    return snap.docs.map(fromPartyDoc);
  } catch (error) {
    throw wrapError(error);
  }
}

export function subscribeToParties(
  adminId: string,
  onData: (parties: Party[]) => void,
  onError?: (error: Error) => void,
) {
  const q = query(collection(db, PARTIES), where("admin_id", "==", adminId));
  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map(fromPartyDoc)),
    (error) => onError?.(wrapError(error)),
  );
}

export function subscribeToParty(
  partyId: string,
  onData: (party: Party | null) => void,
  onError?: (error: Error) => void,
) {
  return onSnapshot(
    doc(db, PARTIES, partyId),
    (snap) =>
      onData(
        snap.exists()
          ? fromPartyDoc(snap as QueryDocumentSnapshot<DocumentData>)
          : null,
      ),
    (error) => onError?.(wrapError(error)),
  );
}

export async function updateParty(
  partyId: string,
  updates: Partial<CreatePartyInput>,
): Promise<void> {
  try {
    await updateDoc(doc(db, PARTIES, partyId), { ...updates });
    const current = await getParty(partyId);
    if (current) {
      await setDoc(
        doc(db, PUBLIC_PARTIES, current.share_token),
        toPublicSubset(current),
      );
    }
  } catch (error) {
    throw wrapError(error);
  }
}

export async function deleteParty(partyId: string): Promise<void> {
  try {
    const current = await getParty(partyId);
    await deleteDoc(doc(db, PARTIES, partyId));
    if (current) {
      await deleteDoc(doc(db, PUBLIC_PARTIES, current.share_token));
    }
  } catch (error) {
    throw wrapError(error);
  }
}

export async function getPartyByShareToken(
  shareToken: string,
): Promise<PublicParty | null> {
  try {
    const snap = await getDoc(doc(db, PUBLIC_PARTIES, shareToken));
    return snap.exists() ? (snap.data() as PublicParty) : null;
  } catch (error) {
    throw wrapError(error);
  }
}
