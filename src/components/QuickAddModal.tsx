import React, { useState } from 'react';
import { TimeSlot } from '../types';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSlot: (slot: Omit<TimeSlot, 'id' | 'completed'>) => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  onAddSlot,
}) => {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [time, setTime] = useState('15:00');
  const [duration, setDuration] = useState('45m');
  const [category, setCategory] = useState<TimeSlot['category']>('Academics');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddSlot({
      title: title.trim(),
      subtitle: subtitle.trim() || 'Custom allocated circadian block',
      time,
      duration,
      category,
      badge: category,
    });

    setTitle('');
    setSubtitle('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-container rounded-2xl w-full max-w-sm p-5 shadow-2xl border border-outline-variant/40 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">
              more_time
            </span>
            <span className="font-headline text-base font-bold text-on-surface">
              Add Time Slot
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface p-1 rounded-full cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block font-label-badge text-xs uppercase tracking-wider text-on-surface-variant mb-1 font-semibold">
              Activity Name
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Distributed Systems Lab or Sunset Walk"
              className="w-full bg-surface-container-lowest border border-outline-variant/40 px-3 py-2 rounded-xl text-on-surface placeholder:text-outline font-body text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block font-label-badge text-xs uppercase tracking-wider text-on-surface-variant mb-1 font-semibold">
              Context / Location
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g. Turing Block Room 204 or Park stroll"
              className="w-full bg-surface-container-lowest border border-outline-variant/40 px-3 py-2 rounded-xl text-on-surface placeholder:text-outline font-body text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-label-badge text-xs uppercase tracking-wider text-on-surface-variant mb-1 font-semibold">
                Start Time
              </label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="15:00"
                className="w-full bg-surface-container-lowest border border-outline-variant/40 px-3 py-2 rounded-xl text-on-surface font-label-time text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block font-label-badge text-xs uppercase tracking-wider text-on-surface-variant mb-1 font-semibold">
                Duration
              </label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="45m"
                className="w-full bg-surface-container-lowest border border-outline-variant/40 px-3 py-2 rounded-xl text-on-surface font-label-time text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block font-label-badge text-xs uppercase tracking-wider text-on-surface-variant mb-1 font-semibold">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as TimeSlot['category'])}
              className="w-full bg-surface-container-lowest border border-outline-variant/40 px-3 py-2 rounded-xl text-on-surface font-body text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="Academics">Academics (University)</option>
              <option value="High Focus">High Focus (Gov Exam Prep)</option>
              <option value="Wellness">Wellness & Yoga</option>
              <option value="Hobby & Passion">Hobby & Passion</option>
              <option value="Nutrition & Move">Nutrition & Move</option>
              <option value="Free Time">Free Time / Downtime</option>
              <option value="Family">Family Connection</option>
              <option value="Rest">Rest & Sleep</option>
            </select>
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-xl bg-surface-container-high text-on-surface font-headline text-sm font-semibold hover:bg-surface-container-highest transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 bg-primary text-on-primary rounded-xl font-headline text-sm font-semibold shadow-md active:scale-95 transition-all cursor-pointer"
            >
              Save to Flow
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
