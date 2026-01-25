import { useBackground } from '@/hooks/useBackground';
import { cn } from '@/lib/utils';

export function BackgroundScene() {
  const { settings, imageUrl, imageKey, isLoading } = useBackground();

  if (!settings.enabled) {
    return null;
  }

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Background image with slow zoom animation */}
      {imageUrl && (
        <div
          key={imageKey}
          className={cn(
            "absolute inset-0 bg-cover bg-center bg-no-repeat",
            "animate-background-zoom transition-opacity duration-1000",
            isLoading ? "opacity-0" : "opacity-100"
          )}
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
      )}

      {/* Gradient overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background/80" />
      
      {/* Additional vignette effect */}
      <div className="absolute inset-0 bg-radial-vignette" />
    </div>
  );
}
