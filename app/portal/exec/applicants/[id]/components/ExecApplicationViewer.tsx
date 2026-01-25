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

// Response item shape used by your API (adjust if your backend differs)
type ResponseItem = {
  question?: string | number;
  answer?: string | number | boolean | null | Record<string, unknown> | Array<unknown>;
};

// Responses can be an array of ResponseItem or a dictionary
type Responses = ResponseItem[] | Record<string, unknown> | null | undefined;

type AdjacentResponse = {
  prevId: string | null;
  nextId: string | null;
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
        const res = await fetch(`/api/applications/adjacent?id=${encodeURIComponent(String(id))}`);
        if (!res.ok) {
          setAdjacent({ prevId: null, nextId: null });
          return;
        }
        const payload: AdjacentResponse = await res.json();
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
    try {
      router.push('/exec');
    } catch {
      router.push('/exec/applications');
    }
  }

  function goTo(id?: string | number | null) {
    if (id == null) return;
    router.push(`/exec/applications/${id}`);
  }

  async function updateStatus(newStatus: number) {
    if (!app?.id || app.status === newStatus) return;
    setStatusUpdating(true);
    try {
      const res = await fetch(`/api/applications/${encodeURIComponent(String(app.id))}`, {
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
      const res = await fetch(`/api/applications/${encodeURIComponent(String(app.id))}`, { method: 'DELETE' });
      if (res.ok) router.push('/exec/applicants');
      else alert('Delete failed');
    } catch {
      alert('Delete failed (network)');
    } finally {
      setDeleting(false);
    }
  }

  // Type guard: is responses an array of ResponseItem?
  function isResponseArray(r: Responses): r is ResponseItem[] {
    return Array.isArray(r);
  }

  // Generic typed getter for top-level fields or responses
  function getField<T = unknown>(key: string): T | undefined {
    if (!app) return undefined;

    // top-level property
    const topVal = (app as unknown as Record<string, unknown>)[key];
    if (typeof topVal !== 'undefined') return topVal as T;

    const r = app.responses as Responses;
    if (!r) return undefined;

    if (isResponseArray(r)) {
      const found = r.find((x) => {
        if (!x) return false;
        if (typeof x.question === 'string') {
          return x.question === key || x.question.toLowerCase().includes(key.toLowerCase());
        }
        if (typeof x.question === 'number') {
          return String(x.question) === key;
        }
        return false;
      });
      if (found) return found.answer as T | undefined;
      return undefined;
    }

    if (typeof r === 'object' && r !== null) {
      const val = (r as Record<string, unknown>)[key];
      return typeof val === 'undefined' ? undefined : (val as T);
    }

    return undefined;
  }

  function formattedHeaderName(a?: Application | null) {
    const full = (a?.full_name ?? '').toString().trim();
    if (!full) return 'Unnamed Applicant';
    const parts = full.split(/\s+/);
    const preferred = (a?.preferred_first_name ?? '').toString().trim();
    if (parts.length === 1) return preferred ? `${preferred} (${parts[0]})` : parts[0];
    const first = parts[0];
    const last = parts.slice(1).join(' ');
    return preferred ? `${first} (${preferred}) ${last}` : `${first} ${last}`;
  }

  function LabeledBox({ label, value }: { label: string; value?: React.ReactNode }) {
    const isEmpty =
      value === undefined ||
      value === null ||
      (typeof value === 'string' && value.trim() === '') ||
      (Array.isArray(value) && value.length === 0);

    return (
      <div style={{ marginBottom: 12 }}>
        <div className="app-responses-question">{label}</div>
        <div className="app-responses-answer">
          {!isEmpty ? (
            <div style={{ whiteSpace: 'pre-wrap' }}>{value}</div>
          ) : (
            <div style={{ color: '#9aa6b8', fontStyle: 'italic' }}>No response provided.</div>
          )}
        </div>
      </div>
    );
  }

  const email = (getField<string>('email') ?? (app?.email as string | undefined) ?? '') as string;
  const phone = (getField<string>('phone') ?? (app?.phone as string | undefined) ?? '') as string;
  const year = (getField<string>('year') ?? (app?.year as string | undefined) ?? '') as string;
  const gpa = (getField<string>('gpa') ?? (app?.gpa as string | undefined) ?? '') as string;
  const major = (getField<string>('major') ?? (app?.major as string | undefined) ?? '') as string;
  const minor = (getField<string>('minor') ?? (app?.minor as string | undefined) ?? '') as string;
  const hometown = (getField<string>('hometown') ?? (app?.hometown as string | undefined) ?? '') as string;
  const linkedin = (getField<string>('linkedin') ?? (app?.linkedin as string | undefined) ?? '') as string;
  const github = (getField<string>('github') ?? (app?.github as string | undefined) ?? '') as string;
  const extenuating = (getField<string>('extenuating') ?? (app?.extenuating as string | undefined) ?? '') as string;

  const rushEventsRaw =
    getField<unknown>('rushEvents') ??
    getField<unknown>('rush_events') ??
    getField<unknown>('rush') ??
    (app?.rushEvents as unknown | undefined) ??
    '';
  const rushEvents =
    Array.isArray(rushEventsRaw) ? (rushEventsRaw as string[]).join(', ') : (rushEventsRaw ?? '').toString();

  const why = (getField<string>('reason') ?? getField<string>('why') ?? '') as string;

  // Build responseItems safely
  const responseItems: { question: string; answer: React.ReactNode }[] = Array.isArray(app?.responses)
    ? (app!.responses as ResponseItem[]).map((r) => ({
        question:
          typeof r.question === 'string'
            ? r.question
            : typeof r.question === 'number'
            ? String(r.question)
            : 'Question',
        answer:
          r.answer === null || typeof r.answer === 'undefined'
            ? ''
            : Array.isArray(r.answer)
            ? (r.answer as Array<unknown>).join(', ')
            : typeof r.answer === 'object'
            ? JSON.stringify(r.answer)
            : String(r.answer),
      }))
    : [];

  const headshotSrc = app?.headshot_url ? String(app.headshot_url) : '/placeholder-headshot.png';

  return (
    <div className="page-content">
      <header className="exec-topbar">
        <div className="inner">
          <div className="left-area">
            <button className="back-link" onClick={goBack}>
              ← Back
            </button>
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
                  <option key={num} value={num}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <button onClick={handleDelete} className="control-delete" style={{ marginLeft: 12 }} disabled={deleting}>
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </div>
      </header>

      <button
        onClick={() => goTo(adjacent.prevId)}
        disabled={!adjacent.prevId}
        className={`nav-arrow left ${adjacent.prevId ? 'enabled' : 'disabled'}`}
      >
        ←
      </button>
      <button
        onClick={() => goTo(adjacent.nextId)}
        disabled={!adjacent.nextId}
        className={`nav-arrow right ${adjacent.nextId ? 'enabled' : 'disabled'}`}
      >
        →
      </button>

      <div className="exec-application-layout">
        <div className="left-column">
          {app?.resume_url ? (
            <div className="resume-iframe-wrapper">
              <ResumeViewer url={String(app.resume_url)} height="100%" />
            </div>
          ) : (
            <div style={{ padding: 24, color: '#666' }}>No resume attached</div>
          )}
        </div>

        <div className="middle-column">
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, paddingBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div className="app-headshot-box" style={{ boxShadow: '0 4px 14px rgba(0,0,0,0.06)' }}>
                <img
                  src={headshotSrc}
                  alt={formattedHeaderName(app)}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>

              <div className="app-header-text">
                <div className="name">{formattedHeaderName(app)}</div>
                <div className="major">{major ?? 'N/A'}</div>
                <div className="year">{year ?? 'N/A'}</div>
              </div>
            </div>
          </div>

          <div className="responses-scroll">
            <LabeledBox label="Year" value={year} />
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
                {why ? <div style={{ whiteSpace: 'pre-wrap' }}>{why}</div> : <div style={{ color: '#9aa6b8', fontStyle: 'italic' }}>No response provided.</div>}
              </div>
            </div>

            {responseItems.length > 0 &&
              responseItems.map((r, i) => <LabeledBox key={`resp-${i}`} label={r.question} value={r.answer} />)}
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
