import {
  signInWithPopup,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { auth, googleProvider, db } from './config';
import { TimeSlot } from '../types';

export const signInWithGoogle = async (): Promise<User | null> => {
  try {
    const res = await signInWithPopup(auth, googleProvider);
    return res.user;
  } catch (error) {
    console.error('Google Sign-in failed:', error);
    throw error;
  }
};

export const signInGuest = async (): Promise<User | null> => {
  try {
    const res = await signInAnonymously(auth);
    return res.user;
  } catch (error) {
    console.error('Guest Sign-in failed:', error);
    throw error;
  }
};

export const logoutUser = async (): Promise<void> => {
  await signOut(auth);
};

export const subscribeToAuth = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Sync tasks to Firestore
export const syncSlotsToFirestore = async (userId: string, slots: TimeSlot[]) => {
  try {
    const batch = writeBatch(db);
    const userDocRef = doc(db, 'users', userId);
    batch.set(
      userDocRef,
      {
        userId,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    slots.forEach((slot) => {
      const taskRef = doc(db, 'users', userId, 'tasks', slot.id);
      batch.set(taskRef, { ...slot, userId }, { merge: true });
    });

    await batch.commit();
  } catch (err) {
    console.error('Failed to sync slots to Firestore:', err);
  }
};

// Load tasks from Firestore
export const loadSlotsFromFirestore = async (userId: string): Promise<TimeSlot[] | null> => {
  try {
    const tasksRef = collection(db, 'users', userId, 'tasks');
    const snapshot = await getDocs(tasksRef);
    if (snapshot.empty) return null;

    const loaded: TimeSlot[] = [];
    snapshot.forEach((d) => {
      loaded.push(d.data() as TimeSlot);
    });
    return loaded.sort((a, b) => (a.time || '').localeCompare(b.time || ''));
  } catch (err) {
    console.error('Failed to load slots from Firestore:', err);
    return null;
  }
};
