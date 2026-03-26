import React from 'react';
import { THEMES, EFFECTS } from '../constants';
import { cn } from '../lib/utils';
import { Palette, Sparkles } from 'lucide-react';

interface ThemeEffectSettingsProps {
  currentTheme: string;
  currentEffect: string;
  onThemeChange: (themeId: string) => void;
  onEffectChange: (effectId: string) => void;
}

export const ThemeEffectSettings = ({
  currentTheme,
  currentEffect,
  onThemeChange,
  onEffectChange,
}: ThemeEffectSettingsProps) => {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
        <Palette className="w-5 h-5 text-teal-500" />
        Cài đặt Giao diện & Hiệu ứng
      </h3>

      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Chủ đề (Theme)</label>
        <div className="grid grid-cols-2 gap-2">
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() => onThemeChange(theme.id)}
              className={cn(
                "px-3 py-2 rounded-lg text-sm font-medium transition-all text-left",
                currentTheme === theme.id
                  ? "bg-teal-500 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              )}
            >
              {theme.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Hiệu ứng (Effect)
        </label>
        <div className="grid grid-cols-2 gap-2">
          {EFFECTS.map((effect) => (
            <button
              key={effect.id}
              onClick={() => onEffectChange(effect.id)}
              className={cn(
                "px-3 py-2 rounded-lg text-sm font-medium transition-all text-left",
                currentEffect === effect.id
                  ? "bg-teal-500 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              )}
            >
              {effect.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
