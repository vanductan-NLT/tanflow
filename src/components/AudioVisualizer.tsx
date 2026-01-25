import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';

interface AudioVisualizerProps {
  isPlaying: boolean;
  className?: string;
  barCount?: number;
}

export function AudioVisualizer({ isPlaying, className, barCount = 24 }: AudioVisualizerProps) {
  const [bars, setBars] = useState<number[]>(Array(barCount).fill(15));
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!isPlaying) {
      setBars(Array(barCount).fill(8));
      return;
    }

    const animate = () => {
      setBars(prev => prev.map(() => {
        const base = 20 + Math.random() * 40;
        const wave = Math.sin(Date.now() / 500) * 15;
        return Math.max(8, Math.min(80, base + wave));
      }));
      animationRef.current = requestAnimationFrame(animate);
    };

    // Slower animation using setTimeout
    const interval = setInterval(() => {
      setBars(prev => prev.map((_, i) => {
        const base = 25 + Math.random() * 35;
        const wave = Math.sin((Date.now() / 800) + i * 0.3) * 20;
        return Math.max(10, Math.min(85, base + wave));
      }));
    }, 120);

    return () => {
      clearInterval(interval);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, barCount]);

  return (
    <div className={cn("flex items-end justify-center gap-1", className)}>
      {bars.map((height, i) => (
        <div
          key={i}
          className={cn(
            "w-1 md:w-1.5 rounded-full transition-all duration-150 ease-out",
            isPlaying 
              ? "bg-gradient-to-t from-primary/60 via-primary/80 to-primary" 
              : "bg-white/20"
          )}
          style={{ 
            height: `${height}%`,
          }}
        />
      ))}
    </div>
  );
}
