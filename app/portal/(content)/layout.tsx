// app/portal/layout.tsx
'use client';

import type { ReactNode } from 'react';
import ThemeToggle from '@/components/ThemeToggle';
import PortalHeader from './PortalHeader';

export default function PortalLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-800 transition-colors duration-300">
            <ThemeToggle />
            <PortalHeader />
            {children}
        </div>
    );
}
