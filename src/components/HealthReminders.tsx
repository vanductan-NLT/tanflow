import { useState } from 'react';
import { Bell, BellOff, Plus, Trash2, Clock, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { useHealthReminders, HealthReminder } from '@/hooks/useHealthReminders';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface HealthRemindersProps {
  reminders: ReturnType<typeof useHealthReminders>;
}

const EMOJI_OPTIONS = ['💧', '🚶', '👀', '🧘', '☕', '🍎', '🌿', '💪', '🧠', '❤️'];

export function HealthReminders({ reminders: reminderHook }: HealthRemindersProps) {
  const {
    reminders,
    timeUntilNext,
    isActive,
    activeReminder,
    formatTimeRemaining,
    getNextReminder,
    addReminder,
    updateReminder,
    removeReminder,
    toggleReminder,
    dismissReminder,
    snoozeReminder,
    toggleActive,
  } = reminderHook;

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('💧');
  const [newInterval, setNewInterval] = useState(30);

  const nextReminder = getNextReminder();

  const handleAddReminder = () => {
    if (newName.trim()) {
      addReminder(newName.trim(), newIcon, newInterval);
      setNewName('');
      setNewIcon('💧');
      setNewInterval(30);
      setShowAddDialog(false);
    }
  };

  return (
    <>
      {/* Active Reminder Popup */}
      {activeReminder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-effect rounded-2xl p-8 max-w-sm mx-4 text-center space-y-4 animate-scale-in">
            <span className="text-5xl">{activeReminder.icon}</span>
            <h3 className="text-xl font-semibold">{activeReminder.name}</h3>
            <p className="text-muted-foreground">Đã đến lúc rồi!</p>
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => snoozeReminder(activeReminder.id, 5)}
              >
                <Timer className="h-4 w-4 mr-2" strokeWidth={1.5} />
                +5 phút
              </Button>
              <Button onClick={dismissReminder}>
                Xong
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reminders Card */}
      <div className="w-full glass-effect rounded-2xl p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" strokeWidth={1.5} />
            <span className="font-medium">Nhắc nhở sức khỏe</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleActive}
              className={cn('h-8 w-8', !isActive && 'text-muted-foreground')}
            >
              {isActive ? <Bell className="h-4 w-4" strokeWidth={1.5} /> : <BellOff className="h-4 w-4" strokeWidth={1.5} />}
            </Button>
          </div>
        </div>

        {/* Next Reminder Preview */}
        {isActive && nextReminder && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{nextReminder.reminder.icon}</span>
              <div>
                <p className="text-sm font-medium">{nextReminder.reminder.name}</p>
                <p className="text-xs text-muted-foreground">Sắp đến</p>
              </div>
            </div>
            <span className="text-lg font-mono tabular-nums text-primary">
              {formatTimeRemaining(nextReminder.timeLeft)}
            </span>
          </div>
        )}

        {/* Reminder List */}
        <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
          {reminders.map((reminder) => (
            <div
              key={reminder.id}
              className={cn(
                'flex items-center justify-between p-3 rounded-xl transition-colors',
                reminder.enabled ? 'bg-muted/20' : 'bg-muted/5 opacity-60'
              )}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{reminder.icon}</span>
                <div>
                  <p className="text-sm font-medium">{reminder.name}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" strokeWidth={1.5} />
                    <span>Mỗi {reminder.intervalMinutes} phút</span>
                    {reminder.enabled && timeUntilNext[reminder.id] && (
                      <span className="ml-2 text-primary">
                        ({formatTimeRemaining(timeUntilNext[reminder.id])})
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={reminder.enabled}
                  onCheckedChange={() => toggleReminder(reminder.id)}
                />
                {reminder.id.startsWith('custom-') && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeReminder(reminder.id)}
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add Reminder */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="w-full">
              <Plus className="h-4 w-4 mr-2" strokeWidth={1.5} />
              Thêm nhắc nhở
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm nhắc nhở mới</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Biểu tượng</label>
                <div className="flex flex-wrap gap-2">
                  {EMOJI_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setNewIcon(emoji)}
                      className={cn(
                        'w-10 h-10 text-xl rounded-lg transition-colors',
                        newIcon === emoji
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted hover:bg-muted/80'
                      )}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tên nhắc nhở</label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="VD: Uống trà"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Chu kỳ (phút)</label>
                <Input
                  type="number"
                  value={newInterval}
                  onChange={(e) => setNewInterval(parseInt(e.target.value) || 30)}
                  min={1}
                  max={120}
                />
              </div>
              <Button onClick={handleAddReminder} className="w-full" disabled={!newName.trim()}>
                Thêm
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
