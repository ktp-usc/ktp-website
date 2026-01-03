'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ResumeViewer from './ResumeViewer';
import CommentsSidebar from './CommentsSidebar';
import ImageViewer from './ImageViewer';
import type { Application } from '../../types';

const STATUS_MAP: Record<number, string> = {
    0: 'Closed',
    1: 'Under Review',
    2: 'Interviews',
    3: 'Waitlist',
    4: 'Bid Offered',
    5: 'Bid Declined',
    6: 'Bid Accepted',
};

export default function ExecApplicationViewer({ initialApplication }: { initialApplication?: Application | null }) {
    const router = useRouter();
    const [app, setApp] = useState<Application | null>(initialApplication ?? null);
    const [adjacent, setAdjacent] = useState<{ prevId?: string | null; nextId?: string | null }>({});
    const [fullscreenResume, setFullscreenResume] = useState<string | null>(null);
    const [statusUpdating, setStatusUpdating] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // get previous/next applications
    useEffect(() => {
        if (!app?.id) return;

        const id = app.id;

        async function loadAdjacent() {
            try {
                const res = await fetch(`/api/applications/adjacent?id=${id}`);
                if (!res.ok) {
                    setAdjacent({ prevId: null, nextId: null });
                    return;
                }
                const payload: any = await res.json();
                setAdjacent({
                    prevId: payload?.prevId ?? null,
                    nextId: payload?.nextId ?? null,
                });
            } catch {
                setAdjacent({ prevId: null, nextId: null });
            }
        }

        loadAdjacent();
    }, [app?.id]);

    function goBack() {
        try { router.back(); } catch { router.push('/exec/applications'); }
    }

    function goTo(id?: string | number | null) {
        if (id == null) return;
        router.push(`/exec/applications/${id}`);
    }

    async function updateStatus(newStatus: number) {
        if (!app?.id || app.status === newStatus) return;
        setStatusUpdating(true);
        try {
            const res = await fetch(`/api/applications/${app.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) setApp((p) => (p ? { ...p, status: newStatus } : p));
            else alert('Failed to update status');
        } catch {
            alert('Network error updating status');
        } finally {
            setStatusUpdating(false);
        }
    }

    async function handleDelete() {
        if (!app?.id) return;
        if (!confirm('Delete this application?')) return;
        setDeleting(true);
        try {
            const res = await fetch(`/api/applications/${app.id}`, { method: 'DELETE' });
            if (res.ok) router.push('/exec/applications');
            else alert('Delete failed');
        } catch {
            alert('Delete failed (network)');
        } finally {
            setDeleting(false);
        }
    }

    function getField(key: string) {
        if (!app) return undefined;
        const top = (app as any)[key];
        if (top !== undefined) return top;
        const r = app.responses;
        if (!r) return undefined;
        if (Array.isArray(r)) {
            const found = (r as any[]).find((x) => x && (x.question === key || (typeof x.question === 'string' && x.question.toLowerCase().includes(key.toLowerCase()))));
            return found?.answer ?? undefined;
        }
        if (typeof r === 'object') return (r as any)[key];
        return undefined;
    }

    // header: First (Preferred) Last only if preferred exists
    function formattedHeaderName(a?: Application | null) {
        const full = (a?.full_name ?? '').trim();
        if (!full) return 'Unnamed Applicant';
        const parts = full.split(/\s+/);
        const preferred = (a?.preferred_first_name ?? '')?.toString().trim();
        if (parts.length === 1) return preferred ? `${preferred} (${parts[0]})` : parts[0];
        const first = parts[0];
        const last = parts.slice(1).join(' ');
        return preferred ? `${first} (${preferred}) ${last}` : `${first} ${last}`;
    }

    function LabeledBox({ label, value }: { label: string; value?: any }) {
        return (
            <div style={{ marginBottom: 12 }}>
                <div className="app-responses-question">{label}</div>
                <div className="app-responses-answer">
                    {value ? (
                        <div style={{ whiteSpace: 'pre-wrap' }}>{value}</div>
                    ) : (
                        <div style={{ color: '#9aa6b8', fontStyle: 'italic' }}>No response provided.</div>
                    )}
                </div>
            </div>
        );
    }

    const email = getField('email') ?? app?.email ?? '';
    const phone = getField('phone') ?? app?.phone ?? '';
    const year = getField('year') ?? app?.year ?? '';
    const gpa = getField('gpa') ?? app?.gpa ?? '';
    const major = getField('major') ?? app?.major ?? '';
    const minor = getField('minor') ?? app?.minor ?? '';
    const hometown = getField('hometown') ?? app?.hometown ?? '';
    const linkedin = getField('linkedin') ?? app?.linkedin ?? '';
    const github = getField('github') ?? app?.github ?? '';
    const extenuating = getField('extenuating') ?? app?.extenuating ?? '';
    const rushEventsRaw = getField('rushEvents') ?? getField('rush_events') ?? getField('rush') ?? app?.rushEvents ?? '';
    const rushEvents = Array.isArray(rushEventsRaw) ? (rushEventsRaw as string[]).join(', ') : (rushEventsRaw ?? '');
    const why = getField('reason') ?? getField('why') ?? '';

    return (
        <div className="page-content">
            <header className="exec-topbar">
                <div className="inner">
                    <div className="left-area">
                        <button className="back-link" onClick={goBack}>← Back</button>
                    </div>
                    <div className="right-area">
                        <div className="status-select-wrapper" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <span className="status-text">Status</span>
                            <select
                                className="status-select"
                                value={typeof app?.status === 'number' ? String(app!.status) : '1'}
                                onChange={(e) => updateStatus(Number(e.target.value))}
                                disabled={statusUpdating}
                            >
                                {Object.entries(STATUS_MAP).map(([num, label]) => <option key={num} value={num}>{label}</option>)}
                            </select>
                        </div>
                        <button onClick={handleDelete} className="control-delete" style={{ marginLeft: 12 }} disabled={deleting}>
                            {deleting ? 'Deleting…' : 'Delete'}
                        </button>
                    </div>
                </div>
            </header>

            <button onClick={() => goTo(adjacent.prevId)} disabled={!adjacent.prevId} className={`nav-arrow left ${adjacent.prevId ? 'enabled' : 'disabled'}`}>←</button>
            <button onClick={() => goTo(adjacent.nextId)} disabled={!adjacent.nextId} className={`nav-arrow right ${adjacent.nextId ? 'enabled' : 'disabled'}`}>→</button>

            <div className="exec-application-layout">
                <div className="left-column">
                    {app?.resume_url ? (
                        <div
                            className="resume-iframe-wrapper"
                            role="button"
                            tabIndex={0}
                            onClick={() => setFullscreenResume(app.resume_url ?? null)}
                            onKeyDown={(e) => { if (e.key === 'Enter') setFullscreenResume(app.resume_url ?? null); }}
                            aria-label="Open resume fullscreen"
                        >
                            <ResumeViewer url={app.resume_url} height="100%" disableClickOverlay />
                            <div className="resume-iframe-overlay" />
                        </div>
                    ) : <div style={{ padding: 24, color: '#666' }}>No resume attached</div>}
                </div>

                <div className="middle-column" style={{ position: 'relative' }}>
                    <div style={{ position: 'relative', paddingTop: 8, paddingBottom: 60 }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 28, fontWeight: 700 }}>{formattedHeaderName(app)}</div>
                            <div style={{ marginTop: 2, fontSize: 20, fontWeight: 600 }}>{major ?? 'N/A'}</div>
                            <div style={{ marginTop: 1, color: '#666', fontSize: 15 }}>{year ?? 'N/A'}</div>
                        </div>

                        <div
                            aria-hidden
                            className="app-headshot-box"
                            style={{
                                position: 'absolute',
                                left: 'calc(50% - 335px)',
                                top: 0,
                                width: 120,
                                height: 120,
                                overflow: 'hidden',
                                borderRadius: 6,
                                border: '1px solid #e6eaf0',
                                background: '#fff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 4px 14px rgba(0,0,0,0.06)'
                            }}
                        >
                            <ImageViewer src={app?.headshot_url ?? '/placeholder-headshot.png'} alt={formattedHeaderName(app)} />
                        </div>
                    </div>

                    <div className="responses-scroll">
                        <LabeledBox label="Email" value={email} />
                        <LabeledBox label="Phone" value={phone} />
                        <LabeledBox label="GPA" value={gpa} />
                        <LabeledBox label="Rush Events Attended" value={rushEvents || undefined} />
                        {extenuating ? <LabeledBox label="Extenuating Circumstances" value={extenuating} /> : null}
                        {minor ? <LabeledBox label="Minor(s)" value={minor} /> : null}
                        {hometown ? <LabeledBox label="Hometown" value={hometown} /> : null}
                        {linkedin ? <LabeledBox label="LinkedIn" value={linkedin} /> : null}
                        {github ? <LabeledBox label="GitHub" value={github} /> : null}

                        <div style={{ marginTop: 6 }}>
                            <div className="app-responses-question">Why are you interested in joining Kappa Theta Pi? What talents/experiences could you bring to the organization?</div>
                            <div className="app-responses-answer">{why ? <div style={{ whiteSpace: 'pre-wrap' }}>{why}</div> : <div style={{ color: '#9aa6b8', fontStyle: 'italic' }}>No response provided.</div>}</div>
                        </div>
                    </div>
                </div>

                <div className="right-column">
                    <div className="sidebar-elevated">
                        <CommentsSidebar applicationId={app?.id} />
                    </div>
                </div>
            </div>

            {fullscreenResume && (
                <div className="fullscreen-overlay" onClick={() => setFullscreenResume(null)}>
                    <div className="fullscreen-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="fullscreen-close" onClick={() => setFullscreenResume(null)} aria-label="Close resume">✕</button>
                        <div style={{ width: '100%', height: '100%' }}>
                            <ResumeViewer url={fullscreenResume} fill />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
