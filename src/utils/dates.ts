import { Timestamp } from "firebase/firestore";

// Converts a Firestore Timestamp (or an already-ISO string) into an ISO
// string usable by the rest of the app. Returns undefined when empty.
export function timestampToISOString(
  value: Timestamp | string | null | undefined,
): string | undefined {
  if (!value) return undefined;
  if (typeof value === "string") return value;
  if (value instanceof Timestamp) return value.toDate().toISOString();
  return undefined;
}

export function todayISODate(): string {
  return new Date().toISOString().split("T")[0];
}
