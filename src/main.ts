import { $, signal, computed, effect } from '@bquery/bquery';
import './components/greeting-card';

// ── Reactive Counter ────────────────────────────────────────────────
const count = signal(0);
const doubled = computed(() => count.value * 2);

effect(() => {
  $('#count').text(String(count.value));
  $('#doubled').text(String(doubled.value));
});

$('#increment').on('click', () => {
  count.value++;
});

$('#decrement').on('click', () => {
  count.value--;
});

$('#reset').on('click', () => {
  count.value = 0;
});

// ── To-Do List ──────────────────────────────────────────────────────
interface Todo {
  id: number;
  text: string;
  done: boolean;
}

const todos = signal<Todo[]>([]);
let nextId = 1;

function renderTodos() {
  const list = document.querySelector('#todo-list');
  if (!list) return;

  const focused = document.activeElement;
  const focusedId = focused?.closest('li')?.dataset.todoId;
  const focusedIsRemove =
    focused instanceof HTMLButtonElement &&
    focused.dataset.action === 'remove';

  list.innerHTML = '';
  for (const todo of todos.value) {
    const li = document.createElement('li');
    li.className = todo.done ? 'done' : '';
    li.dataset.todoId = String(todo.id);

    const toggleButton = document.createElement('button');
    toggleButton.type = 'button';
    toggleButton.textContent = todo.text;
    toggleButton.setAttribute('aria-label', `Toggle todo "${todo.text}"`);
    toggleButton.setAttribute('aria-pressed', String(todo.done));
    toggleButton.addEventListener('click', () => {
      todos.value = todos.value.map((t) =>
        t.id === todo.id ? { ...t, done: !t.done } : t
      );
    });

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.textContent = '✕';
    removeBtn.dataset.action = 'remove';
    removeBtn.setAttribute('aria-label', `Remove todo "${todo.text}"`);
    removeBtn.addEventListener('click', () => {
      todos.value = todos.value.filter((t) => t.id !== todo.id);
    });

    li.appendChild(toggleButton);
    li.appendChild(removeBtn);
    list.appendChild(li);
  }

  if (focusedId) {
    const target = list.querySelector(`li[data-todo-id="${focusedId}"]`);
    if (target) {
      const btn = focusedIsRemove
        ? target.querySelector<HTMLButtonElement>('button[data-action="remove"]')
        : target.querySelector<HTMLButtonElement>('button:first-of-type');
      btn?.focus();
    }
  }
}

effect(() => {
  renderTodos();
});

const form = document.querySelector('#todo-form');
const input = document.querySelector('#todo-input') as HTMLInputElement | null;

form?.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!input) return;

  const text = input.value.trim();
  if (!text) return;

  todos.value = [...todos.value, { id: nextId++, text, done: false }];
  input.value = '';
});
