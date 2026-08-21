import Link from "next/link";

import MatrixRain from "./components/MatrixRain";

const GROUPME_URL = "https://groupme.com/join_group/116625658/czF4Yrw4";

type RushEvent = {
    codename: string;
    title: string;
    date: string;
    time: string;
    location: string;
    description: string;
};

const RUSH_EVENTS: RushEvent[] = [
    {
        codename: "INFO_NIGHT_01",
        title: "Info Night #1",
        date: "Thursday, September 3",
        time: "7:00 – 8:00 PM",
        location: "Location TBA",
        description:
            "Want to learn more about what KTP has to offer? We'll give a presentation about what it means to be a brother in KTP; then, you'll have a chance to ask our brothers anything about rush, the professional fraternity experience, or whatever else you're wondering.",
    },
    {
        codename: "INFO_NIGHT_02",
        title: "Info Night #2",
        date: "Tuesday, September 8",
        time: "7:00 – 8:00 PM",
        location: "Location TBA",
        description:
            "Same content as Info Night #1 — you only need to attend one of the two. Pick whichever fits your schedule.",
    },
    {
        codename: "GAME_NIGHT",
        title: "Game Night: Escape the Matrix",
        date: "Wednesday, September 9",
        time: "7:00 – 8:30 PM",
        location: "Location TBA",
        description:
            "Team up with our brothers to crack ciphers, solve puzzles, and escape the Matrix before the clock runs out. Part escape room, part game night, and the easiest way to actually get to know the chapter.",
    },
    {
        codename: "TECH_WORKSHOP",
        title: "Technical Workshop",
        date: "Thursday, September 10",
        time: "7:00 – 8:30 PM",
        location: "Location TBA",
        description:
            "Want a glance at what it's like to join KTP? We'll teach you the basics of React and walk you through building your own website. No prior experience required — bring a laptop if you have one.",
    },
    {
        codename: "PITCH_NIGHT",
        title: "Pitch Night",
        date: "Friday, September 11",
        time: "5:00 – 7:00 PM",
        location: "Location TBA",
        description:
            "Time to showcase your collaboration skills. First we'll give you tips on your resume and LinkedIn; then you'll work with a team to pitch a solution to a technical challenge. Please dress business casual!",
    },
];

const WHY_KTP = [
    {
        title: "Hands-On Tech Experience",
        detail: "Work on a project team to build real technical solutions for local nonprofits.",
    },
    {
        title: "Professional Development",
        detail: "Weekly workshops on LinkedIn, resumes, interview prep, and more.",
    },
    {
        title: "Build Your Network",
        detail: "Get connected to peers, alumni, faculty, internship opportunities, and tech professionals.",
    },
    {
        title: "Social / Professional Balance",
        detail: "Attend fun events like bonfires, big/little events, formal, and mountain weekend — while still getting to hackathons and conferences like CES and BSides!",
    },
];

function EventCard({ event, index }: { event: RushEvent; index: number }) {
    return (
        <li className="relative pl-10 sm:pl-14">
            {/* timeline node */}
            <span
                aria-hidden="true"
                className="mx-node absolute left-2 top-8 h-2.5 w-2.5 -translate-x-1/2 rotate-45 bg-[#00ff41] sm:left-4"
            />

            <article className="mx-panel rounded-sm p-5 sm:p-7">
                {/* terminal chrome */}
                <div className="mb-4 flex items-center justify-between gap-4 border-b border-[#00ff41]/20 pb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-[#4bcc74]">
                    <span>
                        {String(index + 1).padStart(2, "0")} / {event.codename}
                    </span>
                    <span className="hidden sm:inline">STATUS: OPEN</span>
                </div>

                <h3 className="font-mono text-xl font-bold text-[#00ff41] mx-glow sm:text-2xl">
                    {event.title}
                </h3>

                <dl className="mt-5 grid gap-2 font-mono text-sm text-[#9dffb8] sm:grid-cols-2">
                    <div className="flex items-start gap-2">
                        <dt className="text-[#12833a]">[DATE]</dt>
                        <dd>{event.date}</dd>
                    </div>
                    <div className="flex items-start gap-2">
                        <dt className="text-[#12833a]">[TIME]</dt>
                        <dd>{event.time}</dd>
                    </div>
                    <div className="flex items-start gap-2 sm:col-span-2">
                        <dt className="text-[#12833a]">[LOC]</dt>
                        <dd>{event.location}</dd>
                    </div>
                </dl>

                <p className="mt-5 text-sm leading-relaxed text-[#9dffb8]/80 sm:text-base">
                    {event.description}
                </p>
            </article>
        </li>
    );
}

export default function RushPage() {
    return (
        <main className="matrix-rush min-h-screen font-mono">
            <div className="matrix-rush__backdrop" aria-hidden="true" />
            <MatrixRain />
            <div className="matrix-rush__scanlines" aria-hidden="true" />

            <div className="matrix-rush__content px-4 pt-14 pb-24 sm:px-6">
                {/* ===== Hero ===== */}
                <section className="mx-auto max-w-3xl text-center">
                    <p className="font-mono text-xs uppercase tracking-[0.35em] text-[#12833a] sm:text-sm">
                        Kappa Theta Pi · Alpha Theta · Fall 2026
                    </p>

                    <h1 className="mt-6 text-4xl font-extrabold uppercase leading-tight tracking-tight sm:text-6xl">
                        <span className="mx-glitch mx-glow" data-text="Wake up,">
                            Wake up,
                        </span>
                        <br />
                        <span className="mx-glitch mx-glow" data-text="Gamecock.">
                            Gamecock.
                        </span>
                    </h1>

                    <div className="mx-panel mx-auto mt-10 max-w-2xl rounded-sm p-5 text-left sm:p-6">
                        <p className="text-sm leading-relaxed text-[#9dffb8] sm:text-base">
                            <span className="text-[#00ff41]">&gt;</span> The Matrix has you. Take the
                            red pill and come see what USC&apos;s premier professional technology
                            fraternity actually looks like from the inside.
                        </p>
                        <p className="mt-4 text-sm leading-relaxed text-[#9dffb8] sm:text-base">
                            <span className="text-[#00ff41]">&gt;</span> Applications are due{" "}
                            <strong className="text-[#00ff41]">
                                Friday, September 11, 2026 at 9:00 PM
                            </strong>
                            .
                            <span className="mx-caret" />
                        </p>
                    </div>

                    <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <Link
                            href="/apply"
                            className="w-full max-w-xs whitespace-nowrap rounded-sm border border-[#00ff41] bg-[#00ff41]/10 px-6 py-3 font-mono text-sm font-bold uppercase tracking-[0.18em] text-[#00ff41] transition-all duration-300 hover:bg-[#00ff41]/25 hover:shadow-[0_0_24px_rgba(0,255,65,0.45)] sm:w-auto"
                        >
                            Start your application →
                        </Link>
                        <Link
                            href={GROUPME_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full max-w-xs rounded-sm border border-[#00ff41]/40 px-6 py-3 font-mono text-sm font-bold uppercase tracking-[0.18em] text-[#9dffb8] transition-all duration-300 hover:border-[#00ff41] hover:text-[#00ff41] sm:w-auto"
                        >
                            Rush GroupMe
                        </Link>
                    </div>

                </section>

                {/* ===== Schedule ===== */}
                <section className="mx-auto mt-20 max-w-4xl">
                    <h2 className="font-mono text-2xl font-bold uppercase tracking-[0.15em] text-[#00ff41] mx-glow sm:text-3xl">
                        Rush Schedule Fall 2026
                    </h2>

                    <p className="mt-4 border-l-2 border-[#00ff41]/40 pl-4 font-mono text-xs italic leading-relaxed text-[#4bcc74] sm:text-sm">
                        WARNING: All rush dates, times, and locations are subject to change. Join the
                        Rush GroupMe so you get notified of any changes.
                    </p>

                    <ol className="mx-timeline mt-10 space-y-8">
                        {RUSH_EVENTS.map((event, index) => (
                            <EventCard key={event.codename} event={event} index={index} />
                        ))}

                        {/* Deadline */}
                        <li className="relative pl-10 sm:pl-14">
                            <span
                                aria-hidden="true"
                                className="mx-node absolute left-2 top-8 h-2.5 w-2.5 -translate-x-1/2 rotate-45 bg-[#00ff41] sm:left-4"
                            />
                            <article className="mx-panel rounded-sm border-[#00ff41]/70 p-5 sm:p-7">
                                <div className="mb-4 flex items-center justify-between gap-4 border-b border-[#00ff41]/20 pb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-[#4bcc74]">
                                    <span>06 / APPLICATION_DEADLINE</span>
                                    <span className="hidden sm:inline">STATUS: FINAL</span>
                                </div>

                                <h3 className="font-mono text-xl font-bold text-[#00ff41] mx-glow sm:text-2xl">
                                    Application Deadline
                                </h3>

                                <dl className="mt-5 grid gap-2 font-mono text-sm text-[#9dffb8] sm:grid-cols-2">
                                    <div className="flex items-start gap-2">
                                        <dt className="text-[#12833a]">[DATE]</dt>
                                        <dd>Friday, September 11</dd>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <dt className="text-[#12833a]">[TIME]</dt>
                                        <dd>9:00 PM</dd>
                                    </div>
                                </dl>

                                <p className="mt-5 text-sm leading-relaxed text-[#9dffb8]/80 sm:text-base">
                                    Submit before the window closes. Rush event attendance is tracked
                                    and included with your application.
                                </p>

                                <Link
                                    href="/apply"
                                    className="mt-6 inline-block rounded-sm border border-[#00ff41] bg-[#00ff41]/10 px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-[0.18em] text-[#00ff41] transition-all duration-300 hover:bg-[#00ff41]/25 hover:shadow-[0_0_24px_rgba(0,255,65,0.45)]"
                                >
                                    Start your application
                                </Link>
                            </article>
                        </li>
                    </ol>
                </section>

                {/* ===== Why KTP ===== */}
                <section className="mx-auto mt-24 max-w-4xl">
                    <h2 className="text-center font-mono text-2xl font-bold uppercase tracking-[0.15em] text-[#00ff41] mx-glow sm:text-3xl">
                        Why Kappa Theta Pi?
                    </h2>

                    <div className="mt-10 grid gap-6 sm:grid-cols-2">
                        {WHY_KTP.map((reason) => (
                            <article key={reason.title} className="mx-panel rounded-sm p-6">
                                <h3 className="font-mono text-lg font-bold text-[#00ff41] mx-glow">
                                    {reason.title}
                                </h3>
                                <p className="mt-3 flex gap-2 text-sm leading-relaxed text-[#9dffb8]/85 sm:text-base">
                                    <span aria-hidden="true" className="text-[#12833a]">
                                        &gt;
                                    </span>
                                    <span>{reason.detail}</span>
                                </p>
                            </article>
                        ))}
                    </div>

                    <p className="mt-12 text-center font-mono text-sm text-[#4bcc74]">
                        Still have questions? Ping us at{" "}
                        <a
                            href="mailto:soktp@mailbox.sc.edu"
                            className="text-[#00ff41] underline decoration-[#00ff41]/40 underline-offset-4 hover:decoration-[#00ff41]"
                        >
                            soktp@mailbox.sc.edu
                        </a>
                    </p>
                </section>
            </div>
        </main>
    );
}
