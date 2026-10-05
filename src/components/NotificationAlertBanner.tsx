import React from 'react';
import { HighFocusAlert } from '../utils/notifications';

interface NotificationAlertBannerProps {
  alert: HighFocusAlert | null;
  onDismiss: () => void;
  onStartPomodoro: (taskId: string) => void;
  onSnooze: (alert: HighFocusAlert) => void;
}

export const NotificationAlertBanner: React.FC<NotificationAlertBannerProps> = ({
  alert,
  onDismiss,
  onStartPomodoro,
  onSnooze,
}) => {
  if (!alert) return null;

  return (
    <div className="fixed top-18 inset-x-4 max-w-sm mx-auto z-50 animate-in slide-in-from-top-4 duration-300">
      <div className="bg-surface-container-lowest/95 backdrop-blur-xl border border-primary/40 text-on-surface p-4 rounded-2xl shadow-2xl space-y-3 relative overflow-hidden">
        {/* Glowing top line */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary via-tertiary to-secondary" />

        <div className="flex items-start justify-between gap-2 pt-1">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
            </span>
            <span className="font-label-badge text-[10px] uppercase font-bold tracking-wider text-primary">
              High Focus Alert • Starting Now
            </span>
          </div>

          <button
            onClick={onDismiss}
            className="text-on-surface-variant hover:text-on-surface p-1 rounded-full cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="space-y-0.5">
          <div className="flex items-center justify-between">
            <h4 className="font-headline text-sm font-bold text-on-surface">
              {alert.taskTitle}
            </h4>
            <span className="font-label-time text-xs text-primary font-bold">
              {alert.scheduledTime}
            </span>
          </div>
          <p className="font-body text-xs text-on-surface-variant line-clamp-2">
            {alert.taskSubtitle}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => onStartPomodoro(alert.taskId)}
            className="flex-1 py-2 px-3 rounded-xl bg-primary text-on-primary font-headline text-xs font-bold shadow-md hover:bg-primary/95 active:scale-95 transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">timer</span>
            <span>Start 25m Pomodoro</span>
          </button>

          <button
            type="button"
            onClick={() => onSnooze(alert)}
            className="py-2 px-3 rounded-xl bg-surface-container-high text-on-surface font-headline text-xs font-semibold hover:bg-surface-container-highest border border-outline-variant/30 active:scale-95 transition cursor-pointer"
          >
            Snooze 5m
          </button>
        </div>
      </div>
    </div>
  );
};
