import React, { useState } from 'react';
import { WellbeingItem } from '../../types';

interface ScheduleTabProps {
  onTriggerToast: (msg: string, badge?: string) => void;
  onApplyToSchedule: () => void;
}

export const ScheduleTab: React.FC<ScheduleTabProps> = ({
  onTriggerToast,
  onApplyToSchedule,
}) => {
  // Step 2: Exam Window toggle ('late' | 'early')
  const [examWindow, setExamWindow] = useState<'late' | 'early'>('late');

  // Step 3: Wellbeing Anchors
  const [wellbeingItems, setWellbeingItems] = useState<WellbeingItem[]>([
    { id: '1', emoji: '🧘‍♀️', title: 'Morning Yoga', duration: '45m', selected: true },
    { id: '2', emoji: '💃', title: 'Evening Dance', duration: '60m', selected: true },
    { id: '3', emoji: '📞', title: 'Family Call', duration: '30m', selected: true },
    { id: '4', emoji: '🏃', title: 'Sunset Jog', duration: '30m', selected: false },
    { id: '5', emoji: '🎸', title: 'Guitar Jam', duration: '40m', selected: false },
  ]);

  // Step 4: Chronotype ('lark' | 'owl')
  const [chronotype, setChronotype] = useState<'lark' | 'owl'>('lark');

  // Schedule Applied toggle
  const [applied, setApplied] = useState(true);

  // Less stress mode active
  const [lessStressActive, setLessStressActive] = useState(false);

  // Active donut slice highlight
  const [activeSlice, setActiveSlice] = useState<string | null>(null);

  const toggleWellbeing = (id: string) => {
    setWellbeingItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const handleGenerate = () => {
    onTriggerToast('Routine locked without burnout! 🌿', '24H SYNCED');
    onApplyToSchedule();
  };

  const handleRegenerateLessStress = () => {
    setLessStressActive(!lessStressActive);
    if (!lessStressActive) {
      onTriggerToast('Calibrated: -30m study, +30m restorative nature walk', 'DE-STRESSED');
    } else {
      onTriggerToast('Reset to standard double-focus balance', 'DEFAULT');
    }
  };

  // Dynamic hours calculation
  const sleepHours = 7.5;
  const uniHours = 5.5;
  const examHours = lessStressActive ? 2.5 : 3.0;
  const wellnessHours = lessStressActive ? 2.0 : 1.5;
  const socialHours = 2.5;
  const bufferHours = 2.0;
  const allocatedTotal = sleepHours + uniHours + examHours + wellnessHours + socialHours;

  return (
    <div className="flex flex-col w-full px-4 pb-28 space-y-4 max-w-lg mx-auto">
      {/* Circadian Header & Context Chip */}
      <div className="flex flex-col space-y-1.5 pt-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary/15 text-secondary font-label-badge text-[11px] uppercase tracking-wider font-bold">
            <span className="material-symbols-outlined text-[14px]">auto_mode</span>
            Circadian Sync Active
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-time text-[11px]">
            Beta 2.4
          </span>
        </div>

        <div className="flex items-baseline justify-between">
          <h2 className="font-headline text-xl font-bold text-on-surface">
            AI Day Balancer
          </h2>
          <span className="font-label-time text-xs text-primary font-bold">
            24h Budget
          </span>
        </div>
        <p className="font-body text-xs text-on-surface-variant leading-relaxed">
          Optimized for Double-Focus (University + SSC CGL). Smart buffer ensures
          zero-paralysis flow.
        </p>
      </div>

      {/* Hero Visual: Day Allocation Circular Rhythm Card */}
      <div className="bg-surface-container rounded-2xl p-4 shadow-md relative overflow-hidden flex flex-col gap-3 border border-outline-variant/30">
        {/* Ambient aura background */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary-container/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between z-10">
          <div>
            <span className="font-label-badge text-[10px] text-on-surface-variant uppercase tracking-wider block font-semibold">
              Balance Harmony Index
            </span>
            <span className="font-headline text-2xl font-bold text-on-surface flex items-center gap-1.5">
              {lessStressActive ? '98%' : '96%'}
              <span
                className="material-symbols-outlined text-secondary text-[20px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                verified
              </span>
            </span>
          </div>
          <div className="text-right">
            <span className="font-label-time text-xs text-secondary font-bold block">
              {allocatedTotal.toFixed(1)}h Allocated
            </span>
            <span className="font-body text-xs text-tertiary">
              {bufferHours.toFixed(1)}h Buffer Guard
            </span>
          </div>
        </div>

        {/* Segmented Donut & Metric Readout */}
        <div className="grid grid-cols-12 gap-3 items-center z-10 py-1">
          <div className="col-span-5 flex items-center justify-center relative">
            {/* SVG Donut Chart for 24h Rhythm */}
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
              {/* Background Track */}
              <circle
                className="text-surface-container-high"
                cx="50"
                cy="50"
                fill="transparent"
                r="38"
                stroke="currentColor"
                strokeWidth="11"
              />
              {/* Sleep: 7.5h (31.25%) */}
              <circle
                className={`transition-all duration-300 cursor-pointer ${
                  activeSlice === 'sleep' ? 'opacity-100 stroke-[13]' : 'opacity-90'
                }`}
                cx="50"
                cy="50"
                fill="transparent"
                r="38"
                stroke="#727481"
                strokeDasharray="74.6 238.8"
                strokeDashoffset="0"
                strokeWidth="11"
                onMouseEnter={() => setActiveSlice('sleep')}
                onMouseLeave={() => setActiveSlice(null)}
              />
              {/* Uni Lectures: 5.5h (22.9%) */}
              <circle
                className={`transition-all duration-300 cursor-pointer ${
                  activeSlice === 'uni' ? 'opacity-100 stroke-[13]' : 'opacity-90'
                }`}
                cx="50"
                cy="50"
                fill="transparent"
                r="38"
                stroke="#595b68"
                strokeDasharray="54.7 238.8"
                strokeDashoffset="-74.6"
                strokeWidth="11"
                onMouseEnter={() => setActiveSlice('uni')}
                onMouseLeave={() => setActiveSlice(null)}
              />
              {/* Exam Prep: 3.0h (12.5%) */}
              <circle
                className={`transition-all duration-300 cursor-pointer ${
                  activeSlice === 'exam' ? 'opacity-100 stroke-[13]' : 'opacity-90'
                }`}
                cx="50"
                cy="50"
                fill="transparent"
                r="38"
                stroke="#5d5c59"
                strokeDasharray="29.8 238.8"
                strokeDashoffset="-129.3"
                strokeWidth="11"
                onMouseEnter={() => setActiveSlice('exam')}
                onMouseLeave={() => setActiveSlice(null)}
              />
              {/* Wellness/Fitness: 1.5h (6.25%) */}
              <circle
                className={`transition-all duration-300 cursor-pointer ${
                  activeSlice === 'wellness' ? 'opacity-100 stroke-[13]' : 'opacity-90'
                }`}
                cx="50"
                cy="50"
                fill="transparent"
                r="38"
                stroke="#56615d"
                strokeDasharray="14.9 238.8"
                strokeDashoffset="-159.1"
                strokeWidth="11"
                onMouseEnter={() => setActiveSlice('wellness')}
                onMouseLeave={() => setActiveSlice(null)}
              />
              {/* Chill/Social: 2.5h (10.4%) */}
              <circle
                className={`transition-all duration-300 cursor-pointer ${
                  activeSlice === 'social' ? 'opacity-100 stroke-[13]' : 'opacity-90'
                }`}
                cx="50"
                cy="50"
                fill="transparent"
                r="38"
                stroke="#5b5e6a"
                strokeDasharray="24.8 238.8"
                strokeDashoffset="-174.0"
                strokeWidth="11"
                onMouseEnter={() => setActiveSlice('social')}
                onMouseLeave={() => setActiveSlice(null)}
              />
              {/* Free Buffer: 2.0h (8.3%) */}
              <circle
                className="opacity-60 cursor-pointer"
                cx="50"
                cy="50"
                fill="transparent"
                r="38"
                stroke="#c7c4d7"
                strokeDasharray="4 6"
                strokeDashoffset="-218.7"
                strokeWidth="11"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="font-metric-display text-lg font-bold text-on-surface">
                24h
              </span>
              <span className="font-label-badge text-[9px] text-secondary font-bold tracking-wider">
                ZERO CRUSH
              </span>
            </div>
          </div>

          {/* Compact Legend Grid */}
          <div className="col-span-7 flex flex-col space-y-1.5 min-w-0">
            <div
              className={`flex items-center justify-between text-xs p-1 rounded transition ${
                activeSlice === 'sleep' ? 'bg-surface-container-high' : ''
              }`}
            >
              <span className="flex items-center gap-1.5 truncate">
                <span className="w-2.5 h-2.5 rounded-full bg-[#727481] shrink-0" />
                <span className="text-on-surface-variant font-body truncate">Sleep Rest</span>
              </span>
              <span className="font-metric-display text-xs text-on-surface font-semibold">
                {sleepHours}h
              </span>
            </div>

            <div
              className={`flex items-center justify-between text-xs p-1 rounded transition ${
                activeSlice === 'uni' ? 'bg-surface-container-high' : ''
              }`}
            >
              <span className="flex items-center gap-1.5 truncate">
                <span className="w-2.5 h-2.5 rounded-full bg-[#595b68] shrink-0" />
                <span className="text-on-surface-variant font-body truncate">Uni Lectures</span>
              </span>
              <span className="font-metric-display text-xs text-on-surface font-semibold">
                {uniHours}h
              </span>
            </div>

            <div
              className={`flex items-center justify-between text-xs p-1 rounded transition ${
                activeSlice === 'exam' ? 'bg-surface-container-high' : ''
              }`}
            >
              <span className="flex items-center gap-1.5 truncate">
                <span className="w-2.5 h-2.5 rounded-full bg-[#5d5c59] shrink-0" />
                <span className="text-on-surface-variant font-body truncate">Gov Exam Prep</span>
              </span>
              <span className="font-metric-display text-xs text-tertiary font-semibold">
                {examHours}h
              </span>
            </div>

            <div
              className={`flex items-center justify-between text-xs p-1 rounded transition ${
                activeSlice === 'wellness' ? 'bg-surface-container-high' : ''
              }`}
            >
              <span className="flex items-center gap-1.5 truncate">
                <span className="w-2.5 h-2.5 rounded-full bg-[#56615d] shrink-0" />
                <span className="text-on-surface-variant font-body truncate">Fitness & Hobbies</span>
              </span>
              <span className="font-metric-display text-xs text-secondary font-semibold">
                {wellnessHours}h
              </span>
            </div>

            <div
              className={`flex items-center justify-between text-xs p-1 rounded transition ${
                activeSlice === 'social' ? 'bg-surface-container-high' : ''
              }`}
            >
              <span className="flex items-center gap-1.5 truncate">
                <span className="w-2.5 h-2.5 rounded-full bg-[#5b5e6a] shrink-0" />
                <span className="text-on-surface-variant font-body truncate">Chill & Social</span>
              </span>
              <span className="font-metric-display text-xs text-on-surface font-semibold">
                {socialHours}h
              </span>
            </div>

            <div className="flex items-center justify-between text-xs p-1 pt-0.5 border-t border-outline-variant/30">
              <span className="flex items-center gap-1.5 truncate">
                <span className="w-2.5 h-2.5 rounded-full bg-[#c7c4d7] shrink-0" />
                <span className="text-tertiary font-body truncate font-medium">Smart Buffer</span>
              </span>
              <span className="font-metric-display text-xs text-tertiary font-bold">
                {bufferHours}h
              </span>
            </div>
          </div>
        </div>

        {/* Motivational Micro-Insight */}
        <div className="bg-surface-container-high rounded-xl p-3 flex items-center gap-2.5 z-10 border border-outline-variant/30">
          <span className="text-xl leading-none">🧠</span>
          <p className="font-body text-xs text-on-surface-variant leading-snug">
            <strong className="text-on-surface font-semibold">Cognitive Safeguard:</strong> 2h
            unstructured buffer prevents routine collapse if afternoon lectures run over.
          </p>
        </div>
      </div>

      {/* Optimizer Step Configurations */}
      <div className="flex flex-col space-y-3 pt-1">
        {/* Step 1 Header */}
        <div className="flex items-center justify-between">
          <span className="font-label-badge text-xs uppercase tracking-wider text-on-surface-variant font-bold">
            Step 1 — Academic Anchor
          </span>
          <span className="font-label-time text-[11px] text-secondary font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">sync</span> Synced
          </span>
        </div>

        {/* Anchor Card */}
        <div className="bg-surface-container rounded-2xl p-4 flex flex-col gap-2.5 shadow-xs border border-outline-variant/30">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">account_balance</span>
              </div>
              <div>
                <h3 className="font-headline text-sm font-bold text-on-surface">
                  University Timetable
                </h3>
                <p className="font-body text-xs text-on-surface-variant">
                  Mon – Fri • B.Tech Computer Science
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary font-label-badge text-[11px] font-bold">
              Fixed 5.5h
            </span>
          </div>

          <div className="bg-surface-container-low rounded-xl p-2.5 flex items-center justify-between border border-outline-variant/30">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-outline text-[18px]">schedule</span>
              <span className="font-label-time text-xs text-on-surface font-semibold">
                09:00 AM – 02:30 PM
              </span>
            </div>
            <span className="font-body text-xs text-secondary font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" /> Live Link
            </span>
          </div>
        </div>

        {/* Step 2 Header */}
        <div className="flex items-center justify-between pt-1">
          <span className="font-label-badge text-xs uppercase tracking-wider text-on-surface-variant font-bold">
            Step 2 — Exam Target Window
          </span>
          <span className="font-label-time text-[11px] text-tertiary font-bold">
            {examHours}h Deep Focus
          </span>
        </div>

        {/* Target Exam Card */}
        <div className="bg-surface-container rounded-2xl p-4 flex flex-col gap-3 shadow-xs border border-outline-variant/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-tertiary/15 text-tertiary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">military_tech</span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-headline text-sm font-bold text-on-surface truncate">
                    SSC CGL Tier 1
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-tertiary/20 text-tertiary font-label-badge text-[10px] font-bold">
                    54 Days Left
                  </span>
                </div>
                <p className="font-body text-xs text-on-surface-variant truncate">
                  Quantitative Aptitude & Reasoning
                </p>
              </div>
            </div>
          </div>

          {/* Timing Selector Toggle */}
          <div className="flex flex-col gap-1.5">
            <span className="font-label-badge text-[11px] text-on-surface-variant font-semibold">
              Preferred High-Tension Block
            </span>
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-surface-container-low rounded-xl border border-outline-variant/30">
              <button
                type="button"
                onClick={() => setExamWindow('late')}
                className={`py-2 px-3 rounded-lg font-body text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                  examWindow === 'late'
                    ? 'bg-surface-container-highest text-primary shadow-xs border border-outline-variant/30 font-bold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">wb_twilight</span>
                <span>Late PM (4:00 - 7:00)</span>
              </button>
              <button
                type="button"
                onClick={() => setExamWindow('early')}
                className={`py-2 px-3 rounded-lg font-body text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                  examWindow === 'early'
                    ? 'bg-surface-container-highest text-primary shadow-xs border border-outline-variant/30 font-bold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">wb_sunny</span>
                <span>Early AM (5:30 - 8:30)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Step 3 Header */}
        <div className="flex items-center justify-between pt-1">
          <span className="font-label-badge text-xs uppercase tracking-wider text-on-surface-variant font-bold">
            Step 3 — Wellbeing Anchors
          </span>
          <span className="font-label-time text-[11px] text-secondary font-bold">
            Active Rest
          </span>
        </div>

        {/* Wellbeing Card */}
        <div className="bg-surface-container rounded-2xl p-4 flex flex-col gap-2 shadow-xs border border-outline-variant/30">
          <p className="font-body text-xs text-on-surface-variant">
            Select anti-burnout activities AI must strictly schedule before slotting study blocks:
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {wellbeingItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleWellbeing(item.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all active:scale-95 cursor-pointer border ${
                  item.selected
                    ? 'bg-secondary/20 border-secondary/40 text-secondary font-semibold shadow-xs'
                    : 'bg-surface-container-high border-outline-variant/40 text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span>{item.emoji}</span>
                <span>{item.title}</span>
                <span className="font-label-time text-[11px] opacity-80">({item.duration})</span>
                <span className="material-symbols-outlined text-[16px]">
                  {item.selected ? 'check_circle' : 'add'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Step 4 Header */}
        <div className="flex items-center justify-between pt-1">
          <span className="font-label-badge text-xs uppercase tracking-wider text-on-surface-variant font-bold">
            Step 4 — Chronotype
          </span>
          <span className="font-label-time text-[11px] text-primary font-bold">
            Circadian Curve
          </span>
        </div>

        {/* Energy Rhythm Card */}
        <div className="bg-surface-container rounded-2xl p-4 flex flex-col gap-2 shadow-xs border border-outline-variant/30">
          <div className="grid grid-cols-2 gap-2.5">
            {/* Morning Lark */}
            <div
              onClick={() => setChronotype('lark')}
              className={`p-3 rounded-xl cursor-pointer flex flex-col gap-1 transition-all border ${
                chronotype === 'lark'
                  ? 'bg-surface-container-highest border-primary/40 shadow-xs'
                  : 'bg-surface-container-low border-outline-variant/30 opacity-60 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xl">🌅</span>
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    chronotype === 'lark' ? 'bg-primary' : 'bg-surface-container-high'
                  }`}
                >
                  {chronotype === 'lark' && (
                    <span className="material-symbols-outlined text-[12px] text-on-primary font-bold">
                      check
                    </span>
                  )}
                </span>
              </div>
              <span className="font-headline text-xs font-bold text-on-surface pt-1">
                Lark Rhythm
              </span>
              <span className="font-body text-[11px] text-on-surface-variant">
                Peak alertness: 7AM - 1PM
              </span>
            </div>

            {/* Night Owl */}
            <div
              onClick={() => setChronotype('owl')}
              className={`p-3 rounded-xl cursor-pointer flex flex-col gap-1 transition-all border ${
                chronotype === 'owl'
                  ? 'bg-surface-container-highest border-primary/40 shadow-xs'
                  : 'bg-surface-container-low border-outline-variant/30 opacity-60 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xl">🦉</span>
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    chronotype === 'owl' ? 'bg-primary' : 'bg-surface-container-high'
                  }`}
                >
                  {chronotype === 'owl' && (
                    <span className="material-symbols-outlined text-[12px] text-on-primary font-bold">
                      check
                    </span>
                  )}
                </span>
              </div>
              <span className="font-headline text-xs font-bold text-on-surface pt-1">
                Night Owl
              </span>
              <span className="font-body text-[11px] text-on-surface-variant">
                Peak alertness: 8PM - 1AM
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Action Deck */}
      <div className="flex flex-col space-y-2 pt-2">
        {/* Auto-Generate Button */}
        <button
          type="button"
          onClick={handleGenerate}
          className="relative group w-full py-3.5 px-4 rounded-2xl bg-primary text-on-primary font-headline text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/25 hover:bg-primary/95 active:scale-98 transition-all overflow-hidden cursor-pointer"
        >
          <span className="material-symbols-outlined text-[22px] group-hover:rotate-12 transition-transform">
            auto_awesome
          </span>
          <span>Auto-Generate Zero-Paralysis Day</span>
        </button>

        {/* Less Stress Button */}
        <button
          type="button"
          onClick={handleRegenerateLessStress}
          className={`w-full py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer ${
            lessStressActive
              ? 'bg-secondary/20 border-secondary text-secondary font-bold'
              : 'bg-surface-container hover:bg-surface-container-high border-outline-variant/40 text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[18px] text-secondary">spa</span>
          <span>
            {lessStressActive
              ? 'Active: Stress-Shield Active (-30m study, +30m walk)'
              : 'Regenerate with Less Stress (-30m study, +30m walk)'}
          </span>
        </button>
      </div>

      {/* Suggested Schedule Preview */}
      <div className="flex flex-col space-y-2 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="font-headline text-sm font-bold text-on-surface">
              Suggested Schedule Preview
            </span>
            <span className="px-2 py-0.5 rounded-full bg-secondary/15 text-secondary font-label-badge text-[10px] font-bold">
              READY
            </span>
          </div>
          <span className="font-label-time text-xs text-on-surface-variant font-medium">
            Tomorrow
          </span>
        </div>

        {/* Timeline Ladder */}
        <div className="bg-surface-container rounded-2xl p-3 flex flex-col space-y-2 shadow-xs border border-outline-variant/30">
          {/* Block 1: Morning Wellness */}
          <div className="flex items-stretch gap-2.5">
            <div className="w-14 flex flex-col items-end pt-1 shrink-0">
              <span className="font-label-time text-xs text-on-surface font-semibold leading-none">
                06:45
              </span>
              <span className="font-body text-[10px] text-on-surface-variant">45m</span>
            </div>
            <div className="w-1 rounded-full bg-secondary shrink-0" />
            <div className="flex-1 bg-surface-container-high rounded-xl p-2.5 flex items-center justify-between border border-outline-variant/20">
              <div className="min-w-0">
                <span className="font-headline text-xs font-bold text-on-surface block truncate">
                  Morning Sun & Yoga Flow
                </span>
                <span className="font-body text-[11px] text-secondary flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">self_improvement</span>{' '}
                  Serotonin Boost
                </span>
              </div>
              <span className="material-symbols-outlined text-outline text-[18px]">
                drag_indicator
              </span>
            </div>
          </div>

          {/* Block 2: University (Fixed Anchor) */}
          <div className="flex items-stretch gap-2.5">
            <div className="w-14 flex flex-col items-end pt-1 shrink-0">
              <span className="font-label-time text-xs text-on-surface font-semibold leading-none">
                09:00
              </span>
              <span className="font-body text-[10px] text-on-surface-variant">5.5h</span>
            </div>
            <div className="w-1 rounded-full bg-primary shrink-0" />
            <div className="flex-1 bg-surface-container-high rounded-xl p-2.5 flex items-center justify-between border border-outline-variant/20">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-headline text-xs font-bold text-on-surface block truncate">
                    College Lectures & Labs
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-surface-container-highest text-[10px] font-label-badge text-outline">
                    Anchor
                  </span>
                </div>
                <span className="font-body text-[11px] text-on-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">location_on</span>{' '}
                  Campus Hall B
                </span>
              </div>
              <span
                className="material-symbols-outlined text-primary text-[18px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                lock
              </span>
            </div>
          </div>

          {/* Block 3: Smart Decompression Buffer */}
          <div className="flex items-stretch gap-2.5">
            <div className="w-14 flex flex-col items-end pt-1 shrink-0">
              <span className="font-label-time text-xs text-tertiary font-semibold leading-none">
                14:30
              </span>
              <span className="font-body text-[10px] text-tertiary">60m</span>
            </div>
            <div className="w-1 rounded-full bg-tertiary/40 shrink-0" />
            <div className="flex-1 bg-surface-container-low rounded-xl p-2.5 flex items-center justify-between border border-outline-variant/20">
              <div className="min-w-0">
                <span className="font-headline text-xs font-medium text-tertiary block truncate">
                  Unassigned Wind-Down & Lunch
                </span>
                <span className="font-body text-[11px] text-on-surface-variant">
                  Buffer zone protects focus stamina
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-tertiary/10 text-tertiary font-label-badge text-[10px] font-bold">
                Guard
              </span>
            </div>
          </div>

          {/* Block 4: SSC CGL Deep Focus */}
          <div className="flex items-stretch gap-2.5">
            <div className="w-14 flex flex-col items-end pt-1 shrink-0">
              <span className="font-label-time text-xs text-on-surface font-semibold leading-none">
                {examWindow === 'late' ? '16:00' : '05:30'}
              </span>
              <span className="font-body text-[10px] text-on-surface-variant">
                {examHours}h
              </span>
            </div>
            <div className="w-1 rounded-full bg-tertiary shrink-0" />
            <div className="flex-1 bg-surface-container-high rounded-xl p-2.5 flex items-center justify-between border border-outline-variant/20">
              <div className="min-w-0">
                <span className="font-headline text-xs font-bold text-on-surface block truncate">
                  Gov Exam Focus: Reasoning & Quants
                </span>
                <span className="font-body text-[11px] text-tertiary flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">timer</span> Pomodoro
                  50/10 split
                </span>
              </div>
              <span className="material-symbols-outlined text-outline text-[18px]">
                tune
              </span>
            </div>
          </div>

          {/* Block 5: Evening Fun / Dance */}
          <div className="flex items-stretch gap-2.5">
            <div className="w-14 flex flex-col items-end pt-1 shrink-0">
              <span className="font-label-time text-xs text-on-surface font-semibold leading-none">
                19:30
              </span>
              <span className="font-body text-[10px] text-on-surface-variant">60m</span>
            </div>
            <div className="w-1 rounded-full bg-secondary shrink-0" />
            <div className="flex-1 bg-surface-container-high rounded-xl p-2.5 flex items-center justify-between border border-outline-variant/20">
              <div className="min-w-0">
                <span className="font-headline text-xs font-bold text-on-surface block truncate">
                  Choreography & Dance Workout 💃
                </span>
                <span className="font-body text-[11px] text-secondary">Pure endorphin reset</span>
              </div>
              <span className="material-symbols-outlined text-outline text-[18px]">
                drag_indicator
              </span>
            </div>
          </div>

          {/* Block 6: Rest & Sleep Sanctuary */}
          <div className="flex items-stretch gap-2.5">
            <div className="w-14 flex flex-col items-end pt-1 shrink-0">
              <span className="font-label-time text-xs text-primary-container font-semibold leading-none">
                23:00
              </span>
              <span className="font-body text-[10px] text-primary-container">7.5h</span>
            </div>
            <div className="w-1 rounded-full bg-primary-container shrink-0" />
            <div className="flex-1 bg-surface-container-high rounded-xl p-2.5 flex items-center justify-between border border-outline-variant/20">
              <div className="min-w-0">
                <span className="font-headline text-xs font-bold text-on-surface block truncate">
                  Restorative Sleep Cycle
                </span>
                <span className="font-body text-[11px] text-on-surface-variant">
                  Circadian sleep rhythm locked
                </span>
              </div>
              <span className="material-symbols-outlined text-primary-container text-[18px]">
                bedtime
              </span>
            </div>
          </div>
        </div>

        {/* Direct Sync Commitment Bar */}
        <div className="bg-surface-container-high rounded-2xl p-3.5 flex items-center justify-between shadow-xs border border-outline-variant/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">calendar_month</span>
            </div>
            <div>
              <span className="font-headline text-xs font-bold text-on-surface block">
                Apply to My Schedule
              </span>
              <span className="font-body text-[11px] text-on-surface-variant">
                Locks blocks into Google / SyncLife
              </span>
            </div>
          </div>

          {/* Interactive Toggle */}
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={applied}
              onChange={() => {
                const next = !applied;
                setApplied(next);
                if (next) {
                  onTriggerToast('Locks activated into Google Calendar & SyncLife Flow', 'SYNCED');
                } else {
                  onTriggerToast('Manual edit mode unlocked', 'UNLOCKED');
                }
              }}
              className="sr-only peer"
            />
            <div className="w-12 h-7 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-secondary after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all shadow-inner" />
          </label>
        </div>
      </div>
    </div>
  );
};
