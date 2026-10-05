import React, { useState, useEffect } from 'react';
import { MealItem } from '../../types';
import { WeeklyActivityTrend } from '../WeeklyActivityTrend';
import { HabitReminderControlCard } from '../HabitReminderControlCard';
import { MicroHabit } from '../../utils/habitReminders';

interface BalanceTabProps {
  onTriggerToast: (msg: string, badge?: string) => void;
  onSendHabitReminder?: (habit: MicroHabit) => void;
  onAddWaterExternal?: () => void;
}

export const BalanceTab: React.FC<BalanceTabProps> = ({
  onTriggerToast,
  onSendHabitReminder,
  onAddWaterExternal,
}) => {
  // Hydration state
  const [waterIntake, setWaterIntake] = useState<number>(2.25);
  const maxWater = 3.0;

  // Yoga Card Logged toggle
  const [yogaLogged, setYogaLogged] = useState<boolean>(true);

  // Dance session active
  const [danceActive, setDanceActive] = useState<boolean>(false);

  // Guilt-Free Chill Timer
  const [chillActive, setChillActive] = useState<boolean>(false);
  const [chillSeconds, setChillSeconds] = useState<number>(90 * 60);

  // Night wind-down checklist
  const [checklist, setChecklist] = useState({
    screenDimming: true,
    gratitude: true,
    bagPacked: false,
  });

  // Meals list
  const [meals, setMeals] = useState<MealItem[]>([
    { id: '1', type: 'Breakfast', name: 'Healthy Poha & Eggs', time: 'Logged • 08:15 AM', status: 'logged' },
    { id: '2', type: 'Lunch', name: 'Mess Thali + Dal', time: 'Logged • 01:10 PM', status: 'logged' },
    { id: '3', type: 'Snack & Chai', name: 'Masala Chai & Walnuts', time: 'Bell at 05:45 PM', status: 'upcoming' },
    { id: '4', type: 'Dinner', name: 'Light Paneer Wrap', time: 'Scheduled • 08:00 PM', status: 'scheduled' },
  ]);

  // Chill timer tick
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (chillActive && chillSeconds > 0) {
      interval = setInterval(() => {
        setChillSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [chillActive, chillSeconds]);

  const handleAddWater = () => {
    if (waterIntake < maxWater) {
      const next = Math.min(maxWater, +(waterIntake + 0.25).toFixed(2));
      setWaterIntake(next);
      onTriggerToast(`+250ml added! Total: ${next}L / 3.0L 💧`, 'HYDRATION');
    } else {
      onTriggerToast('Optimal hydration achieved for today!', 'GOAL MET');
    }
  };

  const handleToggleMeal = (id: string) => {
    setMeals((prev) =>
      prev.map((meal) => {
        if (meal.id === id) {
          const nextStatus = meal.status === 'logged' ? 'scheduled' : 'logged';
          onTriggerToast(`${meal.type} ${nextStatus === 'logged' ? 'logged' : 'marked scheduled'}`, 'NUTRITION');
          return {
            ...meal,
            status: nextStatus,
            time: nextStatus === 'logged' ? 'Logged • Just now' : 'Scheduled • Soon',
          };
        }
        return meal;
      })
    );
  };

  const handleStartChill = () => {
    if (!chillActive) {
      setChillActive(true);
      onTriggerToast('90m Guilt-Free Pure Play started! Study thoughts banned 🛡️', 'CHILL MODE');
    } else {
      setChillActive(false);
      onTriggerToast('Guilt-free session paused', 'PAUSED');
    }
  };

  const chillMin = Math.floor(chillSeconds / 60);
  const chillSec = chillSeconds % 60;
  const loggedMealsCount = meals.filter((m) => m.status === 'logged').length;

  return (
    <div className="flex flex-col w-full px-4 pb-28 space-y-4 max-w-lg mx-auto">
      {/* Top Breathing Space & Micro-Motivational Tag */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-secondary animate-pulse" />
          <span className="font-label-badge text-xs text-secondary font-bold uppercase tracking-wider">
            Circadian Balance Active
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high shadow-xs border border-outline-variant/30">
          <span className="material-symbols-outlined text-[15px] text-tertiary">bedtime</span>
          <span className="font-label-time text-xs text-on-surface-variant font-medium">
            Reset in 5h 22m
          </span>
        </div>
      </div>

      {/* Holistic Life Adherence Card (Hero Meter) */}
      <section className="flex flex-col bg-surface-container rounded-2xl p-4 shadow-lg relative overflow-hidden border border-outline-variant/30">
        <div className="absolute -right-8 -top-8 w-36 h-36 bg-secondary/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-36 h-36 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start justify-between relative z-10">
          <div className="flex flex-col min-w-0 pr-2">
            <span className="font-label-badge text-xs uppercase tracking-wider text-secondary font-bold">
              Vital Signs of Life
            </span>
            <h2 className="font-headline text-xl text-on-surface font-bold mt-0.5">
              Holistic Adherence
            </h2>
            <p className="font-body text-xs text-on-surface-variant mt-1 leading-relaxed">
              High grades mean nothing if your spark fades out.
            </p>
          </div>

          {/* Radial Ring Score Indicator */}
          <div className="relative flex items-center justify-center shrink-0 w-20 h-20">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 72 72">
              <circle
                className="stroke-surface-container-highest"
                cx="36"
                cy="36"
                fill="transparent"
                r="30"
                strokeWidth="6"
              />
              <circle
                className="text-secondary transition-all duration-700 ease-out"
                cx="36"
                cy="36"
                fill="transparent"
                r="30"
                stroke="currentColor"
                strokeDasharray="188.4"
                strokeDashoffset="22.6"
                strokeLinecap="round"
                strokeWidth="6.5"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="font-metric-display text-lg text-on-surface font-bold leading-none tracking-tight">
                88<span className="text-xs font-normal text-secondary">%</span>
              </span>
              <span className="font-label-badge text-[9px] text-on-surface-variant uppercase mt-0.5 font-bold">
                Optimal
              </span>
            </div>
          </div>
        </div>

        {/* 4 Sub-Gauges Bento Strip */}
        <div className="grid grid-cols-4 gap-2 mt-4 pt-4 bg-surface-container-low/70 rounded-xl p-2.5 border border-outline-variant/30">
          {/* Body */}
          <div className="flex flex-col items-center text-center p-1">
            <div className="w-8 h-8 rounded-full bg-secondary-container/20 flex items-center justify-center mb-1 text-secondary">
              <span className="material-symbols-outlined text-[18px]">self_improvement</span>
            </div>
            <span className="font-label-badge text-xs text-on-surface font-semibold truncate w-full">
              Body
            </span>
            <div className="w-full bg-surface-container-highest h-1 rounded-full mt-1.5 overflow-hidden">
              <div className="bg-secondary h-full rounded-full" style={{ width: '95%' }} />
            </div>
            <span className="font-label-time text-[10px] text-secondary mt-1 font-bold">95%</span>
          </div>

          {/* Nutrition */}
          <div className="flex flex-col items-center text-center p-1">
            <div className="w-8 h-8 rounded-full bg-tertiary-container/20 flex items-center justify-center mb-1 text-tertiary">
              <span className="material-symbols-outlined text-[18px]">restaurant</span>
            </div>
            <span className="font-label-badge text-xs text-on-surface font-semibold truncate w-full">
              Nutrition
            </span>
            <div className="w-full bg-surface-container-highest h-1 rounded-full mt-1.5 overflow-hidden">
              <div className="bg-tertiary h-full rounded-full" style={{ width: '78%' }} />
            </div>
            <span className="font-label-time text-[10px] text-tertiary mt-1 font-bold">78%</span>
          </div>

          {/* Heart */}
          <div className="flex flex-col items-center text-center p-1">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mb-1 text-primary">
              <span className="material-symbols-outlined text-[18px]">favorite</span>
            </div>
            <span className="font-label-badge text-xs text-on-surface font-semibold truncate w-full">
              Heart
            </span>
            <div className="w-full bg-surface-container-highest h-1 rounded-full mt-1.5 overflow-hidden">
              <div className="bg-primary h-full rounded-full" style={{ width: '90%' }} />
            </div>
            <span className="font-label-time text-[10px] text-primary mt-1 font-bold">90%</span>
          </div>

          {/* Mind */}
          <div className="flex flex-col items-center text-center p-1">
            <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center mb-1 text-on-surface-variant">
              <span className="material-symbols-outlined text-[18px]">psychology</span>
            </div>
            <span className="font-label-badge text-xs text-on-surface font-semibold truncate w-full">
              Mind
            </span>
            <div className="w-full bg-surface-container-highest h-1 rounded-full mt-1.5 overflow-hidden">
              <div className="bg-primary-container h-full rounded-full" style={{ width: '84%' }} />
            </div>
            <span className="font-label-time text-[10px] text-on-surface-variant mt-1 font-bold">
              84%
            </span>
          </div>
        </div>
      </section>

      {/* Weekly Activity Trend (Recharts Stacked Category Distribution) */}
      <WeeklyActivityTrend />

      {/* Active Wellness Routines / Artistic Passion Hub */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[20px]">fitness_center</span>
            <h3 className="font-headline text-base text-on-surface font-bold">
              Passions & Motion
            </h3>
          </div>
          <span className="font-label-badge text-xs text-on-surface-variant font-bold">
            2 Sessions Today
          </span>
        </div>

        {/* Wellness Carousel / Stacked Active Cards */}
        <div className="flex flex-col gap-3">
          {/* Card 1: Morning Yoga Flow */}
          <div
            className={`bg-surface-container-low rounded-2xl p-4 shadow-xs flex flex-col gap-2 transition-all duration-300 border border-outline-variant/30 ${
              !yogaLogged ? 'opacity-70' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="relative shrink-0 w-16 h-16 rounded-xl overflow-hidden shadow-xs">
                <img
                  className="w-full h-full object-cover"
                  alt="Morning yoga posture"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC7U_vVYVhLV-XjIEWOT_1psFNYyEA_OiYcasfCtZqvDQlkkukLVQ3zoO7Wv4AN_U6lyrGv9l-CcRc3-IVN3DmS4sC1VG_L2Mi49Psd6qsyleI-7PWVNGOzb4guxRMdrqE7LrbLFKjriEbeGOkR0ZiuZdGVvcz6H0tto1AoHwG5W_XHhyE--mfUjOqtA0hdzW-tvmySJAfDOQvwF_hx1lC_gjdvFAtfyFRnHRGiFGrnZW1yLs-UoleU"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-1 left-1.5 flex items-center text-[10px] text-white font-label-time font-bold">
                  45m
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full bg-secondary-container/20 text-secondary text-[11px] font-label-badge font-bold">
                    {yogaLogged ? 'Completed' : 'Skipped'}
                  </span>
                  <div className="flex items-center gap-1 text-tertiary">
                    <span className="text-xs">🔥</span>
                    <span className="font-label-time text-xs font-bold">8d Streak</span>
                  </div>
                </div>
                <h4 className="font-headline text-sm text-on-surface font-bold truncate mt-1">
                  Morning Yoga Flow
                </h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="material-symbols-outlined text-[14px] text-on-surface-variant">
                    schedule
                  </span>
                  <span className="font-label-time text-xs text-on-surface-variant">
                    07:00 AM – 07:45 AM
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="font-body text-xs text-on-surface-variant italic">
                Refueled posture for library desks
              </span>
              <button
                type="button"
                onClick={() => {
                  setYogaLogged(!yogaLogged);
                  onTriggerToast(
                    yogaLogged ? 'Yoga session marked as pending' : 'Morning Yoga Flow logged! 🧘‍♀️',
                    'FLOW'
                  );
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer border ${
                  yogaLogged
                    ? 'bg-surface-container-highest border-secondary/40 text-secondary font-bold'
                    : 'bg-surface-container-high border-outline-variant/40 text-on-surface-variant'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {yogaLogged ? 'check_circle' : 'restart_alt'}
                </span>
                <span>{yogaLogged ? 'Logged' : 'Log Session'}</span>
              </button>
            </div>
          </div>

          {/* Card 2: Contemporary Dance / Choreography Rehearsal */}
          <div className="bg-surface-container-low rounded-2xl p-4 shadow-xs flex flex-col gap-2 relative overflow-hidden border border-outline-variant/30">
            <div className="absolute -right-12 top-0 w-28 h-28 bg-primary-container/10 rounded-full blur-xl pointer-events-none" />

            <div className="flex items-start gap-3">
              <div className="relative shrink-0 w-16 h-16 rounded-xl overflow-hidden shadow-xs">
                <img
                  className="w-full h-full object-cover"
                  alt="Contemporary choreography"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCuoKNFt3v5Z9nstIS488vht0ODcrUknRvjOob0yNBlS1q82F15fG2o98FjdgTP2zEGLd75JnwopOev95pbJgiZgRitqhanca3yJ7NQz3aAuJq6QbN_wUpbhu_rrZNkFHcSmTLhtZZjwaoyGNUg0BXFCIyZbucweHh3esnk_NxvkO0vfGz08VBlUrb1eIhV6oBRWbG3Vz4FNCff309M2Eu281cSE73VkKbgRMTKvO4spWJmLW2Zg19-"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-1 left-1.5 flex items-center text-[10px] text-white font-label-time font-bold">
                  60m
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[11px] font-label-badge font-bold">
                    Up Next • 4:45 PM
                  </span>
                  <span className="font-label-time text-xs text-secondary font-bold flex items-center gap-1">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-secondary animate-ping" />
                    Live Studio
                  </span>
                </div>
                <h4 className="font-headline text-sm text-on-surface font-bold truncate mt-1">
                  Contemporary Choreography
                </h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="material-symbols-outlined text-[14px] text-on-surface-variant">
                    schedule
                  </span>
                  <span className="font-label-time text-xs text-on-surface-variant">
                    04:45 PM – 05:45 PM
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-2 min-w-0">
                <button
                  type="button"
                  onClick={() => onTriggerToast("Playing Spotify set 'Echoes Set' 🎧", 'MUSIC')}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-surface-container-highest text-on-surface text-xs font-semibold hover:bg-surface-container active:scale-95 transition-all border border-outline-variant/30 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px] text-tertiary">
                    music_note
                  </span>
                  <span className="truncate">Echoes Set</span>
                </button>

                <div className="inline-flex items-center gap-1 px-2 py-1.5 rounded-xl bg-surface-container-highest text-on-surface text-xs font-semibold border border-outline-variant/30">
                  <span className="material-symbols-outlined text-[15px] text-primary">
                    pin_drop
                  </span>
                  <span>Hall B</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setDanceActive(!danceActive);
                  onTriggerToast(
                    danceActive ? 'Rehearsal concluded' : 'Dance warmup active! Pure endorphin reset 💃',
                    'DANCE'
                  );
                }}
                className="px-3.5 py-1.5 rounded-xl bg-primary text-on-primary text-xs font-bold shadow-xs active:scale-95 transition-all shrink-0 cursor-pointer hover:bg-primary/95"
              >
                {danceActive ? 'In Rehearsal' : 'Start Now'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Food & Hydration Tracker Strip */}
      <section className="flex flex-col bg-surface-container rounded-2xl p-4 shadow-md gap-3 border border-outline-variant/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary text-[20px]">local_cafe</span>
            <h3 className="font-headline text-base text-on-surface font-bold">
              Nourish & Hydrate
            </h3>
          </div>
          <span className="font-label-time text-xs text-tertiary font-bold">
            {loggedMealsCount} / {meals.length} Meals
          </span>
        </div>

        {/* Meals Timeline Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {meals.map((meal) => {
            const isLogged = meal.status === 'logged';
            return (
              <div
                key={meal.id}
                onClick={() => handleToggleMeal(meal.id)}
                className={`p-3 rounded-xl flex flex-col justify-between relative overflow-hidden border border-outline-variant/30 transition cursor-pointer ${
                  isLogged ? 'bg-surface-container-low shadow-xs' : 'bg-surface-container-high'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-label-badge text-[10px] text-on-surface-variant uppercase font-bold">
                    {meal.type}
                  </span>
                  <span
                    className={`material-symbols-outlined text-[16px] ${
                      isLogged ? 'text-secondary' : 'text-tertiary animate-pulse'
                    }`}
                  >
                    {isLogged ? 'check_circle' : 'schedule'}
                  </span>
                </div>
                <p className="font-headline text-xs font-bold text-on-surface mt-2 truncate">
                  {meal.name}
                </p>
                <span className="font-label-time text-[10px] text-on-surface-variant mt-0.5">
                  {meal.time}
                </span>
              </div>
            );
          })}
        </div>

        {/* Hydration Real-Time Interactive Bar */}
        <div className="p-3.5 rounded-xl bg-surface-container-lowest flex flex-col gap-2 border border-outline-variant/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[20px]">
                water_drop
              </span>
              <span className="font-headline text-xs font-bold text-on-surface">
                Water Intake
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-metric-display text-base text-secondary font-bold">
                {waterIntake.toFixed(2)}
              </span>
              <span className="font-label-time text-xs text-on-surface-variant">
                / {maxWater.toFixed(1)}L
              </span>
            </div>
          </div>

          {/* Progress Meter */}
          <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden p-0.5 border border-outline-variant/20">
            <div
              className="bg-secondary h-full rounded-full transition-all duration-500 shadow-xs"
              style={{ width: `${Math.min(100, (waterIntake / maxWater) * 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between mt-0.5">
            <span className="font-body text-xs text-on-surface-variant">
              {waterIntake >= maxWater
                ? 'Target achieved!'
                : `${Math.round(((maxWater - waterIntake) / 0.25))} sips away from focus target`}
            </span>
            <button
              type="button"
              onClick={handleAddWater}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary/20 text-secondary text-xs font-bold active:scale-95 transition-all cursor-pointer border border-secondary/30"
            >
              <span className="material-symbols-outlined text-[15px]">add</span>
              <span>+250ml</span>
            </button>
          </div>
        </div>

        {/* Periodic Habit Reminders System */}
        <HabitReminderControlCard
          onTriggerToast={onTriggerToast}
          onSendTestReminder={onSendHabitReminder}
        />
      </section>

      {/* Emotional Ties & Downtime Center */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">
              favorite_border
            </span>
            <h3 className="font-headline text-base text-on-surface font-bold">
              Emotional & Downtime
            </h3>
          </div>
          <span className="font-label-badge text-xs text-primary font-bold">
            Anti-Burnout Zone
          </span>
        </div>

        {/* Family Call Routine Card */}
        <div className="bg-surface-container-low rounded-2xl p-4 shadow-xs flex items-center justify-between gap-3 border border-outline-variant/30">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <img
                className="w-12 h-12 rounded-full object-cover ring-1 ring-secondary"
                alt="Loving parents smiling warmly"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBXpy0Ch5bQ0OF0gK1GhIG0Fr_4CXF4hvaO16lZmGFDBlYwGZu0pGJIieXegddwjLgAFuZr0t-RcqzU9pju3uIaLW2S1RD4WvGQVPOGLJtwJrcp73DdVocJnoMUU0f3dtZoAA3f_yfvFV7GTFPM-jaGQ0v9at-1IusaJWX8zclw7foAUWixNUf6ZpE5KejdAXkTLmlW4bhHoi8O60w-uJSwZJE4K-0_qYyezCqjVheVKb6HPcIkmLkb"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-secondary flex items-center justify-center text-[9px] text-white font-bold">
                ✓
              </div>
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="font-headline text-sm font-bold text-on-surface truncate">
                  Call Mom & Dad
                </h4>
                <span className="font-label-time text-[11px] text-tertiary font-bold">
                  🔥 12d
                </span>
              </div>
              <span className="font-label-time text-xs text-on-surface-variant truncate">
                Scheduled: 07:15 PM • 15 min
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => onTriggerToast('Connecting quick call with parents 📞', 'FAMILY')}
              className="w-10 h-10 rounded-xl bg-surface-container-highest flex items-center justify-center text-primary active:scale-90 transition-all shadow-xs border border-outline-variant/30 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">call</span>
            </button>
            <button
              type="button"
              onClick={() => onTriggerToast('Opening family message check-in', 'MESSAGE')}
              className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center text-secondary active:scale-90 transition-all shadow-xs border border-secondary/30 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">chat</span>
            </button>
          </div>
        </div>

        {/* Guilt-Free Recharge Time Banner */}
        <div className="bg-surface-container rounded-2xl p-4 shadow-md relative overflow-hidden flex flex-col gap-2.5 border border-outline-variant/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-tertiary-container/30 text-tertiary font-label-badge text-[10px] font-bold">
                UNLOCKED
              </span>
              <span className="font-label-time text-xs text-on-surface-variant font-medium">
                Earned by 4h Deep Work
              </span>
            </div>
            <div className="flex items-center gap-1 text-primary">
              <span className="material-symbols-outlined text-[18px]">sports_esports</span>
              <span className="material-symbols-outlined text-[18px]">movie</span>
            </div>
          </div>

          <div className="flex flex-col mt-0.5">
            <h4 className="font-headline text-lg font-bold text-on-surface">
              90 Min Pure Play
            </h4>
            <p className="font-body text-xs text-on-surface-variant mt-0.5">
              Gaming, Netflix, or campus stroll without academic guilt.
            </p>
          </div>

          {/* Strict Warning Pill */}
          <div className="flex items-center gap-2 py-2 px-3 rounded-xl bg-surface-container-lowest border border-error/20">
            <span className="text-sm">🛡️</span>
            <span className="font-body text-xs text-error font-semibold truncate">
              Rule: Study thoughts strictly banned until 10:00 PM!
            </span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5 text-on-surface-variant font-label-time text-xs font-semibold">
              <span className="material-symbols-outlined text-[16px] text-tertiary">timer</span>
              <span>
                {chillActive
                  ? `${chillMin}m ${String(chillSec).padStart(2, '0')}s remaining`
                  : 'Ready whenever you are'}
              </span>
            </div>
            <button
              type="button"
              onClick={handleStartChill}
              className={`px-4 py-2 rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer ${
                chillActive
                  ? 'bg-secondary text-on-secondary'
                  : 'bg-tertiary text-on-tertiary hover:opacity-95'
              }`}
            >
              {chillActive ? 'Enjoying Chill...' : 'Start Guilt-Free Time'}
            </button>
          </div>
        </div>
      </section>

      {/* Bedtime Circadian Ritual Card */}
      <section className="flex flex-col bg-surface-container-low rounded-2xl p-4 shadow-md gap-3 border border-outline-variant/30">
        <div className="flex items-start justify-between">
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">
                nightlight
              </span>
              <h3 className="font-headline text-base text-on-surface font-bold">
                Circadian Wind-Down
              </h3>
            </div>
            <p className="font-body text-xs text-on-surface-variant mt-0.5">
              Target: 10:45 PM – 06:30 AM (7h 45m restorative sleep)
            </p>
          </div>
          <div className="px-2.5 py-1 rounded-full bg-primary/10 text-primary font-label-time text-[11px] font-bold shrink-0 border border-primary/20">
            Sleep Sync
          </div>
        </div>

        {/* Night Routine Interactive Checklist */}
        <div className="flex flex-col gap-2">
          {/* Item 1 */}
          <label className="flex items-center justify-between p-3 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors cursor-pointer border border-outline-variant/30">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-md bg-surface-container-highest flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[15px]">brightness_medium</span>
              </div>
              <span className="font-body text-xs text-on-surface font-semibold">
                Screen Dimming & Warm Light Filter
              </span>
            </div>
            <input
              type="checkbox"
              checked={checklist.screenDimming}
              onChange={() =>
                setChecklist({ ...checklist, screenDimming: !checklist.screenDimming })
              }
              className="w-4 h-4 rounded accent-primary cursor-pointer"
            />
          </label>

          {/* Item 2 */}
          <label className="flex items-center justify-between p-3 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors cursor-pointer border border-outline-variant/30">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-md bg-surface-container-highest flex items-center justify-center text-tertiary">
                <span className="material-symbols-outlined text-[15px]">edit_note</span>
              </div>
              <span className="font-body text-xs text-on-surface font-semibold">
                Journal 3 Daily Gratitude Points
              </span>
            </div>
            <input
              type="checkbox"
              checked={checklist.gratitude}
              onChange={() => setChecklist({ ...checklist, gratitude: !checklist.gratitude })}
              className="w-4 h-4 rounded accent-primary cursor-pointer"
            />
          </label>

          {/* Item 3 */}
          <label className="flex items-center justify-between p-3 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors cursor-pointer border border-outline-variant/30">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-md bg-surface-container-highest flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[15px]">backpack</span>
              </div>
              <span className="font-body text-xs text-on-surface font-semibold">
                Bag packed for 9:00 AM lecture
              </span>
            </div>
            <input
              type="checkbox"
              checked={checklist.bagPacked}
              onChange={() => setChecklist({ ...checklist, bagPacked: !checklist.bagPacked })}
              className="w-4 h-4 rounded accent-primary cursor-pointer"
            />
          </label>
        </div>

        {/* Sleep Quality Ambient Quote Card */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-lowest/80 border border-outline-variant/30">
          <span className="text-xl">🌙</span>
          <p className="font-body text-xs text-on-surface-variant italic leading-relaxed">
            "Your memory consolidation happens during REM, not in 2:00 AM panic cramming."
          </p>
        </div>
      </section>
    </div>
  );
};
