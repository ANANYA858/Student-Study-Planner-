import React from 'react';
import { MicroHabit } from '../utils/habitReminders';

interface HabitReminderBannerProps {
  habit: MicroHabit | null;
  onDismiss: () => void;
  onCompleteHabit: (habit: MicroHabit) => void;
  onSnooze: (habit: MicroHabit) => void;
}

export const HabitReminderBanner: React.FC<HabitReminderBannerProps> = ({
  habit,
  onDismiss,
  onCompleteHabit,
  onSnooze,
}) => {
  if (!habit) return null;

  return (
    <div className="fixed top-20 inset-x-4 max-w-sm mx-auto z-50 animate-in slide-in-from-top-4 duration-300">
      <div className="bg-surface-container-lowest/95 backdrop-blur-xl border border-secondary/40 text-on-surface p-4 rounded-2xl shadow-2xl space-y-3 relative overflow-hidden">
        {/* Glowing top line with secondary teal-cyan gradient */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-secondary via-teal-400 to-emerald-400" />

        <div className="flex items-start justify-between gap-2 pt-1">
          <div className="flex items-center gap-2">
            <span className="text-xl leading-none">{habit.emoji}</span>
            <div className="flex flex-col">
              <span className="font-label-badge text-[10px] uppercase font-bold tracking-wider text-secondary">
                Gentle Habit Reminder
              </span>
              <h4 className="font-headline text-sm font-bold text-on-surface">
                {habit.title}
              </h4>
            </div>
          </div>

          <button
            onClick={onDismiss}
            className="text-on-surface-variant hover:text-on-surface p-1 rounded-full cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <p className="font-body text-xs text-on-surface-variant leading-relaxed">
          {habit.actionText} —{' '}
          <span className="text-secondary font-medium">{habit.benefit}</span>
        </p>

        {/* Action Controls */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => onCompleteHabit(habit)}
            className="flex-1 py-2 px-3 rounded-xl bg-secondary text-on-secondary font-headline text-xs font-bold shadow-md hover:bg-secondary/95 active:scale-95 transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            <span>
              {habit.id === 'hydration'
                ? 'Done (+250ml Water)'
                : habit.id === 'stretching'
                ? 'Stretched & Refreshed'
                : 'Done!'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onSnooze(habit)}
            className="py-2 px-3 rounded-xl bg-surface-container-high text-on-surface font-headline text-xs font-semibold hover:bg-surface-container-highest border border-outline-variant/30 active:scale-95 transition cursor-pointer"
          >
            Snooze 10m
          </button>
        </div>
      </div>
    </div>
  );
};
