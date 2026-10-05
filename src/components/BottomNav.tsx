import React from 'react';
import { TabType } from '../types';

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab }) => {
  const tabs: { id: TabType; label: string; icon: string; activeIconFill?: boolean }[] = [
    { id: 'today', label: 'Today', icon: 'more_time' },
    { id: 'schedule', label: 'Schedule', icon: 'auto_fix_high' },
    { id: 'exam-prep', label: 'Exam Prep', icon: 'target' },
    { id: 'balance', label: 'Balance', icon: 'spa' },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 pb-[env(safe-area-inset-bottom,0px)] bg-surface-container-lowest/90 backdrop-blur-xl border-t border-outline-variant/30 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      <div className="grid grid-cols-4 items-center h-18 px-2 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center justify-center min-h-[48px] py-1.5 px-1 rounded-xl transition-all duration-200 active:scale-95 group cursor-pointer ${
                isActive
                  ? 'bg-surface-container-highest text-primary font-bold shadow-[0_2px_12px_rgba(192,193,255,0.18)]'
                  : 'text-on-surface-variant/80 hover:text-on-surface'
              }`}
            >
              <div
                className={`flex items-center justify-center w-10 h-7 rounded-full mb-1 transition-all ${
                  isActive ? 'bg-secondary/20 text-secondary' : 'text-on-surface-variant'
                }`}
              >
                <span className="material-symbols-outlined text-[22px] transition-transform duration-200 group-hover:scale-105">
                  {tab.icon}
                </span>
              </div>
              <span className="font-label-badge text-[11px] tracking-wide font-semibold">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
