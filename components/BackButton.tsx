'use client';

import { useRouter } from 'next/navigation';

type BackButtonProps = {
    label?: string;
    className?: string;
};

export default function BackButton({ label = 'Back', className = '' }: BackButtonProps) {
    const router = useRouter();

    return (
        <button
            onClick={() => router.back()}
            type="button"
            className={`
                fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2
                rounded-full bg-white dark:bg-gray-800 shadow-lg
                hover:shadow-xl transition-all duration-300 hover:scale-105
                border border-gray-200 dark:border-gray-700
                text-gray-900 dark:text-white font-medium text-sm
                ${className}
            `}
        >
            <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
            </svg>
            {label}
        </button>
    );
}
