import React from 'react';
import ExecApplicationViewer from './components/ExecApplicationViewer';

type Props = { params: { id: string } };

//add fields later if needed
type AppShape = {
    id: string | number;
    full_name?: string;
    email?: string;
    major?: string | null;
    resume_url?: string | null;
    headshot_url?: string | null;
    responses?: Record<string, any> | Array<{ question?: string; answer?: string }>;
    status?: number;
};

export default async function Page({ params }: Props) {
    const { id } = params;
    const base = process.env.NEXT_PUBLIC_API_BASE ?? '';

    let application: AppShape | null = null;

    try {
        const res = await fetch(`${base}/api/applications/${id}`, { cache: 'no-store' });
        if (res.ok) {
            const payload = await res.json();
            application = (payload && typeof payload === 'object' && 'data' in payload) ? payload.data : payload;
        } else {
            console.error(`Failed to fetch application ${id}: ${res.status} ${res.statusText}`);
        }
    } catch (err) {
        console.error('Error fetching application:', err);
    }

    // dev fallback cause no API
    if (!application) {
        application = {
            id,
            full_name: 'Dev Fallback Applicant',
            email: 'fallback@dev.com',
            major: 'Major',
            resume_url: '/images/insert-resume.pdf',
            headshot_url: '/images/insert-headshot.png',
            responses: [{ question: 'Why KTP?', answer: 'Because I like coding.' }],
            status: 1,
        };
    }

    return (
        <div style={{ padding: 24 }}>
            <ExecApplicationViewer initialApplication={application} />
        </div>
    );
}
