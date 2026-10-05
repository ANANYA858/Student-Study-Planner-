import React, { useState, useEffect } from 'react';

export interface Milestone {
  id: string;
  text: string;
  completed: boolean;
}

export interface WeeklyGoal {
  title: string;
  targetExam: string;
  targetCount: number;
  currentCount: number;
  unit: string; // e.g. 'Hours', 'Mock Tests', 'Chapters', 'Problem Sets'
  weekLabel: string;
  milestones: Milestone[];
}

const DEFAULT_WEEKLY_GOAL: WeeklyGoal = {
  title: 'Conquer 4 Full-Length Mock Tests & Deep Error Analysis',
  targetExam: 'Gov Exam Prep (SSC CGL / UPSC)',
  targetCount: 4,
  currentCount: 3,
  unit: 'Mock Tests',
  weekLabel: 'Week of Oct 14 – Oct 20',
  milestones: [
    { id: 'm1', text: 'Sectional Test 1: Quantitative Aptitude (Algebra & Geometry)', completed: true },
    { id: 'm2', text: 'Sectional Test 2: General Reasoning & Logic Matrices', completed: true },
    { id: 'm3', text: 'Full Mock 1: Comprehensive Tier 1 Simulation (164/200)', completed: true },
    { id: 'm4', text: 'Full Mock 2 & Mistake Notebook Review', completed: false },
  ],
};

interface WeeklyGoalTrackerProps {
  onTriggerToast: (msg: string, badge?: string) => void;
}

export const WeeklyGoalTracker: React.FC<WeeklyGoalTrackerProps> = ({ onTriggerToast }) => {
  const [goal, setGoal] = useState<WeeklyGoal>(() => {
    const saved = localStorage.getItem('synclife_weekly_goal');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_WEEKLY_GOAL;
      }
    }
    return DEFAULT_WEEKLY_GOAL;
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(goal.title);
  const [editTarget, setEditTarget] = useState(goal.targetCount);
  const [editUnit, setEditUnit] = useState(goal.unit);
  const [editExam, setEditExam] = useState(goal.targetExam);
  const [newMilestoneText, setNewMilestoneText] = useState('');

  // Persist goal changes
  useEffect(() => {
    localStorage.setItem('synclife_weekly_goal', JSON.stringify(goal));
  }, [goal]);

  const percentage = Math.min(
    100,
    Math.round((goal.currentCount / Math.max(1, goal.targetCount)) * 100)
  );
  const isGoalCompleted = goal.currentCount >= goal.targetCount;

  const handleAdjustCount = (delta: number) => {
    const nextCount = Math.max(0, goal.currentCount + delta);
    setGoal((prev) => ({ ...prev, currentCount: nextCount }));

    if (nextCount >= goal.targetCount && goal.currentCount < goal.targetCount) {
      onTriggerToast(`🏆 Weekly Academic Goal Achieved! 100% Complete`, 'GOAL HIT');
    } else {
      onTriggerToast(
        `Weekly progress updated: ${nextCount} / ${goal.targetCount} ${goal.unit}`,
        'PROGRESS'
      );
    }
  };

  const handleToggleMilestone = (id: string) => {
    const updated = goal.milestones.map((m) =>
      m.id === id ? { ...m, completed: !m.completed } : m
    );
    const target = updated.find((m) => m.id === id);
    setGoal((prev) => ({ ...prev, milestones: updated }));

    if (target?.completed) {
      onTriggerToast(`Milestone completed: "${target.text}" ✨`, 'MILESTONE');
    }
  };

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneText.trim()) return;

    const newMilestone: Milestone = {
      id: String(Date.now()),
      text: newMilestoneText.trim(),
      completed: false,
    };

    setGoal((prev) => ({
      ...prev,
      milestones: [...prev.milestones, newMilestone],
    }));
    setNewMilestoneText('');
    onTriggerToast('New weekly sub-milestone added!', 'ADDED');
  };

  const handleDeleteMilestone = (id: string) => {
    setGoal((prev) => ({
      ...prev,
      milestones: prev.milestones.filter((m) => m.id !== id),
    }));
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    setGoal((prev) => ({
      ...prev,
      title: editTitle.trim() || prev.title,
      targetExam: editExam.trim() || prev.targetExam,
      targetCount: Math.max(1, Number(editTarget)),
      unit: editUnit.trim() || prev.unit,
    }));
    setIsEditing(false);
    onTriggerToast('Weekly academic objective updated!', 'SAVED');
  };

  const handleSetTemplate = (templateTitle: string, targetNum: number, unitLabel: string) => {
    setEditTitle(templateTitle);
    setEditTarget(targetNum);
    setEditUnit(unitLabel);
  };

  return (
    <div className="bg-surface-container-low rounded-2xl p-4 border border-outline-variant/30 space-y-3 shadow-xs">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[20px]">target</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-headline text-sm font-bold text-on-surface">
                Weekly Academic Objective
              </h4>
              <span className="font-label-badge text-[9px] px-1.5 py-0.2 rounded bg-primary/20 text-primary font-bold">
                Week Target
              </span>
            </div>
            <p className="font-body text-[11px] text-on-surface-variant">
              {goal.weekLabel}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (!isEditing) {
              setEditTitle(goal.title);
              setEditTarget(goal.targetCount);
              setEditUnit(goal.unit);
              setEditExam(goal.targetExam);
            }
            setIsEditing(!isEditing);
          }}
          className="text-xs font-semibold px-2 py-1 rounded-lg bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/30 text-on-surface flex items-center gap-1 cursor-pointer transition active:scale-95"
        >
          <span className="material-symbols-outlined text-[14px]">
            {isEditing ? 'close' : 'edit'}
          </span>
          <span>{isEditing ? 'Cancel' : 'Edit Goal'}</span>
        </button>
      </div>

      {/* Edit Mode Drawer */}
      {isEditing ? (
        <form onSubmit={handleSaveEdit} className="p-3 bg-surface-container rounded-xl border border-outline-variant/40 space-y-3 animate-in fade-in duration-200">
          <div className="space-y-1">
            <label className="font-label-badge text-[10px] uppercase font-bold text-on-surface-variant block">
              Objective Title
            </label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full bg-surface-container-highest border border-outline-variant/40 rounded-xl px-2.5 py-1.5 text-xs text-on-surface font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="e.g. Master 4 Mock Tests & Geometry"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <label className="font-label-badge text-[10px] uppercase font-bold text-on-surface-variant block">
                Target Exam
              </label>
              <input
                type="text"
                value={editExam}
                onChange={(e) => setEditExam(e.target.value)}
                className="w-full bg-surface-container-highest border border-outline-variant/40 rounded-xl px-2 py-1 text-xs text-on-surface font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="SSC / Gate"
              />
            </div>

            <div className="space-y-1">
              <label className="font-label-badge text-[10px] uppercase font-bold text-on-surface-variant block">
                Target Amount
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={editTarget}
                onChange={(e) => setEditTarget(Number(e.target.value))}
                className="w-full bg-surface-container-highest border border-outline-variant/40 rounded-xl px-2 py-1 text-xs text-on-surface font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-label-badge text-[10px] uppercase font-bold text-on-surface-variant block">
                Metric Unit
              </label>
              <input
                type="text"
                value={editUnit}
                onChange={(e) => setEditUnit(e.target.value)}
                className="w-full bg-surface-container-highest border border-outline-variant/40 rounded-xl px-2 py-1 text-xs text-on-surface font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Hours / Mocks"
                required
              />
            </div>
          </div>

          {/* Quick Academic Goal Templates */}
          <div className="space-y-1 pt-1">
            <span className="font-label-badge text-[10px] text-on-surface-variant font-bold block uppercase">
              Quick Academic Templates
            </span>
            <div className="flex flex-wrap gap-1">
              <button
                type="button"
                onClick={() => handleSetTemplate('Conquer 5 Sectional Mock Tests', 5, 'Mock Tests')}
                className="text-[10px] px-2 py-0.5 rounded-full bg-surface-container-highest hover:bg-surface-container text-on-surface-variant cursor-pointer border border-outline-variant/30"
              >
                📝 5 Mock Tests
              </button>
              <button
                type="button"
                onClick={() => handleSetTemplate('Log 25 Deep Focus Hours', 25, 'Hours')}
                className="text-[10px] px-2 py-0.5 rounded-full bg-surface-container-highest hover:bg-surface-container text-on-surface-variant cursor-pointer border border-outline-variant/30"
              >
                ⚡ 25 Focus Hours
              </button>
              <button
                type="button"
                onClick={() => handleSetTemplate('Revise 6 High-Yield Syllabus Units', 6, 'Chapters')}
                className="text-[10px] px-2 py-0.5 rounded-full bg-surface-container-highest hover:bg-surface-container text-on-surface-variant cursor-pointer border border-outline-variant/30"
              >
                📚 6 Chapters
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-1.5 rounded-xl bg-primary text-on-primary font-headline text-xs font-bold shadow-xs hover:bg-primary/95 transition cursor-pointer"
          >
            Save Weekly Objective
          </button>
        </form>
      ) : (
        /* Display Card */
        <div className="space-y-2.5">
          {/* Objective Title & Exam Badge */}
          <div className="p-3 rounded-xl bg-surface-container border border-outline-variant/30 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-0.5">
                <span className="font-label-badge text-[10px] text-primary font-bold uppercase tracking-wider">
                  {goal.targetExam}
                </span>
                <h3 className="font-headline text-xs font-bold text-on-surface leading-snug">
                  {goal.title}
                </h3>
              </div>

              {/* Progress Count Stepper */}
              <div className="flex items-center gap-1 shrink-0 bg-surface-container-high px-2 py-1 rounded-xl border border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => handleAdjustCount(-1)}
                  title="Decrease progress"
                  className="w-5 h-5 rounded-md bg-surface-container-highest flex items-center justify-center text-xs font-bold text-on-surface hover:bg-surface-container cursor-pointer"
                >
                  -
                </button>
                <span className="font-metric-display text-xs font-bold text-on-surface px-1">
                  {goal.currentCount}/{goal.targetCount}
                </span>
                <button
                  type="button"
                  onClick={() => handleAdjustCount(1)}
                  title="Increase progress"
                  className="w-5 h-5 rounded-md bg-surface-container-highest flex items-center justify-center text-xs font-bold text-on-surface hover:bg-surface-container cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden p-0.5 border border-outline-variant/20">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${
                    isGoalCompleted
                      ? 'bg-secondary'
                      : 'bg-gradient-to-r from-primary to-amber-500'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <div className="flex justify-between text-[10px] text-on-surface-variant font-medium">
                <span>
                  {goal.currentCount} of {goal.targetCount} {goal.unit} completed
                </span>
                <span className={`font-bold ${isGoalCompleted ? 'text-secondary' : 'text-primary'}`}>
                  {percentage}% {isGoalCompleted ? 'Completed 🏆' : 'On Track'}
                </span>
              </div>
            </div>
          </div>

          {/* Sub-Milestones Checklist */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-headline font-semibold text-on-surface-variant">
                Weekly Milestone Checkpoints
              </span>
              <span className="text-[10px] text-on-surface-variant">
                {goal.milestones.filter((m) => m.completed).length} / {goal.milestones.length} done
              </span>
            </div>

            <div className="space-y-1 max-h-36 overflow-y-auto no-scrollbar">
              {goal.milestones.map((milestone) => (
                <div
                  key={milestone.id}
                  className="flex items-center justify-between p-1.5 rounded-lg bg-surface-container-lowest/80 border border-outline-variant/20 text-xs hover:bg-surface-container transition group"
                >
                  <button
                    type="button"
                    onClick={() => handleToggleMilestone(milestone.id)}
                    className="flex items-center gap-2 text-left min-w-0 flex-1 cursor-pointer"
                  >
                    <span
                      className={`w-4 h-4 rounded-md flex items-center justify-center text-[11px] shrink-0 border ${
                        milestone.completed
                          ? 'bg-secondary border-secondary text-on-secondary font-bold'
                          : 'border-outline-variant text-transparent'
                      }`}
                    >
                      ✓
                    </span>
                    <span
                      className={`text-[11px] leading-tight truncate ${
                        milestone.completed
                          ? 'line-through text-on-surface-variant'
                          : 'text-on-surface font-medium'
                      }`}
                    >
                      {milestone.text}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteMilestone(milestone.id)}
                    className="opacity-0 group-hover:opacity-100 text-on-surface-variant hover:text-red-400 p-0.5 rounded cursor-pointer transition"
                    title="Remove milestone"
                  >
                    <span className="material-symbols-outlined text-[13px]">delete</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Quick Add Milestone Form */}
            <form onSubmit={handleAddMilestone} className="flex gap-1.5 pt-1">
              <input
                type="text"
                value={newMilestoneText}
                onChange={(e) => setNewMilestoneText(e.target.value)}
                placeholder="+ Add checkpoint (e.g. Chapter 3 revision)"
                className="flex-1 bg-surface-container-highest border border-outline-variant/30 rounded-xl px-2.5 py-1 text-[11px] text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="submit"
                disabled={!newMilestoneText.trim()}
                className="px-2.5 py-1 rounded-xl bg-surface-container-high hover:bg-surface-container-highest disabled:opacity-40 text-on-surface text-[11px] font-bold border border-outline-variant/30 transition cursor-pointer"
              >
                Add
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
