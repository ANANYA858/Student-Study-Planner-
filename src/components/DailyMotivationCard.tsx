import React, { useState, useEffect } from 'react';

export interface MotivationalQuote {
  id: number;
  quote: string;
  author: string;
  source: string;
  category: string;
  categoryEmoji: string;
  microChallenge: string;
}

export const MOTIVATION_QUOTES: MotivationalQuote[] = [
  {
    id: 1,
    quote: 'You have power over your mind — not outside events. Realize this, and you will find unshakeable strength.',
    author: 'Marcus Aurelius',
    source: 'Meditations',
    category: 'Stoic Focus',
    categoryEmoji: '🏛️',
    microChallenge: 'Today: Ignore what you cannot control; own your next 25-minute study sprint.',
  },
  {
    id: 2,
    quote: 'Arise, awake, and stop not until the goal is reached.',
    author: 'Swami Vivekananda',
    source: 'Call to the Youth',
    category: 'Relentless Grit',
    categoryEmoji: '🔥',
    microChallenge: 'Today: Push through that one tough algorithm problem before taking a break.',
  },
  {
    id: 3,
    quote: 'Dream is not that which you see while sleeping, it is something that does not let you sleep.',
    author: 'Dr. A.P.J. Abdul Kalam',
    source: 'Wings of Fire',
    category: 'Purpose & Vision',
    categoryEmoji: '🚀',
    microChallenge: 'Today: Write down why you started your exam prep and put it where you can see it.',
  },
  {
    id: 4,
    quote: 'You do not rise to the level of your goals. You fall to the level of your systems.',
    author: 'James Clear',
    source: 'Atomic Habits',
    category: 'Habit Power',
    categoryEmoji: '⚡',
    microChallenge: 'Today: Complete your high-focus block at the exact scheduled circadian crest.',
  },
  {
    id: 5,
    quote: 'Nothing in life is to be feared, it is only to be understood. Now is the time to understand more, so that we may fear less.',
    author: 'Marie Curie',
    source: 'Nobel Reflections',
    category: 'Intellectual Bravery',
    categoryEmoji: '🔬',
    microChallenge: 'Today: Tackle the chapter or mock test you have been avoiding.',
  },
  {
    id: 6,
    quote: 'A calm mind is the ultimate weapon against your challenges. So relax, breathe, and begin.',
    author: 'Seneca',
    source: 'Letters from a Stoic',
    category: 'Inner Peace',
    categoryEmoji: '🌿',
    microChallenge: 'Today: Take 3 deep box breaths before opening your notes or test papers.',
  },
  {
    id: 7,
    quote: 'Energy is finite; focus is the multiplier. Guard your attention with ruthless intent.',
    author: 'Naval Ravikant',
    source: 'Almanack of Naval',
    category: 'Cognitive Leverage',
    categoryEmoji: '🧠',
    microChallenge: 'Today: Put your phone in another room during your 25m Pomodoro sprint.',
  },
];

interface DailyMotivationCardProps {
  onTriggerToast: (msg: string, badge?: string) => void;
}

export const DailyMotivationCard: React.FC<DailyMotivationCardProps> = ({
  onTriggerToast,
}) => {
  // Deterministic daily quote index based on calendar day
  const getTodayIndex = () => {
    const dayOfMonth = new Date().getDate();
    return dayOfMonth % MOTIVATION_QUOTES.length;
  };

  const [currentIndex, setCurrentIndex] = useState<number>(getTodayIndex);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [showChallenge, setShowChallenge] = useState<boolean>(false);

  const currentQuote = MOTIVATION_QUOTES[currentIndex];

  // Check if liked in localStorage
  useEffect(() => {
    const savedLikes = localStorage.getItem('synclife_liked_quotes');
    if (savedLikes) {
      try {
        const likedIds = JSON.parse(savedLikes);
        setIsLiked(likedIds.includes(currentQuote.id));
      } catch {
        setIsLiked(false);
      }
    } else {
      setIsLiked(false);
    }
  }, [currentIndex, currentQuote.id]);

  const handleShuffle = () => {
    const nextIndex = (currentIndex + 1) % MOTIVATION_QUOTES.length;
    setCurrentIndex(nextIndex);
    onTriggerToast('Fresh Daily Motivation sparked! ✨', 'MOTIVATION');
  };

  const handleToggleLike = () => {
    const nextState = !isLiked;
    setIsLiked(nextState);

    const savedLikes = localStorage.getItem('synclife_liked_quotes');
    let likedIds: number[] = [];
    if (savedLikes) {
      try {
        likedIds = JSON.parse(savedLikes);
      } catch {
        likedIds = [];
      }
    }

    if (nextState) {
      likedIds.push(currentQuote.id);
      onTriggerToast('Quote saved to your personal reflections! ❤️', 'FAVORITED');
    } else {
      likedIds = likedIds.filter((id) => id !== currentQuote.id);
      onTriggerToast('Quote removed from saved reflections', 'REMOVED');
    }

    localStorage.setItem('synclife_liked_quotes', JSON.stringify(likedIds));
  };

  const handleCopyQuote = () => {
    const text = `"${currentQuote.quote}" — ${currentQuote.author} (${currentQuote.source})`;
    navigator.clipboard?.writeText(text);
    onTriggerToast('Quote copied to clipboard! 📋', 'COPIED');
  };

  const handlePlayChime = () => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Soothing inspiring dual bell (E5 -> B5 harmonic chime)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, now); // E5

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(987.77, now + 0.1); // B5

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.exponentialRampToValueAtTime(0.18, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now + 0.08);
      osc1.stop(now + 1.2);
      osc2.stop(now + 1.2);

      onTriggerToast('Mindset grounded. Ready for peak focus 🧘', 'IN HARMONY');
    } catch {
      // fallback
    }
  };

  return (
    <section className="bg-gradient-to-br from-surface-container-high via-surface-container to-surface-container-high rounded-2xl p-4 border border-outline-variant/30 shadow-md relative overflow-hidden space-y-3">
      {/* Decorative ambient glowing accents */}
      <div className="absolute -right-8 -top-8 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -left-8 -bottom-8 w-28 h-28 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

      {/* Top Header Badge & Action Tools */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
          <span className="text-xs">{currentQuote.categoryEmoji}</span>
          <span className="font-label-badge text-[10px] font-bold uppercase tracking-wider">
            Daily Motivation • {currentQuote.category}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Audio Chime Bell */}
          <button
            type="button"
            onClick={handlePlayChime}
            title="Grounding Focus Bell"
            className="w-7 h-7 rounded-full bg-surface-container-lowest/80 text-on-surface-variant hover:text-on-surface flex items-center justify-center transition active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px]">notifications</span>
          </button>

          {/* Copy Quote Button */}
          <button
            type="button"
            onClick={handleCopyQuote}
            title="Copy Quote"
            className="w-7 h-7 rounded-full bg-surface-container-lowest/80 text-on-surface-variant hover:text-on-surface flex items-center justify-center transition active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px]">content_copy</span>
          </button>

          {/* Favorite Like Button */}
          <button
            type="button"
            onClick={handleToggleLike}
            title={isLiked ? 'Favorited' : 'Save to favorites'}
            className={`w-7 h-7 rounded-full bg-surface-container-lowest/80 flex items-center justify-center transition active:scale-95 cursor-pointer ${
              isLiked ? 'text-red-400' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span
              className="material-symbols-outlined text-[16px]"
              style={isLiked ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              favorite
            </span>
          </button>

          {/* Shuffle / Next Quote Button */}
          <button
            type="button"
            onClick={handleShuffle}
            title="Spark Another Motivation"
            className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 flex items-center justify-center transition active:scale-95 cursor-pointer ml-0.5"
          >
            <span className="material-symbols-outlined text-[15px]">refresh</span>
          </button>
        </div>
      </div>

      {/* Quote Block with Typography */}
      <div className="relative z-10 pt-0.5">
        <blockquote className="font-headline text-[13px] md:text-sm font-semibold text-on-surface leading-snug tracking-normal italic pl-3 border-l-2 border-amber-400/70">
          "{currentQuote.quote}"
        </blockquote>

        <div className="flex items-center justify-between pt-2 pl-3">
          <div className="flex items-baseline gap-1.5 text-xs">
            <span className="font-headline font-bold text-on-surface">
              {currentQuote.author}
            </span>
            <span className="text-[11px] text-on-surface-variant italic truncate max-w-[160px]">
              • {currentQuote.source}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowChallenge(!showChallenge)}
            className="text-[10px] font-label-badge uppercase font-bold text-amber-300 hover:text-amber-200 flex items-center gap-0.5 cursor-pointer"
          >
            <span>{showChallenge ? 'Hide Action' : "Today's Action"}</span>
            <span className="material-symbols-outlined text-[13px]">
              {showChallenge ? 'expand_less' : 'expand_more'}
            </span>
          </button>
        </div>
      </div>

      {/* Actionable Micro-Challenge */}
      {showChallenge && (
        <div className="p-2.5 rounded-xl bg-surface-container-lowest/80 border border-amber-500/20 text-xs space-y-1 animate-in fade-in duration-200">
          <div className="flex items-center gap-1 text-amber-300 font-bold text-[11px]">
            <span className="material-symbols-outlined text-[14px]">flag</span>
            <span>Micro Action</span>
          </div>
          <p className="font-body text-[11px] text-on-surface-variant leading-relaxed">
            {currentQuote.microChallenge}
          </p>
        </div>
      )}
    </section>
  );
};
