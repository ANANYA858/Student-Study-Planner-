import React, { useState, useEffect } from 'react';
import { TabType, TimeSlot } from './types';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { ProfileModal } from './components/ProfileModal';
import { QuickAddModal } from './components/QuickAddModal';
import { Toast } from './components/Toast';
import { NotificationAlertBanner } from './components/NotificationAlertBanner';
import { NotificationSettingsModal } from './components/NotificationSettingsModal';
import { HabitReminderBanner } from './components/HabitReminderBanner';
import { PomodoroTimerModal } from './components/PomodoroTimerModal';
import { StopwatchModal } from './components/StopwatchModal';
import { GeminiChatModal } from './components/GeminiChatModal';
import { notificationService, HighFocusAlert } from './utils/notifications';
import { habitReminderService, MicroHabit } from './utils/habitReminders';

// Tab screens
import { TodayTab } from './components/tabs/TodayTab';
import { ScheduleTab } from './components/tabs/ScheduleTab';
import { ExamPrepTab } from './components/tabs/ExamPrepTab';
import { BalanceTab } from './components/tabs/BalanceTab';

const INITIAL_SLOTS: TimeSlot[] = [
  {
    id: '1',
    time: '06:30',
    duration: '',
    title: 'Wake up & Sunrise Hydration',
    subtitle: '500ml water + morning light view',
    category: 'Nutrition & Move',
    completed: true,
    badge: 'Done',
  },
  {
    id: '2',
    time: '07:00',
    duration: '60m',
    title: 'Vinyasa Yoga & Breathwork',
    subtitle: 'Sun Salutations & 10m Box Breath',
    category: 'Wellness',
    completed: true,
    badge: 'Wellness',
  },
  {
    id: '3',
    time: '08:15',
    duration: '30m',
    title: 'High-Protein Breakfast 🍳',
    subtitle: 'Oats, eggs, chia seeds, green tea',
    category: 'Nutrition',
    completed: true,
    badge: 'Done',
  },
  {
    id: '4',
    time: '09:00',
    duration: '3h 30m',
    title: 'University Lectures',
    subtitle: 'Algorithms, Distributed Systems & Lab',
    category: 'Academics',
    completed: false,
    badge: 'Academics',
    tag: 'Block 2 of 3 in progress • Ends 12:30',
  },
  {
    id: '5',
    time: '12:30',
    duration: '60m',
    title: 'Campus Lunch + 20-min Power Walk',
    subtitle: 'North Lawn stroll + healthy bowl',
    category: 'Nutrition & Move',
    completed: false,
    badge: 'Nutrition & Move',
  },
  {
    id: '6',
    time: '14:00',
    duration: '2h 30m',
    title: 'Gov Exam Prep (SSC CGL)',
    subtitle: 'Quantitative Aptitude, General Studies & Mock Set 4',
    category: 'High Focus',
    completed: false,
    badge: 'High Focus',
    tag: 'Gov Exam Deep Work • Target: 40 questions',
  },
  {
    id: '7',
    time: '16:45',
    duration: '60m',
    title: 'Hip-Hop Dance Studio / Fitness 🕺',
    subtitle: 'Choreography set at Student Center',
    category: 'Hobby & Passion',
    completed: false,
    badge: 'Hobby & Passion',
  },
  {
    id: '8',
    time: '18:00',
    duration: '60m',
    title: 'Guilt-Free Downtime & Friends',
    subtitle: 'Coffee with study group at Cafe Nero',
    category: 'Free Time',
    completed: false,
    badge: 'Free Time',
  },
  {
    id: '9',
    time: '19:15',
    duration: '30m',
    title: 'Daily Call with Parents 📞',
    subtitle: 'Family check-in & home updates',
    category: 'Family',
    completed: false,
    badge: 'Family',
  },
  {
    id: '10',
    time: '20:00',
    duration: '45m',
    title: 'Dinner & Digital Pause',
    subtitle: 'Screen-free nourishment & podcasts',
    category: 'Nutrition',
    completed: false,
    badge: 'Nutrition',
  },
  {
    id: '11',
    time: '21:00',
    duration: '90m',
    title: 'Light University Revision',
    subtitle: 'Summary flashcards & pack bag for Tue',
    category: 'Review',
    completed: false,
    badge: 'Review',
  },
  {
    id: '12',
    time: '22:45',
    duration: '',
    title: 'Night Wind-Down & Bedtime Ritual',
    subtitle: 'Warm shower, fiction reading, 8h sleep goal',
    category: 'Rest',
    completed: false,
    badge: 'Rest',
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('today');
  const [slots, setSlots] = useState<TimeSlot[]>(() => {
    const saved = localStorage.getItem('synclife_slots');
    return saved ? JSON.parse(saved) : INITIAL_SLOTS;
  });

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isNotificationSettingsOpen, setIsNotificationSettingsOpen] = useState(false);
  const [isStopwatchOpen, setIsStopwatchOpen] = useState(false);
  const [isGeminiChatOpen, setIsGeminiChatOpen] = useState(false);
  const [activeAlert, setActiveAlert] = useState<HighFocusAlert | null>(null);
  const [activeHabitReminder, setActiveHabitReminder] = useState<MicroHabit | null>(null);
  const [selectedPomodoroTask, setSelectedPomodoroTask] = useState<TimeSlot | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastBadge, setToastBadge] = useState<string>('SYNCED');

  // Persist time slots
  useEffect(() => {
    localStorage.setItem('synclife_slots', JSON.stringify(slots));
  }, [slots]);

  const triggerToast = (message: string, badge: string = 'SYNCED') => {
    setToastMessage(message);
    setToastBadge(badge);
    setTimeout(() => {
      setToastMessage((current) => (current === message ? null : current));
    }, 3200);
  };

  // Trigger habit reminder
  const triggerHabitReminder = (specificHabit?: MicroHabit) => {
    const settings = habitReminderService.getSettings();
    const habit =
      specificHabit ||
      settings.habits.find((h) => h.enabled) ||
      settings.habits[0];

    setActiveHabitReminder(habit);
    habitReminderService.sendHabitPush(habit);
  };

  const handleCompleteHabit = (habit: MicroHabit) => {
    setActiveHabitReminder(null);
    if (habit.id === 'hydration') {
      triggerToast('+250ml water logged! Target progressing 💧', 'HYDRATED');
    } else if (habit.id === 'stretching') {
      triggerToast('Posture refreshed! Spinal tension relieved 🧘', 'STRETCHED');
    } else {
      triggerToast(`${habit.title} completed! ✨`, 'COMPLETED');
    }
  };

  const handleSnoozeHabit = (habit: MicroHabit) => {
    setActiveHabitReminder(null);
    triggerToast(`Reminder for ${habit.title} snoozed`, 'SNOOZED');
    setTimeout(() => {
      triggerHabitReminder(habit);
    }, 6000);
  };

  // Trigger high focus push notification alert
  const triggerHighFocusAlert = (targetSlot?: TimeSlot) => {
    const task =
      targetSlot ||
      slots.find((s) => s.category === 'High Focus' && !s.completed) ||
      slots.find((s) => s.category === 'High Focus') ||
      slots[0];

    const alert: HighFocusAlert = {
      id: String(Date.now()),
      taskId: task.id,
      taskTitle: task.title,
      taskSubtitle: task.subtitle,
      scheduledTime: task.time || '14:00 PM',
      timestamp: Date.now(),
    };

    setActiveAlert(alert);

    // Trigger audio chime & native web push
    notificationService.sendNativeNotification(
      `⚡ High Focus Alert: ${task.title}`,
      `Starting now (${task.time}): ${task.subtitle}. Ready for deep focus?`,
      () => {
        setSelectedPomodoroTask(task);
      }
    );
  };

  const handleSnoozeAlert = (alert: HighFocusAlert) => {
    setActiveAlert(null);
    triggerToast('Alert snoozed for 5 minutes', 'SNOOZED');
    setTimeout(() => {
      const task = slots.find((s) => s.id === alert.taskId) || slots[0];
      triggerHighFocusAlert(task);
    }, 5000);
  };

  const handleStartPomodoroFromAlert = (taskId: string) => {
    const task = slots.find((s) => s.id === taskId);
    if (task) {
      setSelectedPomodoroTask(task);
      setActiveAlert(null);
    }
  };

  const handleToggleSlot = (id: string) => {
    setSlots((prev) =>
      prev.map((slot) => {
        if (slot.id === id) {
          const next = !slot.completed;
          triggerToast(
            next ? `Marked "${slot.title}" as complete!` : `Unmarked "${slot.title}"`,
            next ? 'COMPLETED' : 'REVERTED'
          );
          return { ...slot, completed: next };
        }
        return slot;
      })
    );
  };

  const handleAddSlot = (newSlotData: Omit<TimeSlot, 'id' | 'completed'>) => {
    const newSlot: TimeSlot = {
      ...newSlotData,
      id: String(Date.now()),
      completed: false,
    };
    setSlots((prev) => [newSlot, ...prev]);
    triggerToast(`Added "${newSlot.title}" to schedule`, 'ADDED');
  };

  const handleApplyToSchedule = () => {
    setActiveTab('today');
    triggerToast('Generated routine applied to Today flow!', 'SYNCED');
  };

  return (
    <div className="min-h-screen bg-[#0f131d] flex flex-col items-center justify-start selection:bg-primary-container selection:text-on-primary-container">
      {/* Centered Device Canvas */}
      <div className="w-full max-w-[440px] min-h-screen bg-surface text-on-surface shadow-2xl relative flex flex-col overflow-x-hidden">
        {/* Sticky App Header */}
        <Header
          activeTab={activeTab}
          onOpenProfile={() => setIsProfileOpen(true)}
          onOpenNotifications={() => setIsNotificationSettingsOpen(true)}
          onOpenStopwatch={() => setIsStopwatchOpen(true)}
          onOpenGemini={() => setIsGeminiChatOpen(true)}
        />

        {/* High Focus Proactive Browser Push Alert Banner */}
        <NotificationAlertBanner
          alert={activeAlert}
          onDismiss={() => setActiveAlert(null)}
          onStartPomodoro={handleStartPomodoroFromAlert}
          onSnooze={handleSnoozeAlert}
        />

        {/* Gentle Habit Reminder Banner (Hydration, Stretch, Eye Rest) */}
        <HabitReminderBanner
          habit={activeHabitReminder}
          onDismiss={() => setActiveHabitReminder(null)}
          onCompleteHabit={handleCompleteHabit}
          onSnooze={handleSnoozeHabit}
        />

        {/* Screen Content Render */}
        <main className="flex-1 w-full flex flex-col pt-2">
          {activeTab === 'today' && (
            <TodayTab
              slots={slots}
              onToggleSlot={handleToggleSlot}
              onOpenAddModal={() => setIsAddModalOpen(true)}
              onTriggerToast={triggerToast}
            />
          )}

          {activeTab === 'schedule' && (
            <ScheduleTab
              onTriggerToast={triggerToast}
              onApplyToSchedule={handleApplyToSchedule}
            />
          )}

          {activeTab === 'exam-prep' && (
            <ExamPrepTab onTriggerToast={triggerToast} />
          )}

          {activeTab === 'balance' && (
            <BalanceTab
              onTriggerToast={triggerToast}
              onSendHabitReminder={(h) => triggerHabitReminder(h)}
            />
          )}
        </main>

        {/* Fixed Ergonomic Bottom Navigation */}
        <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} />

        {/* Global Toast Notification */}
        <Toast
          message={toastMessage}
          badge={toastBadge}
          onClose={() => setToastMessage(null)}
        />

        {/* Student Profile & Flow Analytics Modal */}
        <ProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          onTriggerToast={triggerToast}
          slots={slots}
          onSlotsUpdated={(updated) => setSlots(updated)}
        />

        {/* SyncLife Gemini AI Multimodal Mentor Modal */}
        <GeminiChatModal
          isOpen={isGeminiChatOpen}
          onClose={() => setIsGeminiChatOpen(false)}
          onTriggerToast={triggerToast}
        />

        {/* High Focus Alert System Settings & Simulator Modal */}
        <NotificationSettingsModal
          isOpen={isNotificationSettingsOpen}
          onClose={() => setIsNotificationSettingsOpen(false)}
          onTriggerTestAlert={() => triggerHighFocusAlert()}
          onTriggerTestHabit={() => triggerHabitReminder()}
          onTriggerToast={triggerToast}
        />

        {/* Integrated Pomodoro Focus Session from Notifications or Cards */}
        <PomodoroTimerModal
          isOpen={Boolean(selectedPomodoroTask)}
          task={selectedPomodoroTask}
          onClose={() => setSelectedPomodoroTask(null)}
          onSwitchToStopwatch={() => setIsStopwatchOpen(true)}
          onCompleteTask={(taskId) => {
            const task = slots.find((s) => s.id === taskId);
            if (task && !task.completed) {
              handleToggleSlot(taskId);
            }
          }}
          onTriggerToast={triggerToast}
        />

        {/* High-Precision Stopwatch Modal */}
        <StopwatchModal
          isOpen={isStopwatchOpen}
          onClose={() => setIsStopwatchOpen(false)}
          slots={slots}
          onTriggerToast={triggerToast}
          onLogCompletedFocus={(mins, taskTitle) => {
            triggerToast(`Logged ${mins}m focus to "${taskTitle}"! ⏱️`, 'STOPWATCH');
          }}
        />

        {/* Quick Add Slot Modal */}
        <QuickAddModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAddSlot={handleAddSlot}
        />
      </div>
    </div>
  );
}
