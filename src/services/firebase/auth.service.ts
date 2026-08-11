import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "./config";
import { wrapError } from "./errors";

export async function signUp(
  email: string,
  password: string,
): Promise<FirebaseUser> {
  try {
    const credential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    await setDoc(doc(db, "users", credential.user.uid), {
      email,
      created_at: serverTimestamp(),
    });
    return credential.user;
  } catch (error) {
    throw wrapError(error);
  }
}

export async function signIn(
  email: string,
  password: string,
): Promise<FirebaseUser> {
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return credential.user;
  } catch (error) {
    throw wrapError(error);
  }
}

export async function signOutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    throw wrapError(error);
  }
}

export function getCurrentUser(): FirebaseUser | null {
  return auth.currentUser;
}

export async function getUserDocument(uid: string) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
}

export function subscribeToAuthState(
  callback: (user: FirebaseUser | null) => void,
) {
  return onAuthStateChanged(auth, callback);
}
