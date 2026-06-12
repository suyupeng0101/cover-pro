import type { Theme } from '../types';

export const themes: Theme[] = [
  {
    id: 'quantum-cyan',
    name: 'Quantum Cyan',
    accent: '#00E5FF',
    accent2: '#7C5CFF',
    background: '#0B1020',
    foreground: '#EAFBFF',
    muted: '#8DA4BC',
  },
  {
    id: 'signal-green',
    name: 'Signal Green',
    accent: '#4DFF88',
    accent2: '#00D1A7',
    background: '#07130C',
    foreground: '#DFFFE9',
    muted: '#84B796',
  },
  {
    id: 'magenta-pulse',
    name: 'Magenta Pulse',
    accent: '#FF3DF2',
    accent2: '#00E5FF',
    background: '#140718',
    foreground: '#FFE9FD',
    muted: '#D6A8D2',
  },
  {
    id: 'warning-amber',
    name: 'Warning Amber',
    accent: '#FFB020',
    accent2: '#FF315A',
    background: '#151009',
    foreground: '#FFF2D2',
    muted: '#D7B774',
  },
  {
    id: 'cold-white',
    name: 'Cold White',
    accent: '#E8F0FF',
    accent2: '#9DB2D6',
    background: '#080A10',
    foreground: '#F8FBFF',
    muted: '#9DB2D6',
  },
  {
    id: 'red-alert',
    name: 'Red Alert',
    accent: '#FF315A',
    accent2: '#FFB020',
    background: '#12070B',
    foreground: '#FFE3EA',
    muted: '#D693A3',
  },
];

export const defaultTheme = themes[0];
