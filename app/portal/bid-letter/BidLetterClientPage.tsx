// app/portal/bid-letter/BidLetterClient.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer';
import { toast } from 'sonner';

import { useMyApplicationQuery, useUpdateMyApplicationMutation } from '@/client/hooks/applications';

import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import BackButton from "@/components/BackButton";

type AppStatus = 'BID_OFFERED' | 'BID_ACCEPTED' | 'BID_DECLINED';

export default function BidLetterClientPage() {
    const router = useRouter();
    const [isDark, setIsDark] = useState(false);
    const [loading, setLoading] = useState(false);
    const [hasMounted, setHasMounted] = useState(false);

    const myAppQuery = useMyApplicationQuery();
    const updateMyApp = useUpdateMyApplicationMutation();

    useEffect(() => {
        setHasMounted(true);
        const darkMode = document.documentElement.classList.contains('dark');
        setIsDark(darkMode);
    }, []);

    const toggleTheme = () => {
        setIsDark((v) => !v);
        document.documentElement.classList.toggle('dark');
    };

    // ✅ memoize documents so DocViewer doesn't think it has "new docs" every render
    const documents = useMemo(
        () => [
            {
                uri: 'https://pdfobject.com/pdf/sample.pdf',
                fileType: 'pdf',
                fileName: 'bidLetter.pdf'
            }
        ],
        []
    );

    // ✅ memoize config object too
    const viewerConfig = useMemo(
        () => ({
            header: { disableHeader: false, disableFileName: false, retainURLParams: false },
            pdfZoom: { defaultZoom: 1.0, zoomJump: 0.1 },
            pdfVerticalScrollByDefault: true
        }),
        []
    );

    // ✅ memoize theme so it only changes when isDark changes
    const viewerTheme = useMemo(
        () => ({
            primary: '#ffffff',
            secondary: isDark ? '#1f2937' : '#f3f4f6',
            tertiary: isDark ? '#374151' : '#e5e7eb',
            textPrimary: '#111827',
            textSecondary: isDark ? '#ffffff' : '#6b7280',
            textTertiary: isDark ? '#d1d5db' : '#4b5563',
            disableThemeScrollbar: false
        }),
        [isDark]
    );

    async function setStatusAndReturn(nextStatus: AppStatus) {
        if (loading) return;

        const currentStatus = (myAppQuery.data as any)?.status as AppStatus | undefined;
        if (currentStatus && currentStatus !== 'BID_OFFERED') {
            router.replace('/portal');
            return;
        }

        const confirmed = window.confirm('This decision is final and cannot be changed. Continue?');
        if (!confirmed) return;

        setLoading(true);
        try {
            await updateMyApp.mutateAsync({ status: nextStatus });
            if (nextStatus === 'BID_ACCEPTED') sessionStorage.setItem('showBidAcceptedConfetti', '1');
            router.replace('/portal');
        } catch (e: any) {
            toast.error(e?.message ?? 'Failed to update bid decision.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
            {/* theme toggle */}
            <button
                onClick={toggleTheme}
                className="fixed top-6 right-6 z-50 p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 border border-gray-200 dark:border-gray-700"
                aria-label="Toggle theme"
                type="button"
                disabled={loading}
            >
                {isDark ? (
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                        />
                    </svg>
                ) : (
                    <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                    </svg>
                )}
            </button>

            <BackButton />

            <main className="max-w-5xl mx-auto px-6 py-20">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">Bid Letter</h1>
                </div>

                {/* pdf viewer */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700 transition-colors duration-300 mb-8">
                    <div style={{ height: '600px', overflow: 'auto' }} className="bg-white dark:bg-gray-800">
                        {hasMounted ? (
                            <DocViewer
                                // ✅ keep key stable; only change when theme changes (intentional)
                                key={isDark ? 'dark' : 'light'}
                                documents={documents}
                                pluginRenderers={DocViewerRenderers}
                                config={viewerConfig}
                                theme={viewerTheme}
                                style={{ height: '100%', overflow: 'auto' }}
                            />
                        ) : null}
                    </div>
                </div>

                {/* action buttons */}
                <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
                    <button
                        disabled={loading}
                        onClick={() => void setStatusAndReturn('BID_ACCEPTED')}
                        className="cursor-pointer flex-1 rounded-lg bg-linear-to-r from-blue-600 to-blue-700 py-4 px-8 text-white font-semibold hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
                        type="button"
                    >
                        Accept Bid
                    </button>

                    <button
                        disabled={loading}
                        onClick={() => void setStatusAndReturn('BID_DECLINED')}
                        className="cursor-pointer flex-1 rounded-lg bg-linear-to-r from-red-600 to-red-700 py-4 px-8 text-white font-semibold hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all shadow-lg shadow-red-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
                        type="button"
                    >
                        Decline Bid
                    </button>
                </div>
            </main>
        </div>
    );
}
