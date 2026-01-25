import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Trash2 } from 'lucide-react';
import type { Task } from '@/hooks/useTasks';

interface EditTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  onSave: (id: string, title: string, description: string, targetCycles: number) => void;
  onDelete: (id: string) => void;
}

export function EditTaskDialog({ open, onOpenChange, task, onSave, onDelete }: EditTaskDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetCycles, setTargetCycles] = useState(4);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setTargetCycles(task.targetCycles);
    }
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !task) return;
    
    onSave(task.id, title.trim(), description.trim(), targetCycles);
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (task) {
      onDelete(task.id);
      onOpenChange(false);
    }
  };

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa Task</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Tên task *</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Viết báo cáo..."
              maxLength={100}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-description">Mô tả (tùy chọn)</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Chi tiết về công việc..."
              maxLength={500}
              rows={3}
            />
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Số chu kỳ Pomodoro</Label>
              <span className="text-lg font-semibold text-primary">
                {targetCycles} 🍅
              </span>
            </div>
            <Slider
              value={[targetCycles]}
              onValueChange={(value) => setTargetCycles(value[0])}
              min={1}
              max={12}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Đã hoàn thành: {task.completedCycles} 🍅</span>
              <span>≈ {Math.round(targetCycles * 25)} phút</span>
            </div>
          </div>
          
          <DialogFooter className="flex-row gap-2">
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={handleDelete}
              className="shrink-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <div className="flex-1 flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={!title.trim()}>
                Lưu
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
