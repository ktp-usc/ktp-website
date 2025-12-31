'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ResumeViewer from './ResumeViewer';
import CommentsSidebar from './CommentsSidebar';
import ImageViewer from './ImageViewer';

type AppShape = {
    id: number | string;
    full_name?: string;
    major?: string | null;
    year?: string | null;
    resume_url?: string | null;
    headshot_url?: string | null;
    responses?: Record<string, any> | Array<{ question?: string; answer?: string }>;
    status?: number;
};

const STATUS_MAP: Record<number, string> = {
    5: 'Bid Accepted',
    4: 'Bid Offered',
    3: 'Interviewed',
    2: 'Reviewed',
    1: 'Submitted',
    0: 'Rejected',
};

export default function ExecApplicationViewer({ initialApplication }: { initialApplication?: AppShape | null }) {
    const router = useRouter();
    const [app, setApp] = useState<AppShape | null>(initialApplication ?? null);
    const [fullscreenResume, setFullscreenResume] = useState<string | null>(null);
    const [adjacent, setAdjacent] = useState<{ prevId?: number | null; nextId?: number | null }>({});

    useEffect(() => {
        if (!app?.id) return;
        fetch(`/api/applications/adjacent?id=${app.id}`)
            .then((r) => (r.ok ? r.json() : null))
            .then((j) => {
                if (j && typeof j === 'object') setAdjacent({ prevId: j.prevId ?? null, nextId: j.nextId ?? null });
            })
            .catch(() => {
                fetch('/api/applications?limit=200')
                    .then((r) => (r.ok ? r.json() : null))
                    .then((j) => {
                        const rows = Array.isArray(j?.data) ? j.data : [];
                        const ids = rows.map((x: any) => x.id);
                        const idx = ids.indexOf(app.id);
                        setAdjacent({
                            prevId: idx > 0 ? ids[idx - 1] : null,
                            nextId: idx >= 0 && idx < ids.length - 1 ? ids[idx + 1] : null,
                        });
                    })
                    .catch(() => {});
            });
    }, [app?.id]);

    function goBack() {
        try {
            router.back();
        } catch {
            router.push('/exec/applications');
        }
    }

    function goTo(id?: number | null) {
        if (!id) return;
        router.push(`/exec/applications/${id}`);
    }

    async function updateStatus(newStatus: number) {
        if (!app?.id) return;
        try {
            const res = await fetch(`/api/applications/${app.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) setApp({ ...app, status: newStatus });
        } catch (e) {
            console.error('Status update error', e);
        }
    }

    async function handleDelete() {
        if (!app?.id) return;
        if (!confirm('Delete this application?')) return;
        try {
            const res = await fetch(`/api/applications/${app.id}`, { method: 'DELETE' });
            if (res.ok) router.push('/exec/applications');
            else alert('Delete failed');
        } catch (e) {
            console.error(e);
            alert('Delete failed (network)');
        }
    }

    function renderResponses() {
        const r = app?.responses;
        if (!r) return <div style={{ textAlign: 'center', color: '#666' }}>N/A</div>;
        if (Array.isArray(r))
            return r.map((qa, i) => (
                <div key={i} style={{ marginBottom: 16 }}>
                    <div className="app-responses-question">{qa.question ?? 'Question'}</div>
                    <div className="app-responses-answer">{qa.answer ?? 'N/A'}</div>
                </div>
            ));
        try {
            return Object.entries(r).map(([q, a]) => (
                <div key={q} style={{ marginBottom: 16 }}>
                    <div className="app-responses-question">{q}</div>
                    <div className="app-responses-answer">{a ?? 'N/A'}</div>
                </div>
            ));
        } catch (e) {
            console.error('renderResponses error', e);
            return <div style={{ color: '#666' }}>Unable to show responses</div>;
        }
    }

    const fullName = app?.full_name ?? 'Unnamed Applicant';
    const [firstName, ...rest] = fullName.split(' ');
    const lastName = rest.join(' ');

    const rightArrowOffset = 'calc(360px + 24px)';

    return (
        <div className="page-content" style={{ display: 'flex', gap: 20 }}>
            <header className="exec-topbar" aria-hidden>
                <div className="inner">
                    <div className="left-area">
                        <button
                            className="back-link button-match-select header-back"
                            onClick={goBack}
                        >
                            ← Back
                        </button>
                    </div>


                    <div className="right-area">
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }} className="status-select-wrapper">
                            <span className="status-text">Status</span>
                            <select
                                value={typeof app?.status === 'number' ? String(app!.status) : '1'}
                                onChange={(e) => updateStatus(Number(e.target.value ?? '1'))}
                                className="status-select control-tall"
                                aria-label="Application status"
                                style={{ minWidth: 140 }}
                            >
                                {Object.entries(STATUS_MAP).map(([num, label]) => (
                                    <option key={num} value={num}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={handleDelete}
                            className="control-delete"
                            title="Delete application"
                            style={{ marginLeft: 12 }}
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </header>

            {/* previous arrow */}
            <button
                aria-label="Previous"
                onClick={() => goTo(adjacent.prevId)}
                disabled={!adjacent.prevId}
                className={`nav-arrow left ${adjacent.prevId ? 'enabled' : 'disabled'}`}
                style={{ left: 12 }}
            >
                ←
            </button>

            {/* next arrow */}
            <button
                aria-label="Next"
                onClick={() => goTo(adjacent.nextId)}
                disabled={!adjacent.nextId}
                className={`nav-arrow right ${adjacent.nextId ? 'enabled' : 'disabled'}`}
                style={{ right: rightArrowOffset }}
            >
                →
            </button>

            <div style={{ flex: 1, maxWidth: 1000, margin: '0 auto', position: 'relative' }}>

                {/* header */}
                <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ width: 120, textAlign: 'center' }}>
                        <ImageViewer src={app?.headshot_url ?? '/placeholder-headshot.png'} alt={fullName} />
                    </div>

                    <div style={{ flex: 1, textAlign: 'center' }}>
                        <div style={{ fontSize: 28, fontWeight: 800 }}>{firstName} {lastName}</div>
                        <div style={{ marginTop: 6, fontWeight: 700 }}>{app?.major ?? 'N/A'}</div>
                        <div style={{ marginTop: 4, color: '#666' }}>{app?.year ?? 'N/A'}</div>
                    </div>

                    <div style={{ width: 120 }} />
                </div>

                {/* resume */}
                <div style={{ marginTop: 8 }}>
                    {app?.resume_url ? (
                        <div className="resume-box surface-card" onClick={() => setFullscreenResume(app.resume_url ?? null)} style={{ cursor: 'zoom-in' }}>
                            <ResumeViewer url={app.resume_url!} />
                        </div>
                    ) : (
                        <div style={{ padding: 24, color: '#666' }}>No resume attached</div>
                    )}
                </div>

                {/* responses */}
                <div style={{ marginTop: 40 }}>
                    <h2 className="app-responses-title">Application Responses</h2>
                    <div style={{ marginTop: 8 }}>{renderResponses()}</div>
                </div>
            </div>

            {/* comments sidebar */}
            <div style={{ width: 360 }}>
                <div className="sidebar-elevated" style={{ padding: 16 }}>
                    <CommentsSidebar applicationId={app?.id} />
                </div>
            </div>

            {/* fullscreen resume */}
            {fullscreenResume && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 300 }}>
                    <div
                        style={{
                            width: '90%',
                            height: '90%',
                            margin: '40px auto',
                            background: '#fff',
                            borderRadius: 8,
                            overflow: 'hidden',
                            position: 'relative',
                        }}
                    >
                        <button
                            onClick={() => setFullscreenResume(null)}
                            style={{
                                position: 'absolute',
                                right: 12,
                                top: 12,
                                zIndex: 30,
                                padding: 8,
                                borderRadius: 6,
                                border: '1px solid rgba(0,0,0,0.08)',
                                background: '#fff',
                                cursor: 'pointer',
                            }}
                        >
                            ✕
                        </button>

                        <div style={{ width: '100%', height: '100%' }}>
                            <ResumeViewer url={fullscreenResume} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
