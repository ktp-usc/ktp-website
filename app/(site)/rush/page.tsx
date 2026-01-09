"use client"

import Link from "next/link";

import CalendarIcon from "@/components/CalendarIcon";
import PinIcon from "@/components/PinIcon";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Page2() {
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
        <section className="text-center py-16 px-6">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
            Learn About Joining KTP!
          </h1>
          <p className="text-gray-600 text-lg sm:text-xl mb-2">
            Fall 2025 rush is now closed. If you&apos;re interested in joining KTP,
  consider rushing in the Spring 2026 semester!
          </p>
          <p className="text-gray-600 text-lg sm:text-xl mb-8">
            <span className="font-semibold text-black"></span>
          </p>

          {/* Application button */}
          <div
            className="flex justify-center mb-6 transition-all duration-300
                    hover:scale-110 hover: drop-shadow-md"
          >
            <Link
              href="/apply"
              className="px-6 py-3 bg-[#315CA9] text-white rounded-lg font-semibold hover:bg-[#23498F] transition-colors"
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
                    Spring 2025 Rush Google Calendar
                </a>{" "}
                to see the dates, times, and locations of all Rush events.
            </p>


        </section>

        {/* ===== Timeline Section ===== */}
        {/* ===== Timeline Section (no right column) ===== */}
        <section className="max-w-6xl mx-auto mt-9 px-4">
          <div>
            <h2 className="text-3xl font-bold mb-8">Upcoming Rush Events</h2>

            <div className="relative">
              {/* vertical line (left) */}
              <div className="absolute left-3 top-0 bottom-0 w-px bg-gray-200 hidden sm:block" />

              {/* Event 1 */}
              <div className="relative pl-8 pb-10">
                <div className="absolute -left-0.5 top-1 w-3 h-3 rounded-full bg-[#315CA9]"></div>
                <h3 className="text-lg font-semibold mb-1">Info Session</h3>
                <p className="text-sm text-gray-600 flex items-center gap-2 mb-1">
                  <CalendarIcon />
                  <span>Tuesday, January 20, 6:00-7:30 PM</span>
                </p>
                <p className="text-sm text-gray-600 flex items-center gap-2 mb-3">
                  <PinIcon />
                  <span>300 Main St. Room B201</span>
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Want to learn more about what KTP has to offer? Join us for
                  this exciting start to a new experience. Food and refreshments
                  will be provided.
                </p>
              </div>

              {/* Event 2 */}
              <div className="relative pl-8 pb-10">
                <div className="absolute -left-0.5 top-1 w-3 h-3 rounded-full bg-[#315CA9]"></div>
                <h3 className="text-lg font-semibold mb-1">KTP Field Day</h3>
                <p className="text-sm text-gray-600 flex items-center gap-2 mb-1">
                  <CalendarIcon />
                  <span>Wednesday, January 21, 8:00-10:00 PM</span>
                </p>
                <p className="text-sm text-gray-600 flex items-center gap-2 mb-3">
                  <PinIcon />
                  <span>Strom Thurmond Gym</span>
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Join us for this casual social event where you&apos;ll get to
                  enjoy a night full of fun activities and games including
                  volleyball, spikeball, swimming, frisbee, and more.
                </p>
              </div>

              {/* Event 3 */}
              <div className="relative pl-8 pb-10">
                <div className="absolute -left-0.5 top-1 w-3 h-3 rounded-full bg-[#315CA9]"></div>
                <h3 className="text-lg font-semibold mb-1">
                  Technical Workshop
                </h3>
                <p className="text-sm text-gray-600 flex items-center gap-2 mb-1">
                  <CalendarIcon />
                  <span>Thursday, January 22, 7:00-9:00 PM</span>
                </p>
                <p className="text-sm text-gray-600 flex items-center gap-2 mb-3">
                  <PinIcon />
                  <span>Innovation Center Room 2277</span>
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Want to get a glance of what it&apos;s like joining KTP? Join
                  us for this enriching event that will teach you the basics
                  about React applications and how to build your own website!
                </p>
              </div>

              {/* Event 4 */}
              <div className="relative pl-8 pb-10">
                <div className="absolute -left-0.5 top-1 w-3 h-3 rounded-full bg-[#315CA9]"></div>
                <h3 className="text-lg font-semibold mb-1">Pitch Night</h3>
                <p className="text-sm text-gray-600 flex items-center gap-2 mb-1">
                  <CalendarIcon />
                  <span>Friday, January 23, 6:30-8:00 PM</span>
                </p>
                <p className="text-sm text-gray-600 flex items-center gap-2 mb-3">
                  <PinIcon />
                  <span>Darla Moore School of Business Room 140</span>
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  It&apos;s time to showcase your collaboration skills. In this
                  event you&apos;ll work with a team to pitch a solution to a
                  technical challenge. You will need to dress business-casual
                  for this event.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===== FAQ Accordion (added here) ===== */}
        <section className="max-w-4xl mx-auto mt-16 mb-24 px-4">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-center mb-10">
            Frequently Asked Questions
          </h1>

          {/* clean list — no outer box */}
          <Accordion
            type="multiple"
            className="w-full divide-y divide-gray-200"
          >
            <AccordionItem value="q1">
              <AccordionTrigger className="py-6 text-left text-xl sm:text-2xl font-semibold text-black hover:bg-gray-50">
                I&apos;m not majoring in the MCEC, can I still apply?
              </AccordionTrigger>
              <AccordionContent className="pb-6 text-gray-700 text-base leading-relaxed">
                Yes! All majors are welcome, and we encourage applicants from
                different backgrounds to rush, as long as you have an interest
                in the tech industry.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q2">
              <AccordionTrigger className="py-6 text-left text-xl sm:text-2xl font-semibold text-black hover:bg-gray-50">
                I&apos;m not able to attend one of the rush events. How will
                this affect my chances?
              </AccordionTrigger>
              <AccordionContent className="pb-6 text-gray-700 text-base leading-relaxed">
                We understand that various circumstances prevent applicants from
                attending all of our events. Please contact our Executive
                Secretary at least an hour before the event takes place if you
                aren&apos;t able to attend.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q3">
              <AccordionTrigger className="py-6 text-left text-xl sm:text-2xl font-semibold text-black hover:bg-gray-50">
                Can I rush multiple professional fraternities alongside Kappa
                Theta Pi?
              </AccordionTrigger>
              <AccordionContent className="pb-6 text-gray-700 text-base leading-relaxed">
                Yes, but if you receive a bid from us, we ask that you only
                pledge our organization this semester. You&apos;re also able to
                hold membership in any other professional or social
                fraternity/sorority!
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q4">
              <AccordionTrigger className="py-6 text-left text-xl sm:text-2xl font-semibold text-black hover:bg-gray-50">
                How much are dues? Do I have to pay?
              </AccordionTrigger>
              <AccordionContent className="pb-6 text-gray-700 text-base leading-relaxed">
                If you accept a bid from us, you are expected to pay $100 in New
                Member dues this semester. This will cover all expenses related
                to running a professional fraternity, such as professional,
                technical, and social events. If you are unable to pay the dues
                in full, you will have the opportunity to submit a financial
                hardship appeal to our Director of Finance. More information
                will be provided once bids are awarded.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q5">
              <AccordionTrigger className="py-6 text-left text-xl sm:text-2xl font-semibold text-black hover:bg-gray-50">
                If I&apos;m selected for an interview, what commitments should I
                plan for?
              </AccordionTrigger>
              <AccordionContent className="pb-6 text-gray-700 text-base leading-relaxed">
                In the event you advance in our recruitment process, please
                clear your calendar for a 15-20 minute interview slot on TBD as
                well as a finalist dinner on TBD. More details will be provided
                over email via invitation to these events.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
      </div>
    </main>
    </>
  );
}
