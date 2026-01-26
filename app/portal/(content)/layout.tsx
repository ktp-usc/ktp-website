// app/portal/layout.tsx
'use client';

import type { ReactNode } from 'react';
import PortalHeader from './PortalHeader';

export default function PortalLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50 dark:bg-linear-to-br dark:from-gray-800 dark:to-gray-800 transition-colors duration-300">
            <PortalHeader />
            {children}
        </div>
    );
}
