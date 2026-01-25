import { useEffect, useState } from 'react';
import { Quote, getRandomQuote } from '@/data/quotes';
import { cn } from '@/lib/utils';
import { TimerMode } from '@/hooks/usePomodoro';

interface QuoteDisplayProps {
  mode: TimerMode;
  className?: string;
}

export function QuoteDisplay({ mode, className }: QuoteDisplayProps) {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (mode === 'pomodoro' || mode === 'meditation') {
      const quoteType = mode === 'pomodoro' ? 'focus' : 'meditation';
      setQuote(getRandomQuote(quoteType));
      // Delay visibility for animation
      setTimeout(() => setIsVisible(true), 100);
    } else {
      setIsVisible(false);
      setQuote(null);
    }
  }, [mode]);

  if (!quote) return null;

  return (
    <div
      className={cn(
        "text-center max-w-md mx-auto transition-all duration-700 ease-out",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
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
