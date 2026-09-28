import { cn } from '@/lib/utils';

interface YouTubeVideoBackgroundProps {
  active: boolean;
  isFocusing: boolean;
}

export function YouTubeVideoBackground({ active, isFocusing }: YouTubeVideoBackgroundProps) {
  return (
    <div
      className={cn(
        'fixed inset-0 -z-10 overflow-hidden bg-black transition-opacity duration-500',
        active ? 'opacity-100' : 'pointer-events-none opacity-0'
      )}
      aria-hidden="true"
    >
      <div className="absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-[177.77777778vh] min-w-full -translate-x-1/2 -translate-y-1/2 [&>iframe]:h-full [&>iframe]:w-full [&>iframe]:pointer-events-none">
        <div id="hidden-youtube-player" />
      </div>

      <div
        className={cn(
          'absolute inset-0 transition-colors duration-700',
          isFocusing ? 'bg-black/25' : 'bg-black/45'
        )}
      />
      <div className="absolute inset-0 bg-radial-vignette" />
    </div>
  );
}
