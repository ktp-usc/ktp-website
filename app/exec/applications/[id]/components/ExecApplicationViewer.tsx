'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ResumeViewer from './ResumeViewer';
import CommentsSidebar from './CommentsSidebar';
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
    const [statusUpdating, setStatusUpdating] = useState(false);
    const [deleting, setDeleting] = useState(false);

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
            const found = (r as any[]).find(
                (x) =>
                    x &&
                    (x.question === key ||
                        (typeof x.question === 'string' && x.question.toLowerCase().includes(key.toLowerCase())))
            );
            return found?.answer ?? undefined;
        }
        if (typeof r === 'object') return (r as any)[key];
        return undefined;
    }

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
    const rushEventsRaw =
        getField('rushEvents') ?? getField('rush_events') ?? getField('rush') ?? app?.rushEvents ?? '';
    const rushEvents = Array.isArray(rushEventsRaw) ? (rushEventsRaw as string[]).join(', ') : (rushEventsRaw ?? '');
    const why = getField('reason') ?? getField('why') ?? '';

    const responseItems: { question: string; answer: any }[] = Array.isArray(app?.responses)
        ? (app!.responses as any[]).map((r) => ({
            question: typeof r.question === 'string' ? r.question : String(r.question ?? 'Question'),
            answer: r.answer ?? '',
        }))
        : [];

    const headshotSrc = (app?.headshot_url && String(app.headshot_url)) || '/placeholder-headshot.png';

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
                                {Object.entries(STATUS_MAP).map(([num, label]) => (
                                    <option key={num} value={num}>{label}</option>
                                ))}
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
                        <div className="resume-iframe-wrapper">
                            <ResumeViewer url={app.resume_url} height="100%" />
                        </div>
                    ) : (
                        <div style={{ padding: 24, color: '#666' }}>No resume attached</div>
                    )}
                </div>

                <div className="middle-column">
                    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, paddingBottom: 24 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <div className="app-headshot-box" style={{ boxShadow: '0 4px 14px rgba(0,0,0,0.06)' }}>
                                <img src={headshotSrc} alt={formattedHeaderName(app)} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                            </div>

                            <div className="app-header-text">
                                <div className="name">{formattedHeaderName(app)}</div>
                                <div className="major">{major ?? 'N/A'}</div>
                                <div className="year">{year ?? 'N/A'}</div>
                            </div>
                        </div>
                    </div>

                    <div className="responses-scroll">
                        <LabeledBox label="Email" value={email} />
                        <LabeledBox label="Phone" value={phone} />
                        <LabeledBox label="GPA" value={gpa} />
                        <LabeledBox label="Rush Events Attended" value={rushEvents} />
                        <LabeledBox label="Extenuating Circumstances" value={extenuating} />
                        <LabeledBox label="Minor(s)" value={minor} />
                        <LabeledBox label="Hometown" value={hometown} />
                        <LabeledBox label="LinkedIn" value={linkedin} />
                        <LabeledBox label="GitHub" value={github} />

                        <div style={{ marginTop: 6 }}>
                            <div className="app-responses-question">
                                Why are you interested in joining Kappa Theta Pi? What talents/experiences could you bring to the organization?
                            </div>
                            <div className="app-responses-answer">
                                {why ? (
                                    <div style={{ whiteSpace: 'pre-wrap' }}>{why}</div>
                                ) : (
                                    <div style={{ color: '#9aa6b8', fontStyle: 'italic' }}>No response provided.</div>
                                )}
                            </div>
                        </div>

                        {responseItems.length > 0 && responseItems.map((r, i) => (
                            <LabeledBox key={`resp-${i}`} label={r.question} value={r.answer} />
                        ))}
                    </div>
                </div>

                <div className="right-column">
                    <div className="sidebar-elevated">
                        <CommentsSidebar applicationId={app?.id} />
                    </div>
                </div>
            </div>
        </div>
    );
}
