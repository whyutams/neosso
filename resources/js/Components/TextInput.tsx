import {
    forwardRef,
    InputHTMLAttributes,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Tooltip from '@/Components/Tooltip';

export default forwardRef(function TextInput(
    {
        type = 'text',
        className = '',
        isFocused = false,
        ...props
    }: InputHTMLAttributes<HTMLInputElement> & { isFocused?: boolean },
    ref,
) {
    const [showPassword, setShowPassword] = useState(false);
    const localRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    const isPassword = type === 'password';
    const actualType = isPassword ? (showPassword ? 'text' : 'password') : type;

    const inputNode = (
        <input
            {...props}
            type={actualType}
            className={
                'rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 py-2.5 px-3.5 text-sm shadow-sm transition hover:border-slate-400 dark:hover:border-slate-600 focus:border-ung-maroon focus:ring-ung-maroon ' +
                (isPassword ? 'pr-10 ' : '') +
                className
            }
            ref={localRef}
        />
    );

    if (isPassword) {
        return (
            <div className="relative w-full">
                {inputNode}
                <Tooltip content={showPassword ? 'Sembunyikan password' : 'Lihat password'} position="top">
                    <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition focus:outline-none"
                        aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                    >
                        {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                    </button>
                </Tooltip>
            </div>
        );
    }

    return inputNode;
});
