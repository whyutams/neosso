import React, {
    ReactElement,
    ReactNode,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from 'react';
import { createPortal } from 'react-dom';

export type TooltipPosition = 'top' | 'right' | 'bottom' | 'left';

export interface TooltipProps {
    content: ReactNode;
    position?: TooltipPosition;
    delay?: number;
    enabled?: boolean;
    className?: string;
    children: ReactNode;
}

export default function Tooltip({
    content,
    position = 'top',
    delay = 100,
    enabled = true,
    className = '',
    children,
}: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isPositioned, setIsPositioned] = useState(false);
    const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

    const triggerRef = useRef<HTMLElement | null>(null);
    const tooltipRef = useRef<HTMLDivElement | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const updateCoords = () => {
        if (!triggerRef.current || !tooltipRef.current) return;

        const triggerRect = triggerRef.current.getBoundingClientRect();
        const tooltipRect = tooltipRef.current.getBoundingClientRect();

        const gap = 8;
        let top = 0;
        let left = 0;

        switch (position) {
            case 'right':
                top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
                left = triggerRect.right + gap;
                break;
            case 'bottom':
                top = triggerRect.bottom + gap;
                left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
                break;
            case 'left':
                top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
                left = triggerRect.left - tooltipRect.width - gap;
                break;
            case 'top':
            default:
                top = triggerRect.top - tooltipRect.height - gap;
                left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
                break;
        }

        // Pastikan tidak keluar dari batas layar
        const padding = 8;
        const maxLeft = window.innerWidth - tooltipRect.width - padding;
        const maxTop = window.innerHeight - tooltipRect.height - padding;

        left = Math.max(padding, Math.min(left, maxLeft));
        top = Math.max(padding, Math.min(top, maxTop));

        setCoords({ top, left });
        setIsPositioned(true);
    };

    const show = () => {
        if (!enabled || !content) return;
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            setIsVisible(true);
        }, delay);
    };

    const hide = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsVisible(false);
        setIsPositioned(false);
    };

    useLayoutEffect(() => {
        if (isVisible) {
            updateCoords();
        }
    }, [isVisible, content, position]);

    useEffect(() => {
        if (!isVisible) return;

        const handleScrollOrResize = () => hide();
        window.addEventListener('scroll', handleScrollOrResize, true);
        window.addEventListener('resize', handleScrollOrResize);

        return () => {
            window.removeEventListener('scroll', handleScrollOrResize, true);
            window.removeEventListener('resize', handleScrollOrResize);
        };
    }, [isVisible]);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    // Pointer panah penunjuk
    const arrowClass = {
        top: 'bottom-[-4px] left-1/2 -translate-x-1/2 border-r border-b border-slate-700/80 dark:border-slate-700',
        bottom: 'top-[-4px] left-1/2 -translate-x-1/2 border-l border-t border-slate-700/80 dark:border-slate-700',
        left: 'right-[-4px] top-1/2 -translate-y-1/2 border-r border-t border-slate-700/80 dark:border-slate-700',
        right: 'left-[-4px] top-1/2 -translate-y-1/2 border-l border-b border-slate-700/80 dark:border-slate-700',
    }[position];

    if (!React.isValidElement(children)) {
        return <>{children}</>;
    }

    const child = children as ReactElement<any>;

    const clonedChild = React.cloneElement(child, {
        ref: (node: HTMLElement | null) => {
            triggerRef.current = node;
            const originalRef = (child as any).ref;
            if (typeof originalRef === 'function') {
                originalRef(node);
            } else if (originalRef && typeof originalRef === 'object') {
                originalRef.current = node;
            }
        },
        title: undefined,
        onMouseEnter: (e: React.MouseEvent) => {
            show();
            child.props.onMouseEnter?.(e);
        },
        onMouseLeave: (e: React.MouseEvent) => {
            hide();
            child.props.onMouseLeave?.(e);
        },
        onFocus: (e: React.FocusEvent) => {
            show();
            child.props.onFocus?.(e);
        },
        onBlur: (e: React.FocusEvent) => {
            hide();
            child.props.onBlur?.(e);
        },
    });

    return (
        <>
            {clonedChild}

            {isVisible &&
                enabled &&
                Boolean(content) &&
                createPortal(
                    <div
                        ref={tooltipRef}
                        style={{
                            top: `${coords.top}px`,
                            left: `${coords.left}px`,
                        }}
                        role="tooltip"
                        className={`fixed z-[9999] pointer-events-none select-none transition-opacity duration-150 ease-out ${
                            isPositioned ? 'opacity-100' : 'opacity-0'
                        } ${className}`}
                    >
                        <div className="relative rounded-md bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-xs px-2.5 py-1 text-xs font-medium text-white shadow-xl border border-slate-700/70 whitespace-nowrap">
                            {content}
                            <div
                                className={`absolute h-2 w-2 rotate-45 bg-slate-900 dark:bg-slate-800 ${arrowClass}`}
                            />
                        </div>
                    </div>,
                    document.body
                )}
        </>
    );
}
