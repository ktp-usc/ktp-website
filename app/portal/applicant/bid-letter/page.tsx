"use client"
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

export default function BidLetterPage() {
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const darkMode = document.documentElement.classList.contains('dark');
    setIsDark(darkMode);
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

   const docs = [
    {
      uri: "https://pdfobject.com/pdf/sample.pdf",
      fileType: "pdf",
      fileName: "bidLetter.pdf"
    }
  ];


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="fixed top-6 right-6 z-50 p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 border border-gray-200 dark:border-gray-700"
        aria-label="Toggle theme"
      >
        {isDark ? (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        )}
      </button>

      {/* Back Button */}
      <button
        onClick={() => router.push('/')}
        className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-medium text-sm"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back
      </button>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-20">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
            Bid Letter
          </h1>
          
        </div>
        {/* Info Note */}
        <div className="mt-8 mb-6 max-w-2xl mx-auto">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                  Important Information
                </p>
                <p className="text-sm text-blue-800 dark:text-blue-400 mt-1">
                  This decision is final and cannot be changed. Please review the bid letter thoroughly before proceeding.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* PDF Viewer */}
       <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700 transition-colors duration-300 mb-8">
          <div style={{ height: '600px', overflow: 'auto' }} className="bg-white">
            {/* Key prop forces remount when theme changes */}
            <DocViewer
              key={isDark ? 'dark' : 'light'}
              documents={docs}
              pluginRenderers={DocViewerRenderers}
              config={{
                header: {
                  disableHeader: false,
                  disableFileName: false,
                  retainURLParams: false
                },
                pdfZoom: {
                  defaultZoom: 1.0,
                  zoomJump: 0.1,
                },
                pdfVerticalScrollByDefault: true,
              }}
              theme={{
                primary: "#ffffff",
                secondary: isDark ? "#1f2937" : "#f3f4f6",
                tertiary: isDark ? "#374151" : "#e5e7eb",
                textPrimary: "#111827",
                textSecondary: isDark ? "#ffffff" : "#6b7280",
                textTertiary: isDark ? "#d1d5db" : "#4b5563",
                disableThemeScrollbar: false,
              }}
              style={{ 
                height: '100%', 
                overflow: 'auto',
                backgroundColor: '#ffffff'
              }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
          <button
            disabled={loading}
            className="flex-1 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 py-4 px-8 text-white font-semibold hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-lg shadow-blue-500/30"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Processing...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Accept Bid
              </div>
            )}
          </button>

          <button
            disabled={loading}
            className="flex-1 rounded-lg bg-gradient-to-r from-red-600 to-red-700 py-4 px-8 text-white font-semibold hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all shadow-lg shadow-red-500/30"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Processing...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Decline Bid
              </div>
            )}
          </button>
        </div>

        
      </main>
    </div>
  );
}