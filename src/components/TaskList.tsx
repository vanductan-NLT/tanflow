import { useState, useMemo } from 'react';
import { Plus, Trash2, CheckCircle2, Circle, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { AddTaskDialog } from './AddTaskDialog';
import type { Task } from '@/hooks/useTasks';

interface TaskListProps {
  tasks: Task[];
  activeTaskId: string | null;
  pomodoroDuration?: number; // in minutes
  onAddTask: (title: string, description: string, targetCycles: number) => void;
  onDeleteTask: (id: string) => void;
  onSetActiveTask: (id: string | null) => void;
  compact?: boolean; // for focus mode
}

export function TaskList({
  tasks,
  activeTaskId,
  pomodoroDuration = 25,
  onAddTask,
  onDeleteTask,
  onSetActiveTask,
  compact = false,
}: TaskListProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  const incompleteTasks = tasks.filter((t) => !t.isCompleted);
  const completedTasks = tasks.filter((t) => t.isCompleted);

  // Calculate estimated completion time
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

  if (compact) {
    // Compact mode for Focus UI
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
                <Circle className={cn(
                  "h-3 w-3 flex-shrink-0",
                  task.id === activeTaskId ? "text-primary" : "text-white/50"
                )} />
                <span className="truncate flex-1">{task.title}</span>
                <span className="text-white/50">{task.completedCycles}/{task.targetCycles}</span>
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
    <div className="card-glass rounded-2xl p-4 sm:p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Tasks</h3>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowAddDialog(true)}
          className="h-8 gap-1"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Thêm</span>
        </Button>
      </div>

      {/* Task List */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
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
              onDelete={() => onDeleteTask(task.id)}
            />
          ))
        )}
      </div>

      {/* Completed Section */}
      {completedTasks.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border/50">
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
                  onSelect={() => {}}
                  onDelete={() => onDeleteTask(task.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Estimated Completion Time */}
      {estimatedCompletion && (
        <div className="mt-4 pt-4 border-t border-border/50">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
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

      {/* Add Task Dialog */}
      <AddTaskDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAdd={onAddTask}
      />
    </div>
  );
}

interface TaskItemProps {
  task: Task;
  isActive: boolean;
  isCompleted?: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

function TaskItem({ task, isActive, isCompleted, onSelect, onDelete }: TaskItemProps) {
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
        {/* Status Icon */}
        <div className="mt-0.5">
          {isCompleted ? (
            <CheckCircle2 className="h-4 w-4 text-primary" />
          ) : (
            <Circle className={cn(
              "h-4 w-4",
              isActive ? "text-primary" : "text-muted-foreground"
            )} />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className={cn(
            "font-medium text-sm truncate",
            isCompleted && "line-through text-muted-foreground"
          )}>
            {task.title}
          </h4>
          
          {!isCompleted && (
            <div className="flex items-center gap-2 mt-1.5">
              <Progress value={progress} className="h-1.5 flex-1" />
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {task.completedCycles}/{task.targetCycles}
              </span>
            </div>
          )}
        </div>

        {/* Delete Button */}
        <Button
          size="icon"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
        </Button>
      </div>
    </div>
  );
}
