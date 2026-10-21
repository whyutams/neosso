import { InputHTMLAttributes } from 'react';

export default function Checkbox({
    className = '',
    ...props
}: InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'rounded border-slate-300 text-ung-maroon shadow-sm focus:ring-ung-maroon ' +
                className
            }
        />
    );
}
