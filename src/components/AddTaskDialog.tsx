import { useState } from 'react';
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

interface AddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (title: string, description: string, targetCycles: number) => void;
}

export function AddTaskDialog({ open, onOpenChange, onAdd }: AddTaskDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetCycles, setTargetCycles] = useState(4);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    onAdd(title.trim(), description.trim(), targetCycles);
    
    // Reset form
    setTitle('');
    setDescription('');
    setTargetCycles(4);
    onOpenChange(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      setTitle('');
      setDescription('');
      setTargetCycles(4);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Thêm Task mới</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Tên task *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Viết báo cáo..."
              maxLength={100}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả (tùy chọn)</Label>
            <Textarea
              id="description"
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
            <p className="text-xs text-muted-foreground">
              ≈ {Math.round(targetCycles * 25)} phút tập trung
            </p>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={!title.trim()}>
              Thêm Task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
