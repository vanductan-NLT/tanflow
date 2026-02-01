import { useState } from 'react';
import { Bell, BellOff, Plus, Trash2, Clock, Timer, Pencil, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { useHealthReminders, HealthReminder } from '@/hooks/useHealthReminders';
import { ReminderIcon, ICON_OPTIONS, REMINDER_ICONS } from '@/components/icons/ReminderIcon';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface HealthRemindersProps {
  reminders: ReturnType<typeof useHealthReminders>;
  isExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
}

export function HealthReminders({ 
  reminders: reminderHook,
  isExpanded: externalIsExpanded,
  onExpandedChange,
}: HealthRemindersProps) {
  const {
    reminders,
    timeUntilNext,
    isActive,
    activeReminder,
    formatTimeRemaining,
    addReminder,
    updateReminder,
    removeReminder,
    toggleReminder,
    dismissReminder,
    snoozeReminder,
    toggleActive,
    resetAllTimers,
  } = reminderHook;

  const { t } = useLanguage();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('droplets');
  const [newInterval, setNewInterval] = useState(30);
  const [internalIsExpanded, setInternalIsExpanded] = useState(true);

  // Use external state if provided, otherwise use internal
  const isExpanded = externalIsExpanded !== undefined ? externalIsExpanded : internalIsExpanded;
  const setIsExpanded = (value: boolean) => {
    if (onExpandedChange) {
      onExpandedChange(value);
    } else {
      setInternalIsExpanded(value);
    }
  };

  // Edit dialog state
  const [editingReminder, setEditingReminder] = useState<HealthReminder | null>(null);
  const [editName, setEditName] = useState('');
  const [editIcon, setEditIcon] = useState('');
  const [editInterval, setEditInterval] = useState(30);

  // Find next reminder using live timeUntilNext values
  const nextReminder = (() => {
    let next: { reminder: typeof reminders[0]; timeLeft: number } | null = null;
    reminders.forEach((reminder) => {
      if (!reminder.enabled) return;
      const timeLeft = timeUntilNext[reminder.id] || reminder.intervalMinutes * 60;
      if (!next || timeLeft < next.timeLeft) {
        next = { reminder, timeLeft };
      }
    });
    return next;
  })();

  const enabledReminders = reminders.filter((r) => r.enabled);

  const handleAddReminder = () => {
    if (newName.trim()) {
      addReminder(newName.trim(), newIcon, newInterval);
      setNewName('');
      setNewIcon('droplets');
      setNewInterval(30);
      setShowAddDialog(false);
    }
  };

  const openEditDialog = (reminder: HealthReminder) => {
    setEditingReminder(reminder);
    setEditName(reminder.name);
    setEditIcon(reminder.icon);
    setEditInterval(reminder.intervalMinutes);
  };

  const handleSaveEdit = () => {
    if (editingReminder && editName.trim()) {
      updateReminder(editingReminder.id, {
        name: editName.trim(),
        icon: editIcon,
        intervalMinutes: editInterval,
      });
      setEditingReminder(null);
    }
  };

  const handleDeleteReminder = () => {
    if (editingReminder) {
      removeReminder(editingReminder.id);
      setEditingReminder(null);
    }
  };

  return (
    <>
      {/* Active Reminder Popup */}
      {activeReminder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-effect rounded-2xl p-8 max-w-sm mx-4 text-center space-y-4 animate-scale-in">
            <div className="flex items-center justify-center w-20 h-20 mx-auto rounded-full bg-primary/10">
              <ReminderIcon iconKey={activeReminder.icon} size="xl" className="text-primary" />
            </div>
            <h3 className="text-xl font-semibold">{activeReminder.name}</h3>
            <p className="text-muted-foreground">{t('reminders.next')}!</p>
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => snoozeReminder(activeReminder.id, 5)}
              >
                <Timer className="h-4 w-4 mr-2" strokeWidth={1.5} />
                +5 {t('reminders.minutes')}
              </Button>
              <Button onClick={dismissReminder}>
                {t('tasks.complete')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Reminder Dialog */}
      <Dialog open={!!editingReminder} onOpenChange={(open) => !open && setEditingReminder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('tasks.edit')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Biểu tượng</label>
              <div className="flex flex-wrap gap-2">
                {ICON_OPTIONS.map((option) => {
                  const IconComponent = REMINDER_ICONS[option.key];
                  return (
                    <button
                      key={option.key}
                      onClick={() => setEditIcon(option.key)}
                      className={cn(
                        'w-10 h-10 flex items-center justify-center rounded-lg transition-colors',
                        editIcon === option.key
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted hover:bg-muted/80'
                      )}
                      title={option.label}
                    >
                      <IconComponent className="h-5 w-5" strokeWidth={1.5} />
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('tasks.name')}</label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder={t('reminders.water')}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('reminders.interval')} ({t('reminders.minutes')})</label>
              <Input
                type="number"
                value={editInterval}
                onChange={(e) => setEditInterval(parseInt(e.target.value) || 1)}
                min={1}
                max={120}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveEdit} className="flex-1" disabled={!editName.trim()}>
                {t('tasks.save')}
              </Button>
              <Button variant="destructive" onClick={handleDeleteReminder}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reminders Card */}
      <div className="w-full glass-effect rounded-2xl p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" strokeWidth={1.5} />
            <span className="font-medium">{t('reminders.title')}</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={resetAllTimers}
              className="h-8 w-8"
              title="Reset tất cả bộ đếm"
            >
              <RotateCcw className="h-4 w-4" strokeWidth={1.5} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleActive}
              className={cn('h-8 w-8', !isActive && 'text-muted-foreground')}
            >
              {isActive ? <Bell className="h-4 w-4" strokeWidth={1.5} /> : <BellOff className="h-4 w-4" strokeWidth={1.5} />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs h-8 px-2"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Collapsed View - Show icons only */}
        {!isExpanded && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {enabledReminders.slice(0, 5).map((reminder) => {
                const isNext = nextReminder?.reminder.id === reminder.id;
                return (
                  <div
                    key={reminder.id}
                    className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-full",
                      isNext ? "bg-green-500/20" : "bg-muted/50"
                    )}
                    title={`${reminder.name} - ${formatTimeRemaining(timeUntilNext[reminder.id] || 0)}`}
                  >
                    <ReminderIcon 
                      iconKey={reminder.icon} 
                      size="md" 
                      className={isNext ? "text-green-500" : "text-muted-foreground"} 
                    />
                  </div>
                );
              })}
              {enabledReminders.length > 5 && (
                <span className="text-xs text-muted-foreground">+{enabledReminders.length - 5}</span>
              )}
            </div>
            {nextReminder && (
              <span className="text-sm font-mono tabular-nums text-green-500">
                {formatTimeRemaining(nextReminder.timeLeft)}
              </span>
            )}
          </div>
        )}

        {/* Expanded View */}
        {isExpanded && (
          <>
            {/* Next Reminder Preview */}
            {isActive && nextReminder && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                    <ReminderIcon iconKey={nextReminder.reminder.icon} size="lg" className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{nextReminder.reminder.name}</p>
                    <p className="text-xs text-muted-foreground">{t('reminders.next')}</p>
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
                    'flex items-center justify-between p-3 rounded-xl transition-colors group',
                    reminder.enabled ? 'bg-muted/20' : 'bg-muted/5 opacity-60'
                  )}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex items-center justify-center w-9 h-9 rounded-full bg-muted shrink-0">
                      <ReminderIcon iconKey={reminder.icon} size="lg" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{reminder.name}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 shrink-0" strokeWidth={1.5} />
                        <span>{reminder.intervalMinutes} {t('reminders.minutes')}</span>
                        {reminder.enabled && timeUntilNext[reminder.id] && (
                          <span className="ml-2 text-primary">
                            ({formatTimeRemaining(timeUntilNext[reminder.id])})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(reminder)}
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Chỉnh sửa"
                    >
                      <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
                    </Button>
                    <Switch
                      checked={reminder.enabled}
                      onCheckedChange={() => toggleReminder(reminder.id)}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Add Reminder */}
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full">
                  <Plus className="h-4 w-4 mr-2" strokeWidth={1.5} />
                  {t('reminders.add')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('reminders.add')}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Biểu tượng</label>
                    <div className="flex flex-wrap gap-2">
                      {ICON_OPTIONS.map((option) => {
                        const IconComponent = REMINDER_ICONS[option.key];
                        return (
                          <button
                            key={option.key}
                            onClick={() => setNewIcon(option.key)}
                            className={cn(
                              'w-10 h-10 flex items-center justify-center rounded-lg transition-colors',
                              newIcon === option.key
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted hover:bg-muted/80'
                            )}
                            title={option.label}
                          >
                            <IconComponent className="h-5 w-5" strokeWidth={1.5} />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('tasks.name')}</label>
                    <Input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder={t('reminders.water')}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('reminders.interval')} ({t('reminders.minutes')})</label>
                    <Input
                      type="number"
                      value={newInterval}
                      onChange={(e) => setNewInterval(parseInt(e.target.value) || 30)}
                      min={1}
                      max={120}
                    />
                  </div>
                  <Button onClick={handleAddReminder} className="w-full" disabled={!newName.trim()}>
                    {t('tasks.add')}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
    </>
  );
}
