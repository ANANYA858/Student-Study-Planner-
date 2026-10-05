import React, { useState } from 'react';
import { TimeSlot } from '../types';

export interface AchievementBadge {
  id: string;
  title: string;
  icon: string;
  emoji: string;
  description: string;
  requirement: string;
  unlocked: boolean;
  category: 'focus' | 'consistency' | 'balance' | 'circadian';
  unlockedAt?: string;
}

interface BadgesSectionProps {
  slots: TimeSlot[];
  consecutiveDays: number;
  onTriggerToast: (msg: string, badge?: string) => void;
}

export const BadgesSection: React.FC<BadgesSectionProps> = ({
  slots,
  consecutiveDays,
  onTriggerToast,
}) => {
  const [selectedBadge, setSelectedBadge] = useState<AchievementBadge | null>(null);

  // Evaluate dynamic unlocks based on task completion patterns:
  const completedSlots = slots.filter((s) => s.completed);

  // 1. Early Bird: Completed an early morning task scheduled before 08:30 AM
  const isEarlyBird = completedSlots.some(
    (s) =>
      s.time.startsWith('06:') ||
      s.time.startsWith('07:') ||
      s.time.startsWith('08:0') ||
      s.time.startsWith('08:1') ||
      s.title.toLowerCase().includes('wake') ||
      s.title.toLowerCase().includes('sunrise')
  );

  // 2. Deep Work Master: Completed High Focus or Academic deep work block
  const isDeepWorkMaster = completedSlots.some(
    (s) => s.category === 'High Focus' || s.category === 'Academics'
  );

  // 3. Consistent Achiever: 7+ day flow streak or >= 3 tasks checked off today
  const isConsistentAchiever = consecutiveDays >= 7 || completedSlots.length >= 3;

  // 4. Equilibrium Sage: Completed both focus study AND restorative wellness tasks
  const hasFocusTask = completedSlots.some((s) =>
    ['Academics', 'High Focus', 'Review'].includes(s.category)
  );
  const hasRestTask = completedSlots.some((s) =>
    [
      'Wellness',
      'Nutrition & Move',
      'Hobby & Passion',
      'Free Time',
      'Family',
      'Nutrition',
      'Rest',
    ].includes(s.category)
  );
  const isEquilibriumSage = hasFocusTask && hasRestTask;

  // 5. Circadian Defender: Honored morning hydration or physical wellness routines
  const isCircadianDefender = completedSlots.some(
    (s) =>
      s.category === 'Wellness' ||
      s.category === 'Nutrition & Move' ||
      s.category === 'Nutrition'
  );

  // 6. Night Owl Shutdown: Completed evening wind-down, family time, or guilt-free session
  const isNightShutdown = completedSlots.some(
    (s) =>
      s.category === 'Rest' ||
      s.category === 'Free Time' ||
      s.category === 'Family' ||
      s.time.startsWith('20:') ||
      s.time.startsWith('21:') ||
      s.time.startsWith('22:')
  );

  const badges: AchievementBadge[] = [
    {
      id: 'early-bird',
      title: 'Early Bird',
      icon: 'wb_twilight',
      emoji: '🌅',
      description: 'Awakened with the sun and completed early morning hydration/routine.',
      requirement: 'Check off a task scheduled before 8:30 AM',
      unlocked: isEarlyBird,
      category: 'circadian',
      unlockedAt: isEarlyBird ? '06:30 AM' : undefined,
    },
    {
      id: 'deep-work-master',
      title: 'Deep Work Master',
      icon: 'psychology',
      emoji: '⚡',
      description: 'Conquered rigorous cognitive tension in Gov Exam Prep or Academics.',
      requirement: 'Complete an "Academics" or "High Focus" task block',
      unlocked: isDeepWorkMaster,
      category: 'focus',
      unlockedAt: isDeepWorkMaster ? 'Today' : undefined,
    },
    {
      id: 'consistent-achiever',
      title: 'Consistent Achiever',
      icon: 'military_tech',
      emoji: '🏆',
      description: 'Unbroken daily rhythm maintaining a 7+ day streak or 3+ completed tasks.',
      requirement: 'Reach a 7-day flow streak or complete 3+ tasks today',
      unlocked: isConsistentAchiever,
      category: 'consistency',
      unlockedAt: isConsistentAchiever ? `${consecutiveDays}d Streak` : undefined,
    },
    {
      id: 'equilibrium-sage',
      title: 'Equilibrium Sage',
      icon: 'spa',
      emoji: '🌿',
      description: 'Mastered harmony between high-intensity study and restorative vitality.',
      requirement: 'Check off at least 1 Focus task and 1 Wellness/Rest task',
      unlocked: isEquilibriumSage,
      category: 'balance',
      unlockedAt: isEquilibriumSage ? 'Balanced' : undefined,
    },
    {
      id: 'circadian-defender',
      title: 'Circadian Defender',
      icon: 'shield_heart',
      emoji: '🛡️',
      description: 'Nourished biological energy with nutrition, yoga, or physical movement.',
      requirement: 'Complete a Wellness or Nutrition routine',
      unlocked: isCircadianDefender,
      category: 'circadian',
      unlockedAt: isCircadianDefender ? 'Active' : undefined,
    },
    {
      id: 'night-shutdown',
      title: 'Sunset Wind-Down',
      icon: 'bedtime',
      emoji: '🌙',
      description: 'Protected recovery boundaries with evening downtime & family rituals.',
      requirement: 'Complete an evening Rest, Free Time, or Family session',
      unlocked: isNightShutdown,
      category: 'balance',
      unlockedAt: isNightShutdown ? 'Restored' : undefined,
    },
  ];

  const unlockedCount = badges.filter((b) => b.unlocked).length;
  const progressPercent = Math.round((unlockedCount / badges.length) * 100);

  const handleBadgeClick = (badge: AchievementBadge) => {
    setSelectedBadge(badge);
    if (badge.unlocked) {
      onTriggerToast(`🏆 ${badge.title} Unlocked! ${badge.description}`, 'ACHIEVEMENT');
    } else {
      onTriggerToast(`🔒 Locked: ${badge.requirement}`, 'REQUIREMENT');
    }
  };

  return (
    <div className="bg-surface-container-low rounded-2xl p-4 border border-outline-variant/30 space-y-3 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary text-[22px]">
            workspace_premium
          </span>
          <div>
            <h4 className="font-headline text-sm font-bold text-on-surface leading-tight">
              Visual Achievements
            </h4>
            <p className="font-body text-[11px] text-on-surface-variant">
              Unlocked by real task completion patterns
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary/15 border border-secondary/30">
          <span className="font-metric-display text-xs font-bold text-secondary">
            {unlockedCount}/{badges.length}
          </span>
          <span className="font-label-badge text-[10px] uppercase font-bold text-secondary">
            Unlocked
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden p-0.5 border border-outline-variant/20">
          <div
            className="h-full bg-gradient-to-r from-secondary to-primary rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-on-surface-variant font-medium">
          <span>Mastery Progress</span>
          <span>{progressPercent}% Complete</span>
        </div>
      </div>

      {/* Badges Grid (3 columns) */}
      <div className="grid grid-cols-3 gap-2 pt-1">
        {badges.map((badge) => {
          const isSelected = selectedBadge?.id === badge.id;
          return (
            <button
              key={badge.id}
              type="button"
              onClick={() => handleBadgeClick(badge)}
              className={`p-2.5 rounded-xl flex flex-col items-center justify-center text-center transition-all active:scale-95 cursor-pointer relative border ${
                badge.unlocked
                  ? isSelected
                    ? 'bg-secondary/20 border-secondary ring-1 ring-secondary shadow-md'
                    : 'bg-surface-container border-secondary/40 shadow-xs hover:border-secondary/70'
                  : 'bg-surface-container-lowest/60 border-outline-variant/30 opacity-60 hover:opacity-80'
              }`}
            >
              {/* Status Indicator Dot */}
              <span
                className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${
                  badge.unlocked ? 'bg-secondary' : 'bg-outline-variant'
                }`}
              />

              {/* Icon / Emblem */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center mb-1.5 transition-transform ${
                  badge.unlocked
                    ? 'bg-gradient-to-br from-secondary/30 to-primary/20 text-on-surface shadow-xs'
                    : 'bg-surface-container-highest text-outline'
                }`}
              >
                {badge.unlocked ? (
                  <span className="text-xl leading-none">{badge.emoji}</span>
                ) : (
                  <span className="material-symbols-outlined text-[18px]">lock</span>
                )}
              </div>

              {/* Title */}
              <span
                className={`font-headline text-[11px] font-bold leading-tight truncate w-full ${
                  badge.unlocked ? 'text-on-surface' : 'text-on-surface-variant'
                }`}
              >
                {badge.title}
              </span>

              {/* Badge State Label */}
              <span
                className={`font-label-badge text-[9px] mt-0.5 truncate font-semibold uppercase ${
                  badge.unlocked ? 'text-secondary font-bold' : 'text-outline'
                }`}
              >
                {badge.unlocked ? 'Unlocked' : 'Locked'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Badge Details Card */}
      {selectedBadge && (
        <div className="p-3 rounded-xl bg-surface-container border border-outline-variant/30 space-y-1.5 text-xs animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-base">{selectedBadge.emoji}</span>
              <span className="font-headline font-bold text-on-surface">
                {selectedBadge.title}
              </span>
            </div>
            <span
              className={`font-label-badge text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                selectedBadge.unlocked
                  ? 'bg-secondary/20 text-secondary'
                  : 'bg-surface-container-highest text-outline'
              }`}
            >
              {selectedBadge.unlocked ? 'Unlocked 🏆' : 'Locked 🔒'}
            </span>
          </div>

          <p className="font-body text-[11px] text-on-surface-variant leading-relaxed">
            {selectedBadge.description}
          </p>

          <div className="pt-1 border-t border-outline-variant/20 flex items-center justify-between text-[10px]">
            <span className="text-on-surface-variant">Requirement:</span>
            <span className="text-primary font-semibold truncate max-w-[200px]">
              {selectedBadge.requirement}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
