import { useLocalStorage } from './useLocalStorage';

interface SidebarState {
  tasks: boolean;
  music: boolean;
  reminders: boolean;
}

const DEFAULT_STATE: SidebarState = {
  tasks: true,
  music: true,
  reminders: true,
};

export function useSidebarState() {
  const [state, setState] = useLocalStorage<SidebarState>('focusflow-sidebar-state', DEFAULT_STATE);

  const setExpanded = (section: keyof SidebarState, expanded: boolean) => {
    setState((prev) => ({
      ...prev,
      [section]: expanded,
    }));
  };

  return {
    isTasksExpanded: state.tasks,
    isMusicExpanded: state.music,
    isRemindersExpanded: state.reminders,
    setTasksExpanded: (expanded: boolean) => setExpanded('tasks', expanded),
    setMusicExpanded: (expanded: boolean) => setExpanded('music', expanded),
    setRemindersExpanded: (expanded: boolean) => setExpanded('reminders', expanded),
  };
}
