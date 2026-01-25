import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

export interface Task {
  id: string;
  title: string;
  description: string;
  targetCycles: number;
  completedCycles: number;
  isCompleted: boolean;
  createdAt: number;
}

interface TasksState {
  tasks: Task[];
  activeTaskId: string | null;
}

const initialState: TasksState = {
  tasks: [],
  activeTaskId: null,
};

export function useTasks() {
  const [state, setState] = useLocalStorage<TasksState>('focusflow-tasks', initialState);

  const addTask = useCallback((title: string, description: string, targetCycles: number) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      description,
      targetCycles,
      completedCycles: 0,
      isCompleted: false,
      createdAt: Date.now(),
    };

    setState((prev) => {
      const newTasks = [...prev.tasks, newTask];
      return {
        tasks: newTasks,
        // Auto-select as active if no active task
        activeTaskId: prev.activeTaskId || newTask.id,
      };
    });

    return newTask.id;
  }, [setState]);

  const updateTask = useCallback((id: string, updates: Partial<Pick<Task, 'title' | 'description' | 'targetCycles'>>) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) =>
        task.id === id ? { ...task, ...updates } : task
      ),
    }));
  }, [setState]);

  const deleteTask = useCallback((id: string) => {
    setState((prev) => {
      const newTasks = prev.tasks.filter((task) => task.id !== id);
      let newActiveId = prev.activeTaskId;
      
      // If deleting active task, select next incomplete task
      if (prev.activeTaskId === id) {
        const nextTask = newTasks.find((t) => !t.isCompleted);
        newActiveId = nextTask?.id || null;
      }
      
      return {
        tasks: newTasks,
        activeTaskId: newActiveId,
      };
    });
  }, [setState]);

  const setActiveTask = useCallback((id: string | null) => {
    setState((prev) => ({
      ...prev,
      activeTaskId: id,
    }));
  }, [setState]);

  const incrementCycle = useCallback((id: string) => {
    let taskCompleted = false;
    
    setState((prev) => {
      const updatedTasks = prev.tasks.map((task) => {
        if (task.id === id) {
          const newCompletedCycles = task.completedCycles + 1;
          if (newCompletedCycles >= task.targetCycles) {
            taskCompleted = true;
          }
          return { ...task, completedCycles: newCompletedCycles };
        }
        return task;
      });
      
      return { ...prev, tasks: updatedTasks };
    });
    
    return taskCompleted;
  }, [setState]);

  const markComplete = useCallback((id: string) => {
    setState((prev) => {
      const updatedTasks = prev.tasks.map((task) =>
        task.id === id ? { ...task, isCompleted: true } : task
      );
      
      // Auto-select next incomplete task
      let newActiveId = prev.activeTaskId;
      if (prev.activeTaskId === id) {
        const nextTask = updatedTasks.find((t) => !t.isCompleted);
        newActiveId = nextTask?.id || null;
      }
      
      return {
        tasks: updatedTasks,
        activeTaskId: newActiveId,
      };
    });
  }, [setState]);

  const addMoreCycles = useCallback((id: string, additionalCycles: number) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) =>
        task.id === id
          ? { ...task, targetCycles: task.targetCycles + additionalCycles }
          : task
      ),
    }));
  }, [setState]);

  const getActiveTask = useCallback((): Task | null => {
    return state.tasks.find((t) => t.id === state.activeTaskId) || null;
  }, [state.tasks, state.activeTaskId]);

  const incompleteTasks = state.tasks.filter((t) => !t.isCompleted);
  const completedTasks = state.tasks.filter((t) => t.isCompleted);

  return {
    tasks: state.tasks,
    activeTaskId: state.activeTaskId,
    activeTask: getActiveTask(),
    incompleteTasks,
    completedTasks,
    addTask,
    updateTask,
    deleteTask,
    setActiveTask,
    incrementCycle,
    markComplete,
    addMoreCycles,
  };
}
