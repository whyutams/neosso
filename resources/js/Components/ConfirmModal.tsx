import { ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, Trash2 } from 'lucide-react';

interface ConfirmModalProps {
    show: boolean;
    title: string;
    message: ReactNode;
    confirmText?: string;
    cancelText?: string;
    isProcessing?: boolean;
    onConfirm: () => void;
    onClose: () => void;
    icon?: ReactNode;
}

export default function ConfirmModal({
    show,
    title,
    message,
    confirmText = 'Hapus',
    cancelText = 'Batal',
    isProcessing = false,
    onConfirm,
    onClose,
    icon,
}: ConfirmModalProps) {
    // Kunci scroll halaman dan tangani tombol Escape saat modal terbuka
    useEffect(() => {
        if (!show) return;

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !isProcessing) {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = originalOverflow;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [show, isProcessing, onClose]);

    if (!show || typeof document === 'undefined') return null;

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto"
            onClick={() => {
                if (!isProcessing) onClose();
            }}
        >
            <div
                className="relative my-auto w-full max-w-md rounded-lg bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-4"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center gap-3.5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40">
                        {icon || <Trash2 className="h-6 w-6" />}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h3>
                    </div>
                </div>

                <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {message}
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                        type="button"
                        disabled={isProcessing}
                        onClick={onClose}
                        className="rounded-lg border border-slate-200 dark:border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        disabled={isProcessing}
                        onClick={onConfirm}
                        className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-50 shadow-sm"
                    >
                        {isProcessing && <Loader2 className="animate-spin h-4 w-4 text-white" />}
                        <span>{isProcessing ? `${confirmText}...` : confirmText}</span>
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
