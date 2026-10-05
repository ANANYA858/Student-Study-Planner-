import React, { useState, useEffect } from 'react';
import { TimeSlot } from '../../types';
import { PomodoroTimerModal } from '../PomodoroTimerModal';
import { DailyMotivationCard } from '../DailyMotivationCard';

interface TodayTabProps {
  slots: TimeSlot[];
  onToggleSlot: (id: string) => void;
  onOpenAddModal: () => void;
  onTriggerToast: (msg: string, badge?: string) => void;
}

export const TodayTab: React.FC<TodayTabProps> = ({
  slots,
  onToggleSlot,
  onOpenAddModal,
  onTriggerToast,
}) => {
  const [selectedDay, setSelectedDay] = useState<string>('TODAY');
  const [activeTaskDone, setActiveTaskDone] = useState(false);
  const [remainingMinutes, setRemainingMinutes] = useState(32);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedPomodoroTask, setSelectedPomodoroTask] = useState<TimeSlot | null>(null);
  const [taskNote, setTaskNote] = useState(
    'Red-black tree balancing rules, AVL tree rotation edge cases review.'
  );

  // Live countdown timer for active task
  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingMinutes((prev) => (prev > 1 ? prev - 1 : 45));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Dynamic progress calculation based on slots state
  const totalTasks = slots.length;
  const completedTasks = slots.filter((s) => s.completed).length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const getStatusLabel = () => {
    if (completionPercentage === 100) return 'Complete';
    if (completionPercentage >= 75) return 'On Track';
    if (completionPercentage >= 40) return 'In Flow';
    return 'Starting';
  };

  const days = [
    { day: 'SAT', date: '12', key: 'sat' },
    { day: 'SUN', date: '13', key: 'sun' },
    { day: 'TODAY', date: '14 OCT', key: 'TODAY', isToday: true },
    { day: 'TUE', date: '15', key: 'tue' },
    { day: 'WED', date: '16', key: 'wed' },
    { day: 'THU', date: '17', key: 'thu' },
  ];

  const lectureSlot = slots.find((s) => s.id === '4');
  const isCurrentTaskDone = lectureSlot ? lectureSlot.completed : activeTaskDone;

  const handleCompleteActive = () => {
    if (lectureSlot) {
      onToggleSlot('4');
    } else {
      setActiveTaskDone(!activeTaskDone);
      if (!activeTaskDone) {
        onTriggerToast('Marked "Advanced Data Structures" as done! 🎓', 'COMPLETED');
      }
    }
  };

  const handleExtend = () => {
    setRemainingMinutes((prev) => prev + 15);
    onTriggerToast('+15m buffer allocated to lecture session', 'EXTENDED');
  };

  return (
    <div className="flex flex-col w-full px-4 pb-28 space-y-4 max-w-lg mx-auto">
      {/* Day Switcher & Circadian Metric Strip */}
      <section className="flex flex-col gap-2 pt-2">
        {/* Day selector horizontal ribbon */}
        <div className="flex items-center justify-between gap-1.5 overflow-x-auto no-scrollbar py-1">
          {days.map((item) => {
            const isSelected = selectedDay === item.key;
            if (item.isToday) {
              return (
                <button
                  key={item.key}
                  onClick={() => setSelectedDay(item.key)}
                  className={`flex flex-col items-center justify-center min-w-[58px] py-2 px-2 rounded-2xl transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-primary text-on-primary shadow-md shadow-primary/30 scale-105 font-bold'
                      : 'bg-surface-container-high text-on-surface'
                  }`}
                >
                  <span className="font-label-badge text-[10px] tracking-wider uppercase font-bold">
                    TODAY
                  </span>
                  <span className="font-label-time text-xs font-bold whitespace-nowrap">
                    14 OCT
                  </span>
                </button>
              );
            }

            return (
              <button
                key={item.key}
                onClick={() => setSelectedDay(item.key)}
                className={`flex flex-col items-center justify-center min-w-[46px] py-2 px-1 rounded-xl transition-all active:scale-95 cursor-pointer border ${
                  isSelected
                    ? 'bg-surface-container-highest border-primary/50 text-primary font-bold shadow-xs'
                    : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="font-label-badge text-[10px] text-outline font-semibold">
                  {item.day}
                </span>
                <span className="font-label-time text-xs font-semibold">
                  {item.date}
                </span>
              </button>
            );
          })}
        </div>

        {/* Circadian State & Adherence Row */}
        <div className="grid grid-cols-12 gap-2.5 items-center">
          {/* Peak Energy Zone Pill */}
          <div className="col-span-8 flex items-center gap-2 bg-surface-container-high px-3 py-2.5 rounded-2xl shadow-xs border border-outline-variant/30">
            <span className="text-tertiary text-base animate-pulse">⚡</span>
            <div className="flex flex-col min-w-0">
              <span className="font-label-badge text-[10px] text-tertiary uppercase tracking-wider font-bold">
                Peak Focus Zone
              </span>
              <span className="font-label-time text-xs text-on-surface truncate font-semibold">
                10:00 - 13:00 (Circadian Crest)
              </span>
            </div>
          </div>

          {/* Circular Adherence Progress Card (Dynamically tied to slots completion) */}
          <div
            onClick={() =>
              onTriggerToast(
                `${completedTasks} of ${totalTasks} tasks completed (${completionPercentage}% flow adherence)`,
                'FLOW'
              )
            }
            title="Click to view daily task flow status"
            className="col-span-4 flex items-center justify-center gap-2 bg-surface-container-high px-2 py-2 rounded-2xl shadow-xs border border-outline-variant/30 cursor-pointer hover:bg-surface-container-highest transition-all duration-200 active:scale-95 group"
          >
            <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 36 36">
                <path
                  className="text-surface-container-highest"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                />
                <path
                  className={`${
                    completionPercentage === 100
                      ? 'text-secondary'
                      : completionPercentage > 0
                      ? 'text-secondary'
                      : 'text-outline/40'
                  } transition-all duration-700 ease-out`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray={`${completionPercentage}, 100`}
                  strokeLinecap="round"
                  strokeWidth="3.5"
                />
              </svg>
              <span className="absolute font-metric-display text-[10px] text-on-surface font-bold">
                {completionPercentage}%
              </span>
            </div>
            <div className="flex flex-col min-w-0 leading-tight">
              <span className="font-label-badge text-[10px] text-secondary font-bold uppercase tracking-wider truncate">
                {getStatusLabel()}
              </span>
              <span className="font-body text-[11px] text-on-surface-variant truncate font-medium">
                {completedTasks}/{totalTasks} Tasks
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Daily Motivation Spark */}
      <DailyMotivationCard onTriggerToast={onTriggerToast} />

      {/* Active Task Hero Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-surface-container-high p-4 shadow-lg border border-primary/20">
        {/* Ambient glowing backdrop gradient */}
        <div className="absolute -right-12 -top-12 w-40 h-40 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary" />

        <div className="flex flex-col space-y-2.5 relative z-10 pl-1">
          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/15 text-primary">
              <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
              <span className="font-label-badge text-[11px] font-bold uppercase tracking-wider">
                Happening Now
              </span>
            </div>

            <div className="inline-flex items-center gap-1 font-label-time text-xs text-on-surface bg-surface-container-lowest/80 px-2.5 py-0.5 rounded-lg border border-outline-variant/30">
              <span className="material-symbols-outlined text-[15px] text-primary">timer</span>
              <span>{remainingMinutes}m remaining</span>
            </div>
          </div>

          <div>
            <h2
              className={`font-headline text-lg text-on-surface font-bold tracking-tight transition ${
                isCurrentTaskDone ? 'line-through text-on-surface-variant' : ''
              }`}
            >
              Advanced Data Structures
            </h2>
            <div className="flex items-center gap-2 mt-0.5 text-on-surface-variant">
              <span className="font-label-time text-xs text-on-surface font-semibold">
                10:15 - 11:45 AM
              </span>
              <span>•</span>
              <span className="font-body text-xs flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[15px] text-outline">location_on</span>
                Hall B, Turing Block
              </span>
            </div>
          </div>

          {/* Quick Action Controls */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              onClick={handleCompleteActive}
              className={`flex items-center justify-center gap-1 py-2 px-2 rounded-xl font-headline text-xs font-semibold active:scale-95 transition-all shadow-xs cursor-pointer ${
                isCurrentTaskDone
                  ? 'bg-secondary-container text-on-secondary-container'
                  : 'bg-secondary text-on-secondary'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {isCurrentTaskDone ? 'check_box' : 'check_circle'}
              </span>
              <span className="truncate">{isCurrentTaskDone ? 'Done' : 'Mark Done'}</span>
            </button>

            <button
              onClick={handleExtend}
              className="flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-surface-container-highest text-on-surface font-headline text-xs font-semibold hover:bg-surface-container border border-outline-variant/30 active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">add_alarm</span>
              <span className="truncate">+15m</span>
            </button>

            <button
              onClick={() => setShowNotesModal(true)}
              className="flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-surface-container-highest text-primary font-headline text-xs font-semibold hover:bg-surface-container border border-outline-variant/30 active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">edit_note</span>
              <span className="truncate">Notes</span>
            </button>
          </div>
        </div>
      </section>

      {/* Next Up Quick Glance Card */}
      <section className="flex items-center justify-between bg-surface-container p-3.5 rounded-2xl shadow-xs border border-outline-variant/30">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-tertiary-container/30 flex items-center justify-center text-xl shrink-0">
            🥗
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-label-badge text-[10px] text-tertiary font-bold tracking-wider uppercase">
                Next Up
              </span>
              <span className="font-label-time text-xs text-outline font-semibold">
                12:00 PM
              </span>
            </div>
            <span className="font-headline text-xs text-on-surface font-bold truncate">
              Mindful Lunch & Hydration
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end shrink-0 pl-2">
          <span className="inline-flex items-center gap-1 font-label-badge text-[11px] text-secondary bg-secondary/15 px-2 py-0.5 rounded-full font-bold">
            <span className="material-symbols-outlined text-[13px]">coffee</span>
            15m Rest
          </span>
          <span className="font-body text-[10px] text-on-surface-variant mt-0.5">
            Refuel window
          </span>
        </div>
      </section>

      {/* 24-Hour Master Timeline Stream Header & Inline Quick Add */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]">
            calendar_view_day
          </span>
          <h3 className="font-headline text-base text-on-surface font-bold">
            24h Schedule Flow
          </h3>
        </div>
        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/15 text-primary text-xs font-bold active:scale-95 transition-transform hover:bg-primary/25 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          <span>Add Slot</span>
        </button>
      </div>

      {/* Interactive Timeline Stream List */}
      <div className="flex flex-col space-y-2 relative">
        {/* Visual vertical guide track */}
        <div className="absolute left-6 top-3 bottom-4 w-0.5 bg-surface-container-highest/60 -z-0" />

        {slots.map((slot) => {
          const isDone = slot.completed;

          return (
            <div
              key={slot.id}
              onClick={() => onToggleSlot(slot.id)}
              className={`flex items-start gap-2.5 relative z-10 transition-all cursor-pointer ${
                isDone ? 'opacity-70 hover:opacity-100' : 'hover:scale-[1.01]'
              }`}
            >
              {/* Time Column */}
              <div className="w-12 pt-2.5 shrink-0 flex flex-col items-end">
                <span
                  className={`font-label-time text-[11px] leading-none ${
                    slot.category === 'Academics'
                      ? 'text-primary font-bold'
                      : slot.category === 'High Focus'
                      ? 'text-primary-container font-bold'
                      : 'text-outline'
                  }`}
                >
                  {slot.time}
                </span>
                {slot.duration && (
                  <span className="font-label-time text-[10px] text-outline/70 mt-1">
                    {slot.duration}
                  </span>
                )}
              </div>

              {/* Status Circle Node */}
              <div
                className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 mt-3 transition-all ${
                  isDone
                    ? 'bg-secondary text-white shadow-[0_0_8px_rgba(78,222,163,0.4)]'
                    : slot.category === 'Academics'
                    ? 'bg-primary ring-4 ring-primary/20'
                    : slot.category === 'High Focus'
                    ? 'bg-primary-container shadow-[0_0_8px_rgba(128,131,255,0.5)]'
                    : 'bg-surface-variant'
                }`}
              >
                {isDone && (
                  <span className="material-symbols-outlined text-[10px] font-black">
                    check
                  </span>
                )}
              </div>

              {/* Card Container */}
              <div
                className={`flex-1 min-w-0 p-3 rounded-xl border border-outline-variant/30 transition-all ${
                  isDone
                    ? 'bg-surface-container-low'
                    : slot.category === 'Academics' || slot.category === 'High Focus'
                    ? 'bg-surface-container-high shadow-xs'
                    : 'bg-surface-container'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span
                    className={`font-headline text-xs font-bold truncate ${
                      isDone ? 'line-through text-on-surface-variant' : 'text-on-surface'
                    }`}
                  >
                    {slot.title}
                  </span>

                  {slot.badge && (
                    <span
                      className={`font-label-badge text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                        isDone
                          ? 'bg-secondary/15 text-secondary'
                          : slot.category === 'Academics'
                          ? 'bg-primary/20 text-primary'
                          : slot.category === 'High Focus'
                          ? 'bg-tertiary/20 text-tertiary'
                          : slot.category === 'Family'
                          ? 'bg-error-container/40 text-error'
                          : 'bg-surface-container-highest text-on-surface-variant'
                      }`}
                    >
                      {slot.badge}
                    </span>
                  )}
                </div>

                <p className="font-body text-[11px] text-on-surface-variant truncate">
                  {slot.subtitle}
                </p>

                {/* Micro info if currently active */}
                {slot.tag && !isDone && (
                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-outline-variant/20">
                    <span className="font-label-time text-[10px] text-primary font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      {slot.tag}
                    </span>
                  </div>
                )}

                {/* Integrated Pomodoro Action for High Focus Tasks */}
                {slot.category === 'High Focus' && (
                  <div className="mt-2.5 pt-2 border-t border-outline-variant/20 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPomodoroTask(slot);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-on-primary text-xs font-bold active:scale-95 transition shadow-xs hover:bg-primary/95 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">timer</span>
                      <span>{isDone ? 'Restart 25m Pomodoro' : 'Start 25m Pomodoro'}</span>
                    </button>
                    <span className="font-label-time text-[10px] text-tertiary font-bold">
                      25/5m Focus
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Integrated 25-Minute Pomodoro Focus Session Modal */}
      <PomodoroTimerModal
        isOpen={Boolean(selectedPomodoroTask)}
        task={selectedPomodoroTask}
        onClose={() => setSelectedPomodoroTask(null)}
        onCompleteTask={(taskId) => {
          const taskToComplete = slots.find((s) => s.id === taskId);
          if (taskToComplete && !taskToComplete.completed) {
            onToggleSlot(taskId);
          }
        }}
        onTriggerToast={onTriggerToast}
      />

      {/* Lecture Notes Modal */}
      {showNotesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-container rounded-2xl w-full max-w-sm p-4 shadow-2xl border border-outline-variant/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-headline text-sm font-bold text-on-surface">
                Lecture Quick Scratchpad
              </span>
              <button
                onClick={() => setShowNotesModal(false)}
                className="text-on-surface-variant p-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <textarea
              rows={4}
              value={taskNote}
              onChange={(e) => setTaskNote(e.target.value)}
              placeholder="Jot key questions, algorithm complexities, or lab reminders..."
              className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-2.5 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
            <button
              onClick={() => {
                setShowNotesModal(false);
                onTriggerToast('Notes auto-synced to Academic Archive', 'SAVED');
              }}
              className="w-full py-2 bg-primary text-on-primary rounded-xl font-headline text-xs font-bold cursor-pointer"
            >
              Save Scratchpad
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
