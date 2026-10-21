import { ImgHTMLAttributes } from 'react';

export default function ApplicationLogo({
    className = '',
    alt = 'Logo UNG',
    ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            src="/img/ung-logo.png"
            alt={alt}
            className={`select-none object-contain ${className}`}
            {...props}
        />
    );
}
