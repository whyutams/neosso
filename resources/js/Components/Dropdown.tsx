import { InertiaLinkProps, Link } from '@inertiajs/react';
import {
    createContext,
    Dispatch,
    PropsWithChildren,
    SetStateAction,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';

const DropDownContext = createContext<{
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    toggleOpen: () => void;
}>({
    open: false,
    setOpen: () => {},
    toggleOpen: () => {},
});

const Dropdown = ({ children }: PropsWithChildren) => {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const toggleOpen = () => {
        setOpen((previousState) => !previousState);
    };

    useEffect(() => {
        if (!open) return;

        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [open]);

    return (
        <DropDownContext.Provider value={{ open, setOpen, toggleOpen }}>
            <div ref={dropdownRef} className="relative">
                {children}
            </div>
        </DropDownContext.Provider>
    );
};

const Trigger = ({ children }: PropsWithChildren) => {
    const { toggleOpen } = useContext(DropDownContext);

    return <div onClick={toggleOpen}>{children}</div>;
};

const Content = ({
    align = 'right',
    width = '48',
    contentClasses = 'py-1 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xl rounded-lg',
    children,
}: PropsWithChildren<{
    align?: 'left' | 'right';
    width?: '48' | '56' | '60' | '64' | string;
    contentClasses?: string;
}>) => {
    const { open, setOpen } = useContext(DropDownContext);

    if (!open) return null;

    let alignmentClasses = 'origin-top';

    if (align === 'left') {
        alignmentClasses = 'ltr:origin-top-left rtl:origin-top-right start-0 left-0';
    } else if (align === 'right') {
        alignmentClasses = 'ltr:origin-top-right rtl:origin-top-left end-0 right-0';
    }

    let widthClasses = '';

    if (width === '48') {
        widthClasses = 'w-48';
    } else if (width === '56') {
        widthClasses = 'w-56';
    } else if (width === '60') {
        widthClasses = 'w-60';
    } else if (width === '64') {
        widthClasses = 'w-64';
    } else {
        widthClasses = width;
    }

    return (
        <div
            className={`absolute z-50 mt-2 ${alignmentClasses} ${widthClasses} origin-top-right transition-all duration-150`}
            onClick={() => setOpen(false)}
        >
            <div className={contentClasses}>
                {children}
            </div>
        </div>
    );
};

const DropdownLink = ({
    className = '',
    children,
    ...props
}: InertiaLinkProps) => {
    return (
        <Link
            {...props}
            className={
                'block w-full px-4 py-2 text-start text-sm leading-5 text-slate-700 dark:text-slate-200 transition-colors duration-200 ease-in-out hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-slate-100 dark:focus:bg-slate-800 focus:outline-none ' +
                className
            }
        >
            {children}
        </Link>
    );
};

Dropdown.Trigger = Trigger;
Dropdown.Content = Content;
Dropdown.Link = DropdownLink;

export default Dropdown;
