import { useEffect, useRef, useState } from 'react';
import { Check, Monitor, Moon, Sun } from 'lucide-react';
import { Theme, useTheme } from '@/Hooks/useTheme';

export default function ThemeToggle() {
    const { theme, isDark, setTheme } = useTheme();
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false);
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, []);

    const options: { key: Theme; label: string; icon: typeof Sun }[] = [
        { key: 'light', label: 'Terang', icon: Sun },
        { key: 'dark', label: 'Gelap', icon: Moon },
        { key: 'system', label: 'Sistem', icon: Monitor },
    ];

    const CurrentIcon = theme === 'system' ? Monitor : isDark ? Moon : Sun;

    return (
        <div ref={dropdownRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                title="Pilih tema"
                aria-label="Pilih tema"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/90 bg-white text-slate-600 transition-colors duration-200 ease-in-out hover:bg-slate-50 hover:text-[#9e1a1a] hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-rose-400"
            >
                <CurrentIcon className="h-5 w-5 transition-transform duration-200 hover:scale-105" />
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-36 origin-top-right rounded-2xl border border-slate-200/90 bg-white p-1.5 shadow-xl transition-all duration-150 z-50 dark:border-slate-800 dark:bg-slate-900">
                    <div className="space-y-0.5">
                        {options.map((option) => {
                            const Icon = option.icon;
                            const isSelected = theme === option.key;

                            return (
                                <button
                                    key={option.key}
                                    type="button"
                                    onClick={() => {
                                        setTheme(option.key);
                                        setOpen(false);
                                    }}
                                    className={`w-full flex items-center justify-between gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium transition-colors duration-150 ${
                                        isSelected
                                            ? 'bg-rose-50 text-[#9e1a1a] dark:bg-rose-950/40 dark:text-rose-400 font-semibold'
                                            : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <Icon className="h-4 w-4 shrink-0" />
                                        <span>{option.label}</span>
                                    </div>
                                    {isSelected && <Check className="h-3.5 w-3.5 shrink-0" />}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
