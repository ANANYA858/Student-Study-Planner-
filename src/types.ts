export type TabType = 'today' | 'schedule' | 'exam-prep' | 'balance';

export interface TimeSlot {
  id: string;
  time: string;
  duration: string;
  title: string;
  subtitle: string;
  category: 'Academics' | 'High Focus' | 'Wellness' | 'Nutrition & Move' | 'Hobby & Passion' | 'Free Time' | 'Family' | 'Nutrition' | 'Review' | 'Rest' | 'Done';
  completed: boolean;
  tag?: string;
  badge?: string;
  color?: string;
}

export interface WellbeingItem {
  id: string;
  emoji: string;
  title: string;
  duration: string;
  selected: boolean;
}

export interface PunchItem {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  completed: boolean;
  metric?: string;
}

export interface MealItem {
  id: string;
  type: 'Breakfast' | 'Lunch' | 'Snack & Chai' | 'Dinner';
  name: string;
  time: string;
  status: 'logged' | 'upcoming' | 'scheduled';
}
