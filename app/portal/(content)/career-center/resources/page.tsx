"use client";

export default function ResourcesPage() {
    return (
        <main className="max-w-5xl mx-auto px-6 py-8">
            {/* Back link */}
            <a
                href="/portal/career-center"
                className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline mb-4"
            >
                &larr; Back to Career Center
            </a>

            {/* Header */}
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Resources
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Career guides, prep materials, and helpful links.
                </p>
            </div>

            <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                No resources yet. Check back soon!
            </div>
        </main>
    );
}
