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
    'music.selectTopic': 'Select topic:',
    'music.pasteLink': 'Or paste YouTube link...',
    'music.openYouTube': 'Open on YouTube',
    'music.autoPlayOn': 'Auto-play is on',
    'music.autoPlayOff': 'Auto-play is off',
    
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
    'reminders.icon': 'Icon',
    'reminders.resetAll': 'Reset all timers',
    'reminders.editReminder': 'Edit reminder',
    'reminders.healthMessage': 'Time to take care of your health!',
    'reminders.snooze': 'Snooze',
    'reminders.done': 'Done!',
    'reminders.continue': 'Continue',
    'reminders.autoClose': 'Auto close in',
    'reminders.seconds': 'seconds',
    'reminders.next': 'Next',
    'reminders.enabled': 'Enabled',
    
    // Settings
    'settings.title': 'Settings',
    'settings.description': 'Customize Pomodoro timer and other options',
    'settings.timer': 'Timer',
    'settings.background': 'Background',
    'settings.notifications': 'Notifications',
    'settings.sound': 'Sound',
    'settings.autoStart': 'Auto-start next session',
    'settings.autoStartDesc': 'Automatically start the next session',
    'settings.showNotifications': 'Show notifications',
    
    // Background / Pexels
    'background.title': 'Background Video (Pexels)',
    'background.enable': 'Enable video background',
    'background.category': 'Video theme',
    'background.refresh': 'Refresh video',
    'background.autoRefresh': 'Auto refresh video',
    'background.refreshOff': 'Off',
    'background.refreshOnPomodoro': 'On pomodoro complete',
    'background.refreshOnVideoEnd': 'On video end',
    'background.refreshEvery10': 'Every 10 minutes',
    'background.refreshEvery15': 'Every 15 minutes',
    'background.refreshEvery30': 'Every 30 minutes',
    'background.refreshEvery60': 'Every 1 hour',
    'background.random': 'Random',
    'background.nature': 'Nature',
    'background.forest': 'Forest',
    'background.ocean': 'Ocean',
    'background.mountains': 'Mountains',
    'background.sky': 'Sky',
    'background.rain': 'Rain',
    'background.sunset': 'Sunset',
    'background.clouds': 'Clouds',
    
    // Breath Box
    'breathBox.title': 'Breath Box',
    'breathBox.enable': 'Enable Breath Box',
    'breathBox.pattern': 'Breathing pattern',
    'breathBox.inhale': 'Breathe In',
    'breathBox.holdIn': 'Hold',
    'breathBox.exhale': 'Breathe Out',
    'breathBox.holdOut': 'Hold',
    'breathBox.cycle': 'Cycle',
    'breathBox.pattern.box4': 'Box 4-4-4-4 (Navy SEALs)',
    'breathBox.pattern.relaxing': 'Relaxing 4-7-8',
    'breathBox.pattern.box5': 'Box 5-5-5-5',
    
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
    'music.selectTopic': 'Chọn thể loại:',
    'music.pasteLink': 'Hoặc dán link YouTube...',
    'music.openYouTube': 'Mở trên YouTube',
    'music.autoPlayOn': 'Tự động chuyển bài đang bật',
    'music.autoPlayOff': 'Tự động chuyển bài đang tắt',
    
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
    'reminders.icon': 'Biểu tượng',
    'reminders.resetAll': 'Reset tất cả bộ đếm',
    'reminders.editReminder': 'Chỉnh sửa',
    'reminders.healthMessage': 'Đã đến lúc chăm sóc sức khỏe!',
    'reminders.snooze': 'Tạm hoãn',
    'reminders.done': 'Đã xong!',
    'reminders.continue': 'Tiếp tục',
    'reminders.autoClose': 'Tự đóng sau',
    'reminders.seconds': 'giây',
    
    // Settings
    'settings.title': 'Cài đặt',
    'settings.description': 'Tùy chỉnh thời gian Pomodoro và các tùy chọn khác',
    'settings.timer': 'Hẹn giờ',
    'settings.background': 'Hình nền',
    'settings.notifications': 'Thông báo',
    'settings.sound': 'Âm thanh',
    'settings.autoStart': 'Tự động chuyển chế độ',
    'settings.autoStartDesc': 'Tự bắt đầu phiên tiếp theo',
    'settings.showNotifications': 'Hiển thị thông báo',
    
    // Background / Pexels
    'background.title': 'Video nền (Pexels)',
    'background.enable': 'Bật video nền',
    'background.category': 'Chủ đề video',
    'background.refresh': 'Làm mới video',
    'background.autoRefresh': 'Tự động đổi video',
    'background.refreshOff': 'Tắt',
    'background.refreshOnPomodoro': 'Khi hoàn thành Pomodoro',
    'background.refreshOnVideoEnd': 'Khi video phát xong',
    'background.refreshEvery10': 'Mỗi 10 phút',
    'background.refreshEvery15': 'Mỗi 15 phút',
    'background.refreshEvery30': 'Mỗi 30 phút',
    'background.refreshEvery60': 'Mỗi 1 giờ',
    'background.random': 'Ngẫu nhiên',
    'background.nature': 'Thiên nhiên',
    'background.forest': 'Rừng',
    'background.ocean': 'Biển',
    'background.mountains': 'Núi',
    'background.sky': 'Bầu trời',
    'background.rain': 'Mưa',
    'background.sunset': 'Hoàng hôn',
    'background.clouds': 'Mây',
    
    // Breath Box
    'breathBox.title': 'Thở hộp',
    'breathBox.enable': 'Bật chế độ thở hộp',
    'breathBox.pattern': 'Nhịp thở',
    'breathBox.inhale': 'Hít vào',
    'breathBox.holdIn': 'Giữ',
    'breathBox.exhale': 'Thở ra',
    'breathBox.holdOut': 'Giữ',
    'breathBox.cycle': 'Vòng',
    'breathBox.pattern.box4': 'Hộp 4-4-4-4 (Navy SEALs)',
    'breathBox.pattern.relaxing': 'Thư giãn 4-7-8',
    'breathBox.pattern.box5': 'Hộp 5-5-5-5',
    
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
