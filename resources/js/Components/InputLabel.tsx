import { LabelHTMLAttributes } from 'react';

export default function InputLabel({
    value,
    className = '',
    children,
    required = false,
    ...props
}: LabelHTMLAttributes<HTMLLabelElement> & { value?: string; required?: boolean }) {
    return (
        <label
            {...props}
            className={
                `block text-sm font-medium text-slate-700 dark:text-slate-300 ` +
                className
            }
        >
            {value ? value : children}
            {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
    );
}

