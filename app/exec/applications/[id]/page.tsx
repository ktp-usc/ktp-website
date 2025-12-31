import React from 'react';
import ExecApplicationViewer from './components/ExecApplicationViewer';

type Props = { params: { id: string } };

export default async function Page({ params }: Props) {
    const { id } = params;
    const base = process.env.NEXT_PUBLIC_API_BASE ?? '';
    let application = null;

    try {
        const res = await fetch(`${base}/api/applications/${id}`, { cache: 'no-store' });
        if (res.ok) {
            const payload = await res.json();
            application = payload?.data ?? payload;
        }
    } catch (e) {
        // ignore
    }

    if (!application) {
        application = {
            id,
            full_name: 'Test Applicant',
            email: 'test@example.com',
            major: 'Computer Science',
            resume_url: '/mock-resume.pdf',
            headshot_url: '/placeholder-headshot.png',
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
