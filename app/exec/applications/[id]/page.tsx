import React from 'react';
import { headers } from 'next/headers';
import ExecApplicationViewer from './components/ExecApplicationViewer';
import type { Application } from '../types';

type Props = { params: { id: string } };

export default async function Page({ params }: Props) {
    const { id } = await params;

    const headersList = await headers();
    const cookie = headersList.get('cookie') ?? '';

    // const baseEnv = process.env.ORIGIN_URL;
    // const base = baseEnv ?? 'http://localhost:3000';
    const proto = headersList.get('x-forwarded-proto') ?? 'http';
    const host = headersList.get('x-forwarded-host') ?? headersList.get('host');
    const base = host ? `${proto}://${host}` : 'http://localhost:3000';
    let application: Application | null = null;

    try {
        const res = await fetch(`${base}/api/applications/${id}`, { cache: 'no-store', headers: { cookie } });
        console.log('Fetch response:', res);
        if (res.ok) {
            const payload = await res.json();
            application = (payload.data ?? payload) as Application;
        } else {
            console.error(`Failed to fetch application ${id}: ${res.status}`);
        }
    } catch (err) {
        console.error('Error fetching application:', err);
    }
    console.log('Fetched application:', application);
    // dev fallback
    if (!application) {
        application = {
            id,
            fullName: 'Dev Fallback Applicant',
            preferred_first_name: null,
            email: 'fallback@dev.com',
            phone: 'xxx-xxx-xxxx',
            year: 'Year',
            gpa: '0.0',
            extenuating: null,
            major: 'Major',
            minor: null,
            hometown: null,
            headshotUrl: '/images/fallback-headshot.jpg',
            resumeUrl: '/images/fallback-resume.pdf',
            linkedin: null,
            github: null,
            submittedAt: new Date(),
            responses: [],
            rushEvents: [],
            status: 'INCOMPLETE',
        };
    }

    return (
        <div style={{ padding: 24 }}>
            <ExecApplicationViewer initialApplication={application} />
        </div>
    );
}
