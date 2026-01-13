'use client';

import Link from 'next/link';
import { ArrowRight, Users, ClipboardList, Flag } from 'lucide-react';

function cx(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(' ');
}

export default function AdminSection() {
    const items = [
        {
            title: 'Members',
            desc: 'View member directory and profiles.',
            href: '/members',
            icon: <Users className="h-5 w-5" />
        },
        {
            title: 'Applications',
            desc: 'Review applications and leave comments.',
            href: '/application', // adjust if you have an admin route
            icon: <ClipboardList className="h-5 w-5" />
        },
        {
            title: 'Flagged',
            desc: 'Jump to flagged applications.',
            href: '/application?filter=flagged', // adjust to your routing
            icon: <Flag className="h-5 w-5" />
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((it) => (
                <Link
                    key={it.title}
                    href={it.href}
                    className={cx(
                        'group rounded-2xl border border-gray-200 dark:border-gray-700 p-5',
                        'bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition'
                    )}
                >
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-2">
                                {it.icon}
                            </div>
                            <div>
                                <div className="font-bold text-gray-900 dark:text-white">{it.title}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">{it.desc}</div>
                            </div>
                        </div>

                        <ArrowRight className="h-5 w-5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                </Link>
            ))}
        </div>
    );
}
