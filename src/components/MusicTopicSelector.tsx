import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const MUSIC_TOPICS = [
  { id: 'lofi', name: 'Lofi', emoji: '🎵', query: 'lofi hip hop beats' },
  { id: 'jazz', name: 'Jazz', emoji: '☕', query: 'jazz coffee shop music' },
  { id: 'piano', name: 'Piano', emoji: '🎹', query: 'piano study music' },
  { id: 'nature', name: 'Nature', emoji: '🌿', query: 'nature sounds relaxing' },
  { id: 'ambient', name: 'Ambient', emoji: '🌙', query: 'ambient study music' },
  { id: 'classical', name: 'Classical', emoji: '🎻', query: 'classical music focus' },
  { id: 'chill', name: 'Chill', emoji: '✨', query: 'chill music playlist' },
] as const;

export type MusicTopic = typeof MUSIC_TOPICS[number];

interface MusicTopicSelectorProps {
  currentTopic: string;
  onTopicSelect: (topic: MusicTopic) => void;
  isLoading: boolean;
}

export function MusicTopicSelector({
  currentTopic,
  onTopicSelect,
  isLoading,
}: MusicTopicSelectorProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">Chọn thể loại:</p>
      <div className="flex flex-wrap gap-2">
        {MUSIC_TOPICS.map((topic) => (
          <Button
            key={topic.id}
            variant={currentTopic === topic.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => onTopicSelect(topic)}
            disabled={isLoading}
            className={cn(
              "h-8 text-xs gap-1.5",
              currentTopic === topic.id && "bg-primary text-primary-foreground"
            )}
          >
            {isLoading && currentTopic === topic.id ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <span>{topic.emoji}</span>
            )}
            {topic.name}
          </Button>
        ))}
      </div>
    </div>
  );
}
