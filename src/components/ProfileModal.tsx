import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { TimeSlot } from '../types';
import { BadgesSection } from './BadgesSection';
import { WeeklyGoalTracker } from './WeeklyGoalTracker';
import { FirebaseAuthCard } from './FirebaseAuthCard';
import {
  subscribeToAuth,
  getUserProfileFromFirestore,
  updateUserDisplayName,
  formatNameFromEmail,
} from '../firebase/authService';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerToast: (msg: string, badge?: string) => void;
  slots: TimeSlot[];
  onSlotsUpdated?: (slots: TimeSlot[]) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  onTriggerToast,
  slots,
  onSlotsUpdated,
}) => {
  // Stored historical consistency streak (default to 7 to show the initial milestone)
  const [baseStreak, setBaseStreak] = useState<number>(() => {
    const saved = localStorage.getItem('synclife_consistency_streak');
    return saved !== null ? parseInt(saved, 10) : 7;
  });

  useEffect(() => {
    localStorage.setItem('synclife_consistency_streak', baseStreak.toString());
  }, [baseStreak]);

  // User Authentication & Dynamic Name State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState<string>(() => {
    return localStorage.getItem('synclife_user_name') || 'Guest Student';
  });
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');

  useEffect(() => {
    const unsubscribe = subscribeToAuth(async (user) => {
      setCurrentUser(user);
      if (user) {
        // Load profile from Firestore or Auth
        const remote = await getUserProfileFromFirestore(user.uid);
        const resolvedName =
          remote?.displayName ||
          user.displayName ||
          formatNameFromEmail(user.email) ||
          'Student';
        setDisplayName(resolvedName);
        setNameInput(resolvedName);
        localStorage.setItem('synclife_user_name', resolvedName);
      } else {
        const saved = localStorage.getItem('synclife_user_name');
        if (saved) {
          setDisplayName(saved);
          setNameInput(saved);
        } else {
          setDisplayName('Guest Student');
          setNameInput('Guest Student');
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSaveName = async () => {
    if (!nameInput.trim()) return;
    const newName = nameInput.trim();
    setDisplayName(newName);
    setIsEditingName(false);
    localStorage.setItem('synclife_user_name', newName);

    if (currentUser) {
      await updateUserDisplayName(newName);
      onTriggerToast(`Profile name updated to ${newName}! ✏️`, 'NAME UPDATED');
    } else {
      onTriggerToast(`Display name set to ${newName}! ✏️`, 'SAVED');
    }
  };

  if (!isOpen) return null;

  // Real-time task completion calculations from slots
  const totalTasks = slots.length;
  const completedTodayCount = slots.filter((s) => s.completed).length;
  const allCompletedToday = totalTasks > 0 && completedTodayCount === totalTasks;

  // If all tasks today are completed, add 1 day to consistency streak
  const consecutiveDays = allCompletedToday ? baseStreak + 1 : baseStreak;
  const hasHit7DayMilestone = consecutiveDays >= 7;

  // Helper to parse duration string to minutes
  const parseDurationMinutes = (dur: string): number => {
    if (!dur) return 30;
    let total = 0;
    const hoursMatch = dur.match(/(\d+)\s*h/);
    const minsMatch = dur.match(/(\d+)\s*m/);
    if (hoursMatch) total += parseInt(hoursMatch[1], 10) * 60;
    if (minsMatch) total += parseInt(minsMatch[1], 10);
    return total > 0 ? total : 30;
  };

  // Focus vs. Rest Calculations for completed tasks
  const completedSlots = slots.filter((s) => s.completed);

  const isFocusCategory = (cat: TimeSlot['category']) =>
    ['Academics', 'High Focus', 'Review'].includes(cat);

  const isRestCategory = (cat: TimeSlot['category']) =>
    [
      'Wellness',
      'Nutrition & Move',
      'Hobby & Passion',
      'Free Time',
      'Family',
      'Nutrition',
      'Rest',
    ].includes(cat);

  const focusTasks = completedSlots.filter((s) => isFocusCategory(s.category));
  const restTasks = completedSlots.filter((s) => isRestCategory(s.category));

  const focusMinutes = focusTasks.reduce((acc, s) => acc + parseDurationMinutes(s.duration), 0);
  const restMinutes = restTasks.reduce((acc, s) => acc + parseDurationMinutes(s.duration), 0);
  const totalCompletedMinutes = focusMinutes + restMinutes;

  const focusPercent =
    totalCompletedMinutes > 0
      ? Math.round((focusMinutes / totalCompletedMinutes) * 100)
      : 0;
  const restPercent =
    totalCompletedMinutes > 0 ? 100 - focusPercent : 0;

  const focusHoursFormatted = (focusMinutes / 60).toFixed(1);
  const restHoursFormatted = (restMinutes / 60).toFixed(1);

  const getHarmonyVerdict = () => {
    if (completedSlots.length === 0) {
      return {
        label: 'Awaiting Completed Tasks',
        icon: 'hourglass_empty',
        color: 'text-on-surface-variant',
        bg: 'bg-surface-container',
        desc: 'Check off activities in your Today flow to calculate your real-time ratio.',
      };
    }
    if (focusPercent > 70) {
      return {
        label: 'High-Tension Focus Sprint',
        icon: 'bolt',
        color: 'text-primary',
        bg: 'bg-primary/15',
        desc: 'Heavy cognitive output today. Schedule an evening dance or yoga wind-down.',
      };
    }
    if (focusPercent >= 45 && focusPercent <= 70) {
      return {
        label: 'Optimal Circadian Equilibrium 🌿',
        icon: 'verified',
        color: 'text-secondary',
        bg: 'bg-secondary/15',
        desc: 'Healthy 50/50 balance between intense study and restorative downtime.',
      };
    }
    return {
      label: 'Recovery & Active Rest Heavy',
      icon: 'spa',
      color: 'text-secondary',
      bg: 'bg-secondary/15',
      desc: 'Great rejuvenation momentum fueling future deep-focus study marathons.',
    };
  };

  const harmonyVerdict = getHarmonyVerdict();

  const handleAdjustStreak = (delta: number) => {
    const next = Math.max(0, baseStreak + delta);
    setBaseStreak(next);
    if (next >= 7 && baseStreak < 7) {
      onTriggerToast('🏆 7-Day Consistency Trophy Unlocked!', 'MILESTONE');
    } else {
      onTriggerToast(`Daily Consistency Streak set to ${next} days`, 'STREAK');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-container rounded-2xl w-full max-w-md p-5 shadow-2xl border border-outline-variant/40 space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {currentUser?.photoURL ? (
              <img
                alt={displayName}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/40 shadow-sm shrink-0"
                src={currentUser.photoURL}
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-amber-500 text-on-primary font-headline font-bold text-lg flex items-center justify-center shadow-md ring-2 ring-primary/30 shrink-0">
                {displayName.charAt(0).toUpperCase() || 'S'}
              </div>
            )}

            <div className="min-w-0 flex-1">
              {isEditingName ? (
                <div className="flex items-center gap-1.5 py-0.5">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Enter your name"
                    autoFocus
                    className="bg-surface-container-high border border-primary/50 rounded-lg px-2 py-0.5 text-sm text-on-surface font-headline font-bold focus:outline-none focus:ring-1 focus:ring-primary w-full max-w-[170px]"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveName();
                      if (e.key === 'Escape') setIsEditingName(false);
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleSaveName}
                    className="p-1 rounded-md bg-primary text-on-primary hover:bg-primary/90 text-xs cursor-pointer"
                    title="Save name"
                  >
                    <span className="material-symbols-outlined text-[15px]">check</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingName(false)}
                    className="p-1 rounded-md text-on-surface-variant hover:text-on-surface text-xs cursor-pointer"
                    title="Cancel"
                  >
                    <span className="material-symbols-outlined text-[15px]">close</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <h3 className="font-headline text-lg font-bold text-on-surface truncate">
                    {displayName}
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setNameInput(displayName);
                      setIsEditingName(true);
                    }}
                    title="Edit profile name"
                    className="p-1 text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded-md transition cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]">edit</span>
                  </button>
                </div>
              )}

              <p className="font-body text-xs text-on-surface-variant truncate">
                {currentUser?.email ? currentUser.email : 'Double-Focus Regime (Competitive Exam Prep)'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface transition cursor-pointer shrink-0 ml-2"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Daily Consistency Streak Feature Card */}
        <div
          className={`rounded-2xl p-4 border transition-all duration-300 relative overflow-hidden ${
            hasHit7DayMilestone
              ? 'bg-gradient-to-br from-amber-500/15 via-surface-container-high to-secondary/15 border-amber-500/40 shadow-md'
              : 'bg-surface-container-low border-outline-variant/30'
          }`}
        >
          {/* Ambient Glow for Milestone */}
          {hasHit7DayMilestone && (
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
          )}

          <div className="flex items-start justify-between relative z-10">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="font-label-badge text-xs uppercase tracking-wider font-bold text-on-surface-variant">
                  Daily Consistency Streak
                </span>
                {hasHit7DayMilestone && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400 font-label-badge text-[10px] font-bold inline-flex items-center gap-1">
                    <span>🏆</span> Milestone
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-2">
                <span className="font-metric-display text-3xl font-bold text-on-surface">
                  {consecutiveDays}
                </span>
                <span className="font-body text-xs font-semibold text-on-surface-variant">
                  Consecutive Days 100% Completed
                </span>
              </div>
            </div>

            {/* Prominent Trophy Icon on 7-Day Milestone */}
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 transition-all duration-300 border ${
                hasHit7DayMilestone
                  ? 'bg-amber-400/20 border-amber-400/50 shadow-md shadow-amber-400/20 scale-105 animate-pulse'
                  : 'bg-surface-container-highest border-outline-variant/30 opacity-60 text-xl'
              }`}
              title={
                hasHit7DayMilestone
                  ? '7-Day Milestone Achieved! Trophy Unlocked.'
                  : `${7 - (consecutiveDays % 7)} days to next Trophy milestone`
              }
            >
              {hasHit7DayMilestone ? '🏆' : '🎯'}
            </div>
          </div>

          {/* 7-Day Visual Progress Track */}
          <div className="mt-3.5 space-y-1.5 relative z-10">
            <div className="flex items-center justify-between text-xs">
              <span className="font-body text-[11px] text-on-surface-variant font-medium">
                {hasHit7DayMilestone
                  ? '7-Day Milestone Trophy Unlocked! 🎉'
                  : `${Math.max(0, 7 - consecutiveDays)} more consecutive day${
                      7 - consecutiveDays === 1 ? '' : 's'
                    } for Trophy 🏆`}
              </span>
              <span className="font-label-time text-[11px] font-bold text-secondary">
                {Math.min(7, consecutiveDays)}/7 Days
              </span>
            </div>

            {/* 7 Day Matrix Pills */}
            <div className="grid grid-cols-7 gap-1.5 pt-1">
              {[1, 2, 3, 4, 5, 6, 7].map((dayNum) => {
                const isDayAchieved = consecutiveDays >= dayNum;
                const isTrophyDay = dayNum === 7;

                return (
                  <div
                    key={dayNum}
                    className={`flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl border transition-all ${
                      isDayAchieved
                        ? isTrophyDay
                          ? 'bg-amber-500/25 border-amber-500/50 text-amber-700 font-bold shadow-xs'
                          : 'bg-secondary/20 border-secondary/40 text-secondary font-bold'
                        : 'bg-surface-container border-outline-variant/20 text-on-surface-variant/50'
                    }`}
                  >
                    <span className="font-label-time text-[10px] leading-tight">
                      D{dayNum}
                    </span>
                    <span className="text-[13px] mt-0.5">
                      {isTrophyDay ? (
                        isDayAchieved ? '🏆' : '🔒'
                      ) : isDayAchieved ? (
                        '✓'
                      ) : (
                        '·'
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Today's Full Completion Status Sub-Banner */}
          <div className="mt-3 pt-2.5 border-t border-outline-variant/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  allCompletedToday ? 'bg-secondary' : 'bg-primary animate-pulse'
                }`}
              />
              <span className="font-body text-[11px] text-on-surface">
                {allCompletedToday
                  ? `Today: All ${totalTasks} tasks completed! Streak safe ✨`
                  : `Today: ${completedTodayCount}/${totalTasks} tasks completed`}
              </span>
            </div>

            {/* Quick Streak Tester Stepper */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleAdjustStreak(-1)}
                title="Decrease simulated streak by 1"
                className="w-6 h-6 rounded-md bg-surface-container-highest border border-outline-variant/40 flex items-center justify-center text-xs text-on-surface hover:bg-surface-container font-bold cursor-pointer"
              >
                -
              </button>
              <button
                type="button"
                onClick={() => handleAdjustStreak(1)}
                title="Increase simulated streak by 1"
                className="w-6 h-6 rounded-md bg-surface-container-highest border border-outline-variant/40 flex items-center justify-center text-xs text-on-surface hover:bg-surface-container font-bold cursor-pointer"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Weekly Academic Objective Tracker */}
        <WeeklyGoalTracker onTriggerToast={onTriggerToast} />

        {/* Cloud Database & Auth (Firebase Auth & Firestore) */}
        <FirebaseAuthCard
          slots={slots}
          onSlotsUpdated={onSlotsUpdated}
          onTriggerToast={onTriggerToast}
        />

        {/* Focus vs. Rest Ratio Feature Section */}
        <div className="bg-surface-container-low rounded-2xl p-4 border border-outline-variant/30 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">
                balance
              </span>
              <div>
                <h4 className="font-headline text-sm font-bold text-on-surface leading-tight">
                  Focus vs. Rest Ratio
                </h4>
                <p className="font-body text-[11px] text-on-surface-variant">
                  Computed from completed daily categories
                </p>
              </div>
            </div>

            {totalCompletedMinutes > 0 ? (
              <span className="font-metric-display text-xs font-bold px-2 py-0.5 rounded-full bg-surface-container-highest border border-outline-variant/40 text-on-surface">
                {focusPercent}% : {restPercent}%
              </span>
            ) : (
              <span className="font-label-badge text-[10px] text-outline font-semibold">
                No tasks yet
              </span>
            )}
          </div>

          {/* Segmented Dual Proportion Bar */}
          <div className="space-y-1.5">
            <div className="h-3 w-full bg-surface-container-highest rounded-full overflow-hidden flex p-0.5 border border-outline-variant/20 shadow-inner">
              {totalCompletedMinutes > 0 ? (
                <>
                  <div
                    style={{ width: `${focusPercent}%` }}
                    className="bg-primary h-full rounded-l-full transition-all duration-700 relative group"
                    title={`Focus: ${focusPercent}% (${focusHoursFormatted}h)`}
                  />
                  <div
                    style={{ width: `${restPercent}%` }}
                    className="bg-secondary h-full rounded-r-full transition-all duration-700 relative group"
                    title={`Rest: ${restPercent}% (${restHoursFormatted}h)`}
                  />
                </>
              ) : (
                <div className="w-full h-full bg-outline-variant/30 rounded-full animate-pulse" />
              )}
            </div>

            {/* Metric Labels Below Bar */}
            <div className="flex items-center justify-between text-xs font-medium pt-0.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
                <span className="font-body text-xs text-on-surface font-semibold">
                  Focus:{' '}
                  <span className="font-metric-display font-bold text-primary">
                    {focusHoursFormatted}h
                  </span>
                </span>
                <span className="font-label-time text-[10px] text-on-surface-variant">
                  ({focusTasks.length} tasks)
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary shrink-0" />
                <span className="font-body text-xs text-on-surface font-semibold">
                  Rest:{' '}
                  <span className="font-metric-display font-bold text-secondary">
                    {restHoursFormatted}h
                  </span>
                </span>
                <span className="font-label-time text-[10px] text-on-surface-variant">
                  ({restTasks.length} tasks)
                </span>
              </div>
            </div>
          </div>

          {/* Circadian Harmony Verdict */}
          <div className="p-2.5 rounded-xl bg-surface-container border border-outline-variant/20 flex items-start gap-2.5">
            <div
              className={`p-1.5 rounded-lg ${harmonyVerdict.bg} ${harmonyVerdict.color} shrink-0 mt-0.5`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {harmonyVerdict.icon}
              </span>
            </div>
            <div className="min-w-0 space-y-0.5">
              <span className="font-headline text-xs font-bold text-on-surface block">
                {harmonyVerdict.label}
              </span>
              <p className="font-body text-[11px] text-on-surface-variant leading-snug">
                {harmonyVerdict.desc}
              </p>
            </div>
          </div>

          {/* Category Classification Legend */}
          <div className="flex items-center justify-between text-[10px] text-outline font-label-badge pt-0.5 border-t border-outline-variant/20">
            <span>
              <strong>Focus:</strong> Academics, High Focus, Review
            </span>
            <span>
              <strong>Rest:</strong> Wellness, Nutrition, Free Time, Sleep
            </span>
          </div>
        </div>

        {/* Visual Achievements / Badges Section */}
        <BadgesSection
          slots={slots}
          consecutiveDays={consecutiveDays}
          onTriggerToast={onTriggerToast}
        />

        {/* 14d Flow Streak Banner */}
        <div className="bg-gradient-to-r from-secondary/15 via-surface-container-high to-primary/10 rounded-xl p-3 border border-secondary/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center text-2xl">
              🔥
            </div>
            <div>
              <span className="font-headline text-sm font-bold text-on-surface block">
                14-Day Circadian Flow
              </span>
              <span className="font-body text-xs text-secondary font-medium">
                Zero routines broken this semester
              </span>
            </div>
          </div>
          <span className="font-label-time text-xs font-bold px-2 py-1 rounded bg-secondary/20 text-secondary">
            Tier A+
          </span>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/30">
            <span className="font-metric-display text-base font-bold text-on-surface block">
              96%
            </span>
            <span className="font-body text-[11px] text-on-surface-variant">
              Harmony Index
            </span>
          </div>
          <div className="bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/30">
            <span className="font-metric-display text-base font-bold text-primary block">
              5.5h
            </span>
            <span className="font-body text-[11px] text-on-surface-variant">
              Daily Uni Anchor
            </span>
          </div>
          <div className="bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/30">
            <span className="font-metric-display text-base font-bold text-secondary block">
              3.0h
            </span>
            <span className="font-body text-[11px] text-on-surface-variant">
              Deep Prep Sprint
            </span>
          </div>
        </div>

        {/* Sync Settings */}
        <div className="space-y-2">
          <span className="font-label-badge text-xs uppercase tracking-wider text-on-surface-variant font-bold">
            Integrations & Calendar Locks
          </span>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">
                  calendar_month
                </span>
                <span className="font-body text-xs font-semibold text-on-surface">
                  Google Calendar Bi-directional Sync
                </span>
              </div>
              <span className="font-label-badge text-[10px] text-secondary font-bold">
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[18px]">
                  notifications_active
                </span>
                <span className="font-body text-xs font-semibold text-on-surface">
                  Circadian Hydration & Stretch Chimes
                </span>
              </div>
              <span className="font-label-badge text-[10px] text-primary font-bold">
                Active
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => {
            onTriggerToast('Profile settings saved to SyncLife Cloud', 'SAVED');
            onClose();
          }}
          className="w-full py-2.5 rounded-xl bg-primary text-on-primary font-headline text-sm font-bold shadow-md hover:opacity-95 active:scale-98 transition cursor-pointer"
        >
          Done
        </button>
      </div>
    </div>
  );
};
