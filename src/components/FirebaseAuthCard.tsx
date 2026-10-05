import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  signInWithGoogle,
  signInGuest,
  logoutUser,
  subscribeToAuth,
  syncSlotsToFirestore,
  loadSlotsFromFirestore,
} from '../firebase/authService';
import { TimeSlot } from '../types';

interface FirebaseAuthCardProps {
  slots: TimeSlot[];
  onSlotsUpdated?: (slots: TimeSlot[]) => void;
  onTriggerToast: (msg: string, badge?: string) => void;
}

export const FirebaseAuthCard: React.FC<FirebaseAuthCardProps> = ({
  slots,
  onSlotsUpdated,
  onTriggerToast,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToAuth((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    try {
      const user = await signInWithGoogle();
      if (user) {
        onTriggerToast(`Signed in as ${user.displayName || user.email}! ☁️`, 'FIREBASE AUTH');
        // Auto sync
        await syncSlotsToFirestore(user.uid, slots);
      }
    } catch {
      onTriggerToast('Google Sign-in cancelled or failed', 'AUTH CANCEL');
    }
  };

  const handleGuestLogin = async () => {
    try {
      const user = await signInGuest();
      if (user) {
        onTriggerToast('Signed in as Guest with Cloud Sync! ☁️', 'ANONYMOUS');
      }
    } catch {
      onTriggerToast('Guest sign-in failed', 'AUTH ERROR');
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      onTriggerToast('Signed out of Firebase account', 'SIGNED OUT');
    } catch {
      onTriggerToast('Sign out error', 'ERROR');
    }
  };

  const handleManualSync = async () => {
    if (!currentUser) return;
    setIsSyncing(true);
    try {
      await syncSlotsToFirestore(currentUser.uid, slots);
      onTriggerToast('Schedule & Goals synced to Cloud Firestore! 🚀', 'CLOUD SYNCED');
    } catch {
      onTriggerToast('Sync failed', 'ERROR');
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePullCloud = async () => {
    if (!currentUser) return;
    setIsSyncing(true);
    try {
      const remote = await loadSlotsFromFirestore(currentUser.uid);
      if (remote && remote.length > 0 && onSlotsUpdated) {
        onSlotsUpdated(remote);
        onTriggerToast(`Loaded ${remote.length} tasks from Cloud Firestore! 📥`, 'RESTORED');
      } else {
        onTriggerToast('No previous cloud tasks found to restore', 'INFO');
      }
    } catch {
      onTriggerToast('Cloud restore failed', 'ERROR');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="bg-surface-container-low rounded-2xl p-4 border border-outline-variant/30 space-y-3 shadow-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-orange-500/15 flex items-center justify-center text-orange-400">
            <span className="material-symbols-outlined text-[20px]">cloud_sync</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-headline text-sm font-bold text-on-surface">
                Cloud Database & Auth
              </h4>
              <span className="font-label-badge text-[9px] px-1.5 py-0.2 rounded bg-orange-500/20 text-orange-400 font-bold">
                Firebase Firestore
              </span>
            </div>
            <p className="font-body text-[11px] text-on-surface-variant">
              {currentUser
                ? `Logged in: ${currentUser.displayName || currentUser.email || 'Guest User'}`
                : 'Sign in to persist your schedule across devices'}
            </p>
          </div>
        </div>

        {currentUser && (
          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" title="Cloud Active" />
        )}
      </div>

      {currentUser ? (
        <div className="space-y-2 pt-1 animate-in fade-in duration-200">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container border border-outline-variant/20 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt="User"
                  className="w-7 h-7 rounded-full object-cover"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                  {currentUser.displayName ? currentUser.displayName[0] : 'U'}
                </div>
              )}
              <div className="min-w-0">
                <span className="font-headline font-bold text-on-surface block truncate">
                  {currentUser.displayName || 'SyncLife Student'}
                </span>
                <span className="text-[10px] text-on-surface-variant truncate block">
                  {currentUser.email || `UID: ${currentUser.uid.slice(0, 10)}...`}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="text-[11px] font-semibold text-on-surface-variant hover:text-red-400 px-2 py-1 rounded-lg bg-surface-container-highest cursor-pointer"
            >
              Sign out
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleManualSync}
              disabled={isSyncing}
              className="py-2 px-3 rounded-xl bg-primary text-on-primary font-headline text-xs font-bold hover:bg-primary/95 disabled:opacity-50 transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
            >
              <span className="material-symbols-outlined text-[15px]">upload</span>
              <span>{isSyncing ? 'Syncing...' : 'Push to Cloud'}</span>
            </button>

            <button
              type="button"
              onClick={handlePullCloud}
              disabled={isSyncing}
              className="py-2 px-3 rounded-xl bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/30 text-on-surface font-headline text-xs font-semibold disabled:opacity-50 transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[15px]">download</span>
              <span>Restore Cloud</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-2.5 px-3 rounded-xl bg-white text-gray-800 font-headline text-xs font-bold shadow-sm hover:bg-gray-50 border border-gray-300 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Sign in with Google</span>
          </button>

          <button
            type="button"
            onClick={handleGuestLogin}
            className="w-full py-1.5 px-3 rounded-xl bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/30 text-on-surface-variant font-headline text-xs font-semibold transition active:scale-95 cursor-pointer text-center"
          >
            Continue as Guest (Anonymous Sync)
          </button>
        </div>
      )}
    </div>
  );
};
