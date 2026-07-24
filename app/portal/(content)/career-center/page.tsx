"use client";

import Link from "next/link";

export default function CareerCenterPage() {
    return (
        <main className="max-w-7xl mx-auto px-6 py-8 bg-transparent transition-colors duration-300">
            {/* Header */}
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2 dark:text-white transition-colors duration-300">
                    Career Center
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Explore company reviews and career resources shared by brothers.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Glassdoor */}
                <Link href="/portal/career-center/glassdoor" className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-8 text-left border border-gray-200 hover:border-blue-300 group dark:bg-gray-900 dark:border-gray-700 duration-300 cursor-pointer">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-yellow-100 rounded-lg group-hover:bg-yellow-200 dark:bg-gray-700 dark:group-hover:bg-gray-600 transition-colors">
                            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                            </svg>
                        </div>
                        <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                        </svg>
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-2 dark:text-white transition-colors duration-300">
                        Glassdoor
                    </h4>
                    <p className="text-gray-600 text-sm dark:text-gray-400 transition-colors duration-300">
                        Browse company reviews, interview experiences, and referrals from brothers.
                    </p>
                </Link>

                {/* Resources */}
                <Link href="/portal/career-center/resources" className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-8 text-left border border-gray-200 hover:border-blue-300 group dark:bg-gray-900 dark:border-gray-700 duration-300 cursor-pointer">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 dark:bg-gray-700 dark:group-hover:bg-gray-600 transition-colors">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                />
                            </svg>
                        </div>
                        <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                        </svg>
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-2 dark:text-white transition-colors duration-300">
                        Resources
                    </h4>
                    <p className="text-gray-600 text-sm dark:text-gray-400 transition-colors duration-300">
                        Career guides, prep materials, and helpful links.
                    </p>
                </Link>
            </div>
        </main>
    );
}
