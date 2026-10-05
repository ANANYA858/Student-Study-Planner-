import React, { useState, useEffect } from 'react';
import { TimeSlot } from '../types';
import { ambientAudio, SoundscapeType } from '../utils/audio';
import { SoundscapeSelector } from './SoundscapeSelector';

export interface FocusSessionRecord {
  id: string;
  taskTitle: string;
  durationMinutes: number;
  timeFormatted: string;
  timestamp: string;
  soundscape: SoundscapeType;
}

const DEFAULT_SESSION_HISTORY: FocusSessionRecord[] = [
  {
    id: 's1',
    taskTitle: 'Gov Exam Prep: Quantitative Aptitude',
    durationMinutes: 25,
    timeFormatted: '25m',
    timestamp: '11:30 AM',
    soundscape: 'rain',
  },
  {
    id: 's2',
    taskTitle: 'Distributed Systems & Lab Review',
    durationMinutes: 30,
    timeFormatted: '30m',
    timestamp: '10:00 AM',
    soundscape: 'cafe',
  },
  {
    id: 's3',
    taskTitle: 'SSC CGL Mock: Reasoning Sprint',
    durationMinutes: 25,
    timeFormatted: '25m',
    timestamp: 'Yesterday',
    soundscape: 'binaural',
  },
  {
    id: 's4',
    taskTitle: 'Red-Black Trees Algorithm Analysis',
    durationMinutes: 25,
    timeFormatted: '25m',
    timestamp: 'Yesterday',
    soundscape: 'rain',
  },
];

interface PomodoroTimerModalProps {
  isOpen: boolean;
  task: TimeSlot | null;
  onClose: () => void;
  onCompleteTask: (taskId: string) => void;
  onTriggerToast: (msg: string, badge?: string) => void;
  onSwitchToStopwatch?: () => void;
}

export const PomodoroTimerModal: React.FC<PomodoroTimerModalProps> = ({
  isOpen,
  task,
  onClose,
  onCompleteTask,
  onTriggerToast,
  onSwitchToStopwatch,
}) => {
  const initialDuration = 25 * 60; // 25 minutes
  const [totalSeconds, setTotalSeconds] = useState(initialDuration);
  const [secondsLeft, setSecondsLeft] = useState(initialDuration);
  const [isRunning, setIsRunning] = useState(false);
  const [currentSoundscape, setCurrentSoundscape] = useState<SoundscapeType>('rain');
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [showHistory, setShowHistory] = useState(true);

  // Stored Session History (Last 5 completed sessions)
  const [sessionHistory, setSessionHistory] = useState<FocusSessionRecord[]>(() => {
    const saved = localStorage.getItem('synclife_pomodoro_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_SESSION_HISTORY;
      }
    }
    return DEFAULT_SESSION_HISTORY;
  });

  useEffect(() => {
    localStorage.setItem('synclife_pomodoro_history', JSON.stringify(sessionHistory));
  }, [sessionHistory]);

  // When a new task is opened, reset to 25m and auto-start
  useEffect(() => {
    if (isOpen) {
      setTotalSeconds(initialDuration);
      setSecondsLeft(initialDuration);
      setIsRunning(true);
    } else {
      setIsRunning(false);
      if (ambientAudio.isPlaying()) {
        ambientAudio.pause();
        setIsAudioPlaying(false);
      }
    }
  }, [isOpen, task]);

  const recordSession = (durationMins: number) => {
    if (!task) return;
    const newRecord: FocusSessionRecord = {
      id: String(Date.now()),
      taskTitle: task.title,
      durationMinutes: durationMins,
      timeFormatted: `${durationMins}m`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      soundscape: currentSoundscape,
    };
    setSessionHistory((prev) => [newRecord, ...prev].slice(0, 5));
  };

  // Timer interval countdown
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            const durationMins = Math.round(totalSeconds / 60);
            recordSession(durationMins);
            if (task) {
              onTriggerToast(
                `🎉 ${durationMins}m Pomodoro session completed for ${task.title}!`,
                'POMODORO DONE'
              );
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, secondsLeft, task, totalSeconds, onTriggerToast]);

  if (!isOpen || !task) return null;

  const toggleRunning = () => {
    const nextState = !isRunning;
    setIsRunning(nextState);
    if (nextState) {
      onTriggerToast(`Pomodoro focus sprint resumed: ${task.title}`, 'FOCUSING');
    } else {
      onTriggerToast('Pomodoro session paused', 'PAUSED');
    }
  };

  const handleReset = () => {
    setSecondsLeft(totalSeconds);
    setIsRunning(false);
    onTriggerToast('Timer reset to 25:00', 'RESET');
  };

  const handleAdd5Minutes = () => {
    setSecondsLeft((prev) => prev + 300);
    setTotalSeconds((prev) => prev + 300);
    onTriggerToast('+5 minutes added to sprint', 'EXTENDED');
  };

  const handleSelectSoundscape = (type: SoundscapeType) => {
    setCurrentSoundscape(type);
    ambientAudio.play(type);
    setIsAudioPlaying(true);
    const soundName =
      type === 'rain'
        ? 'Rain'
        : type === 'cafe'
        ? 'Cafe White Noise'
        : 'Deep Binaural Beats';
    onTriggerToast(`Soundscape: ${soundName} playing 🎧`, 'SOUNDSCAPE');
  };

  const handleTogglePlay = () => {
    const nextState = ambientAudio.toggle(currentSoundscape);
    setIsAudioPlaying(nextState);
    const soundName =
      currentSoundscape === 'rain'
        ? 'Rain'
        : currentSoundscape === 'cafe'
        ? 'Cafe White Noise'
        : 'Deep Binaural Beats';
    onTriggerToast(
      nextState ? `Playing ${soundName}` : 'Soundscape muted',
      nextState ? 'AUDIO ON' : 'MUTED'
    );
  };

  const handleCompleteAndClose = () => {
    if (ambientAudio.isPlaying()) {
      ambientAudio.pause();
      setIsAudioPlaying(false);
    }

    // Record session duration
    const elapsedMinutes = Math.max(1, Math.round((totalSeconds - secondsLeft) / 60));
    const loggedMins = elapsedMinutes >= 20 ? Math.round(totalSeconds / 60) : elapsedMinutes;
    recordSession(loggedMins);

    onCompleteTask(task.id);
    onTriggerToast(`Task marked complete: ${task.title}! (${loggedMins}m logged) 🏆`, 'COMPLETED');
    onClose();
  };

  const handleClose = () => {
    if (ambientAudio.isPlaying()) {
      ambientAudio.pause();
      setIsAudioPlaying(false);
    }
    onClose();
  };

  // SVG circular calculation
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const circumference = 2 * Math.PI * 46; // ~289
  const strokeDashoffset = circumference - (secondsLeft / totalSeconds) * circumference;

  const totalHistoryMinutes = sessionHistory.reduce((acc, s) => acc + s.durationMinutes, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-surface-container rounded-3xl w-full max-w-sm p-5 shadow-2xl border border-primary/30 space-y-4 text-center relative overflow-hidden max-h-[92vh] overflow-y-auto no-scrollbar">
        {/* Ambient radial blur glow */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-secondary/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30">
            <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
            <span className="font-label-badge text-[10px] font-bold uppercase tracking-wider">
              25m Pomodoro Sprint
            </span>
          </div>

          <div className="flex items-center gap-1">
            {onSwitchToStopwatch && (
              <button
                type="button"
                onClick={() => {
                  handleClose();
                  onSwitchToStopwatch();
                }}
                className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg bg-secondary/15 text-secondary hover:bg-secondary/25 border border-secondary/30 transition active:scale-95 cursor-pointer"
                title="Switch to open count-up stopwatch"
              >
                <span className="material-symbols-outlined text-[13px]">timer</span>
                <span>Stopwatch</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleAdd5Minutes}
              className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-container-highest border border-outline-variant/30 transition active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[13px]">add_alarm</span>
              <span>+5m</span>
            </button>
            <button
              onClick={handleClose}
              className="w-7 h-7 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface transition cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        </div>

        {/* Task Info */}
        <div className="space-y-1 relative z-10 text-left bg-surface-container-low p-2.5 rounded-2xl border border-outline-variant/30">
          <div className="flex items-center justify-between">
            <span className="font-label-badge text-[10px] px-2 py-0.5 rounded-full bg-tertiary/20 text-tertiary font-bold">
              {task.badge || 'High Focus'}
            </span>
            <span className="font-label-time text-[11px] text-on-surface-variant">
              {task.time} ({task.duration || '25m'})
            </span>
          </div>
          <h3 className="font-headline text-sm font-bold text-on-surface truncate">
            {task.title}
          </h3>
          <p className="font-body text-xs text-on-surface-variant line-clamp-1">
            {task.subtitle}
          </p>
        </div>

        {/* Visual Circular Countdown */}
        <div className="flex flex-col items-center justify-center relative py-1 z-10">
          <div className="relative w-44 h-44 flex items-center justify-center">
            {/* Ambient ring glow */}
            <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl" />

            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 110 110">
              <circle
                className="text-surface-container-highest"
                cx="55"
                cy="55"
                fill="none"
                r="46"
                stroke="currentColor"
                strokeWidth="5"
              />
              <circle
                className="text-primary transition-all duration-1000 ease-linear"
                cx="55"
                cy="55"
                fill="none"
                r="46"
                stroke="currentColor"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                strokeWidth="6"
              />
            </svg>

            <div className="absolute flex flex-col items-center justify-center">
              <span className="font-metric-display text-4xl font-bold tracking-tight text-on-surface">
                {timeFormatted}
              </span>
              <span className="font-body text-[11px] text-on-surface-variant font-medium mt-0.5">
                {isRunning ? 'Deep Focus Active' : secondsLeft === 0 ? 'Sprint Finished' : 'Paused'}
              </span>
            </div>
          </div>
        </div>

        {/* Soundscape Selector Component */}
        <SoundscapeSelector
          currentSoundscape={currentSoundscape}
          isPlaying={isAudioPlaying}
          onSelectSoundscape={handleSelectSoundscape}
          onTogglePlay={handleTogglePlay}
        />

        {/* Action Controls: Start / Pause / Reset */}
        <div className="grid grid-cols-2 gap-2 z-10 relative">
          <button
            type="button"
            onClick={toggleRunning}
            className={`flex items-center justify-center gap-1.5 h-11 rounded-xl font-headline text-xs font-bold shadow-md active:scale-98 transition cursor-pointer ${
              isRunning
                ? 'bg-surface-container-highest text-on-surface border border-outline-variant/40 hover:bg-surface-container'
                : 'bg-primary text-on-primary hover:bg-primary/95'
            }`}
          >
            <span
              className="material-symbols-outlined text-[18px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {isRunning ? 'pause' : 'play_arrow'}
            </span>
            <span>{isRunning ? 'Pause' : 'Start Focus'}</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="flex items-center justify-center gap-1 h-11 rounded-xl bg-surface-container-high text-on-surface font-headline text-xs font-semibold hover:bg-surface-container-highest border border-outline-variant/30 active:scale-98 transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">restart_alt</span>
            <span>Reset 25m</span>
          </button>
        </div>

        {/* Mark Task as Done CTA */}
        <button
          type="button"
          onClick={handleCompleteAndClose}
          className="w-full py-2.5 rounded-xl bg-secondary text-on-secondary font-headline text-xs font-bold shadow-sm hover:opacity-95 active:scale-98 transition flex items-center justify-center gap-1.5 cursor-pointer z-10 relative"
        >
          <span className="material-symbols-outlined text-[16px]">check_circle</span>
          <span>Complete Task & End Session</span>
        </button>

        {/* Session History List (Last 5 Completed Focus Sessions) */}
        <div className="bg-surface-container-low rounded-2xl p-3 border border-outline-variant/30 space-y-2 text-left z-10 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-[17px]">history</span>
              <h4 className="font-headline text-xs font-bold text-on-surface">
                Session History
              </h4>
              <span className="font-label-time text-[10px] text-on-surface-variant font-medium">
                (Last {sessionHistory.length})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-metric-display text-[11px] font-bold text-secondary">
                {totalHistoryMinutes}m total
              </span>
              <button
                type="button"
                onClick={() => setShowHistory((prev) => !prev)}
                className="text-on-surface-variant hover:text-on-surface p-0.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {showHistory ? 'expand_less' : 'expand_more'}
                </span>
              </button>
            </div>
          </div>

          {showHistory && (
            <div className="space-y-1.5 pt-1">
              {sessionHistory.length === 0 ? (
                <p className="font-body text-[11px] text-on-surface-variant text-center py-2">
                  No completed sessions yet. Start your first sprint!
                </p>
              ) : (
                sessionHistory.map((item, idx) => {
                  const soundIcon =
                    item.soundscape === 'rain'
                      ? '🌧️'
                      : item.soundscape === 'cafe'
                      ? '☕'
                      : '🧘';

                  return (
                    <div
                      key={item.id || idx}
                      className="flex items-center justify-between p-2 rounded-xl bg-surface-container border border-outline-variant/20 hover:border-primary/30 transition-all text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <div className="w-6 h-6 rounded-lg bg-secondary/15 text-secondary flex items-center justify-center shrink-0 text-xs">
                          <span className="material-symbols-outlined text-[14px]">
                            check_circle
                          </span>
                        </div>
                        <div className="min-w-0">
                          <span className="font-headline text-[11px] font-semibold text-on-surface truncate block">
                            {item.taskTitle}
                          </span>
                          <span className="font-label-time text-[10px] text-on-surface-variant flex items-center gap-1">
                            <span>{item.timestamp}</span>
                            <span>·</span>
                            <span>{soundIcon}</span>
                          </span>
                        </div>
                      </div>

                      {/* Duration Badge */}
                      <span className="font-metric-display text-xs font-bold px-2 py-0.5 rounded-lg bg-surface-container-highest text-primary border border-outline-variant/30 shrink-0">
                        {item.timeFormatted}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
