import React, { useState, useEffect } from 'react';

export interface ExamItem {
  id: string;
  name: string;
  category: 'Gov' | 'Engineering' | 'Management' | 'University';
  targetDate: string; // ISO date string YYYY-MM-DDTHH:mm:ss
  readinessPercentage: number;
  icon: string;
}

const DEFAULT_EXAMS: ExamItem[] = [
  {
    id: 'ssc-cgl',
    name: 'SSC CGL Tier 1 Prelims',
    category: 'Gov',
    targetDate: '2026-12-15T09:00:00',
    readinessPercentage: 68,
    icon: 'military_tech',
  },
  {
    id: 'upsc-cse',
    name: 'UPSC Civil Services Prelims',
    category: 'Gov',
    targetDate: '2027-05-23T09:30:00',
    readinessPercentage: 54,
    icon: 'account_balance',
  },
  {
    id: 'gate-cs',
    name: 'GATE Computer Science 2027',
    category: 'Engineering',
    targetDate: '2027-02-06T09:00:00',
    readinessPercentage: 72,
    icon: 'terminal',
  },
  {
    id: 'uni-finals',
    name: 'University Semester 6 Finals',
    category: 'University',
    targetDate: '2026-11-20T10:00:00',
    readinessPercentage: 85,
    icon: 'school',
  },
];

interface UpcomingExamsTrackerProps {
  onTriggerToast: (msg: string, badge?: string) => void;
}

export const UpcomingExamsTracker: React.FC<UpcomingExamsTrackerProps> = ({
  onTriggerToast,
}) => {
  const [exams, setExams] = useState<ExamItem[]>(() => {
    const saved = localStorage.getItem('synclife_upcoming_exams');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_EXAMS;
      }
    }
    return DEFAULT_EXAMS;
  });

  const [selectedExamId, setSelectedExamId] = useState<string>(() => {
    const savedId = localStorage.getItem('synclife_active_exam_id');
    return savedId || 'ssc-cgl';
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customDate, setCustomDate] = useState('2026-12-15T09:00');
  const [customCategory, setCustomCategory] = useState<ExamItem['category']>('Gov');
  const [customReadiness, setCustomReadiness] = useState(60);

  // Live countdown state
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPassed: false,
  });

  const activeExam = exams.find((e) => e.id === selectedExamId) || exams[0];

  // Save exams to localStorage
  useEffect(() => {
    localStorage.setItem('synclife_upcoming_exams', JSON.stringify(exams));
    localStorage.setItem('synclife_active_exam_id', selectedExamId);
  }, [exams, selectedExamId]);

  // Dynamic live countdown ticker running every 1000ms
  useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime();
      const target = new Date(activeExam.targetDate).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isPassed: true,
        });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        isPassed: false,
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [activeExam.targetDate]);

  const handleSelectExam = (exam: ExamItem) => {
    setSelectedExamId(exam.id);
    onTriggerToast(`Target shifted to ${exam.name}! 🎯`, 'EXAM SWITCHED');
  };

  const handleAddCustomExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !customDate) return;

    const newExam: ExamItem = {
      id: `custom-${Date.now()}`,
      name: customName.trim(),
      category: customCategory,
      targetDate: new Date(customDate).toISOString(),
      readinessPercentage: customReadiness,
      icon: 'star',
    };

    const updated = [newExam, ...exams];
    setExams(updated);
    setSelectedExamId(newExam.id);
    setShowEditModal(false);
    setCustomName('');
    onTriggerToast(`New competitive exam added: "${newExam.name}" 🚀`, 'EXAM ADDED');
  };

  // Determine Urgency Phase
  const getUrgencyPhase = (days: number) => {
    if (days <= 21) {
      return {
        label: 'Final Revision Sprint',
        color: 'text-red-400 bg-red-500/15 border-red-500/30',
        advice: 'Simulate 2 full mock exams weekly & review mistake notebook daily.',
      };
    }
    if (days <= 60) {
      return {
        label: 'High-Yield Mock Phase',
        color: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
        advice: 'Daily 2-hour sectional timed practice & active spaced recall.',
      };
    }
    return {
      label: 'Core Foundation & Mastery',
      color: 'text-primary bg-primary/15 border-primary/30',
      advice: 'Thorough syllabus coverage aligned with circadian peak focus crests.',
    };
  };

  const urgency = getUrgencyPhase(timeLeft.days);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-surface-container p-4 shadow-lg border border-primary/20 space-y-4">
      {/* Background ambient lighting */}
      <div className="absolute -right-10 -top-10 w-44 h-44 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-10 -bottom-10 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header: Active Exam Title & Switcher */}
      <div className="flex items-start justify-between relative z-10 gap-2">
        <div className="space-y-1 min-w-0">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30">
            <span className="material-symbols-outlined text-[13px]">{activeExam.icon}</span>
            <span className="font-label-badge text-[10px] font-bold uppercase tracking-wider">
              {activeExam.category} Exam • Target #1
            </span>
          </div>

          <h2 className="font-headline text-lg font-bold text-on-surface truncate">
            {activeExam.name}
          </h2>

          <div className="flex items-center gap-2">
            <span
              className={`font-label-badge text-[10px] px-2 py-0.5 rounded-md border font-bold uppercase ${urgency.color}`}
            >
              {urgency.label}
            </span>
            <span className="text-[11px] text-on-surface-variant font-medium">
              Target: {new Date(activeExam.targetDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowEditModal(!showEditModal)}
          className="shrink-0 p-1.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/30 text-on-surface text-xs font-semibold flex items-center gap-1 cursor-pointer transition active:scale-95"
          title="Add or Customize Target Exam"
        >
          <span className="material-symbols-outlined text-[15px]">edit_calendar</span>
          <span className="text-[11px] hidden sm:inline">Change</span>
        </button>
      </div>

      {/* DYNAMIC LIVE COUNTDOWN TICKER */}
      <div className="relative z-10 bg-surface-container-lowest/85 rounded-2xl p-3.5 border border-outline-variant/30 shadow-inner">
        <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20 mb-2.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
            <span className="font-label-badge text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
              Live Real-Time Countdown
            </span>
          </div>
          <span className="font-label-time text-[10px] text-primary font-bold">
            Ticker Active • 1s Sync
          </span>
        </div>

        {timeLeft.isPassed ? (
          <div className="text-center py-2 text-primary font-bold text-sm">
            🎉 Exam Target Date Arrived! Good Luck!
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2 text-center">
            {/* Days */}
            <div className="bg-surface-container-high/80 rounded-xl p-2 border border-outline-variant/30 flex flex-col items-center justify-center">
              <span className="font-metric-display text-2xl font-black text-on-surface tracking-tight">
                {String(timeLeft.days).padStart(2, '0')}
              </span>
              <span className="font-label-badge text-[9px] uppercase tracking-wider font-bold text-on-surface-variant mt-0.5">
                Days
              </span>
            </div>

            {/* Hours */}
            <div className="bg-surface-container-high/80 rounded-xl p-2 border border-outline-variant/30 flex flex-col items-center justify-center">
              <span className="font-metric-display text-2xl font-black text-primary tracking-tight">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="font-label-badge text-[9px] uppercase tracking-wider font-bold text-on-surface-variant mt-0.5">
                Hours
              </span>
            </div>

            {/* Minutes */}
            <div className="bg-surface-container-high/80 rounded-xl p-2 border border-outline-variant/30 flex flex-col items-center justify-center">
              <span className="font-metric-display text-2xl font-black text-on-surface tracking-tight">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="font-label-badge text-[9px] uppercase tracking-wider font-bold text-on-surface-variant mt-0.5">
                Mins
              </span>
            </div>

            {/* Seconds (Active Ticking) */}
            <div className="bg-surface-container-high/80 rounded-xl p-2 border border-primary/40 flex flex-col items-center justify-center relative overflow-hidden">
              <span className="font-metric-display text-2xl font-black text-secondary tracking-tight">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="font-label-badge text-[9px] uppercase tracking-wider font-bold text-secondary mt-0.5">
                Secs
              </span>
            </div>
          </div>
        )}

        {/* Dynamic Study Directive */}
        <p className="font-body text-[11px] text-on-surface-variant pt-2.5 text-center leading-relaxed">
          💡 <strong className="text-on-surface">{urgency.label}:</strong> {urgency.advice}
        </p>
      </div>

      {/* Quick Exam Selector Horizontal Strip */}
      <div className="relative z-10 space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-headline font-semibold text-on-surface-variant">
            Track Other Upcoming Exams
          </span>
          <span className="text-[10px] text-on-surface-variant font-medium">
            {exams.length} Tracked
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          {exams.map((exam) => {
            const isSelected = exam.id === selectedExamId;
            const target = new Date(exam.targetDate).getTime();
            const daysLeft = Math.max(0, Math.floor((target - Date.now()) / (1000 * 60 * 60 * 24)));

            return (
              <button
                key={exam.id}
                type="button"
                onClick={() => handleSelectExam(exam)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-primary text-on-primary border-primary shadow-sm scale-[1.02] font-bold'
                    : 'bg-surface-container-low hover:bg-surface-container-high border-outline-variant/30 text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">
                  {exam.icon}
                </span>
                <span>{exam.name.split(' ')[0]}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                    isSelected
                      ? 'bg-black/20 text-white'
                      : 'bg-surface-container-highest text-primary font-bold'
                  }`}
                >
                  {daysLeft}d
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Add Custom Exam Modal / Drawer */}
      {showEditModal && (
        <form
          onSubmit={handleAddCustomExam}
          className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/40 space-y-3 animate-in fade-in duration-200 relative z-10"
        >
          <div className="flex items-center justify-between">
            <h4 className="font-headline text-xs font-bold text-on-surface">
              Track New Competitive Exam
            </h4>
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="text-on-surface-variant hover:text-on-surface text-xs"
            >
              ✕
            </button>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-on-surface-variant block">
              Exam Name
            </label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="e.g. UPSC CSE Mains / CAT 2026 / NEET PG"
              className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl px-2.5 py-1.5 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-on-surface-variant block">
                Exam Date & Time
              </label>
              <input
                type="datetime-local"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl px-2 py-1 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-on-surface-variant block">
                Category
              </label>
              <select
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value as ExamItem['category'])}
                className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl px-2 py-1 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="Gov">Gov Exam (UPSC, SSC, State)</option>
                <option value="Engineering">Engineering (GATE, IES)</option>
                <option value="Management">Management (CAT, XAT)</option>
                <option value="University">University Semester</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 rounded-xl bg-primary text-on-primary font-headline text-xs font-bold shadow-md hover:bg-primary/95 transition cursor-pointer"
          >
            Start Dynamic Ticker
          </button>
        </form>
      )}
    </div>
  );
};
