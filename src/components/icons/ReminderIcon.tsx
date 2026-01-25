import {
  Droplets,
  Footprints,
  Eye,
  Dumbbell,
  Coffee,
  Apple,
  Leaf,
  Brain,
  Heart,
  Activity,
  LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Icon key to component mapping
export const REMINDER_ICONS: Record<string, LucideIcon> = {
  droplets: Droplets,
  footprints: Footprints,
  eye: Eye,
  stretch: Activity,
  coffee: Coffee,
  apple: Apple,
  leaf: Leaf,
  dumbbell: Dumbbell,
  brain: Brain,
  heart: Heart,
};

// Icon options for picker
export const ICON_OPTIONS = [
  { key: 'droplets', label: 'Nước' },
  { key: 'footprints', label: 'Đi lại' },
  { key: 'eye', label: 'Mắt' },
  { key: 'stretch', label: 'Vươn vai' },
  { key: 'coffee', label: 'Cà phê' },
  { key: 'apple', label: 'Ăn uống' },
  { key: 'leaf', label: 'Thư giãn' },
  { key: 'dumbbell', label: 'Tập luyện' },
  { key: 'brain', label: 'Tập trung' },
  { key: 'heart', label: 'Sức khỏe' },
];

interface ReminderIconProps {
  iconKey: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
  xl: 'h-6 w-6',
};

export function ReminderIcon({ iconKey, size = 'md', className }: ReminderIconProps) {
  const IconComponent = REMINDER_ICONS[iconKey];
  
  if (!IconComponent) {
    // Fallback for old emoji format or unknown icons
    return <span className={cn(sizeClasses[size], className)}>{iconKey}</span>;
  }
  
  return (
    <IconComponent 
      className={cn(sizeClasses[size], className)} 
      strokeWidth={1.5} 
    />
  );
}
