import React from 'react';
import {
  SoundscapeType,
  SOUNDSCAPE_OPTIONS,
  ambientAudio,
} from '../utils/audio';

interface SoundscapeSelectorProps {
  currentSoundscape: SoundscapeType;
  isPlaying: boolean;
  onSelectSoundscape: (type: SoundscapeType) => void;
  onTogglePlay: () => void;
}

export const SoundscapeSelector: React.FC<SoundscapeSelectorProps> = ({
  currentSoundscape,
  isPlaying,
  onSelectSoundscape,
  onTogglePlay,
}) => {
  return (
    <div className="w-full bg-surface-container-low rounded-2xl p-3 border border-outline-variant/30 space-y-2 text-left z-10 relative">
      {/* Header with Master Audio Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span
            className={`material-symbols-outlined text-[18px] ${
              isPlaying ? 'text-secondary animate-pulse' : 'text-outline'
            }`}
          >
            headphones
          </span>
          <span className="font-label-badge text-xs uppercase tracking-wider font-bold text-on-surface">
            Soundscape Selector
          </span>
        </div>

        <button
          type="button"
          onClick={onTogglePlay}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold active:scale-95 transition-all cursor-pointer border ${
            isPlaying
              ? 'bg-secondary/20 border-secondary/40 text-secondary font-bold'
              : 'bg-surface-container-highest border-outline-variant/40 text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[15px]">
            {isPlaying ? 'volume_up' : 'volume_off'}
          </span>
          <span>{isPlaying ? 'Playing' : 'Muted'}</span>
        </button>
      </div>

      {/* 3 Soundscape Options Selector Pill Grid */}
      <div className="grid grid-cols-3 gap-1.5">
        {SOUNDSCAPE_OPTIONS.map((opt) => {
          const isCurrent = currentSoundscape === opt.id;
          const isActivelyEmitting = isCurrent && isPlaying;

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelectSoundscape(opt.id)}
              className={`p-2 rounded-xl flex flex-col items-center justify-center text-center transition-all active:scale-95 cursor-pointer border ${
                isCurrent
                  ? isActivelyEmitting
                    ? 'bg-secondary/20 border-secondary/50 shadow-xs'
                    : 'bg-surface-container-highest border-primary/40 shadow-xs'
                  : 'bg-surface-container-lowest border-outline-variant/20 hover:bg-surface-container-high'
              }`}
            >
              <div className="flex items-center gap-1">
                <span className="text-base">{opt.emoji}</span>
                {isActivelyEmitting && (
                  <span className="flex items-end gap-0.5 h-3">
                    <span className="w-0.5 h-2 bg-secondary animate-pulse" />
                    <span className="w-0.5 h-3 bg-secondary animate-ping" />
                    <span className="w-0.5 h-1.5 bg-secondary animate-pulse" />
                  </span>
                )}
              </div>

              <span
                className={`font-headline text-[11px] font-bold mt-1 leading-tight truncate w-full ${
                  isCurrent ? 'text-on-surface' : 'text-on-surface-variant'
                }`}
              >
                {opt.name}
              </span>

              <span
                className={`font-label-badge text-[9px] mt-0.5 truncate w-full ${
                  isCurrent ? 'text-secondary font-bold' : 'text-outline'
                }`}
              >
                {opt.tag}
              </span>
            </button>
          );
        })}
      </div>

      {/* Micro Status / Sound Description */}
      <div className="flex items-center justify-between text-[11px] text-on-surface-variant pt-0.5">
        <span className="truncate italic">
          {
            SOUNDSCAPE_OPTIONS.find((s) => s.id === currentSoundscape)?.desc ||
            'Audio synthesis engine ready'
          }
        </span>
        {isPlaying && (
          <span className="font-label-badge text-[10px] text-secondary font-bold shrink-0 ml-1">
            Pure Synthesis
          </span>
        )}
      </div>
    </div>
  );
};
