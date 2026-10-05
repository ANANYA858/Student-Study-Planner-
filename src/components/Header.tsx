import React from 'react';
import { TabType } from '../types';

interface HeaderProps {
  activeTab: TabType;
  onOpenProfile: () => void;
  onOpenNotifications: () => void;
  onOpenStopwatch: () => void;
  onOpenGemini?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onOpenProfile,
  onOpenNotifications,
  onOpenStopwatch,
  onOpenGemini,
}) => {
  const getSubTitle = () => {
    switch (activeTab) {
      case 'today':
        return 'Today';
      case 'schedule':
        return 'Auto Schedule';
      case 'exam-prep':
        return 'Exam Focus';
      case 'balance':
        return 'Life Balance';
    }
  };

  return (
    <header className="sticky top-0 inset-x-0 z-40 bg-surface-container-lowest/85 backdrop-blur-xl border-b border-outline-variant/30 shadow-[0_1px_8px_rgba(0,0,0,0.06)] transition-all">
      <div className="h-16 px-4 max-w-lg mx-auto flex items-center justify-between gap-3">
        {/* Brand Lockup */}
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            alt="SyncLife Logo"
            className="h-8 w-auto object-contain shrink-0 rounded-md"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCayNi1BFH724qlxf7hz_n3e0GI2jhwA4mwNEavQ5nwuhi8KJRgHpIGHTDJnzwR7OK_zek-1JHibL5lH_WYnsjE1Ru2n7-JRNBKk7iIbY9lifiq3Z6C56oGCrv0CMhYTZNLpYTLVFQ1el_ampQCyzOOKlcX8NGIEApVRMzQ7EmAPV-9e3HUJ2VC0hzOCl7AttqLhQQTSfz4gT-6P08Fr8wwVmVRAUGgmtkG0Iy3WFAF0yH0qpj1q38X"
            onError={(e) => {
              // Graceful fallback to styled SVG
              const target = e.currentTarget;
              target.style.display = 'none';
            }}
          />
          <div className="flex flex-col min-w-0">
            <span className="font-headline text-[13px] font-bold tracking-tight text-on-surface truncate leading-none">
              SyncLife
            </span>
            <span className="font-headline text-[18px] font-bold text-primary truncate leading-tight mt-0.5">
              {getSubTitle()}
            </span>
          </div>
        </div>

        {/* Status Indicators & Student Profile */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenStopwatch}
            title="Open High-Precision Stopwatch"
            className="w-8 h-8 rounded-full bg-surface-container-high/90 border border-outline-variant/40 flex items-center justify-center text-on-surface hover:bg-surface-container-highest transition active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">timer</span>
          </button>

          <button
            type="button"
            onClick={onOpenNotifications}
            title="Manage High Focus Browser Push Alerts"
            className="relative w-8 h-8 rounded-full bg-surface-container-high/90 border border-outline-variant/40 flex items-center justify-center text-on-surface hover:bg-surface-container-highest transition active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">notifications</span>
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary animate-pulse" />
          </button>

          {onOpenGemini && (
            <button
              type="button"
              onClick={onOpenGemini}
              title="Open SyncLife Gemini AI Multimodal Mentor"
              className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary hover:bg-primary/30 transition active:scale-95 cursor-pointer shadow-xs"
            >
              <span className="material-symbols-outlined text-[18px]">smart_toy</span>
            </button>
          )}

          <button
            onClick={onOpenProfile}
            title="View 14-day flow streak breakdown"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high/90 border border-outline-variant/40 shadow-xs hover:bg-surface-container-highest transition active:scale-95 cursor-pointer"
          >
            <span className="text-sm leading-none">🔥</span>
            <span className="font-label-time text-[12px] text-tertiary font-semibold tracking-wide">
              14d Flow
            </span>
          </button>

          <button
            aria-label="Student profile"
            onClick={onOpenProfile}
            className="relative p-0.5 rounded-full hover:opacity-90 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
          >
            <img
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover ring-1 ring-outline/30 shadow-xs"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAOMDQoUzDkq-JykuUms-GUFHQbp9_N95r7yHqspuzekkVhYdBNG6CLN2j-ncGvCWUD3qRNXObfTQAmtl71C_tUEjwCNlxXVydizzOQnoMGleKZi7UMZz3aMRuxj9wObeEhGg7w9e0WIhfm9LFRF_K_J4vw6bJeqUdefQY-NgoFOHhcQSoEqRAUMy7B3PELz5MWXEzZyetx25-qqxyfpYM5d10WtoTmACs6trCuITphwSNBJINd6nXX"
            />
          </button>
        </div>
      </div>
    </header>
  );
};
