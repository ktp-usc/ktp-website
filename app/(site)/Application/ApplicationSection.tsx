// app/(site)/application/ApplicationSection.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import type { applications as Application } from '@prisma/client';

import { Button } from '@/components/ui/button';

function splitCommaList(v: string) {
    return v
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
}

function formFromApp(app: Application | null) {
    return {
        classification: app?.classification ?? '',
        major: app?.major ?? '',
        minor: app?.minor ?? '',
        gpa: app?.gpa?.toString() ?? '',
        linkedin: app?.linkedin ?? '',
        github: app?.github ?? '',
        reason: app?.reason ?? '',
        eventsAttended: (app?.eventsAttended ?? []).join(', ')
    };
}

export default function ApplicationSection({
                                               embedded = false,
                                               initialApplication
                                           }: {
    embedded?: boolean;
    initialApplication?: Application | null;
}) {
    const [application, setApplication] = useState<Application | null>(initialApplication ?? null);
    const [form, setForm] = useState(() => formFromApp(initialApplication ?? null));

    // only show "loading null" if this component is used outside the dashboard without initial data
    const [loading, setLoading] = useState<boolean>(initialApplication === undefined);

    const isSubmitted = !!application?.submittedAt;
    const canEdit = !loading && !isSubmitted;

    const statusText = useMemo(() => {
        if (loading) return 'Loading…';
        if (isSubmitted) return 'Submitted';
        return 'Draft';
    }, [isSubmitted, loading]);

    // ✅ key fix:
    // 1) hydrate instantly from initialApplication
    // 2) ALWAYS fetch fresh on mount to reflect latest DB state after tab switches
    useEffect(() => {
        let cancelled = false;

        // hydrate immediately from the server-provided snapshot (or null)
        setApplication(initialApplication ?? null);
        setForm(formFromApp(initialApplication ?? null));

        async function syncFresh() {
            // if initialApplication was provided, don’t blank the UI
            if (initialApplication === undefined) setLoading(true);

            try {
                const res = await fetch('/api/applications/me', {
                    cache: 'no-store',
                    credentials: 'include'
                });

                const body = await res.json();
                if (!res.ok) throw new Error(body?.error || 'Failed to load application.');

                const app = (body.application ?? null) as Application | null;

                if (!cancelled) {
                    setApplication(app);
                    setForm(formFromApp(app));
                }
            } catch {
                if (!cancelled) {
                    // keep whatever we had from initialApplication if present
                    if (initialApplication === undefined) {
                        setApplication(null);
                        setForm(formFromApp(null));
                    }
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        syncFresh();

        return () => {
            cancelled = true;
        };
        // we only re-run if the initial snapshot truly changes
    }, [
        initialApplication?.id,
        // lastModified exists on your model; this helps if the server prop updates
        (initialApplication as any)?.lastModified,
        (initialApplication as any)?.submittedAt
    ]);

    async function saveDraft() {
        try {
            const gpaNum = form.gpa.trim() ? Number(form.gpa) : null;
            if (gpaNum !== null && (!Number.isFinite(gpaNum) || gpaNum < 0 || gpaNum > 4.0)) {
                toast.error('GPA must be a number between 0.0 and 4.0');
                return;
            }

            const res = await fetch('/api/applications/me', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                cache: 'no-store',
                credentials: 'include',
                body: JSON.stringify({
                    classification: form.classification.trim() || null,
                    major: form.major.trim() || null,
                    minor: form.minor.trim() || null,
                    gpa: gpaNum,
                    linkedin: form.linkedin.trim() || null,
                    github: form.github.trim() || null,
                    reason: form.reason.trim() || null,
                    eventsAttended: splitCommaList(form.eventsAttended)
                })
            });

            const body = await res.json();
            if (!res.ok) {
                toast.error(body?.error || 'Failed to save draft.');
                return;
            }

            const updated = body.application as Application;
            setApplication(updated);
            setForm(formFromApp(updated));
            toast.success('Draft saved.');
        } catch {
            toast.error('Failed to save draft.');
        }
    }

    async function submitApplication() {
        try {
            const res = await fetch('/api/applications/me/submit', {
                method: 'POST',
                cache: 'no-store',
                credentials: 'include'
            });

            const body = await res.json();
            if (!res.ok) {
                toast.error(body?.error || 'Submit failed.');
                return;
            }

            setApplication(body.application as Application);
            toast.success('Application submitted!');
        } catch {
            toast.error('Submit failed.');
        }
    }

    if (loading) return null;

    const content = (
        <div className="relative space-y-6">
            <div className="flex justify-end sm:h-0">
                <div className="flex items-center gap-2 sm:absolute sm:right-0 sm:top-[-92px]">
                    <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
                        Status: <span className="font-medium text-foreground">{statusText}</span>
                    </div>

                    <Button type="button" variant="secondary" onClick={saveDraft} disabled={!canEdit}>
                        Save draft
                    </Button>

                    <Button type="button" onClick={submitApplication} disabled={!application || isSubmitted}>
                        Submit
                    </Button>
                </div>
            </div>

            {application ? (
                <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm">
                    <div>
                        <span className="font-medium text-foreground">Name:</span>{' '}
                        <span className="text-muted-foreground">{application.fullName}</span>
                    </div>
                    <div>
                        <span className="font-medium text-foreground">Email:</span>{' '}
                        <span className="text-muted-foreground">{application.email}</span>
                    </div>
                </div>
            ) : null}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-foreground/90 mb-2">Classification</label>
                    <input
                        value={form.classification}
                        disabled={!canEdit}
                        onChange={(e) => setForm((p) => ({ ...p, classification: e.target.value }))}
                        className="w-full rounded-lg border border-input px-4 py-3 text-foreground placeholder:text-muted-foreground bg-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-70 disabled:cursor-not-allowed"
                        placeholder="Freshman, Sophomore, Junior, Senior"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-foreground/90 mb-2">GPA</label>
                    <input
                        value={form.gpa}
                        disabled={!canEdit}
                        onChange={(e) => setForm((p) => ({ ...p, gpa: e.target.value }))}
                        className="w-full rounded-lg border border-input px-4 py-3 text-foreground placeholder:text-muted-foreground bg-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-70 disabled:cursor-not-allowed"
                        placeholder="3.8"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-foreground/90 mb-2">Major</label>
                    <input
                        value={form.major}
                        disabled={!canEdit}
                        onChange={(e) => setForm((p) => ({ ...p, major: e.target.value }))}
                        className="w-full rounded-lg border border-input px-4 py-3 text-foreground placeholder:text-muted-foreground bg-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-70 disabled:cursor-not-allowed"
                        placeholder="IIT, CS, etc."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-foreground/90 mb-2">Minor</label>
                    <input
                        value={form.minor}
                        disabled={!canEdit}
                        onChange={(e) => setForm((p) => ({ ...p, minor: e.target.value }))}
                        className="w-full rounded-lg border border-input px-4 py-3 text-foreground placeholder:text-muted-foreground bg-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-70 disabled:cursor-not-allowed"
                        placeholder="Business, Math, etc."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-foreground/90 mb-2">LinkedIn</label>
                    <input
                        value={form.linkedin}
                        disabled={!canEdit}
                        onChange={(e) => setForm((p) => ({ ...p, linkedin: e.target.value }))}
                        className="w-full rounded-lg border border-input px-4 py-3 text-foreground placeholder:text-muted-foreground bg-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-70 disabled:cursor-not-allowed"
                        placeholder="https://www.linkedin.com/in/username"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-foreground/90 mb-2">GitHub</label>
                    <input
                        value={form.github}
                        disabled={!canEdit}
                        onChange={(e) => setForm((p) => ({ ...p, github: e.target.value }))}
                        className="w-full rounded-lg border border-input px-4 py-3 text-foreground placeholder:text-muted-foreground bg-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-70 disabled:cursor-not-allowed"
                        placeholder="https://github.com/username"
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-foreground/90 mb-2">Events attended</label>
                    <div className="w-full rounded-lg border border-input px-4 py-3 bg-muted/30 text-foreground">
                        {(application?.eventsAttended?.length ?? 0) > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {application!.eventsAttended.map((evt) => (
                                    <span
                                        key={evt}
                                        className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1 text-sm"
                                    >
                    {evt}
                  </span>
                                ))}
                            </div>
                        ) : (
                            <span className="text-muted-foreground">No events recorded yet.</span>
                        )}
                    </div>

                    <p className="mt-2 text-xs text-muted-foreground">This is tracked by admins and updates automatically.</p>
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-foreground/90 mb-2">Why do you want to join?</label>
                    <textarea
                        value={form.reason}
                        disabled={!canEdit}
                        onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))}
                        rows={6}
                        className="w-full rounded-lg border border-input px-4 py-3 text-foreground placeholder:text-muted-foreground bg-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-70 disabled:cursor-not-allowed"
                        placeholder="Write a thoughtful response…"
                    />
                </div>

                {application?.resumeUrl ? (
                    <div className="md:col-span-2 text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">Resume:</span>{' '}
                        <a className="hover:underline" href={application.resumeUrl} target="_blank" rel="noreferrer">
                            View uploaded resume
                        </a>
                    </div>
                ) : (
                    <div className="md:col-span-2 text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">Resume:</span> Upload your resume in the Profile section above
                        to attach it here.
                    </div>
                )}
            </div>
        </div>
    );

    if (embedded) return content;
    return <div className="mt-10">{content}</div>;
}
