import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  signInGuest,
  logoutUser,
  subscribeToAuth,
  syncSlotsToFirestore,
  loadSlotsFromFirestore,
  formatNameFromEmail,
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

  // Email Auth State
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToAuth((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    try {
      setAuthError(null);
      const user = await signInWithGoogle();
      if (user) {
        const studentName = user.displayName || formatNameFromEmail(user.email);
        onTriggerToast(`Signed in as ${studentName}! ☁️`, 'FIREBASE AUTH');
        await syncSlotsToFirestore(user.uid, slots);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google sign-in failed';
      setAuthError(msg);
      onTriggerToast('Google Sign-in cancelled or failed', 'AUTH CANCEL');
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !passwordInput.trim()) {
      setAuthError('Please enter both email and password.');
      return;
    }

    setAuthError(null);
    setIsAuthLoading(true);

    try {
      let user: User | null = null;
      if (isRegistering) {
        user = await signUpWithEmail(emailInput.trim(), passwordInput, nameInput.trim());
        const studentName = user?.displayName || nameInput.trim() || formatNameFromEmail(emailInput);
        onTriggerToast(`Account created! Welcome, ${studentName} 🎓`, 'ACCOUNT CREATED');
      } else {
        user = await signInWithEmail(emailInput.trim(), passwordInput);
        const studentName = user?.displayName || formatNameFromEmail(emailInput);
        onTriggerToast(`Welcome back, ${studentName}! ☁️`, 'SIGNED IN');
      }

      if (user) {
        await syncSlotsToFirestore(user.uid, slots);
        setShowEmailForm(false);
        setEmailInput('');
        setPasswordInput('');
        setNameInput('');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      setAuthError(msg.replace('Firebase: ', ''));
      onTriggerToast('Authentication failed', 'AUTH ERROR');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    try {
      setAuthError(null);
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

  const userDisplayName =
    currentUser?.displayName ||
    (currentUser?.email ? formatNameFromEmail(currentUser.email) : 'Guest Student');

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
                Firestore
              </span>
            </div>
            <p className="font-body text-[11px] text-on-surface-variant">
              {currentUser
                ? `Logged in: ${userDisplayName}`
                : 'Sign in to show your name and sync across devices'}
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
                  alt={userDisplayName}
                  className="w-8 h-8 rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                  {userDisplayName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <span className="font-headline font-bold text-on-surface block truncate">
                  {userDisplayName}
                </span>
                <span className="text-[10px] text-on-surface-variant truncate block">
                  {currentUser.email || `Guest UID: ${currentUser.uid.slice(0, 8)}...`}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="text-[11px] font-semibold text-on-surface-variant hover:text-red-400 px-2 py-1 rounded-lg bg-surface-container-highest cursor-pointer shrink-0"
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
      ) : showEmailForm ? (
        /* Email Login & Registration Form */
        <form onSubmit={handleEmailAuth} className="space-y-2.5 pt-1 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h5 className="font-headline text-xs font-bold text-on-surface">
              {isRegistering ? 'Create Student Account' : 'Sign In With Email'}
            </h5>
            <button
              type="button"
              onClick={() => {
                setShowEmailForm(false);
                setAuthError(null);
              }}
              className="text-on-surface-variant hover:text-on-surface text-xs"
            >
              ✕ Cancel
            </button>
          </div>

          {authError && (
            <p className="text-[11px] text-red-400 bg-red-500/10 p-2 rounded-lg border border-red-500/20">
              {authError}
            </p>
          )}

          {isRegistering && (
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-on-surface-variant block">
                Your Full Name
              </label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="e.g. Alex Morgan"
                className="w-full bg-surface-container border border-outline-variant/30 rounded-xl px-2.5 py-1.5 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-on-surface-variant block">
              Email Address
            </label>
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="student@example.com"
              required
              className="w-full bg-surface-container border border-outline-variant/30 rounded-xl px-2.5 py-1.5 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-on-surface-variant block">
              Password
            </label>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full bg-surface-container border border-outline-variant/30 rounded-xl px-2.5 py-1.5 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <button
            type="submit"
            disabled={isAuthLoading}
            className="w-full py-2.5 rounded-xl bg-primary text-on-primary font-headline text-xs font-bold shadow-md hover:bg-primary/95 disabled:opacity-50 transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>{isAuthLoading ? 'Authenticating...' : isRegistering ? 'Register & Show My Profile' : 'Sign In'}</span>
          </button>

          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setAuthError(null);
              }}
              className="text-[11px] text-primary hover:underline font-semibold cursor-pointer"
            >
              {isRegistering
                ? 'Already have an account? Sign In'
                : "Don't have an account? Create one"}
            </button>
          </div>
        </form>
      ) : (
        /* Sign-in Options */
        <div className="space-y-2 pt-1">
          {authError && (
            <p className="text-[11px] text-red-400 bg-red-500/10 p-2 rounded-lg border border-red-500/20">
              {authError}
            </p>
          )}

          {/* Google Sign In */}
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

          {/* Email Sign In / Up */}
          <button
            type="button"
            onClick={() => setShowEmailForm(true)}
            className="w-full py-2 px-3 rounded-xl bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/30 text-on-surface font-headline text-xs font-semibold transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">mail</span>
            <span>Sign in with Email</span>
          </button>

          {/* Guest Sign In */}
          <button
            type="button"
            onClick={handleGuestLogin}
            className="w-full py-1.5 px-3 rounded-xl text-on-surface-variant hover:text-on-surface text-[11px] font-medium transition cursor-pointer text-center"
          >
            Continue as Guest (Anonymous)
          </button>
        </div>
      )}
    </div>
  );
};
