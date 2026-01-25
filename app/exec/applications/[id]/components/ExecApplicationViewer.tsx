'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import ResumeViewer from './ResumeViewer';
import CommentsSidebar from './CommentsSidebar';
import type { applicationStatus } from '@prisma/client';
import type { Application } from '../../types';

const STATUS_LABELS: Record<applicationStatus, string> = {
  CLOSED: 'Closed',
  UNDER_REVIEW: 'Under Review',
  INTERVIEW: 'Interviews',
  WAITLIST: 'Waitlist',
  BID_OFFERED: 'Bid Offered',
  BID_DECLINED: 'Bid Declined',
  BID_ACCEPTED: 'Bid Accepted',
  INCOMPLETE: 'Incomplete',
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

type ApplicantAccount = {
  firstName?: string | null;
  lastName?: string | null;
  resumeBlobURL?: string | null;
  headshotBlobURL?: string | null;
  linkedin?: string | null;
  github?: string | null;
};

export default function ExecApplicationViewer({ initialApplication }: { initialApplication?: Application | null }) {
  const router = useRouter();
  const [app, setApp] = useState<Application | null>(initialApplication ?? null);
  const [adjacent, setAdjacent] = useState<{ prevId?: string | null; nextId?: string | null }>({});
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [execName, setExecName] = useState<string>('An exec');
  const [applicantAccount, setApplicantAccount] = useState<ApplicantAccount | null>(null);
  const [commentsRefresh, setCommentsRefresh] = useState(0);
  const applicantId = typeof (app as unknown as { userId?: string })?.userId === 'string'
    ? (app as unknown as { userId: string }).userId
    : undefined;

  const [checked, setChecked] = useState({
    InfoNight1: false,
    InfoNight2: false,
    CasinoNight: false,
    TechnicalWorkshop: false,
    PitchNight: false,
  });

  // ---------- Helpers & loads ----------
  useEffect(() => {
    if (!app?.id) return;
    const id = app.id;
    async function loadAdjacent() {
      try {
        console.log(app);
        const res = await fetch(`/api/applications/adjacent?id=${encodeURIComponent(String(id))}`);
        if (!res.ok) {
          setAdjacent({ prevId: null, nextId: null });
          return;
        }
        const payload = (await res.json()) as AdjacentResponse | { data?: AdjacentResponse };
        const data = (payload && 'data' in payload ? payload.data : payload) as AdjacentResponse | undefined;
        setAdjacent({
          prevId: data?.prevId ?? null,
          nextId: data?.nextId ?? null,
        });
      } catch {
        setAdjacent({ prevId: null, nextId: null });
      }
    }
    loadAdjacent();
  }, [app?.id]);

  useEffect(() => {
    async function loadExec() {
      try {
        const res = await fetch('/api/accounts/me');
        if (!res.ok) return;
        const payload = await res.json();
        const data = payload?.data ?? payload;
        const first = (data?.firstName ?? '').toString().trim();
        const last = (data?.lastName ?? '').toString().trim();
        const full = `${first} ${last}`.trim();
        if (full) setExecName(full);
      } catch {
        // keep fallback name
      }
    }
    loadExec();
  }, []);

  useEffect(() => {
    const id = applicantId;
    if (!id) {
      setApplicantAccount(null);
      return;
    }

    let cancelled = false;
    async function loadApplicantAccount() {
      try {
        const res = await fetch(`/api/accounts/${encodeURIComponent(id??'')}`);
        if (!res.ok) return;
        const payload = await res.json();
        const data = payload?.data ?? payload;
        if (!cancelled) {
          setApplicantAccount({
            firstName: data?.firstName ?? null,
            lastName: data?.lastName ?? null,
            resumeBlobURL: data?.resumeBlobURL ?? null,
            headshotBlobURL: data?.headshotBlobURL ?? null,
            linkedin: data?.linkedin ?? null,
            github: data?.github ?? null
          });
        }
      } catch {
        if (!cancelled) setApplicantAccount(null);
      }
    }
    loadApplicantAccount();
    return () => {
      cancelled = true;
    };
  }, [applicantId]);

  function goBack() {
    try {
      router.push('/portal/exec/applications');
    } catch {
      router.push('/exec/applications');
    }
  }

  function goTo(id?: string | number | null) {
    if (id == null) return;
    router.push(`/exec/applications/${id}`);
  }

  function statusLabel(value?: applicationStatus | null) {
    if (!value) return 'Unknown';
    return STATUS_LABELS[value] ?? 'Unknown';
  }

  function isSubmitted()
  {
    if(app?.submittedAt == null) return false;
    return true;
  }

  async function postStatusNotification(oldStatus?: applicationStatus | null, newStatus?: applicationStatus | null) {
    if (!app?.id) return;
    const applicantName = formattedHeaderName(app);
    const message = `${execName} changed ${applicantName} status from ${statusLabel(oldStatus)} to ${statusLabel(newStatus)}.`;

    try {
      await fetch(`/api/applications/${encodeURIComponent(String(app.id))}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: message, commenter: execName }),
      });
    } catch {
      alert('Failed to post status change notification');
    }
  }

  async function updateStatus(newStatus: applicationStatus) {
    if (!app?.id || app.status === newStatus) return;
    const oldStatus = app?.status;
    setStatusUpdating(true);
    try {
      const res = await fetch(`/api/applications/${encodeURIComponent(String(app.id))}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const payload = await res.json().catch(() => null);
        const apiStatus = (payload?.data?.status ?? payload?.status ?? newStatus) as applicationStatus;
        setApp((p) => (p ? { ...p, status: apiStatus } : p));
        await postStatusNotification(oldStatus, newStatus);
        setCommentsRefresh((value) => value + 1);
      } else alert('Failed to update status');
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
      if (res.ok) router.push('/portal/exec/applications');
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
    const accountFirst = (applicantAccount?.firstName ?? '').toString().trim();
    const accountLast = (applicantAccount?.lastName ?? '').toString().trim();
    if (accountFirst || accountLast) {
      const formattedFirst = accountFirst ? accountFirst.charAt(0).toUpperCase() + accountFirst.slice(1) : '';
      const formattedLast = accountLast ? accountLast.charAt(0).toUpperCase() + accountLast.slice(1) : '';
      return `${formattedFirst} ${formattedLast}`.trim() || 'Unnamed Applicant';
    }

    const full = ((a as unknown as { fullName?: string; full_name?: string })?.fullName ?? (a as unknown as { full_name?: string })?.full_name ?? '')
      .toString()
      .trim();
    if (!full) return 'Unnamed Applicant';
    const parts = full.split(/\s+/);
    const preferred = (a?.preferred_first_name ?? '').toString().trim();
    if (parts.length === 1) return preferred ? `${preferred} (${parts[0]})` : parts[0];
    let firstPart = parts[0];
    firstPart = firstPart.charAt(0).toUpperCase() + firstPart.slice(1);

    let lastPart = parts.slice(1).join(' ');
    lastPart = lastPart.charAt(0).toUpperCase() + lastPart.slice(1);

    return preferred ? `${firstPart} (${preferred}) ${lastPart}` : `${firstPart} ${lastPart}`;
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

  // ---------- Fields pulled from app ----------
  const email = (getField<string>('email') ?? (app?.email as string | undefined) ?? '') as string;
  const phone = (getField<string>('phone') ?? (app?.phone as string | undefined) ?? '') as string;
  const year = (getField<string>('year') ?? (app?.year as string | undefined) ?? '') as string;
  const gpa = (getField<string>('gpa') ?? (app?.gpa as string | undefined) ?? '') as string;
  const major = (getField<string>('major') ?? (app?.major as string | undefined) ?? '') as string;
  const minor = (getField<string>('minor') ?? (app?.minor as string | undefined) ?? '') as string;
  const hometown = (getField<string>('hometown') ?? (app?.hometown as string | undefined) ?? '') as string;
  const linkedinFromAccount = (applicantAccount?.linkedin ?? '').toString().trim();
  const githubFromAccount = (applicantAccount?.github ?? '').toString().trim();
  const linkedin = (linkedinFromAccount || getField<string>('linkedin') || (app?.linkedin as string | undefined) || '') as string;
  const github = (githubFromAccount || getField<string>('github') || (app?.github as string | undefined) || '') as string;
  const extenuating = (getField<string>('extenuating') ?? (app?.extenuating as string | undefined) ?? '') as string;
  const submittedAt = (getField<string>('submittedAt') ?? (app?.submittedAt as string | undefined) ?? '') as string;

  const rushEventsRaw =
    getField<unknown>('eventsAttended') ??
    getField<unknown>('rush_events') ??
    getField<unknown>('rush') ??
    (app?.rushEvents as unknown | undefined) ??
    '';

  // Original display string (kept for LabeledBox)
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

 
  const resumeFromAccount = (applicantAccount?.resumeBlobURL ?? '').toString().trim();
  const headshotFromAccount = (applicantAccount?.headshotBlobURL ?? '').toString().trim();
  const resumeFromApp = (app as unknown as { resumeUrl?: string; resume_url?: string })?.resumeUrl ?? (app as unknown as { resume_url?: string })?.resume_url;
  const headshotFromApp = (app as unknown as { headshotUrl?: string; headshot_url?: string })?.headshotUrl ?? (app as unknown as { headshot_url?: string })?.headshot_url;
  const resumeSrc = resumeFromAccount || (resumeFromApp ? String(resumeFromApp) : null);
  const headshotSrc = headshotFromAccount || (headshotFromApp ? String(headshotFromApp) : '') || '/placeholder-headshot.png';

  // ---------- NEW: parse rushEventsRaw -> string[] ----------
  function parseRushEvents(raw: unknown): string[] {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw.map(String).map((s) => s.trim()).filter(Boolean);
    const s = String(raw).trim();
    if (!s) return [];
    return s.split(',').map((p) => p.trim()).filter(Boolean);
  }

  const rushEventsArray = parseRushEvents(rushEventsRaw);

  // ---------- NEW: prefill checked from rushEventsArray on load of a new application ----------
  useEffect(() => {
    if (!rushEventsArray || rushEventsArray.length === 0) return;

    setChecked((prev) => {
      const updated = { ...prev };
      rushEventsArray.forEach((key) => {
        if (key in updated) {
          updated[key as keyof typeof updated] = true;
        }
      });
      return updated;
    });
    // We only want to prefill when a new application is loaded.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [app?.id]);

  // ---------- Reusable checkbox handler ----------
  const handleCheckboxChange = (key: keyof typeof checked) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setChecked((prev) => ({ ...prev, [key]: isChecked }));
  };

  // ---------- Auto-save (debounced) ----------
  const saveTimerRef = useRef<number | null>(null);

  function checkedKeys(obj: typeof checked): string[] {
    return Object.entries(obj).filter(([, v]) => v).map(([k]) => k);
  }

  async function saveCheckedToServer(payloadEvents: string[]) {
    if (!app?.id) return;
    try {
      const res = await fetch(`/api/applications/${encodeURIComponent(String(app.id))}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: payloadEvents }),
        credentials: 'include',
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        console.error('Save failed:', body);
      }
    } catch (err) {
      console.error('Network error saving events', err);
    }
  }

  useEffect(() => {
    if (!app?.id) return;

    // Clear previous timer
    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }

    const delay = 700;
    // @ts-ignore - window.setTimeout returns number in browsers
    saveTimerRef.current = window.setTimeout(() => {
      const eventsToSave = checkedKeys(checked);
      saveCheckedToServer(eventsToSave);
      saveTimerRef.current = null;
    }, delay);

    return () => {
      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checked]);

  // ---------- Manual save (optional) ----------
  async function handleManualSave() {
    const eventsToSave = checkedKeys(checked);
    try {
      await saveCheckedToServer(eventsToSave);
      // lightweight feedback
      // replace with toast if you have one
      alert('Saved events');
    } catch {
      alert('Failed to save events');
    }
  }

  // ---------- Render ----------
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
                value={app?.status ?? ''}
                onChange={(e) => updateStatus(e.target.value as applicationStatus)}
                disabled={statusUpdating}
              >
                {Object.entries(STATUS_LABELS).map(([status, label]) => (
                  <option key={status} value={status}>
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
          {resumeSrc ? (
            <div className="resume-iframe-wrapper">
              <ResumeViewer url={String(resumeSrc)} height="100%" />
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

            <div>
              <div className="app-responses-question">Events Attended</div>
              <div className="bg-white flex flex-col gap-4 p-4 rounded-2xl">
                <label>
                  <input type="checkbox" checked={checked.InfoNight1} onChange={handleCheckboxChange('InfoNight1')} />
                  Info Night 1
                </label>
                <label>
                  <input type="checkbox" checked={checked.InfoNight2} onChange={handleCheckboxChange('InfoNight2')} />
                  Info Night 2
                </label>
                <label>
                  <input type="checkbox" checked={checked.CasinoNight} onChange={handleCheckboxChange('CasinoNight')} />
                  Casino Night
                </label>
                <label>
                  <input type="checkbox" checked={checked.TechnicalWorkshop} onChange={handleCheckboxChange('TechnicalWorkshop')} />
                  Technical Workshop
                </label>
                <label>
                  <input type="checkbox" checked={checked.PitchNight} onChange={handleCheckboxChange('PitchNight')} />
                  Pitch Night
                </label>

                <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                  <button className="bg-blue-600 p-2 rounded-full text-white" onClick={handleManualSave}>Save Events</button>
                </div>
              </div>
            </div>

            {responseItems.length > 0 &&
              responseItems.map((r, i) => <LabeledBox key={`resp-${i}`} label={r.question} value={r.answer} />)}
          </div>
        </div>

        <div className="right-column">
          <div className="sidebar-elevated">
            <CommentsSidebar applicationId={app?.id} refreshKey={commentsRefresh} />
          </div>
        </div>
      </div>
    </div>
  );
}
