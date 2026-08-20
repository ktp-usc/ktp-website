import Link from "next/link";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

import MatrixRain from "./components/MatrixRain";

const GROUPME_URL = "https://groupme.com/join_group/112363429/WgvjRlxj";
const CALENDAR_URL =
    "https://calendar.google.com/calendar/u/0?cid=1b20343751d013074e5f5f82bfcb70a9cf4ffba7a5a59d93c92f3b2894f7ef66@group.calendar.google.com";

type RushEvent = {
    codename: string;
    title: string;
    date: string;
    time: string;
    location: string;
    quote: string;
    description: string;
};

const RUSH_EVENTS: RushEvent[] = [
    {
        codename: "INFO_NIGHT_01",
        title: "Info Night #1",
        date: "Thursday, September 3",
        time: "7:00 – 8:00 PM",
        location: "Location TBA",
        quote: "This is your last chance. After this, there is no turning back.",
        description:
            "Want to learn more about what KTP has to offer? We'll give a presentation about what it means to be a brother in KTP; then, you'll have a chance to ask our brothers anything about rush, the professional fraternity experience, or whatever else you're wondering.",
    },
    {
        codename: "INFO_NIGHT_02",
        title: "Info Night #2",
        date: "Tuesday, September 8",
        time: "7:00 – 8:00 PM",
        location: "Location TBA",
        quote: "Offered the pill a second time.",
        description:
            "Same content as Info Night #1 — you only need to attend one of the two. Pick whichever fits your schedule.",
    },
    {
        codename: "GAME_NIGHT",
        title: "Game Night: Escape the Matrix",
        date: "Wednesday, September 9",
        time: "7:00 – 8:30 PM",
        location: "Location TBA",
        quote: "Free your mind.",
        description:
            "Team up with our brothers to crack ciphers, solve puzzles, and escape the Matrix before the clock runs out. Part escape room, part game night, and the easiest way to actually get to know the chapter.",
    },
    {
        codename: "TECH_WORKSHOP",
        title: "Technical Workshop",
        date: "Thursday, September 10",
        time: "7:00 – 8:30 PM",
        location: "Location TBA",
        quote: "I know kung fu.",
        description:
            "Want a glance at what it's like to join KTP? We'll teach you the basics of React and walk you through building your own website. No prior experience required — bring a laptop if you have one.",
    },
    {
        codename: "PITCH_NIGHT",
        title: "Pitch Night",
        date: "Friday, September 11",
        time: "5:00 – 7:00 PM",
        location: "Location TBA",
        quote: "There is no spoon.",
        description:
            "Time to showcase your collaboration skills. First we'll give you tips on your resume and LinkedIn; then you'll work with a team to pitch a solution to a technical challenge. Please dress business casual!",
    },
];

const FAQS = [
    {
        value: "q1",
        question: "I'm not majoring in the MCEC, can I still apply?",
        answer: "Yes! All majors are welcome, and we encourage applicants from different backgrounds to rush, as long as you have an interest in the tech industry.",
    },
    {
        value: "q2",
        question: "How much of a time commitment is the New Member Education process?",
        answer: "Should you accept a bid from us, you will be expected to attend 2-3 events per week (including technical workshops, professional workshops, social events, etc.) as well as actively contributing to your assigned nonprofit project.",
    },
    {
        value: "q3",
        question: "I'm not able to attend one of the rush events. How will this affect my chances?",
        answer: "We understand that various circumstances prevent applicants from attending all of our events. Please contact our Executive Secretary via GroupMe DM at least an hour before the event takes place if you aren't able to attend.",
    },
    {
        value: "q4",
        question: "Can I rush multiple professional fraternities alongside Kappa Theta Pi?",
        answer: "Yes, but if you receive a bid from us, we ask that you only pledge our organization this semester. You're also able to hold membership in any other professional or social fraternity/sorority!",
    },
    {
        value: "q5",
        question: "How much are dues? Do I have to pay?",
        answer: "If you accept a bid from us, you are expected to pay $150 in New Member dues this semester. This will cover all expenses related to running a professional fraternity, such as professional, technical, and social events. If you are unable to pay the dues in full, you will have the opportunity to submit a financial hardship appeal to our Director of Finance. More information will be provided once bids are awarded.",
    },
    {
        value: "q6",
        question: "If I'm selected for an interview, what commitments should I plan for?",
        answer: "In the event you advance in our recruitment process, anticipate a 15-20 minute interview slot on the weekend of September 12th. More details will be provided over email upon invitation.",
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

                <p className="mt-2 font-mono text-sm italic text-[#4bcc74]">
                    &ldquo;{event.quote}&rdquo;
                </p>

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
                            <span className="text-[#00ff41]">&gt;</span> The Matrix has you. Five
                            events. One week. Take the red pill and see what USC&apos;s premier
                            professional technology fraternity actually looks like from the inside.
                        </p>
                        <p className="mt-4 text-sm leading-relaxed text-[#9dffb8] sm:text-base">
                            <span className="text-[#00ff41]">&gt;</span> Applications are due{" "}
                            <strong className="text-[#00ff41]">Friday, September 11, 2026</strong>.
                            <span className="mx-caret" />
                        </p>
                    </div>

                    <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <Link
                            href="/apply"
                            className="w-full max-w-xs rounded-sm border border-[#00ff41] bg-[#00ff41]/10 px-6 py-3 font-mono text-sm font-bold uppercase tracking-[0.18em] text-[#00ff41] transition-all duration-300 hover:bg-[#00ff41]/25 hover:shadow-[0_0_24px_rgba(0,255,65,0.45)] sm:w-auto"
                        >
                            Take the red pill →
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

                    <p className="mt-6 text-sm text-[#4bcc74]">
                        Also join our{" "}
                        <a
                            href={CALENDAR_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-[#00ff41] underline decoration-[#00ff41]/40 underline-offset-4 hover:decoration-[#00ff41]"
                        >
                            Fall 2026 Rush Google Calendar
                        </a>{" "}
                        to sync every event to your own calendar.
                    </p>
                </section>

                {/* ===== Schedule ===== */}
                <section className="mx-auto mt-20 max-w-4xl">
                    <h2 className="font-mono text-2xl font-bold uppercase tracking-[0.15em] text-[#00ff41] mx-glow sm:text-3xl">
                        ./rush_schedule --fall-2026
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

                {/* ===== FAQ ===== */}
                <section className="mx-auto mt-24 max-w-3xl">
                    <h2 className="text-center font-mono text-2xl font-bold uppercase tracking-[0.15em] text-[#00ff41] mx-glow sm:text-3xl">
                        cat faq.txt
                    </h2>

                    <Accordion type="multiple" className="mt-10 w-full space-y-4">
                        {FAQS.map((faq) => (
                            <AccordionItem
                                key={faq.value}
                                value={faq.value}
                                className="mx-faq-item mx-panel rounded-sm px-5"
                            >
                                <AccordionTrigger className="py-5 text-left font-mono text-base! font-bold text-[#00ff41] hover:no-underline sm:text-lg!">
                                    <span>
                                        <span className="text-[#12833a]">?&nbsp;</span>
                                        {faq.question}
                                    </span>
                                </AccordionTrigger>
                                <AccordionContent className="pb-6 text-sm leading-relaxed text-[#9dffb8]/85 sm:text-base">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>

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
