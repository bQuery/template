/**
 * @file Dashboard page module.
 *
 * Protected page (requires authentication) that demonstrates:
 * - **Store** state management with dynamic data
 * - **View** list rendering (`bq-for`) and conditional rendering
 * - **Reactive** computed values and effects
 * - **Motion** animations for list items
 */

import { appStore } from '@/stores/app.store';
import { authStore } from '@/stores/auth.store';
import { counterStore } from '@/stores/counter.store';
import { runFlipAnimation } from '@/utils/animation.utils';
import { setPageTitle } from '@/utils/dom.utils';
import { computed, signal } from '@bquery/bquery/reactive';
import { escapeHtml } from '@bquery/bquery/security';
import { mount } from '@bquery/bquery/view';

/** Shape of a single task item displayed in the dashboard. */
interface Task {
  id: string;
  title: string;
  done: boolean;
}

/**
 * Render and mount the Dashboard page into the given container element.
 *
 * @param container - DOM element to render into.
 * @returns Cleanup object with a `destroy()` method.
 */
export function renderDashboardPage(container: HTMLElement): {
  destroy: () => void;
} {
  setPageTitle('Dashboard');

  /** Reactive task list. */
  const tasks = signal<Task[]>([
    { id: '1', title: 'Set up bQuery project', done: true },
    { id: '2', title: 'Create reusable components', done: true },
    { id: '3', title: 'Implement routing', done: false },
    { id: '4', title: 'Add dark mode support', done: false },
    { id: '5', title: 'Write documentation', done: false },
  ]);

  /** New-task input model. */
  const newTaskTitle = signal('');

  /** Total tasks. */
  const totalTasks = computed(() => tasks.value.length);

  /** Completed count. */
  const completedTasks = computed(
    () => tasks.value.filter((t) => t.done).length
  );

  /** Progress percentage. */
  const progressPercent = computed(() => {
    const total = totalTasks.value;
    return total === 0 ? 0 : Math.round((completedTasks.value / total) * 100);
  });

  container.innerHTML = /* html */ `
    <div class="page-container">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-extrabold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p class="text-gray-500 dark:text-gray-400 mt-1">
            Welcome back, <span bq-text="userName" class="font-semibold text-indigo-600 dark:text-indigo-400"></span>
          </p>
        </div>
        <button
          bq-on:click="logout"
          class="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg
                 hover:bg-red-100 transition-colors dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
        >
          Logout
        </button>
      </div>

      <!-- Stats Row -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <p class="text-sm text-gray-500 dark:text-gray-400">Counter Value</p>
          <p bq-text="count" class="text-3xl font-bold text-gray-900 dark:text-white mt-1"></p>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <p class="text-sm text-gray-500 dark:text-gray-400">Tasks Done</p>
          <p class="text-3xl font-bold text-gray-900 dark:text-white mt-1">
            <span bq-text="completedTasks"></span> / <span bq-text="totalTasks"></span>
          </p>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <p class="text-sm text-gray-500 dark:text-gray-400">Progress</p>
          <p class="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
            <span bq-text="progressPercent"></span>%
          </p>
        </div>
      </div>

      <!-- Progress Bar -->
      <div class="mb-8">
        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div
            class="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
            bq-style="{ width: progressBarWidth }"
          ></div>
        </div>
      </div>

      <!-- Task List -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Task List
        </h2>

        <!-- Add Task -->
        <div class="flex gap-2 mb-4">
          <input
            type="text"
            bq-model="newTaskTitle"
            placeholder="Add a new task…"
            class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm
                   focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                   dark:bg-gray-900 dark:border-gray-600 dark:text-white"
          />
          <button
            bq-on:click="addTask"
            class="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg
                   hover:bg-indigo-700 transition-colors"
          >
            Add
          </button>
        </div>

        <!-- Tasks -->
        <ul
          id="dashboard-task-list"
          class="divide-y divide-gray-100 dark:divide-gray-700"
        >
            <li
              bq-for="task in tasks"
              class="flex items-center gap-3 py-3"
              bq-bind:data-flip-key="task.id"
            >
              <input
                type="checkbox"
                bq-bind:checked="task.done"
                bq-on:change="toggleTask(task.value.id)"
                class="w-4 h-4 text-indigo-600 rounded border-gray-300
                       focus:ring-indigo-500 dark:border-gray-600"
              />
              <span
                bq-text="task.title"
                bq-class="{ 'line-through text-gray-400': task.done }"
                class="flex-1 text-sm text-gray-700 dark:text-gray-300"
              ></span>
              <button
                bq-on:click="removeTask(task.value.id)"
                class="text-gray-400 hover:text-red-500 transition-colors text-sm"
              >
                ✕
              </button>
            </li>
        </ul>
      </div>
    </div>
  `;

  const view = mount(container, {
    userName: computed(() => authStore.userName),
    count: computed(() => counterStore.count),
    completedTasks,
    totalTasks,
    progressPercent,
    progressBarWidth: computed(() => `${progressPercent.value}%`),
    tasks,
    newTaskTitle,

    addTask: () => {
      const title = newTaskTitle.value.trim();
      if (!title) return;
      runFlipAnimation('#dashboard-task-list');
      const safeTitle = escapeHtml(title);
      tasks.value = [
        ...tasks.value,
        { id: crypto.randomUUID(), title: safeTitle, done: false },
      ];
      newTaskTitle.value = '';
    },

    toggleTask: (id: string) => {
      runFlipAnimation('#dashboard-task-list');
      tasks.value = tasks.value.map((t) =>
        t.id === id ? { ...t, done: !t.done } : t
      );
    },

    removeTask: (id: string) => {
      runFlipAnimation('#dashboard-task-list');
      tasks.value = tasks.value.filter((t) => t.id !== id);
    },

    logout: async () => {
      await authStore.logout();
      appStore.addNotification({
        type: 'info',
        message: 'You have been logged out.',
      });
      /* Navigation to /login is handled by the auth guard */
      const { navigate } = await import('@bquery/bquery/router');
      navigate('/login');
    },
  });

  return view;
}
