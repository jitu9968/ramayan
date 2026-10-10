import React from 'react';
import { X, Minus, Plus, Sun, Moon, Type, AlignLeft } from 'lucide-react';
import { ReaderSettings, ThemeMode } from '../../types/ramayan';

interface ReaderSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ReaderSettings;
  onUpdateSettings: (newSettings: Partial<ReaderSettings>) => void;
}

export const ReaderSettingsModal: React.FC<ReaderSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings
}) => {
  if (!isOpen) return null;

  const handleFontSizeChange = (delta: number) => {
    const newSize = Math.min(32, Math.max(16, settings.fontSize + delta));
    onUpdateSettings({ fontSize: newSize });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl theme-card theme-border border shadow-2xl p-5 space-y-6 pt-safe pb-safe-or-6 animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b theme-border">
          <div className="flex items-center gap-2">
            <Type className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-bold theme-text">Reading Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full theme-bg theme-text hover:opacity-80 active:scale-95 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Theme Switcher */}
        <div className="space-y-2.5">
          <label className="text-xs font-semibold theme-muted uppercase tracking-wider">
            Reading Theme
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {/* Light Theme Pill */}
            <button
              onClick={() => onUpdateSettings({ theme: 'light' })}
              className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                settings.theme === 'light'
                  ? 'border-amber-600 ring-2 ring-amber-500/30 font-bold'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
              style={{ backgroundColor: '#FDFBF7', color: '#2D3748' }}
            >
              <Sun className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-medium">Light</span>
            </button>

            {/* Sepia Theme Pill */}
            <button
              onClick={() => onUpdateSettings({ theme: 'sepia' })}
              className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                settings.theme === 'sepia'
                  ? 'border-amber-800 ring-2 ring-amber-700/30 font-bold'
                  : 'border-amber-200'
              }`}
              style={{ backgroundColor: '#F4ECD8', color: '#4A3728' }}
            >
              <div className="w-4 h-4 rounded-full bg-amber-800/20 border border-amber-800" />
              <span className="text-xs font-medium">Sepia</span>
            </button>

            {/* Dark Theme Pill */}
            <button
              onClick={() => onUpdateSettings({ theme: 'dark' })}
              className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                settings.theme === 'dark'
                  ? 'border-orange-500 ring-2 ring-orange-500/30 font-bold'
                  : 'border-gray-700'
              }`}
              style={{ backgroundColor: '#1A202C', color: '#E2E8F0' }}
            >
              <Moon className="w-4 h-4 text-orange-400" />
              <span className="text-xs font-medium">Dark</span>
            </button>
          </div>
        </div>

        {/* 2. Font Size Adjuster */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs font-semibold theme-muted uppercase tracking-wider">
            <span>Font Size</span>
            <span className="theme-text font-mono font-bold text-sm">{settings.fontSize}px</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleFontSizeChange(-2)}
              disabled={settings.fontSize <= 16}
              className="p-2.5 rounded-xl theme-bg border theme-border theme-text disabled:opacity-40 active:scale-95 transition-all"
            >
              <Minus className="w-4 h-4" />
            </button>

            <input
              type="range"
              min="16"
              max="32"
              step="1"
              value={settings.fontSize}
              onChange={(e) => onUpdateSettings({ fontSize: parseInt(e.target.value, 10) })}
              className="w-full accent-amber-600 cursor-pointer h-2 rounded-lg bg-gray-200 dark:bg-gray-700"
            />

            <button
              onClick={() => handleFontSizeChange(2)}
              disabled={settings.fontSize >= 32}
              className="p-2.5 rounded-xl theme-bg border theme-border theme-text disabled:opacity-40 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3. Line Spacing / Height */}
        <div className="space-y-2.5">
          <label className="text-xs font-semibold theme-muted uppercase tracking-wider">
            Line Spacing (Diacritics Matras Guard)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onUpdateSettings({ lineHeight: 'relaxed' })}
              className={`p-2.5 rounded-xl border text-xs font-medium transition-all ${
                settings.lineHeight === 'relaxed'
                  ? 'bg-amber-600 text-white border-amber-600 font-semibold'
                  : 'theme-bg theme-border theme-text'
              }`}
            >
              Relaxed Spacing
            </button>
            <button
              onClick={() => onUpdateSettings({ lineHeight: 'loose' })}
              className={`p-2.5 rounded-xl border text-xs font-medium transition-all ${
                settings.lineHeight === 'loose'
                  ? 'bg-amber-600 text-white border-amber-600 font-semibold'
                  : 'theme-bg theme-border theme-text'
              }`}
            >
              Loose Spacing
            </button>
          </div>
        </div>

        {/* Apply & Close */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold text-sm shadow-md hover:shadow-lg active:scale-95 transition-all"
        >
          Done
        </button>
      </div>
    </div>
  );
};
