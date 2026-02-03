import { useEffect, useState, useRef } from 'react';
import { Quote, getRandomQuote } from '@/data/quotes';
import { cn } from '@/lib/utils';
import { TimerMode } from '@/hooks/usePomodoro';
import { useLanguage } from '@/contexts/LanguageContext';

interface QuoteDisplayProps {
  mode: TimerMode;
  refreshInterval?: number; // in seconds, default 60
  className?: string;
}

export function QuoteDisplay({ mode, refreshInterval = 60, className }: QuoteDisplayProps) {
  const { language } = useLanguage();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const getNewQuote = (quoteMode: TimerMode) => {
    if (quoteMode === 'pomodoro' || quoteMode === 'meditation') {
      const quoteType = quoteMode === 'pomodoro' ? 'focus' : 'meditation';
      return getRandomQuote(quoteType, language);
    }
    return null;
  };

  useEffect(() => {
    if (mode === 'pomodoro' || mode === 'meditation') {
      // Set initial quote
      setQuote(getNewQuote(mode));
      setTimeout(() => setIsVisible(true), 100);

      // Set up interval to change quote
      intervalRef.current = window.setInterval(() => {
        setIsVisible(false);
        setTimeout(() => {
          setQuote(getNewQuote(mode));
          setIsVisible(true);
        }, 300); // Wait for fade out before changing
      }, refreshInterval * 1000);
    } else {
      setIsVisible(false);
      setQuote(null);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [mode, refreshInterval, language]);

  if (!quote) return null;

  return (
    <div
      className={cn(
        "text-center max-w-md mx-auto transition-all duration-500 ease-out",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
        className
      )}
    >
      <p className="text-white/90 text-sm sm:text-base md:text-lg italic leading-relaxed">
        "{quote.text}"
      </p>
      <p className="text-white/60 text-xs sm:text-sm mt-2">
        — {quote.author}
      </p>
    </div>
  );
}
