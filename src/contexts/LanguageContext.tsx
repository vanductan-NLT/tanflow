import React, { createContext, useContext, ReactNode } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

type Language = 'en' | 'vi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Header
    'app.name': 'FocusFlow',
    
    // Timer modes
    'timer.pomodoro': 'Focus',
    'timer.shortBreak': 'Short Break',
    'timer.longBreak': 'Long Break',
    'timer.meditation': 'Meditation',
    'timer.start': 'Start',
    'timer.pause': 'Pause',
    'timer.skip': 'Skip',
    'timer.longBreakAfter': 'Long break after every',
    'timer.cycles': 'cycles',
    
    // Tasks
    'tasks.title': 'Tasks',
    'tasks.active': 'Active',
    'tasks.add': 'Add Task',
    'tasks.addNew': 'Add new task',
    'tasks.name': 'Task name',
    'tasks.targetCycles': 'Target cycles',
    'tasks.cycles': 'cycles',
    'tasks.edit': 'Edit Task',
    'tasks.delete': 'Delete',
    'tasks.save': 'Save',
    'tasks.cancel': 'Cancel',
    'tasks.complete': 'Complete',
    'tasks.completed': 'Completed',
    'tasks.noTasks': 'No tasks yet',
    'tasks.estimatedTime': 'Estimated time',
    
    // Task Complete Dialog
    'taskComplete.title': 'Task Completed!',
    'taskComplete.message': 'Great job! You\'ve completed all cycles for this task.',
    'taskComplete.markComplete': 'Mark as Complete',
    'taskComplete.addMoreTime': 'Add More Time',
    'taskComplete.addCycles': 'Add cycles',
    
    // Music
    'music.title': 'Music',
    'music.search': 'Search YouTube...',
    'music.searching': 'Searching...',
    'music.noResults': 'No results found',
    'music.topics': 'Topics',
    
    // Health Reminders
    'reminders.title': 'Health Reminders',
    'reminders.add': 'Add Reminder',
    'reminders.water': 'Drink Water',
    'reminders.stretch': 'Stretch',
    'reminders.eyes': 'Rest Eyes',
    'reminders.walk': 'Take a Walk',
    'reminders.breathe': 'Deep Breathing',
    'reminders.posture': 'Check Posture',
    'reminders.snack': 'Healthy Snack',
    'reminders.interval': 'Interval',
    'reminders.minutes': 'min',
    'reminders.next': 'Next',
    'reminders.enabled': 'Enabled',
    
    // Settings
    'settings.title': 'Settings',
    'settings.timer': 'Timer',
    'settings.background': 'Background',
    'settings.notifications': 'Notifications',
    'settings.sound': 'Sound',
    'settings.autoStart': 'Auto-start breaks',
    'settings.showNotifications': 'Show notifications',
    
    // Background
    'background.enable': 'Enable video background',
    'background.refresh': 'Refresh video',
    'background.refreshOnPomodoro': 'Refresh on pomodoro complete',
    
    // Theme
    'theme.light': 'Light mode',
    'theme.dark': 'Dark mode',
    
    // Language
    'language.en': 'English',
    'language.vi': 'Vietnamese',
    
    // General
    'general.close': 'Close',
    'general.confirm': 'Confirm',
    'general.loading': 'Loading...',
  },
  vi: {
    // Header
    'app.name': 'FocusFlow',
    
    // Timer modes
    'timer.pomodoro': 'Tập trung',
    'timer.shortBreak': 'Nghỉ ngắn',
    'timer.longBreak': 'Nghỉ dài',
    'timer.meditation': 'Thiền',
    'timer.start': 'Bắt đầu',
    'timer.pause': 'Tạm dừng',
    'timer.skip': 'Bỏ qua',
    'timer.longBreakAfter': 'Nghỉ dài sau mỗi',
    'timer.cycles': 'chu kỳ',
    
    // Tasks
    'tasks.title': 'Công việc',
    'tasks.active': 'Đang làm',
    'tasks.add': 'Thêm',
    'tasks.addNew': 'Thêm công việc mới',
    'tasks.name': 'Tên công việc',
    'tasks.targetCycles': 'Số chu kỳ mục tiêu',
    'tasks.cycles': 'chu kỳ',
    'tasks.edit': 'Chỉnh sửa',
    'tasks.delete': 'Xóa',
    'tasks.save': 'Lưu',
    'tasks.cancel': 'Hủy',
    'tasks.complete': 'Hoàn thành',
    'tasks.completed': 'Đã xong',
    'tasks.noTasks': 'Chưa có công việc nào',
    'tasks.estimatedTime': 'Thời gian ước tính',
    
    // Task Complete Dialog
    'taskComplete.title': 'Hoàn thành công việc!',
    'taskComplete.message': 'Tuyệt vời! Bạn đã hoàn thành tất cả chu kỳ cho công việc này.',
    'taskComplete.markComplete': 'Đánh dấu hoàn thành',
    'taskComplete.addMoreTime': 'Thêm thời gian',
    'taskComplete.addCycles': 'Thêm chu kỳ',
    
    // Music
    'music.title': 'Nhạc',
    'music.search': 'Tìm kiếm YouTube...',
    'music.searching': 'Đang tìm...',
    'music.noResults': 'Không tìm thấy kết quả',
    'music.topics': 'Chủ đề',
    
    // Health Reminders
    'reminders.title': 'Nhắc nhở sức khỏe',
    'reminders.add': 'Thêm',
    'reminders.water': 'Uống nước',
    'reminders.stretch': 'Giãn cơ',
    'reminders.eyes': 'Nghỉ mắt',
    'reminders.walk': 'Đi bộ',
    'reminders.breathe': 'Hít thở sâu',
    'reminders.posture': 'Kiểm tra tư thế',
    'reminders.snack': 'Ăn nhẹ',
    'reminders.interval': 'Khoảng thời gian',
    'reminders.minutes': 'phút',
    'reminders.next': 'Tiếp theo',
    'reminders.enabled': 'Bật',
    
    // Settings
    'settings.title': 'Cài đặt',
    'settings.timer': 'Hẹn giờ',
    'settings.background': 'Hình nền',
    'settings.notifications': 'Thông báo',
    'settings.sound': 'Âm thanh',
    'settings.autoStart': 'Tự động bắt đầu nghỉ',
    'settings.showNotifications': 'Hiển thị thông báo',
    
    // Background
    'background.enable': 'Bật video nền',
    'background.refresh': 'Làm mới video',
    'background.refreshOnPomodoro': 'Làm mới khi hoàn thành pomodoro',
    
    // Theme
    'theme.light': 'Chế độ sáng',
    'theme.dark': 'Chế độ tối',
    
    // Language
    'language.en': 'Tiếng Anh',
    'language.vi': 'Tiếng Việt',
    
    // General
    'general.close': 'Đóng',
    'general.confirm': 'Xác nhận',
    'general.loading': 'Đang tải...',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useLocalStorage<Language>('focusflow-language', 'vi');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
