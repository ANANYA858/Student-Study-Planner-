import React, { useState, useEffect, useRef } from 'react';
import { TimeSlot } from '../types';
import { ambientAudio, SoundscapeType } from '../utils/audio';
import { SoundscapeSelector } from './SoundscapeSelector';

interface LapRecord {
  lapNumber: number;
  lapTimeMs: number;
  totalTimeMs: number;
  formattedLap: string;
  formattedTotal: string;
}

interface StopwatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  slots: TimeSlot[];
  onTriggerToast: (msg: string, badge?: string) => void;
  onLogCompletedFocus?: (minutes: number, taskTitle: string) => void;
}

export const StopwatchModal: React.FC<StopwatchModalProps> = ({
  isOpen,
  onClose,
  slots,
  onTriggerToast,
  onLogCompletedFocus,
}) => {
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<LapRecord[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string>(() => {
    const focusSlot = slots.find((s) => s.category === 'High Focus' || s.category === 'Academics');
    return focusSlot ? focusSlot.id : slots[0]?.id || 'custom';
  });
  const [currentSoundscape, setCurrentSoundscape] = useState<SoundscapeType>('rain');
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  const startTimeRef = useRef<number>(0);
  const accumulatedTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const lastLapTotalRef = useRef<number>(0);

  // Time formatter: MM:SS.cc or HH:MM:SS.cc
  const formatTime = (ms: number): { main: string; centiseconds: string } => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const centiseconds = Math.floor((ms % 1000) / 10);

    const pad = (n: number) => String(n).padStart(2, '0');

    const main =
      hours > 0
        ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
        : `${pad(minutes)}:${pad(seconds)}`;

    return {
      main,
      centiseconds: pad(centiseconds),
    };
  };

  // High precision animation frame loop for stopwatch
  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = performance.now();
      const tick = () => {
        const now = performance.now();
        const currentElapsed = accumulatedTimeRef.current + (now - startTimeRef.current);
        setElapsedMs(currentElapsed);
        animationFrameRef.current = requestAnimationFrame(tick);
      };
      animationFrameRef.current = requestAnimationFrame(tick);
    } else {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRunning]);

  // Clean audio on close
  useEffect(() => {
    if (!isOpen && isAudioPlaying) {
      ambientAudio.pause();
      setIsAudioPlaying(false);
    }
  }, [isOpen, isAudioPlaying]);

  if (!isOpen) return null;

  const handleToggleStart = () => {
    if (isRunning) {
      // Pause
      accumulatedTimeRef.current = elapsedMs;
      setIsRunning(false);
      onTriggerToast('Stopwatch paused', 'PAUSED');
    } else {
      // Start/Resume
      startTimeRef.current = performance.now();
      setIsRunning(true);
      onTriggerToast('Stopwatch focus tracking running ⏱️', 'STOPWATCH');
    }
  };

  const handleLap = () => {
    if (!isRunning && elapsedMs === 0) return;

    const currentTotal = elapsedMs;
    const lapTime = currentTotal - lastLapTotalRef.current;
    lastLapTotalRef.current = currentTotal;

    const lapNum = laps.length + 1;
    const { main: lapMain, centiseconds: lapCs } = formatTime(lapTime);
    const { main: totalMain, centiseconds: totalCs } = formatTime(currentTotal);

    const newLap: LapRecord = {
      lapNumber: lapNum,
      lapTimeMs: lapTime,
      totalTimeMs: currentTotal,
      formattedLap: `${lapMain}.${lapCs}`,
      formattedTotal: `${totalMain}.${totalCs}`,
    };

    setLaps((prev) => [newLap, ...prev]);
    onTriggerToast(`Lap ${lapNum} recorded: ${lapMain}.${lapCs}`, 'LAP');
  };

  const handleReset = () => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsRunning(false);
    accumulatedTimeRef.current = 0;
    lastLapTotalRef.current = 0;
    setElapsedMs(0);
    setLaps([]);
    onTriggerToast('Stopwatch reset to 00:00.00', 'RESET');
  };

  const handleSelectSoundscape = (type: SoundscapeType) => {
    setCurrentSoundscape(type);
    ambientAudio.play(type);
    setIsAudioPlaying(true);
    onTriggerToast(`Soundscape set to ${type}`, 'AUDIO');
  };

  const handleTogglePlay = () => {
    const nextState = ambientAudio.toggle(currentSoundscape);
    setIsAudioPlaying(nextState);
    onTriggerToast(nextState ? 'Soundscape active' : 'Soundscape muted', 'AUDIO');
  };

  const handleLogTimeToTask = () => {
    const totalMinutes = Math.max(1, Math.round(elapsedMs / 60000));
    const targetTask = slots.find((s) => s.id === selectedTaskId);
    const taskName = targetTask ? targetTask.title : 'Deep Focus Session';

    if (onLogCompletedFocus) {
      onLogCompletedFocus(totalMinutes, taskName);
    }

    onTriggerToast(
      `Logged ${totalMinutes}m of deep focus to "${taskName}"! 🏆`,
      'LOGGED'
    );
    handleReset();
    onClose();
  };

  const { main: timeMain, centiseconds: timeCs } = formatTime(elapsedMs);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-surface-container rounded-3xl w-full max-w-sm p-5 shadow-2xl border border-secondary/30 space-y-4 text-center relative overflow-hidden max-h-[92vh] overflow-y-auto no-scrollbar">
        {/* Ambient background glows */}
        <div className="absolute -top-10 -right-10 w-36 h-36 bg-secondary/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-primary/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary/15 text-secondary border border-secondary/30">
            <span
              className={`w-2 h-2 rounded-full bg-secondary ${
                isRunning ? 'animate-ping' : ''
              }`}
            />
            <span className="font-label-badge text-[10px] font-bold uppercase tracking-wider">
              High-Precision Stopwatch
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>

        {/* Target Task Selector */}
        <div className="bg-surface-container-low p-2.5 rounded-2xl border border-outline-variant/30 text-left space-y-1 relative z-10">
          <label className="font-label-badge text-[10px] uppercase font-bold text-on-surface-variant block">
            Target Focus Slot
          </label>
          <select
            value={selectedTaskId}
            onChange={(e) => setSelectedTaskId(e.target.value)}
            className="w-full bg-surface-container-highest border border-outline-variant/40 rounded-xl p-2 text-xs text-on-surface font-semibold focus:outline-none focus:ring-1 focus:ring-secondary cursor-pointer"
          >
            {slots.map((s) => (
              <option key={s.id} value={s.id}>
                {s.time} • {s.title} ({s.category})
              </option>
            ))}
          </select>
        </div>

        {/* Primary Monospace Stopwatch Display Card */}
        <div className="bg-surface-container-lowest/80 backdrop-blur-md rounded-2xl p-5 border border-outline-variant/30 relative z-10 shadow-inner flex flex-col items-center justify-center">
          <div className="flex items-baseline justify-center font-metric-display text-on-surface tracking-tight">
            <span className="text-4xl font-extrabold">{timeMain}</span>
            <span className="text-2xl font-bold text-secondary ml-1">
              .{timeCs}
            </span>
          </div>

          <span className="font-body text-[11px] text-on-surface-variant mt-1">
            {isRunning
              ? 'Focus timer running'
              : elapsedMs > 0
              ? 'Timing paused'
              : 'Ready to track'}
          </span>
        </div>

        {/* Primary Controls: Start / Pause / Lap / Reset */}
        <div className="grid grid-cols-3 gap-2 z-10 relative">
          {/* Start / Pause */}
          <button
            type="button"
            onClick={handleToggleStart}
            className={`py-2.5 px-2 rounded-xl font-headline text-xs font-bold shadow-md active:scale-95 transition flex items-center justify-center gap-1 cursor-pointer ${
              isRunning
                ? 'bg-amber-600 text-white hover:bg-amber-500'
                : 'bg-secondary text-on-secondary hover:bg-secondary/95'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">
              {isRunning ? 'pause' : 'play_arrow'}
            </span>
            <span>{isRunning ? 'Pause' : 'Start'}</span>
          </button>

          {/* Lap */}
          <button
            type="button"
            disabled={elapsedMs === 0}
            onClick={handleLap}
            className="py-2.5 px-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest disabled:opacity-40 text-on-surface border border-outline-variant/30 font-headline text-xs font-semibold active:scale-95 transition flex items-center justify-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">flag</span>
            <span>Lap</span>
          </button>

          {/* Reset */}
          <button
            type="button"
            disabled={elapsedMs === 0 && !isRunning}
            onClick={handleReset}
            className="py-2.5 px-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest disabled:opacity-40 text-on-surface border border-outline-variant/30 font-headline text-xs font-semibold active:scale-95 transition flex items-center justify-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">restart_alt</span>
            <span>Reset</span>
          </button>
        </div>

        {/* Soundscape Selector Integration */}
        <SoundscapeSelector
          currentSoundscape={currentSoundscape}
          isPlaying={isAudioPlaying}
          onSelectSoundscape={handleSelectSoundscape}
          onTogglePlay={handleTogglePlay}
        />

        {/* Log Time CTA */}
        {elapsedMs > 60000 && (
          <button
            type="button"
            onClick={handleLogTimeToTask}
            className="w-full py-2.5 rounded-xl bg-primary text-on-primary font-headline text-xs font-bold shadow-md hover:bg-primary/95 active:scale-98 transition flex items-center justify-center gap-1.5 cursor-pointer z-10 relative"
          >
            <span className="material-symbols-outlined text-[16px]">save</span>
            <span>
              Log {Math.round(elapsedMs / 60000)}m to Selected Task
            </span>
          </button>
        )}

        {/* Laps List */}
        {laps.length > 0 && (
          <div className="bg-surface-container-low rounded-2xl p-3 border border-outline-variant/30 space-y-1.5 text-left z-10 relative">
            <div className="flex items-center justify-between text-[11px] font-bold text-on-surface-variant pb-1 border-b border-outline-variant/30">
              <span>Lap</span>
              <span>Lap Split</span>
              <span>Total Elapsed</span>
            </div>

            <div className="max-h-36 overflow-y-auto space-y-1 no-scrollbar pt-0.5">
              {laps.map((lap) => (
                <div
                  key={lap.lapNumber}
                  className="flex items-center justify-between text-xs py-1 px-1.5 rounded-lg hover:bg-surface-container transition font-mono"
                >
                  <span className="font-bold text-secondary">
                    Lap {lap.lapNumber}
                  </span>
                  <span className="text-on-surface">+{lap.formattedLap}</span>
                  <span className="text-on-surface-variant">
                    {lap.formattedTotal}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
