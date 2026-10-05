/**
 * Browser-based notification & audio chime engine for High Focus tasks
 */

export interface HighFocusAlert {
  id: string;
  taskId: string;
  taskTitle: string;
  taskSubtitle: string;
  scheduledTime: string;
  timestamp: number;
}

class NotificationService {
  private permission: NotificationPermission = 'default';

  constructor() {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  public getPermission(): NotificationPermission {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'denied';
  }

  public async requestPermission(): Promise<NotificationPermission> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }

    try {
      const perm = await Notification.requestPermission();
      this.permission = perm;
      return perm;
    } catch {
      return 'denied';
    }
  }

  public playChime() {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Two-tone gentle crystal chime (E5 -> B5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, now); // E5
      gain1.gain.setValueAtTime(0.01, now);
      gain1.gain.exponentialRampToValueAtTime(0.2, now + 0.05);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.8);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(987.77, now + 0.2); // B5
      gain2.gain.setValueAtTime(0.01, now + 0.2);
      gain2.gain.exponentialRampToValueAtTime(0.25, now + 0.25);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.2);
      osc2.stop(now + 1.2);
    } catch {
      // AudioContext unavailable or blocked by autoplay
    }
  }

  public sendNativeNotification(
    title: string,
    body: string,
    onClick?: () => void
  ) {
    this.playChime();

    if (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'granted'
    ) {
      try {
        const notif = new Notification(title, {
          body,
          icon: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCayNi1BFH724qlxf7hz_n3e0GI2jhwA4mwNEavQ5nwuhi8KJRgHpIGHTDJnzwR7OK_zek-1JHibL5lH_WYnsjE1Ru2n7-JRNBKk7iIbY9lifiq3Z6C56oGCrv0CMhYTZNLpYTLVFQ1el_ampQCyzOOKlcX8NGIEApVRMzQ7EmAPV-9e3HUJ2VC0hzOCl7AttqLhQQTSfz4gT-6P08Fr8wwVmVRAUGgmtkG0Iy3WFAF0yH0qpj1q38X',
          badge: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCayNi1BFH724qlxf7hz_n3e0GI2jhwA4mwNEavQ5nwuhi8KJRgHpIGHTDJnzwR7OK_zek-1JHibL5lH_WYnsjE1Ru2n7-JRNBKk7iIbY9lifiq3Z6C56oGCrv0CMhYTZNLpYTLVFQ1el_ampQCyzOOKlcX8NGIEApVRMzQ7EmAPV-9e3HUJ2VC0hzOCl7AttqLhQQTSfz4gT-6P08Fr8wwVmVRAUGgmtkG0Iy3WFAF0yH0qpj1q38X',
          silent: false,
        });

        if (onClick) {
          notif.onclick = () => {
            window.focus();
            onClick();
            notif.close();
          };
        }
      } catch {
        // Fallback handled via in-app banner
      }
    }
  }
}

export const notificationService = new NotificationService();
