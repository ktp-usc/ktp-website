import ExecApplicationViewer from '../[id]/components/UserApplicationViewer';
import type { Application } from '../types';

export default async function MyApplicationPage() {
    const base = process.env.NEXT_PUBLIC_API_BASE || '';

    let application: Application | null = null;

    try {
        const res = await fetch(`${base}/api/applications/me`, { cache: 'no-store' });
        if (res.ok) {
            const payload = await res.json();
            application = (payload.data ?? payload) as Application;
        } else {
            console.error('Failed to fetch current user application', res.status);
        }
    } catch (e) {
        console.error('Error fetching current user application', e);
    }

    //dev fallback
    if (!application) {
        application = {
            id: 'me-dev-fallback',
            full_name: 'Dev Fallback Applicant',
            preferred_first_name: null,
            email: 'fallback@dev.com',
            phone: 'xxx-xxx-xxxx',
            year: 'Year',
            gpa: '0.0',
            extenuating: null,
            major: 'Major',
            minor: null,
            hometown: null,
            headshot_url: '/images/fallback-headshot.jpg',
            resume_url: '/images/fallback-resume.pdf',
            linkedin: null,
            github: null,
            responses: [],
            rushEvents: [],
            status: 1,
        };
    }

    return (
        <div style={{ padding: 24 }}>
            <ExecApplicationViewer initialApplication={application} mode="applicant" />
        </div>
    );
}
