import React from 'react';

interface ToastProps {
  message: string | null;
  badge?: string;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, badge = 'SYNCED', onClose }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-22 inset-x-4 max-w-sm mx-auto bg-surface-container-lowest/95 backdrop-blur-xl border border-secondary/30 text-on-surface px-4 py-3 rounded-2xl shadow-2xl flex items-center justify-between gap-3 z-50 animate-in fade-in slide-in-from-bottom-6 duration-300">
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="material-symbols-outlined text-secondary text-[22px] shrink-0">
          check_circle
        </span>
        <span className="font-body text-[13px] font-medium leading-tight truncate text-on-surface">
          {message}
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="font-label-badge text-[10px] px-2 py-0.5 rounded-full bg-secondary/15 text-secondary font-bold tracking-wider">
          {badge}
        </span>
        <button
          onClick={onClose}
          className="text-on-surface-variant/60 hover:text-on-surface p-1 rounded-full cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
        </button>
      </div>
    </div>
  );
};
