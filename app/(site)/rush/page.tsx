"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, forwardRef } from "react";

import CalendarIcon from "@/components/CalendarIcon";
import PinIcon from "@/components/PinIcon";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

interface FloatingImageProps {
    className?: string;
}

/* floating cards image */
const FloatingCardsImage = forwardRef<HTMLDivElement, FloatingImageProps>(function FloatingCardsImage({ className = "" }, ref) {
    return (
        <div
            ref={ref}
            aria-hidden="true"
            className={`pointer-events-none hidden sm:block absolute -left-80 top-0 w-44 h-44 ktp-float-cards ${className}`}
        >
            <div className="relative w-full h-full">
                <Image src="/Images/cards.png" alt="" fill style={{ objectFit: "contain" }} />
            </div>
        </div>
    );
});

/* floating chips image */
const AnimatedChipsImage = forwardRef<HTMLDivElement, FloatingImageProps>(function AnimatedChipsImage({ className = "" }, ref) {
    return (
        <div
            ref={ref}
            aria-hidden="true"
            className={`pointer-events-none hidden sm:block absolute -right-80 top-0 w-40 h-40 ktp-chips-anim ${className}`}
        >
            <div className="relative w-full h-full">
                <Image src="/Images/chips.png" alt="" fill style={{ objectFit: "contain" }} />
            </div>
        </div>
    );
});

export default function Page2() {
    const cardsRef = useRef(null);
    const chipsRef = useRef(null);

    return (
        <>
            <main className="relative">
                {/* Background blobs */}
                <div className="relative bg-white w-full">
                    <div className="absolute inset-0 blob-c z-0">
                        <div className="shape-blob eight" />
                        <div className="shape-blob nine" />
                    </div>
                </div>

                <div className="relative z-10">
                    <section className="text-center py-16 px-6 relative overflow-visible">
                        <div className="relative inline-block">
                            <FloatingCardsImage ref={cardsRef} />
                            <AnimatedChipsImage ref={chipsRef} />

                            <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">Learn About Joining KTP!</h1>
                        </div>
                        <p className="text-gray-600 text-xl sm:text-xl mb-4">
                            <strong>Go all in with Kappa Theta Pi for Spring 2026 Rush!</strong>
                        </p>
                        <p className="text-gray-600 text-xl sm:text-xl mb-4">
                            <strong>Here&apos;s our rush schedule. Applications are due Friday, January 30, 2026.</strong>
                        </p>
                        <p className="text-gray-600 text-lg sm:text-xl mb-8">
                            <span className="font-semibold text-black"></span>
                        </p>

                        {/* Application button */}
                        <div className="flex justify-center gap-4 mb-6 px-4">
                            <Link
                                href="https://groupme.com/join_group/112363429/WgvjRlxj"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-6 py-3 bg-[#315CA9] text-white rounded-lg font-semibold hover:bg-[#23498F] transition-all duration-300 hover:scale-110 hover:drop-shadow-md"
                            >
                                Rush GroupMe
                            </Link>
                            <Link
                                href="/apply"
                                className="px-6 py-3 bg-[#315CA9] text-white rounded-lg font-semibold hover:bg-[#23498F] transition-all duration-300 hover:scale-110 hover:drop-shadow-md"
                            >
                                Application Link
                            </Link>
                        </div>
                        <p className="text-gray-600 text-lg sm:text-xl mb-2">
                            Also, join our{" "}
                            <a
                                href="https://calendar.google.com/calendar/u/0?cid=1b20343751d013074e5f5f82bfcb70a9cf4ffba7a5a59d93c92f3b2894f7ef66@group.calendar.google.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#315CA9] font-semibold hover:underline"
                            >
                                Spring 2026 Rush Google Calendar
                            </a>{" "}
                            to add all these events to your personal calendar!
                        </p>
                    </section>

                    {/* ===== Timeline Section ===== */}
                    <section className="max-w-6xl mx-auto mt-9 px-4 relative">
                        <div>
                            <h2 className="text-2xl sm:text-2xl font-bold mb-3">Spring 2026 Rush Events</h2>

                            <p className="text-gray-600 text-md italic font-bold sm:text-md mb-5 px-4">
                                *All rush dates, times, and locations are subject to change. You must join our Rush GroupMe
                                to get updated on any changes that occur.*
                            </p>

                            <div className="relative">
                                {/* vertical line (left) */}
                                <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200 hidden sm:block" />

                                {/* Event 1 */}
                                <div className="relative pl-10 pb-12">
                                    <div className="absolute -left-3 text-2xl top-0 text-[#315CA9] font-bold" aria-hidden="true">
                                        ♠
                                    </div>
                                    <h3 className="text-xl sm:text-xl font-semibold mb-2">Info Night #1</h3>
                                    <p className="text-base text-gray-600 flex items-center gap-2 mb-2">
                                        <CalendarIcon />
                                        <span>Thursday, January 22, 7:00-8:00 PM</span>
                                    </p>
                                    <p className="text-base text-gray-600 flex items-center gap-2 mb-4">
                                        <PinIcon />
                                        <span>Darla Moore School of Business Room 136</span>
                                    </p>
                                    <p className="text-base text-gray-600 leading-relaxed">
                                        Want to learn more about what KTP has to offer? We&apos;ll give a presentation about what it means
                                        to be a brother in KTP; then, you&apos;ll have a chance to ask our brothers any questions related to
                                        rush, the professional fraternity experience, or anything else you may be wondering!
                                    </p>
                                </div>

                                <div className="relative pl-10 pb-12">
                                    <div className="absolute -left-3 text-2xl top-0 text-[#315CA9] font-bold" aria-hidden="true">
                                        ♣
                                    </div>
                                    <h3 className="text-xl sm:text-xl font-semibold mb-2">Info Night #2</h3>
                                    <p className="text-base text-gray-600 flex items-center gap-2 mb-2">
                                        <CalendarIcon />
                                        <span>Monday, January 26, 7:00-8:00 PM</span>
                                    </p>
                                    <p className="text-base text-gray-600 flex items-center gap-2 mb-4">
                                        <PinIcon />
                                        <span>Swearingen Room 1C01</span>
                                    </p>
                                    <p className="text-base text-gray-600 leading-relaxed">
                                        Same as above; you only need to attend one of our info nights! Choose whichever one works best for you.
                                    </p>
                                </div>

                                {/* Event 2 */}
                                <div className="relative pl-10 pb-12">
                                    <div className="absolute -left-3 text-2xl top-0 text-[#315CA9] font-bold" aria-hidden="true">
                                        ♦
                                    </div>
                                    <h3 className="text-xl sm:text-xl font-semibold mb-2">Field Day</h3>
                                    <p className="text-base text-gray-600 flex items-center gap-2 mb-2">
                                        <CalendarIcon />
                                        <span>Tuesday, January 27, 6:00-7:30 PM</span>
                                    </p>
                                    <p className="text-base text-gray-600 flex items-center gap-2 mb-4">
                                        <PinIcon />
                                        <span>Strom Thurmond Fitness and Wellness Center</span>
                                    </p>
                                    <p className="text-base text-gray-600 leading-relaxed">
                                        Join us for this casual social event where you&apos;ll get to enjoy a night full of fun activities and
                                        games including volleyball, spikeball, swimming, frisbee, and more.
                                    </p>
                                </div>

                                {/* Event 3 */}
                                <div className="relative pl-10 pb-12">
                                    <div className="absolute -left-3 text-2xl top-0 text-[#315CA9] font-bold" aria-hidden="true">
                                        ♥
                                    </div>
                                    <h3 className="text-xl sm:text-xl font-semibold mb-2">Technical Workshop</h3>
                                    <p className="text-base text-gray-600 flex items-center gap-2 mb-2">
                                        <CalendarIcon />
                                        <span>Wednesday, January 28, 7:00-8:30 PM</span>
                                    </p>
                                    <p className="text-base text-gray-600 flex items-center gap-2 mb-4">
                                        <PinIcon />
                                        <span>Innovation Room 1400</span>
                                    </p>
                                    <p className="text-base text-gray-600 leading-relaxed">
                                        Want to get a glance of what it&apos;s like joining KTP? At this event, we&apos;ll teach you the basics of
                                        React and how to build your own website!
                                    </p>
                                </div>

                                {/* Event 4 */}
                                <div className="relative pl-10 pb-12">
                                    <div className="absolute -left-3 top-0 text-[#315CA9] text-2xl font-bold" aria-hidden="true">
                                        ♠
                                    </div>
                                    <h3 className="text-xl sm:text-xl font-semibold mb-2">Pitch Night</h3>
                                    <p className="text-base text-gray-600 flex items-center gap-2 mb-2">
                                        <CalendarIcon />
                                        <span>Friday, January 30, 5:00-7:00 PM</span>
                                    </p>
                                    <p className="text-base text-gray-600 flex items-center gap-2 mb-4">
                                        <PinIcon />
                                        <span>Darla Moore School of Business Room 140</span>
                                    </p>
                                    <p className="text-base text-gray-600 leading-relaxed">
                                        It&apos;s time to showcase your collaboration skills. First, we&apos;ll give you tips on your resume and
                                        LinkedIn; then, you&apos;ll work with a team to pitch a solution to a technical challenge. Please dress
                                        business casual!
                                    </p>
                                </div>
                            </div>

                            <div className="relative pl-10 pb-12">
                                <div className="absolute -left-3 text-2xl top-0 text-[#315CA9] font-bold" aria-hidden="true">
                                    ♦
                                </div>
                                <h3 className="text-xl sm:text-xl font-semibold mb-2">Application Deadline</h3>
                                <p className="text-base text-gray-600 flex items-center gap-2 mb-2">
                                    <CalendarIcon />
                                    <span>Friday, January 30, 9:00 PM</span>
                                </p>
                                <div className="mt-5 mb-3">
                                    <Link
                                        href="/apply"
                                        className="inline-block px-6 py-3 bg-[#315CA9] text-white rounded-full font-semibold hover:bg-[#23498F] transition-colors"
                                    >
                                        Apply Here
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="max-w-4xl mx-auto mt-16 mb-24 px-4">
                        <h1 className="text-4xl sm:text-4xl font-extrabold text-center mb-10">Frequently Asked Questions</h1>

                        <Accordion type="multiple" className="w-full divide-y divide-gray-200">
                            <AccordionItem value="q1">
                                <AccordionTrigger className="py-6 text-left !text-xl sm:!text-xl font-bold text-black hover:bg-gray-50">
                                    I&apos;m not majoring in the MCEC, can I still apply?
                                </AccordionTrigger>
                                <AccordionContent className="pb-6 text-gray-700 text-lg leading-relaxed">
                                    Yes! All majors are welcome, and we encourage applicants from different backgrounds to rush, as long as you
                                    have an interest in the tech industry.
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="q2">
                                <AccordionTrigger className="py-6 text-left !text-xl sm:!text-xl font-bold text-black hover:bg-gray-50">
                                    How much of a time commitment is the New Member Education process?
                                </AccordionTrigger>
                                <AccordionContent className="pb-6 text-gray-700 text-lg leading-relaxed">
                                    Should you accept a bid from us, you will be expected to attend 2-3 events per week, (including technical
                                    workshops, professional workshops, social events, etc.) as well as actively contributing to your assigned
                                    nonprofit project.
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="q3">
                                <AccordionTrigger className="py-6 text-left !text-xl sm:!text-xl font-bold text-black hover:bg-gray-50">
                                    I&apos;m not able to attend one of the rush events. How will this affect my chances?
                                </AccordionTrigger>
                                <AccordionContent className="pb-6 text-gray-700 text-lg leading-relaxed">
                                    We understand that various circumstances prevent applicants from attending all of our events. Please contact
                                    our Executive Secretary (Josiah White) via GroupMe DM at least an hour before the event takes place if you
                                    aren&apos;t able to attend.
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="q4">
                                <AccordionTrigger className="py-6 text-left !text-xl sm:!text-xl font-bold text-black hover:bg-gray-50">
                                    Can I rush multiple professional fraternities alongside Kappa Theta Pi?
                                </AccordionTrigger>
                                <AccordionContent className="pb-6 text-gray-700 text-lg leading-relaxed">
                                    Yes, but if you receive a bid from us, we ask that you only pledge our organization this semester. You&apos;re
                                    also able to hold membership in any other professional or social fraternity/sorority!
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="q5">
                                <AccordionTrigger className="py-6 text-left !text-xl sm:!text-xl font-bold text-black hover:bg-gray-50">
                                    How much are dues? Do I have to pay?
                                </AccordionTrigger>
                                <AccordionContent className="pb-6 text-gray-700 text-lg leading-relaxed">
                                    If you accept a bid from us, you are expected to pay $100 in New Member dues this semester. This will
                                    cover all expenses related to running a professional fraternity, such as professional, technical, and social
                                    events. If you are unable to pay the dues in full, you will have the opportunity to submit a financial
                                    hardship appeal to our Director of Finance. More information will be provided once bids are awarded.
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="q6">
                                <AccordionTrigger className="py-6 text-left !text-xl sm:!text-xl font-bold text-black hover:bg-gray-50">
                                    If I&apos;m selected for an interview, what commitments should I plan for?
                                </AccordionTrigger>
                                <AccordionContent className="pb-6 text-gray-700 text-lg leading-relaxed">
                                    In the event you advance in our recruitment process, anticipate a 15-20 minute interview slot on the weekend
                                    of February 1st. More details will be provided over email upon invitation.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </section>
                </div>
            </main>
        </>
    );
}
