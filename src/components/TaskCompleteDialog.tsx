import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, Clock } from 'lucide-react';
import { Confetti } from '@/components/Confetti';
import type { Task } from '@/hooks/useTasks';

interface TaskCompleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  onComplete: (taskId: string) => void;
  onAddMoreTime: (taskId: string, additionalCycles: number) => void;
}

export function TaskCompleteDialog({
  open,
  onOpenChange,
  task,
  onComplete,
  onAddMoreTime,
}: TaskCompleteDialogProps) {
  const [showAddMore, setShowAddMore] = useState(false);
  const [additionalCycles, setAdditionalCycles] = useState(2);

  if (!task) return null;

  const handleComplete = () => {
    onComplete(task.id);
    setShowAddMore(false);
    onOpenChange(false);
  };

  const handleNeedMoreTime = () => {
    setShowAddMore(true);
  };

  const handleConfirmMoreTime = () => {
    onAddMoreTime(task.id, additionalCycles);
    setShowAddMore(false);
    setAdditionalCycles(2);
    onOpenChange(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setShowAddMore(false);
      setAdditionalCycles(2);
    }
    onOpenChange(newOpen);
  };

  return (
    <>
      <Confetti active={open} duration={3000} />
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <span className="text-2xl">🎉</span>
              Task hoàn thành!
            </DialogTitle>
            <DialogDescription className="text-base pt-2">
              Bạn đã hoàn thành <strong className="text-foreground">{task.completedCycles}</strong> chu kỳ cho task:
            </DialogDescription>
          </DialogHeader>

          <div className="bg-muted/50 rounded-lg p-4 my-2">
            <h4 className="font-semibold text-lg">{task.title}</h4>
            {task.description && (
              <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
            )}
            <div className="flex items-center gap-2 mt-3 text-sm">
              <span className="text-primary font-medium">
                {task.completedCycles}/{task.targetCycles} 🍅
              </span>
              <span className="text-muted-foreground">
                ≈ {task.completedCycles * 25} phút
              </span>
            </div>
          </div>

          {!showAddMore ? (
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={handleNeedMoreTime}
                className="flex items-center gap-2"
              >
                <Clock className="h-4 w-4" />
                Cần thêm thời gian
              </Button>
              <Button
                onClick={handleComplete}
                className="flex items-center gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                Đã hoàn thành
              </Button>
            </DialogFooter>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="additionalCycles">Thêm số chu kỳ</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="additionalCycles"
                    type="number"
                    min={1}
                    max={12}
                    value={additionalCycles}
                    onChange={(e) => setAdditionalCycles(Math.min(12, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="w-24"
                  />
                  <span className="text-muted-foreground">
                    = thêm {additionalCycles * 25} phút
                  </span>
                </div>
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={() => setShowAddMore(false)}>
                  Quay lại
                </Button>
                <Button onClick={handleConfirmMoreTime}>
                  Xác nhận thêm {additionalCycles} chu kỳ
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
