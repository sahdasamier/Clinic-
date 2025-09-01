import { TaskItem } from './types';

// Namespace for localStorage keys
const STORAGE_KEY = 'clinic_lab_tasks';

// Default tasks
const DEFAULT_TASKS: Omit<TaskItem, 'id'>[] = [
  { text: 'Wire Patient→Lab integration (createAndOpenLabOrder)', done: false },
  { text: 'Build Orders store with persistence', done: false },
  { text: 'Implement LabPage with prefilled patient fields', done: false },
  { text: 'Add WhatsApp send icon (non‑sensitive text)', done: false },
  { text: 'Implement status transitions & item toggles', done: false },
  { text: 'Build Lab & Radiology list with filter and shared layout', done: false },
  { text: 'Validation: phone number handling', done: false },
  { text: 'Privacy review (avoid PHI in external messages)', done: false }
];

// Tasks store interface
export interface TasksStore {
  getTasks: () => TaskItem[];
  updateTask: (taskId: string, done: boolean) => void;
  resetTasks: () => void;
}

// Tasks store implementation
class TasksStoreImpl implements TasksStore {
  private tasks: TaskItem[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.tasks));
    } catch (error) {
      console.error('Failed to save tasks to localStorage:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.tasks = JSON.parse(stored);
      } else {
        // Initialize with default tasks if nothing stored
        this.tasks = DEFAULT_TASKS.map((task, index) => ({
          id: `task-${index + 1}`,
          ...task
        }));
        this.saveToStorage();
      }
    } catch (error) {
      console.error('Failed to load tasks from localStorage:', error);
      this.tasks = [];
    }
  }

  getTasks(): TaskItem[] {
    return this.tasks;
  }

  updateTask(taskId: string, done: boolean): void {
    const taskIndex = this.tasks.findIndex(task => task.id === taskId);
    if (taskIndex !== -1) {
      this.tasks[taskIndex] = {
        ...this.tasks[taskIndex],
        done
      };
      this.saveToStorage();
    }
  }

  resetTasks(): void {
    this.tasks = DEFAULT_TASKS.map((task, index) => ({
      id: `task-${index + 1}`,
      ...task
    }));
    this.saveToStorage();
  }
}

// Export singleton instance
export const tasksStore = new TasksStoreImpl();