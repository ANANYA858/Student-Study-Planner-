import {
  signInWithPopup,
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
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

export interface UserProfileData {
  userId: string;
  displayName: string;
  email?: string;
  photoURL?: string;
  targetExam?: string;
  updatedAt?: string;
}

// Format email or name nicely (e.g. "alex.smith@gmail.com" -> "Alex Smith")
export const formatNameFromEmail = (email?: string | null): string => {
  if (!email) return 'SyncLife Student';
  const prefix = email.split('@')[0];
  const parts = prefix.split(/[._-]/).filter(Boolean);
  if (parts.length === 0) return prefix;
  return parts
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');
};

export const signInWithGoogle = async (): Promise<User | null> => {
  try {
    const res = await signInWithPopup(auth, googleProvider);
    if (res.user) {
      // Sync or save user profile to Firestore
      await saveUserProfileToFirestore(res.user.uid, {
        userId: res.user.uid,
        displayName: res.user.displayName || formatNameFromEmail(res.user.email),
        email: res.user.email || undefined,
        photoURL: res.user.photoURL || undefined,
        updatedAt: new Date().toISOString(),
      });
    }
    return res.user;
  } catch (error) {
    console.error('Google Sign-in failed:', error);
    throw error;
  }
};

export const signInWithEmail = async (email: string, pass: string): Promise<User | null> => {
  try {
    const res = await signInWithEmailAndPassword(auth, email, pass);
    if (res.user && !res.user.displayName) {
      const generatedName = formatNameFromEmail(email);
      await updateProfile(res.user, { displayName: generatedName });
      await saveUserProfileToFirestore(res.user.uid, {
        userId: res.user.uid,
        displayName: generatedName,
        email: res.user.email || undefined,
        updatedAt: new Date().toISOString(),
      });
    }
    return res.user;
  } catch (error) {
    console.error('Email Sign-in failed:', error);
    throw error;
  }
};

export const signUpWithEmail = async (
  email: string,
  pass: string,
  displayName?: string
): Promise<User | null> => {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    const finalName = displayName?.trim() || formatNameFromEmail(email);
    if (res.user) {
      await updateProfile(res.user, { displayName: finalName });
      await saveUserProfileToFirestore(res.user.uid, {
        userId: res.user.uid,
        displayName: finalName,
        email: res.user.email || undefined,
        updatedAt: new Date().toISOString(),
      });
    }
    return res.user;
  } catch (error) {
    console.error('Email Sign-up failed:', error);
    throw error;
  }
};

export const signInGuest = async (): Promise<User | null> => {
  try {
    const res = await signInAnonymously(auth);
    if (res.user) {
      await saveUserProfileToFirestore(res.user.uid, {
        userId: res.user.uid,
        displayName: 'Guest Student',
        updatedAt: new Date().toISOString(),
      });
    }
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

// Update user display name in Auth and Firestore
export const updateUserDisplayName = async (name: string): Promise<void> => {
  if (!auth.currentUser) return;
  const trimmed = name.trim();
  if (!trimmed) return;

  await updateProfile(auth.currentUser, { displayName: trimmed });
  await saveUserProfileToFirestore(auth.currentUser.uid, {
    userId: auth.currentUser.uid,
    displayName: trimmed,
    updatedAt: new Date().toISOString(),
  });
};

// Save user profile to Firestore
export const saveUserProfileToFirestore = async (
  userId: string,
  data: Partial<UserProfileData>
): Promise<void> => {
  try {
    const userDocRef = doc(db, 'users', userId);
    await setDoc(userDocRef, { ...data, userId }, { merge: true });
  } catch (err) {
    console.error('Failed to save profile to Firestore:', err);
  }
};

// Fetch user profile from Firestore
export const getUserProfileFromFirestore = async (
  userId: string
): Promise<UserProfileData | null> => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data() as UserProfileData;
    }
    return null;
  } catch (err) {
    console.error('Failed to get user profile from Firestore:', err);
    return null;
  }
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
