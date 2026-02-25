import { useEffect, useState, useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import { Confetti } from '@/components/Confetti';
import { useLanguage } from '@/contexts/LanguageContext';

interface BreathBoxCompleteProps {
  cycleCount: number;
  onDismiss: () => void;
}

const motivationalQuotes = {
  en: [
    "Your mind is clear. Time to create something amazing.",
    "Calm mind, sharp focus. Let's get to work!",
    "You're centered and ready. Make it count.",
    "Breathe done. Now go conquer your tasks.",
    "Inner peace unlocked. Productivity mode: ON.",
  ],
  vi: [
    "Tâm trí đã trong sáng. Hãy tạo nên điều tuyệt vời.",
    "Tĩnh tâm rồi, giờ tập trung thôi!",
    "Bạn đã sẵn sàng. Hãy bắt đầu nào.",
    "Thở xong rồi. Giờ chinh phục công việc thôi!",
    "An yên bên trong, hiệu quả bên ngoài.",
  ],
};

export function BreathBoxComplete({ cycleCount, onDismiss }: BreathBoxCompleteProps) {
  const { t, language } = useLanguage();
  const [visible, setVisible] = useState(true);

  const quote = useMemo(() => {
    const quotes = motivationalQuotes[language] || motivationalQuotes.en;
    return quotes[Math.floor(Math.random() * quotes.length)];
  }, [language]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 400); // wait for fade-out
    }, 3500);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <>
      <Confetti active={true} duration={3000} />
      <div
        className={`fixed inset-0 z-[9998] flex flex-col items-center justify-center px-6 transition-opacity duration-400 ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ backgroundColor: 'hsla(var(--background), 0.85)', backdropFilter: 'blur(12px)' }}
      >
        <Sparkles className="h-16 w-16 text-[hsl(var(--timer-meditation))] mb-6 animate-pulse" />
        
        <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-3">
          {t('breathBox.completed')}
        </h1>
        
        <p className="text-lg text-muted-foreground mb-6">
          {t('breathBox.completedDesc').replace('{n}', String(cycleCount))}
        </p>
        
        <p className="text-base sm:text-lg text-foreground/80 italic max-w-md text-center leading-relaxed">
          "{quote}"
        </p>
      </div>
    </>
  );
}
