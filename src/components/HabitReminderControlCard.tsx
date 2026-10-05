import React, { useState, useEffect } from 'react';
import {
  habitReminderService,
  HabitReminderSettings,
  MicroHabit,
} from '../utils/habitReminders';

interface HabitReminderControlCardProps {
  onTriggerToast: (msg: string, badge?: string) => void;
  onSendTestReminder?: (habit: MicroHabit) => void;
}

export const HabitReminderControlCard: React.FC<HabitReminderControlCardProps> = ({
  onTriggerToast,
  onSendTestReminder,
}) => {
  const [settings, setSettings] = useState<HabitReminderSettings>(() =>
    habitReminderService.getSettings()
  );

  useEffect(() => {
    habitReminderService.saveSettings(settings);
  }, [settings]);

  const handleToggleMaster = () => {
    const next = !settings.masterEnabled;
    const updated = { ...settings, masterEnabled: next };
    setSettings(updated);
    onTriggerToast(
      next
        ? `Gentle habit reminders active (every ${settings.intervalMinutes}m) 💧🧘`
        : 'Habit reminders paused',
      next ? 'ACTIVE' : 'PAUSED'
    );
  };

  const handleSetInterval = (mins: number) => {
    const updated = { ...settings, intervalMinutes: mins };
    setSettings(updated);
    onTriggerToast(`Reminder frequency set to every ${mins} minutes`, 'INTERVAL');
  };

  const handleToggleHabit = (id: string) => {
    const updatedHabits = settings.habits.map((h) =>
      h.id === id ? { ...h, enabled: !h.enabled } : h
    );
    const target = updatedHabits.find((h) => h.id === id);
    const updated = { ...settings, habits: updatedHabits };
    setSettings(updated);

    if (target) {
      onTriggerToast(
        target.enabled
          ? `Enabled reminders for ${target.title}`
          : `Muted ${target.title}`,
        target.enabled ? 'ENABLED' : 'MUTED'
      );
    }
  };

  const handleTestTrigger = () => {
    const activeHabit =
      settings.habits.find((h) => h.enabled) || settings.habits[0];

    habitReminderService.sendHabitPush(activeHabit);

    if (onSendTestReminder) {
      onSendTestReminder(activeHabit);
    }

    onTriggerToast(`Test reminder sent: ${activeHabit.title} ✨`, 'REMINDER');
  };

  const intervals = [30, 45, 60, 90];

  return (
    <div className="bg-surface-container-low rounded-2xl p-4 border border-outline-variant/30 space-y-3.5 shadow-xs">
      {/* Header & Master Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-secondary/15 flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined text-[20px]">notifications_active</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-headline text-sm font-bold text-on-surface">
                Habit Reminders
              </h4>
              <span className="font-label-badge text-[9px] px-1.5 py-0.2 rounded bg-secondary/20 text-secondary font-bold">
                Periodic
              </span>
            </div>
            <p className="font-body text-[11px] text-on-surface-variant">
              Gentle prompts for non-task wellness items
            </p>
          </div>
        </div>

        {/* Master Toggle Switch */}
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.masterEnabled}
            onChange={handleToggleMaster}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-secondary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all shadow-inner" />
        </label>
      </div>

      {settings.masterEnabled && (
        <div className="space-y-3 animate-in fade-in duration-200">
          {/* Interval Frequency Selector */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-headline font-semibold text-on-surface-variant">
                Reminder Interval
              </span>
              <span className="font-metric-display text-xs font-bold text-secondary">
                Every {settings.intervalMinutes} mins
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {intervals.map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => handleSetInterval(mins)}
                  className={`py-1.5 rounded-lg text-xs font-semibold transition active:scale-95 cursor-pointer border ${
                    settings.intervalMinutes === mins
                      ? 'bg-secondary/20 border-secondary text-secondary font-bold shadow-xs'
                      : 'bg-surface-container border-outline-variant/30 text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>

          {/* Micro-Habits List */}
          <div className="space-y-1.5">
            <span className="font-headline text-[11px] font-semibold text-on-surface-variant block">
              Active Habit Prompts
            </span>

            <div className="grid grid-cols-2 gap-1.5">
              {settings.habits.map((habit) => (
                <button
                  key={habit.id}
                  type="button"
                  onClick={() => handleToggleHabit(habit.id)}
                  className={`p-2 rounded-xl text-left transition-all active:scale-95 cursor-pointer border flex items-start gap-2 ${
                    habit.enabled
                      ? 'bg-surface-container border-secondary/40 shadow-xs'
                      : 'bg-surface-container-lowest/50 border-outline-variant/20 opacity-60'
                  }`}
                >
                  <span className="text-base leading-none mt-0.5">{habit.emoji}</span>
                  <div className="min-w-0">
                    <span
                      className={`font-headline text-xs font-semibold block truncate ${
                        habit.enabled ? 'text-on-surface' : 'text-on-surface-variant'
                      }`}
                    >
                      {habit.title}
                    </span>
                    <span className="font-body text-[10px] text-on-surface-variant line-clamp-1">
                      {habit.enabled ? 'Active' : 'Muted'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Test Trigger Button */}
          <div className="pt-1">
            <button
              type="button"
              onClick={handleTestTrigger}
              className="w-full py-2 px-3 rounded-xl bg-surface-container-high hover:bg-surface-container-highest border border-secondary/30 text-secondary font-headline text-xs font-bold active:scale-95 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">water_drop</span>
              <span>Send Gentle Test Reminder Now</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
