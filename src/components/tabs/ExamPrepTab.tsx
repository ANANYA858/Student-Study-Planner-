import React, { useState, useEffect } from 'react';
import { ambientAudio } from '../../utils/audio';
import { PunchItem } from '../../types';
import { UpcomingExamsTracker } from '../UpcomingExamsTracker';

interface ExamPrepTabProps {
  onTriggerToast: (msg: string, badge?: string) => void;
}

export const ExamPrepTab: React.FC<ExamPrepTabProps> = ({ onTriggerToast }) => {
  const [activeTrack, setActiveTrack] = useState<'gov' | 'uni'>('gov');

  // Focus Timer State
  const [timerDuration, setTimerDuration] = useState<number>(50 * 60);
  const [secondsLeft, setSecondsLeft] = useState<number>(38 * 60 + 20);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);

  // Audio Ambient State
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);

  // Note Logger Drawer
  const [isLogSheetOpen, setIsLogSheetOpen] = useState<boolean>(false);
  const [logContent, setLogContent] = useState<string>('');

  // 10m Calisthenics Flow Modal
  const [isCalisthenicsOpen, setIsCalisthenicsOpen] = useState<boolean>(false);
  const [stretchSeconds, setStretchSeconds] = useState<number>(600);
  const [isStretchRunning, setIsStretchRunning] = useState<boolean>(false);

  // Punch list items
  const [punchList, setPunchList] = useState<PunchItem[]>([
    {
      id: '1',
      title: 'Indian Polity: Fundamental Rights Chapter 3',
      subtitle: 'Completed in 45m • 94% Retention',
      completed: true,
      metric: 'verified',
    },
    {
      id: '2',
      title: 'Mock Test Sectional: General Intelligence',
      subtitle: '03:30 PM - 04:30 PM • 50 Questions',
      completed: false,
      badge: 'High Yield',
    },
    {
      id: '3',
      title: 'Speed Math Flashcards: 25 Formulas',
      subtitle: '08:30 PM • Spaced Deck #4',
      completed: false,
      metric: 'sync',
    },
  ]);

  // Add Item Modal
  const [isAddPunchModalOpen, setIsAddPunchModalOpen] = useState(false);
  const [newPunchTitle, setNewPunchTitle] = useState('');
  const [newPunchSubtitle, setNewPunchSubtitle] = useState('');

  // Active Timer Interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            onTriggerToast('Deep Work sprint completed! Time for a breath.', 'BREAK TIME');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, secondsLeft, onTriggerToast]);

  // Calisthenics timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isStretchRunning && stretchSeconds > 0) {
      interval = setInterval(() => {
        setStretchSeconds((s) => s - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isStretchRunning, stretchSeconds]);

  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
    if (!isTimerRunning) {
      onTriggerToast('Deep Work Sprint resumed', 'IN FOCUS');
    } else {
      onTriggerToast('Sprint paused. Cognitive safeguard active.', 'PAUSED');
    }
  };

  const handleSetInterval = (mins: number) => {
    setTimerDuration(mins * 60);
    setSecondsLeft(mins * 60);
    setIsTimerRunning(true);
    onTriggerToast(`Timer configured to ${mins}m focus block`, 'MODE SET');
  };

  const handleToggleAudio = () => {
    const nextState = ambientAudio.toggle();
    setIsAudioPlaying(nextState);
    if (nextState) {
      onTriggerToast('Rainfall & White Noise playing', 'AUDIO ON');
    } else {
      onTriggerToast('Ambient audio paused', 'MUTED');
    }
  };

  const togglePunchItem = (id: string) => {
    setPunchList((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const handleAddPunchItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPunchTitle.trim()) return;

    setPunchList((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        title: newPunchTitle.trim(),
        subtitle: newPunchSubtitle.trim() || 'Next scheduled sectional block',
        completed: false,
        badge: 'Priority',
      },
    ]);

    setNewPunchTitle('');
    setNewPunchSubtitle('');
    setIsAddPunchModalOpen(false);
    onTriggerToast('Item added to today’s punch-list', 'PUNCHLIST');
  };

  // Timer Calculations
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  
  // Circumference for r=44 is ~276.46
  const circumference = 276.46;
  const strokeDashoffset = circumference - (secondsLeft / timerDuration) * circumference;

  const completedCount = punchList.filter((p) => p.completed).length;

  return (
    <div className="flex flex-col w-full px-4 pb-28 space-y-4 max-w-lg mx-auto">
      {/* Dynamic Upcoming Competitive Exams Tracker with Live Countdown Ticker */}
      <UpcomingExamsTracker onTriggerToast={onTriggerToast} />

      {/* Dual Track Tab Switcher */}
      <div className="flex rounded-2xl bg-surface-container-lowest p-1 shadow-inner border border-outline-variant/30">
        <button
          type="button"
          onClick={() => setActiveTrack('gov')}
          className={`flex-1 py-2 rounded-xl font-headline text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTrack === 'gov'
              ? 'bg-surface-container-highest text-primary shadow-xs border border-outline-variant/30'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">account_balance</span>
          <span>Gov Exam Track</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTrack('uni')}
          className={`flex-1 py-2 rounded-xl font-headline text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTrack === 'uni'
              ? 'bg-surface-container-highest text-secondary shadow-xs border border-outline-variant/30'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">school</span>
          <span>Semester Credits</span>
        </button>
      </div>

      {/* Deep-Work Focus Timer Widget */}
      <div className="rounded-2xl bg-surface-container p-4 shadow-md space-y-3.5 relative overflow-hidden border border-outline-variant/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
            </span>
            <span className="font-label-badge text-xs uppercase tracking-wider text-primary font-bold">
              Deep Work Sprint
            </span>
          </div>

          {/* Mode Toggle */}
          <div className="flex items-center bg-surface-container-low rounded-full p-0.5 border border-outline-variant/30">
            <button
              type="button"
              onClick={() => handleSetInterval(50)}
              className={`px-2.5 py-0.5 rounded-full font-label-time text-xs transition cursor-pointer ${
                timerDuration === 50 * 60
                  ? 'bg-primary text-on-primary font-bold shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              50/10m
            </button>
            <button
              type="button"
              onClick={() => handleSetInterval(25)}
              className={`px-2.5 py-0.5 rounded-full font-label-time text-xs transition cursor-pointer ${
                timerDuration === 25 * 60
                  ? 'bg-primary text-on-primary font-bold shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              25/5m
            </button>
          </div>
        </div>

        {/* Active Topic */}
        <div className="space-y-0.5">
          <h3 className="font-headline text-base font-bold text-on-surface truncate">
            {activeTrack === 'gov' ? 'Quantitative Aptitude' : 'Advanced Operating Systems'}
          </h3>
          <p className="font-body text-xs text-on-surface-variant truncate">
            {activeTrack === 'gov'
              ? 'Arithmetic & Data Interpretation • Section 2'
              : 'Kernel IPC & Memory Management Module'}
          </p>
        </div>

        {/* Circular Timer Centerpiece */}
        <div className="flex flex-col items-center justify-center py-1 relative">
          <div className="relative w-44 h-44 flex items-center justify-center">
            {/* Ambient radial halo */}
            <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl" />
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
              <circle
                className="text-surface-container-high"
                cx="50"
                cy="50"
                fill="none"
                r="44"
                stroke="currentColor"
                strokeWidth="5"
              />
              <circle
                className="text-primary transition-all duration-1000 ease-linear"
                cx="50"
                cy="50"
                fill="none"
                r="44"
                stroke="currentColor"
                strokeDasharray="276.46"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                strokeWidth="5.5"
              />
            </svg>
            <div className="absolute flex flex-col items-center text-center">
              <span className="font-metric-display text-3xl font-bold tracking-tight text-on-surface">
                {timeFormatted}
              </span>
              <span className="font-body text-xs text-on-surface-variant mt-0.5 font-medium">
                {isTimerRunning ? 'Focus Mode' : 'Paused'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Audio & Tools Strip */}
        <div className="flex items-center justify-between gap-2 bg-surface-container-low p-2 rounded-xl border border-outline-variant/30">
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className={`material-symbols-outlined text-[18px] shrink-0 ${
                isAudioPlaying ? 'text-secondary animate-pulse' : 'text-outline'
              }`}
            >
              air
            </span>
            <span className="font-label-badge text-xs text-on-surface font-semibold truncate">
              Rainfall & White Noise
            </span>
          </div>

          <button
            type="button"
            onClick={handleToggleAudio}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold active:scale-95 transition cursor-pointer border ${
              isAudioPlaying
                ? 'bg-secondary/20 border-secondary/40 text-secondary'
                : 'bg-surface-container-high border-outline-variant/40 text-on-surface'
            }`}
          >
            {isAudioPlaying ? 'Pause Ambient' : 'Play Ambient'}
          </button>
        </div>

        {/* Timer Control Actions */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={toggleTimer}
            className="flex items-center justify-center gap-1.5 h-12 rounded-xl bg-primary text-on-primary font-headline text-sm font-bold shadow-md active:scale-98 transition cursor-pointer hover:bg-primary/95"
          >
            <span
              className="material-symbols-outlined text-[20px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {isTimerRunning ? 'pause' : 'play_arrow'}
            </span>
            <span>{isTimerRunning ? 'Pause Session' : 'Resume Session'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsLogSheetOpen(true)}
            className="flex items-center justify-center gap-1.5 h-12 rounded-xl bg-surface-container-high text-on-surface font-headline text-sm font-semibold hover:bg-surface-container-highest border border-outline-variant/30 active:scale-98 transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">edit_note</span>
            <span>Log Notes</span>
          </button>
        </div>
      </div>

      {/* Anti-Burnout Vitality Alert */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-secondary-container/40 to-surface-container-high p-4 shadow-xs border border-secondary/30">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-secondary-container text-on-secondary-container shrink-0 mt-0.5">
            <span className="material-symbols-outlined text-[22px]">self_improvement</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="font-headline text-xs font-bold text-secondary">
                Circadian Balance Guard
              </span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-secondary" />
            </div>
            <p className="font-body text-xs text-on-surface leading-snug">
              You've studied <strong>2.5 hours</strong> straight. High tension detected! Dance
              rehearsal or Yoga is scheduled next to prevent cognitive drain.
            </p>
            <button
              type="button"
              onClick={() => {
                setIsCalisthenicsOpen(true);
                setIsStretchRunning(true);
              }}
              className="mt-2 text-secondary font-label-badge text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1 active:opacity-75 cursor-pointer hover:underline"
            >
              Start 10m Calisthenics Flow
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>

      {/* Syllabus Punch-List */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-headline text-base font-bold text-on-surface">
              Today's Punch-List
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-surface-container-high font-label-badge text-[11px] text-on-surface-variant font-bold border border-outline-variant/30">
              {completedCount}/{punchList.length} Done
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsAddPunchModalOpen(true)}
            className="text-primary font-body text-xs font-bold flex items-center gap-0.5 hover:underline cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">add</span> Add Item
          </button>
        </div>

        {/* Task List */}
        {punchList.map((item) => {
          return (
            <div
              key={item.id}
              onClick={() => togglePunchItem(item.id)}
              className={`flex items-center justify-between p-3.5 rounded-2xl border border-outline-variant/30 transition duration-200 cursor-pointer ${
                item.completed
                  ? 'bg-surface-container-low opacity-60'
                  : 'bg-surface-container hover:bg-surface-container-high shadow-xs'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <button
                  type="button"
                  className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition ${
                    item.completed
                      ? 'bg-secondary border-secondary text-white'
                      : 'bg-surface-container-highest border-outline-variant/40 text-transparent'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                </button>

                <div className="space-y-0.5 min-w-0">
                  <p
                    className={`font-body text-xs font-bold truncate ${
                      item.completed ? 'line-through text-on-surface-variant' : 'text-on-surface'
                    }`}
                  >
                    {item.title}
                  </p>
                  <p className="text-on-surface-variant font-label-time text-[11px]">
                    {item.subtitle}
                  </p>
                </div>
              </div>

              {item.badge && !item.completed && (
                <span className="px-2 py-0.5 rounded-full bg-tertiary-container/30 text-tertiary font-label-badge text-[10px] font-bold shrink-0">
                  {item.badge}
                </span>
              )}

              {item.completed && (
                <span className="material-symbols-outlined text-secondary text-[20px] shrink-0">
                  verified
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Collision-Free Revision Radar */}
      <div className="rounded-2xl bg-surface-container p-4 shadow-md space-y-3 border border-outline-variant/30">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="font-headline text-sm font-bold text-on-surface">
              Collision-Free Revision Radar
            </h3>
            <p className="font-body text-xs text-on-surface-variant">
              Preventing overlaps with University Mid-Terms
            </p>
          </div>
          <span className="material-symbols-outlined text-primary text-[24px]">radar</span>
        </div>

        {/* Mini Visual Timeline Map (7 days) */}
        <div className="grid grid-cols-7 gap-1 pt-1">
          <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-surface-container-low border border-outline-variant/20">
            <span className="font-label-badge text-[10px] text-on-surface-variant font-bold">M</span>
            <div className="w-2.5 h-7 rounded-full bg-secondary flex flex-col justify-end p-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>
            <span className="font-label-time text-[9px] text-on-surface font-bold">Done</span>
          </div>

          <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-surface-container-highest ring-1 ring-primary/40 border border-primary/20">
            <span className="font-label-badge text-[10px] text-primary font-bold">T</span>
            <div className="w-2.5 h-7 rounded-full bg-primary flex flex-col justify-end p-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>
            <span className="font-label-time text-[9px] text-primary font-bold">Today</span>
          </div>

          <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-surface-container-low border border-outline-variant/20">
            <span className="font-label-badge text-[10px] text-on-surface-variant font-bold">W</span>
            <div className="w-2.5 h-7 rounded-full bg-surface-variant" />
            <span className="font-label-time text-[9px] text-on-surface-variant">Uni Lab</span>
          </div>

          <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-surface-container-low border border-outline-variant/20">
            <span className="font-label-badge text-[10px] text-on-surface-variant font-bold">T</span>
            <div className="w-2.5 h-7 rounded-full bg-tertiary" />
            <span className="font-label-time text-[9px] text-tertiary font-bold">Revise</span>
          </div>

          <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-surface-container-low border border-outline-variant/20">
            <span className="font-label-badge text-[10px] text-on-surface-variant font-bold">F</span>
            <div className="w-2.5 h-7 rounded-full bg-surface-variant" />
            <span className="font-label-time text-[9px] text-on-surface-variant">Quiz</span>
          </div>

          <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-surface-container-low border border-outline-variant/20">
            <span className="font-label-badge text-[10px] text-on-surface-variant font-bold">S</span>
            <div className="w-2.5 h-7 rounded-full bg-primary-container" />
            <span className="font-label-time text-[9px] text-primary-container font-bold">Mock</span>
          </div>

          <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-surface-container-low border border-outline-variant/20">
            <span className="font-label-badge text-[10px] text-secondary font-bold">S</span>
            <div className="w-2.5 h-7 rounded-full bg-secondary" />
            <span className="font-label-time text-[9px] text-secondary font-bold">Reset</span>
          </div>
        </div>

        {/* Active Shield Advisory */}
        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-surface-container-high/80 border border-outline-variant/30">
          <span className="material-symbols-outlined text-secondary text-[20px] shrink-0">
            shield
          </span>
          <p className="font-body text-xs text-on-surface-variant leading-tight">
            <strong className="text-on-surface font-semibold">No Conflict Window:</strong> Thursday
            4 PM - 7 PM locked for Medieval History revision before Friday's University Internal
            Assessment.
          </p>
        </div>
      </div>

      {/* Retrospective Note Logger Sheet */}
      {isLogSheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-surface-container-high p-4 rounded-t-3xl shadow-2xl space-y-3 border-t border-outline-variant/40">
            <div className="w-12 h-1 bg-outline-variant rounded-full mx-auto" />
            <div className="flex items-center justify-between">
              <h4 className="font-headline text-base font-bold text-on-surface">
                Sprint Retrospective Note
              </h4>
              <button
                type="button"
                onClick={() => setIsLogSheetOpen(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <textarea
              rows={3}
              value={logContent}
              onChange={(e) => setLogContent(e.target.value)}
              className="w-full bg-surface-container-lowest rounded-xl p-3 text-on-surface font-body text-xs focus:outline-none focus:ring-1 focus:ring-primary resize-none border border-outline-variant/40"
              placeholder="Tricky formulas, shortcuts memorized, or speed bottlenecks..."
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsLogSheetOpen(false);
                  onTriggerToast('Retrospective logged to Spaced Flashcards', 'SYNCED');
                }}
                className="flex-1 py-2.5 rounded-xl bg-primary text-on-primary font-headline text-xs font-bold shadow-md cursor-pointer"
              >
                Save to Flashcards
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Calisthenics 10M Guided Flow Modal */}
      {isCalisthenicsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-container rounded-2xl w-full max-w-sm p-5 shadow-2xl border border-secondary/40 space-y-4 text-center">
            <div className="flex items-center justify-between">
              <span className="font-headline text-sm font-bold text-secondary">
                10-Minute Calisthenics & Posture Reset
              </span>
              <button
                onClick={() => {
                  setIsCalisthenicsOpen(false);
                  setIsStretchRunning(false);
                }}
                className="text-on-surface-variant p-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="w-24 h-24 mx-auto rounded-full bg-secondary/15 flex items-center justify-center text-3xl border border-secondary/30">
              🤸‍♀️
            </div>

            <div className="space-y-1">
              <span className="font-metric-display text-2xl font-bold text-on-surface block">
                {Math.floor(stretchSeconds / 60)}:{String(stretchSeconds % 60).padStart(2, '0')}
              </span>
              <span className="font-body text-xs text-on-surface-variant">
                Neck rolls, thoracic extensions, wrist flexor stretches & bodyweight squats.
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsStretchRunning(!isStretchRunning)}
                className="flex-1 py-2 bg-secondary text-on-secondary rounded-xl font-headline text-xs font-bold cursor-pointer"
              >
                {isStretchRunning ? 'Pause Flow' : 'Resume Flow'}
              </button>
              <button
                onClick={() => {
                  setIsCalisthenicsOpen(false);
                  setIsStretchRunning(false);
                  onTriggerToast('Calisthenics logged! Brain oxygenation reset 🌿', 'RESET');
                }}
                className="py-2 px-3 bg-surface-container-high text-on-surface rounded-xl font-headline text-xs font-bold cursor-pointer"
              >
                Complete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Punch Item Modal */}
      {isAddPunchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-container rounded-2xl w-full max-w-sm p-4 shadow-2xl border border-outline-variant/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-headline text-sm font-bold text-on-surface">
                Add Exam Focus Target
              </span>
              <button
                onClick={() => setIsAddPunchModalOpen(false)}
                className="text-on-surface-variant p-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleAddPunchItem} className="space-y-3">
              <div>
                <label className="block font-label-badge text-xs uppercase tracking-wider text-on-surface-variant mb-1 font-semibold">
                  Subject / Mock Test
                </label>
                <input
                  type="text"
                  required
                  value={newPunchTitle}
                  onChange={(e) => setNewPunchTitle(e.target.value)}
                  placeholder="e.g. Modern Indian History Speed Quiz"
                  className="w-full bg-surface-container-lowest border border-outline-variant/40 px-3 py-2 rounded-xl text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block font-label-badge text-xs uppercase tracking-wider text-on-surface-variant mb-1 font-semibold">
                  Timing / Target
                </label>
                <input
                  type="text"
                  value={newPunchSubtitle}
                  onChange={(e) => setNewPunchSubtitle(e.target.value)}
                  placeholder="e.g. 05:00 PM • 30 Questions"
                  className="w-full bg-surface-container-lowest border border-outline-variant/40 px-3 py-2 rounded-xl text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddPunchModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-surface-container-high text-on-surface text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-primary text-on-primary rounded-xl text-xs font-bold cursor-pointer"
                >
                  Add to Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
