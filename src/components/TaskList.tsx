import { useState, useMemo } from 'react';
import { Plus, Trash2, CheckCircle2, Circle, ChevronDown, ChevronUp, Clock, Pencil, ListTodo } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Confetti } from '@/components/Confetti';
import { cn } from '@/lib/utils';
import { AddTaskDialog } from './AddTaskDialog';
import { EditTaskDialog } from './EditTaskDialog';
import type { Task } from '@/hooks/useTasks';

interface TaskListProps {
  tasks: Task[];
  activeTaskId: string | null;
  pomodoroDuration?: number;
  isExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  onAddTask: (title: string, description: string, targetCycles: number) => void;
  onUpdateTask: (id: string, updates: Partial<Pick<Task, 'title' | 'description' | 'targetCycles'>>) => void;
  onDeleteTask: (id: string) => void;
  onSetActiveTask: (id: string | null) => void;
  onMarkComplete?: (id: string) => void;
  compact?: boolean;
}

export function TaskList({
  tasks,
  activeTaskId,
  pomodoroDuration = 25,
  isExpanded: externalIsExpanded,
  onExpandedChange,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onSetActiveTask,
  onMarkComplete,
  compact = false,
}: TaskListProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [internalIsExpanded, setInternalIsExpanded] = useState(true);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Use external state if provided, otherwise use internal
  const isExpanded = externalIsExpanded !== undefined ? externalIsExpanded : internalIsExpanded;
  const setIsExpanded = (value: boolean) => {
    if (onExpandedChange) {
      onExpandedChange(value);
    } else {
      setInternalIsExpanded(value);
    }
  };

  const handleManualComplete = (taskId: string) => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
    onMarkComplete?.(taskId);
  };

  const incompleteTasks = tasks.filter((t) => !t.isCompleted);
  const completedTasks = tasks.filter((t) => t.isCompleted);

  const estimatedCompletion = useMemo(() => {
    const remainingCycles = incompleteTasks.reduce((sum, task) => {
      return sum + Math.max(0, task.targetCycles - task.completedCycles);
    }, 0);

    if (remainingCycles === 0) return null;

    const totalMinutes = remainingCycles * pomodoroDuration;
    const completionTime = new Date(Date.now() + totalMinutes * 60 * 1000);

    return {
      cycles: remainingCycles,
      minutes: totalMinutes,
      time: completionTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };
  }, [incompleteTasks, pomodoroDuration]);

  const handleEditSave = (id: string, title: string, description: string, targetCycles: number) => {
    onUpdateTask(id, { title, description, targetCycles });
  };

  if (compact) {
    return (
      <div className="bg-black/20 backdrop-blur-sm rounded-xl p-3 w-full max-w-xs">
        <div className="space-y-1.5 max-h-32 overflow-y-auto">
          {incompleteTasks.length === 0 ? (
            <p className="text-xs text-white/50 text-center py-2">Không có task</p>
          ) : (
            incompleteTasks.slice(0, 3).map((task) => (
              <div
                key={task.id}
                className={cn(
                  "flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs cursor-pointer transition-all",
                  task.id === activeTaskId
                    ? "bg-white/20 text-white"
                    : "text-white/70 hover:bg-white/10"
                )}
                onClick={() => onSetActiveTask(task.id)}
              >
                {task.completedCycles >= task.targetCycles ? (
                  <CheckCircle2 className={cn(
                    "h-3 w-3 flex-shrink-0 text-primary",
                    task.id === activeTaskId && "animate-pulse"
                  )} />
                ) : (
                  <Circle className={cn(
                    "h-3 w-3 flex-shrink-0",
                    task.id === activeTaskId ? "text-primary" : "text-white/50"
                  )} />
                )}
                <span className={cn(
                  "truncate flex-1",
                  task.completedCycles >= task.targetCycles && "font-semibold text-primary"
                )}>
                  {task.title}
                </span>
                <span className={cn(
                  task.completedCycles >= task.targetCycles
                    ? "text-primary font-semibold"
                    : "text-white/50"
                )}>
                  {task.completedCycles}/{task.targetCycles}
                </span>
              </div>
            ))
          )}
        </div>
        {estimatedCompletion && (
          <div className="flex items-center justify-center gap-1.5 mt-2 pt-2 border-t border-white/10 text-xs text-white/60">
            <Clock className="h-3 w-3" />
            <span>Xong lúc {estimatedCompletion.time}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <Confetti active={showConfetti} duration={3000} />
      <div className="w-full glass-effect rounded-2xl p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListTodo className="h-5 w-5 text-primary" strokeWidth={1.5} />
          <span className="font-medium">Tasks</span>
          {incompleteTasks.length > 0 && (
            <span className="text-xs text-muted-foreground">({incompleteTasks.length})</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setShowAddDialog(true)}
            className="h-8 w-8"
          >
            <Plus className="h-4 w-4" strokeWidth={1.5} />
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

      {/* Collapsed View - Show task count and estimated time */}
      {!isExpanded && (
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            {incompleteTasks.slice(0, 3).map((task) => (
              <div
                key={task.id}
                className={cn(
                  "w-2 h-2 rounded-full",
                  task.id === activeTaskId ? "bg-primary" : "bg-muted-foreground/50"
                )}
              />
            ))}
            {incompleteTasks.length > 3 && (
              <span className="text-xs text-muted-foreground">+{incompleteTasks.length - 3}</span>
            )}
          </div>
          {estimatedCompletion && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{estimatedCompletion.time}</span>
            </div>
          )}
        </div>
      )}

      {/* Expanded View */}
      {isExpanded && (
        <>
          {/* Task List */}
          <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
            {incompleteTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Chưa có task nào. Thêm task để bắt đầu!
              </p>
            ) : (
              incompleteTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  isActive={task.id === activeTaskId}
                  onSelect={() => onSetActiveTask(task.id)}
                  onEdit={() => setEditingTask(task)}
                  onDelete={() => onDeleteTask(task.id)}
                  onManualComplete={() => handleManualComplete(task.id)}
                />
              ))
            )}
          </div>

          {/* Completed Section */}
          {completedTasks.length > 0 && (
            <div className="pt-3 border-t border-border/50">
              <button
                onClick={() => setShowCompleted(!showCompleted)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full"
              >
                {showCompleted ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
                <span>Đã hoàn thành ({completedTasks.length})</span>
              </button>

              {showCompleted && (
                <div className="space-y-2 mt-2 opacity-60">
                  {completedTasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      isActive={false}
                      isCompleted
                      onSelect={() => { }}
                      onEdit={() => { }}
                      onDelete={() => onDeleteTask(task.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Estimated Completion Time */}
          {estimatedCompletion && (
            <div className="pt-3 border-t border-border/50">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" strokeWidth={1.5} />
                  <span>Dự kiến hoàn thành</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-primary">{estimatedCompletion.time}</span>
                  <p className="text-xs text-muted-foreground">
                    {estimatedCompletion.cycles} 🍅 · {Math.round(estimatedCompletion.minutes / 60 * 10) / 10}h
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Dialogs */}
      <AddTaskDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAdd={onAddTask}
      />
      <EditTaskDialog
        open={!!editingTask}
        onOpenChange={(open) => !open && setEditingTask(null)}
        task={editingTask}
        onSave={handleEditSave}
        onDelete={onDeleteTask}
      />
      </div>
    </>
  );
}
interface TaskItemProps {
  task: Task;
  isActive: boolean;
  isCompleted?: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onManualComplete?: () => void;
}

function TaskItem({ task, isActive, isCompleted, onSelect, onEdit, onDelete, onManualComplete }: TaskItemProps) {
  const progress = (task.completedCycles / task.targetCycles) * 100;

  return (
    <div
      className={cn(
        "group relative p-3 rounded-xl transition-all cursor-pointer",
        isCompleted
          ? "bg-muted/30"
          : isActive
            ? "bg-primary/10 ring-2 ring-primary/30"
            : "bg-muted/50 hover:bg-muted"
      )}
      onClick={!isCompleted ? onSelect : undefined}
    >
      <div className="flex items-start gap-2">
        {/* Checkbox for manual completion */}
        <div className="mt-0.5" onClick={(e) => e.stopPropagation()}>
          {isCompleted ? (
            <CheckCircle2 className="h-4 w-4 text-primary" />
          ) : (
            <Checkbox
              checked={false}
              onCheckedChange={() => onManualComplete?.()}
              className={cn(
                "h-4 w-4 rounded-full border-2 transition-colors",
                isActive 
                  ? "border-primary data-[state=checked]:bg-primary" 
                  : "border-muted-foreground/50 hover:border-primary"
              )}
            />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className={cn(
            "font-medium text-sm truncate",
            isCompleted && "line-through text-muted-foreground",
            !isCompleted && task.completedCycles >= task.targetCycles && "text-primary font-semibold"
          )}>
            {task.title}
          </h4>

          {!isCompleted && (
            <div className="flex items-center gap-2 mt-1.5">
              <Progress value={progress} className="h-1.5 flex-1" />
              <span className={cn(
                "text-xs whitespace-nowrap",
                task.completedCycles >= task.targetCycles
                  ? "text-primary font-semibold"
                  : "text-muted-foreground"
              )}>
                {task.completedCycles}/{task.targetCycles}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {!isCompleted && (
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="h-6 w-6"
            >
              <Pencil className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" strokeWidth={1.5} />
            </Button>
          )}
          <Button
            size="icon"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="h-6 w-6"
          >
            <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" strokeWidth={1.5} />
          </Button>
        </div>
      </div>
    </div>
  );
}
