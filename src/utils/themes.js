/**
 * themes.js — Theme configurations for Vanish Room
 */

export const themes = {
  dark: {
    name: 'Dark',
    '--bg-primary': '#080818',
    '--bg-secondary': '#0f0f28',
    '--bg-tertiary': '#161640',
    '--bg-glass': 'rgba(14, 14, 38, 0.75)',
    '--bg-glass-hover': 'rgba(22, 22, 64, 0.85)',
    '--bg-chat': '#0a0a20',
    '--bg-bubble-self': 'linear-gradient(135deg, #7c3aed, #a855f7)',
    '--bg-bubble-other': 'rgba(22, 22, 55, 0.85)',
    '--bg-input': 'rgba(14, 14, 38, 0.95)',
    '--text-primary': '#eef0ff',
    '--text-secondary': '#9ca0c8',
    '--text-muted': '#55587a',
    '--accent': '#a855f7',
    '--accent-hover': '#c084fc',
    '--accent-glow': 'rgba(168, 85, 247, 0.25)',
    '--accent-subtle': 'rgba(168, 85, 247, 0.08)',
    '--danger': '#ef4444',
    '--danger-hover': '#f87171',
    '--success': '#22c55e',
    '--warning': '#f59e0b',
    '--border': 'rgba(100, 100, 180, 0.12)',
    '--border-strong': 'rgba(100, 100, 180, 0.25)',
    '--shadow': '0 8px 32px rgba(0, 0, 0, 0.5)',
    '--shadow-sm': '0 2px 8px rgba(0, 0, 0, 0.3)',
    '--gradient-hero': 'linear-gradient(135deg, #080818 0%, #150a2e 40%, #0a162e 80%, #080818 100%)',
  },
  light: {
    name: 'Light',
    '--bg-primary': '#f5f6fc',
    '--bg-secondary': '#ffffff',
    '--bg-tertiary': '#eceef8',
    '--bg-glass': 'rgba(255, 255, 255, 0.8)',
    '--bg-glass-hover': 'rgba(255, 255, 255, 0.95)',
    '--bg-chat': '#f0f2fc',
    '--bg-bubble-self': 'linear-gradient(135deg, #7c3aed, #a855f7)',
    '--bg-bubble-other': 'rgba(255, 255, 255, 0.95)',
    '--bg-input': 'rgba(255, 255, 255, 0.98)',
    '--text-primary': '#12122e',
    '--text-secondary': '#4a4a6e',
    '--text-muted': '#8a8aaa',
    '--accent': '#7c3aed',
    '--accent-hover': '#9333ea',
    '--accent-glow': 'rgba(124, 58, 237, 0.18)',
    '--accent-subtle': 'rgba(124, 58, 237, 0.06)',
    '--danger': '#dc2626',
    '--danger-hover': '#ef4444',
    '--success': '#16a34a',
    '--warning': '#d97706',
    '--border': 'rgba(0, 0, 0, 0.06)',
    '--border-strong': 'rgba(0, 0, 0, 0.1)',
    '--shadow': '0 8px 32px rgba(0, 0, 0, 0.06)',
    '--shadow-sm': '0 2px 8px rgba(0, 0, 0, 0.04)',
    '--gradient-hero': 'linear-gradient(135deg, #f5f6fc 0%, #e8e5fc 40%, #e0e8fc 80%, #f5f6fc 100%)',
  },
};

/**
 * Apply a theme to the document root
 */
export function applyTheme(themeName, customColors) {
  const root = document.documentElement;
  const theme = themes[themeName] || themes.dark;

  Object.entries(theme).forEach(([key, value]) => {
    if (key.startsWith('--')) {
      root.style.setProperty(key, value);
    }
  });

  // Apply custom bubble colors if provided
  if (customColors) {
    if (customColors.bubbleSelf) {
      root.style.setProperty('--bg-bubble-self', customColors.bubbleSelf);
    }
    if (customColors.bubbleOther) {
      root.style.setProperty('--bg-bubble-other', customColors.bubbleOther);
    }
    if (customColors.accent) {
      root.style.setProperty('--accent', customColors.accent);
    }
  }
}
