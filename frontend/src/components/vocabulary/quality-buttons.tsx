'use client';

import { cn } from '@/lib/utils';

interface QualityButtonsProps {
  onSelect: (quality: 0 | 2 | 4 | 5) => void;
  disabled: boolean;
}

const BUTTONS: Array<{
  quality: 0 | 2 | 4 | 5;
  label: string;
  sublabel: string;
  shortcut: string;
  emoji: string;
  bgClass: string;
  hoverClass: string;
  textClass: string;
}> = [
  {
    quality: 0,
    label: 'Yana',
    sublabel: 'Eslay olmadim',
    shortcut: '1',
    emoji: '😅',
    bgClass: 'bg-red-500/10 border-red-500/30',
    hoverClass: 'hover:bg-red-500/20 hover:border-red-500/50',
    textClass: 'text-red-600 dark:text-red-400',
  },
  {
    quality: 2,
    label: 'Qiyin',
    sublabel: 'Eslab oldim, lekin qiyin',
    shortcut: '2',
    emoji: '🤔',
    bgClass: 'bg-amber-500/10 border-amber-500/30',
    hoverClass: 'hover:bg-amber-500/20 hover:border-amber-500/50',
    textClass: 'text-amber-600 dark:text-amber-400',
  },
  {
    quality: 4,
    label: 'Yaxshi',
    sublabel: 'Bemalol esladim',
    shortcut: '3',
    emoji: '😊',
    bgClass: 'bg-blue-500/10 border-blue-500/30',
    hoverClass: 'hover:bg-blue-500/20 hover:border-blue-500/50',
    textClass: 'text-blue-600 dark:text-blue-400',
  },
  {
    quality: 5,
    label: 'Oson',
    sublabel: 'Juda oson',
    shortcut: '4',
    emoji: '🎯',
    bgClass: 'bg-green-500/10 border-green-500/30',
    hoverClass: 'hover:bg-green-500/20 hover:border-green-500/50',
    textClass: 'text-green-600 dark:text-green-400',
  },
];

export function QualityButtons({ onSelect, disabled }: QualityButtonsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {BUTTONS.map((btn) => (
        <button
          key={btn.quality}
          onClick={() => onSelect(btn.quality)}
          disabled={disabled}
          className={cn(
            'rounded-xl border-2 px-4 py-3 transition-all',
            'active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
            btn.bgClass,
            !disabled && btn.hoverClass,
          )}
        >
          <div className="text-2xl mb-1">{btn.emoji}</div>
          <p className={cn('font-bold text-sm', btn.textClass)}>
            {btn.label}
          </p>
          <p className="text-[10px] text-[var(--color-muted-foreground)] mt-0.5 leading-tight">
            {btn.sublabel}
          </p>
          <p className="text-[10px] text-[var(--color-muted-foreground)] mt-1 opacity-70 hidden md:block">
            ({btn.shortcut})
          </p>
        </button>
      ))}
    </div>
  );
}