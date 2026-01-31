import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePexelsVideo } from '@/hooks/usePexelsVideo';
import { cn } from '@/lib/utils';

interface BackgroundToggleProps {
  pexels: ReturnType<typeof usePexelsVideo>;
}

export function BackgroundToggle({ pexels }: BackgroundToggleProps) {
  if (!pexels) {
    return (
      <Button variant="ghost" size="icon" className="rounded-full" disabled>
        <RefreshCw className="h-5 w-5" />
      </Button>
    );
  }

  const { refreshVideo, isLoading, settings } = pexels;

  // Only show if video background is enabled
  if (!settings.enabled) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="rounded-full"
      onClick={refreshVideo}
      disabled={isLoading}
      title="Đổi video nền"
    >
      <RefreshCw className={cn("h-5 w-5", isLoading && "animate-spin")} />
    </Button>
  );
}
