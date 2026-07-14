export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'dio-theme';

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function subscribeTheme(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getPreferredTheme(): Theme {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.classList.toggle('light', theme === 'light');
  root.style.colorScheme = theme;
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  notify();
}

export function toggleTheme(): Theme {
  const next: Theme = getPreferredTheme() === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  return next;
}
