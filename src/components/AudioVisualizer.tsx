import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface AudioVisualizerProps {
  isPlaying: boolean;
  className?: string;
}

export function AudioVisualizer({ isPlaying, className }: AudioVisualizerProps) {
  const [bars, setBars] = useState<number[]>([30, 50, 40, 60, 35, 55, 45, 65, 38, 52]);

  useEffect(() => {
    if (!isPlaying) {
      setBars(bars.map(() => 10));
      return;
    }

    const interval = setInterval(() => {
      setBars(prev => prev.map(() => Math.random() * 60 + 20));
    }, 150);

    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className={cn("flex items-end gap-1 h-12", className)}>
      {bars.map((height, i) => (
        <div
          key={i}
          className={cn(
            "w-1.5 rounded-full transition-all duration-150",
            isPlaying 
              ? "bg-gradient-to-t from-primary/80 to-primary" 
              : "bg-muted-foreground/30"
          )}
          style={{ 
            height: `${height}%`,
            animationDelay: `${i * 50}ms`
          }}
        />
      ))}
    </div>
  );
}
