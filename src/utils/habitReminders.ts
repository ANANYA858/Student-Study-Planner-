/**
 * Habit Reminders Engine for non-task items like hydration, stretching, and eye rest.
 */

export interface MicroHabit {
  id: string;
  title: string;
  actionText: string;
  icon: string;
  emoji: string;
  enabled: boolean;
  benefit: string;
}

export interface HabitReminderSettings {
  masterEnabled: boolean;
  intervalMinutes: number;
  habits: MicroHabit[];
  lastTriggered?: number;
}

export const DEFAULT_HABITS: MicroHabit[] = [
  {
    id: 'hydration',
    title: 'Hydration Sip',
    actionText: 'Drink 250ml of water to restore cognitive flow',
    icon: 'water_drop',
    emoji: '💧',
    enabled: true,
    benefit: 'Combats afternoon brain fog & headaches',
  },
  {
    id: 'stretching',
    title: 'Spine & Neck Stretch',
    actionText: '60s shoulder rolls & spinal extension',
    icon: 'accessibility_new',
    emoji: '🧘',
    enabled: true,
    benefit: 'Relieves desk tension & cervical stiffness',
  },
  {
    id: 'eye-rest',
    title: '20-20-20 Eye Rest',
    actionText: 'Look 20 feet away for 20 seconds',
    icon: 'visibility',
    emoji: '👀',
    enabled: true,
    benefit: 'Resets optic accommodation & prevents digital fatigue',
  },
  {
    id: 'box-breath',
    title: 'Box Breathing Reset',
    actionText: '4s inhale, 4s hold, 4s exhale, 4s hold',
    icon: 'air',
    emoji: '🫁',
    enabled: false,
    benefit: 'Downregulates sympathetic nervous system / cortisol',
  },
];

export const DEFAULT_SETTINGS: HabitReminderSettings = {
  masterEnabled: true,
  intervalMinutes: 45,
  habits: DEFAULT_HABITS,
};

class HabitReminderService {
  private settings: HabitReminderSettings = DEFAULT_SETTINGS;

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('synclife_habit_reminder_settings');
      if (saved) {
        try {
          this.settings = JSON.parse(saved);
        } catch {
          this.settings = DEFAULT_SETTINGS;
        }
      }
    }
  }

  public getSettings(): HabitReminderSettings {
    return this.settings;
  }

  public saveSettings(settings: HabitReminderSettings) {
    this.settings = settings;
    if (typeof window !== 'undefined') {
      localStorage.setItem('synclife_habit_reminder_settings', JSON.stringify(settings));
    }
  }

  // Play soothing water droplet chime using Web Audio API
  public playDropletChime() {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Soft water plop / harmonic drop (C6 -> G6)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1046.5, now); // C6
      osc.frequency.exponentialRampToValueAtTime(1567.98, now + 0.08); // pitch bend up
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.3); // settle down

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.exponentialRampToValueAtTime(0.18, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.6);
    } catch {
      // AudioContext unavailable
    }
  }

  public sendHabitPush(habit: MicroHabit) {
    this.playDropletChime();

    if (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'granted'
    ) {
      try {
        new Notification(`SyncLife • ${habit.emoji} ${habit.title}`, {
          body: `${habit.actionText} — ${habit.benefit}`,
          icon: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCayNi1BFH724qlxf7hz_n3e0GI2jhwA4mwNEavQ5nwuhi8KJRgHpIGHTDJnzwR7OK_zek-1JHibL5lH_WYnsjE1Ru2n7-JRNBKk7iIbY9lifiq3Z6C56oGCrv0CMhYTZNLpYTLVFQ1el_ampQCyzOOKlcX8NGIEApVRMzQ7EmAPV-9e3HUJ2VC0hzOCl7AttqLhQQTSfz4gT-6P08Fr8wwVmVRAUGgmtkG0Iy3WFAF0yH0qpj1q38X',
          silent: false,
        });
      } catch {
        // Fallback handled via in-app banner
      }
    }
  }
}

export const habitReminderService = new HabitReminderService();
