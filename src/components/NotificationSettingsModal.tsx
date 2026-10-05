import React, { useState, useEffect } from 'react';
import { notificationService } from '../utils/notifications';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerTestAlert: () => void;
  onTriggerTestHabit?: () => void;
  onTriggerToast: (msg: string, badge?: string) => void;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  isOpen,
  onClose,
  onTriggerTestAlert,
  onTriggerTestHabit,
  onTriggerToast,
}) => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [alertsEnabled, setAlertsEnabled] = useState<boolean>(() => {
    return localStorage.getItem('synclife_alerts_enabled') !== 'false';
  });
  const [habitsEnabled, setHabitsEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('synclife_habit_reminder_settings');
    if (saved) {
      try {
        return JSON.parse(saved).masterEnabled !== false;
      } catch {
        return true;
      }
    }
    return true;
  });

  useEffect(() => {
    setPermission(notificationService.getPermission());
  }, [isOpen]);

  const handleRequestPermission = async () => {
    const perm = await notificationService.requestPermission();
    setPermission(perm);
    if (perm === 'granted') {
      onTriggerToast('Browser push notifications enabled! 🔔', 'ALERTS ON');
      notificationService.playChime();
    } else {
      onTriggerToast('Browser notification permission was not granted.', 'DENIED');
    }
  };

  const handleToggleAlerts = () => {
    const next = !alertsEnabled;
    setAlertsEnabled(next);
    localStorage.setItem('synclife_alerts_enabled', next ? 'true' : 'false');
    onTriggerToast(
      next
        ? 'High Focus task push notifications activated'
        : 'High Focus task notifications muted',
      next ? 'ACTIVE' : 'MUTED'
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-container rounded-2xl w-full max-w-sm p-5 shadow-2xl border border-outline-variant/40 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">
              notifications_active
            </span>
            <h3 className="font-headline text-base font-bold text-on-surface">
              High Focus Alert System
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface p-1 rounded-full cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <p className="font-body text-xs text-on-surface-variant leading-relaxed">
          Receive proactive browser notifications and gentle audio chimes right as high-tension
          study windows begin, preventing schedule paralysis.
        </p>

        {/* Permission Status Box */}
        <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-headline text-xs font-bold text-on-surface">
              Browser Web Notification
            </span>
            <span
              className={`font-label-badge text-[10px] px-2 py-0.5 rounded-full font-bold ${
                permission === 'granted'
                  ? 'bg-secondary/20 text-secondary'
                  : permission === 'denied'
                  ? 'bg-error-container/40 text-error'
                  : 'bg-primary/20 text-primary'
              }`}
            >
              {permission === 'granted'
                ? 'Permission Granted'
                : permission === 'denied'
                ? 'Blocked in Browser'
                : 'Needs Permission'}
            </span>
          </div>

          {permission !== 'granted' && (
            <button
              type="button"
              onClick={handleRequestPermission}
              className="w-full py-2 px-3 rounded-lg bg-primary text-on-primary font-headline text-xs font-bold hover:bg-primary/95 transition active:scale-95 cursor-pointer"
            >
              Grant Browser Notification Permission
            </button>
          )}
        </div>

        {/* Master Alert Toggle */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-outline-variant/30">
          <div>
            <span className="font-headline text-xs font-bold text-on-surface block">
              High Focus Task Alerts
            </span>
            <span className="font-body text-[11px] text-on-surface-variant">
              Audio chime & prompt 0–5m prior to task
            </span>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={alertsEnabled}
              onChange={handleToggleAlerts}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-secondary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all shadow-inner" />
          </label>
        </div>

        {/* Habit Reminders Toggle */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-outline-variant/30">
          <div>
            <span className="font-headline text-xs font-bold text-on-surface block">
              Habit Reminders (Hydration & Stretch)
            </span>
            <span className="font-body text-[11px] text-on-surface-variant">
              Periodic water droplet chime & posture prompts
            </span>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={habitsEnabled}
              onChange={() => {
                const next = !habitsEnabled;
                setHabitsEnabled(next);
                const saved = localStorage.getItem('synclife_habit_reminder_settings');
                const parsed = saved ? JSON.parse(saved) : {};
                parsed.masterEnabled = next;
                localStorage.setItem('synclife_habit_reminder_settings', JSON.stringify(parsed));
                onTriggerToast(
                  next ? 'Periodic habit reminders enabled 💧' : 'Habit reminders paused',
                  next ? 'ACTIVE' : 'PAUSED'
                );
              }}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-secondary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all shadow-inner" />
          </label>
        </div>

        {/* Test Alert Simulator Buttons */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={() => {
              onTriggerTestAlert();
              onClose();
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-surface-container-high hover:bg-surface-container-highest border border-primary/30 text-primary font-headline text-xs font-bold active:scale-95 transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">notifications</span>
            <span>Simulate High Focus Push Alert Now</span>
          </button>

          {onTriggerTestHabit && (
            <button
              type="button"
              onClick={() => {
                onTriggerTestHabit();
                onClose();
              }}
              className="w-full py-2 px-3 rounded-xl bg-surface-container-high hover:bg-surface-container-highest border border-secondary/30 text-secondary font-headline text-xs font-bold active:scale-95 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">water_drop</span>
              <span>Simulate Habit Reminder (Hydration)</span>
            </button>
          )}

          <span className="font-body text-[10px] text-on-surface-variant text-center block">
            Fires crystal audio chime + native alert banner
          </span>
        </div>
      </div>
    </div>
  );
};
