// app/page2/page.tsx  (or wherever your Page2 file lives)
import Footer from "../Footer";
import { Header } from "../Header";
import Link from "next/link";
import CalendarIcon from "../../Componenets/CalendarIcon";
import PinIcon from "../../Componenets/PinIcon";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Page2() {
  return (
    <main>
      <Header></Header>
      <section className="text-center py-16 px-6">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
          Learn About Joining KTP!
        </h1>
        <p className="text-gray-600 text-lg sm:text-xl mb-2">
          Welcome to Kappa Theta Pi`&apos;`s Spring 2026 Rush!
        </p>
        <p className="text-gray-600 text-lg sm:text-xl mb-8">
          Here`&apos;`s our rush schedule. Applications are due{" "}
          <span className="font-semibold text-black">February 20, 2025.</span>
        </p>

        {/* Application button */}
        <div className="flex justify-center mb-6">
          <Link
            href="/Application"
            className="px-6 py-3 bg-[#315CA9] text-white rounded-lg font-semibold hover:bg-[#23498F] transition-colors"
          >
            Application Link
          </Link>
        </div>
      </section>

      {/* ===== Timeline Section ===== */}
      {/* ===== Timeline Section (no right column) ===== */}
      <section className="max-w-6xl mx-auto mt-12 px-4">
        <div>
          <h2 className="text-3xl font-bold mb-8">Upcoming Rush Events</h2>

          <div className="relative">
            {/* vertical line (left) */}
            <div className="absolute left-3 top-0 bottom-0 w-px bg-gray-200 hidden sm:block" />

            {/* Event 1 */}
            <div className="relative pl-8 pb-10">
              <div className="absolute -left-0.5 top-1 w-3 h-3 rounded-full bg-[#315CA9]"></div>
              <h3 className="text-lg font-semibold mb-1">TBD</h3>
              <p className="text-sm text-gray-600 flex items-center gap-2 mb-1">
                <CalendarIcon />
                <span>Wednesday, August 27, 4:30-6:00 PM</span>
              </p>
              <p className="text-sm text-gray-600 flex items-center gap-2 mb-3">
                <PinIcon />
                <span>300 Main St.</span>
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">TBD</p>
            </div>

            {/* Event 2 */}
            <div className="relative pl-8 pb-10">
              <div className="absolute -left-0.5 top-1 w-3 h-3 rounded-full bg-[#315CA9]"></div>
              <h3 className="text-lg font-semibold mb-1">TBD</h3>
              <p className="text-sm text-gray-600 flex items-center gap-2 mb-1">
                <CalendarIcon />
                <span>Tuesday, September 2, 8:00-10:00 PM</span>
              </p>
              <p className="text-sm text-gray-600 flex items-center gap-2 mb-3">
                <PinIcon />
                <span>300 Main St.</span>
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">TBD</p>
            </div>

            {/* Event 3 */}
            <div className="relative pl-8 pb-10">
              <div className="absolute -left-0.5 top-1 w-3 h-3 rounded-full bg-[#315CA9]"></div>
              <h3 className="text-lg font-semibold mb-1">TBD</h3>
              <p className="text-sm text-gray-600 flex items-center gap-2 mb-1">
                <CalendarIcon />
                <span>Wednesday, September 3, 7:00-9:00 PM</span>
              </p>
              <p className="text-sm text-gray-600 flex items-center gap-2 mb-3">
                <PinIcon />
                <span>Sai`&apos;`s House on 67 Avenue</span>
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">
                TBD BY THE FUTURE EXECS
              </p>
            </div>

            {/* Event 4 */}
            <div className="relative pl-8 pb-10">
              <div className="absolute -left-0.5 top-1 w-3 h-3 rounded-full bg-[#315CA9]"></div>
              <h3 className="text-lg font-semibold mb-1">TBD</h3>
              <p className="text-sm text-gray-600 flex items-center gap-2 mb-1">
                <CalendarIcon />
                <span>Thursday, September 4, 6:30-8:00 PM</span>
              </p>
              <p className="text-sm text-gray-600 flex items-center gap-2 mb-3">
                <PinIcon />
                <span>Boyd Innovation Center</span>
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">
                Start-Ups!
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
        <Accordion type="multiple" className="w-full divide-y divide-gray-200">
          <AccordionItem value="q1">
            <AccordionTrigger className="py-6 text-left text-xl sm:text-2xl font-semibold text-black hover:bg-gray-50">
              I`&apos;`m not majoring in the MCEC, can I still apply?
            </AccordionTrigger>
            <AccordionContent className="pb-6 text-gray-700 text-base leading-relaxed">
              Yes! All majors are welcome, and we encourage applicants from
              different backgrounds to rush, as long as you have an interest in
              the tech industry.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="q2">
            <AccordionTrigger className="py-6 text-left text-xl sm:text-2xl font-semibold text-black hover:bg-gray-50">
              I`&apos;`m not able to attend one of the rush events. How will this
              affect my chances?
            </AccordionTrigger>
            <AccordionContent className="pb-6 text-gray-700 text-base leading-relaxed">
              We understand that various circumstances prevent applicants from
              attending all of our events. Please contact our Executive
              Secretary at least an hour before the event takes place if you
              aren`&apos;`t able to attend.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="q3">
            <AccordionTrigger className="py-6 text-left text-xl sm:text-2xl font-semibold text-black hover:bg-gray-50">
              Can I rush multiple professional fraternities alongside Kappa
              Theta Pi?
            </AccordionTrigger>
            <AccordionContent className="pb-6 text-gray-700 text-base leading-relaxed">
              Yes, but if you receive a bid from us, we ask that you only pledge
              our organization this semester. You`&apos;`re also able to hold
              membership in any other professional or social
              fraternity/sorority!
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="q4">
            <AccordionTrigger className="py-6 text-left text-xl sm:text-2xl font-semibold text-black hover:bg-gray-50">
              How much are dues? Do I have to pay?
            </AccordionTrigger>
            <AccordionContent className="pb-6 text-gray-700 text-base leading-relaxed">
              If you accept a bid from us, you are expected to pay $100 in New
              Member dues this semester. This will cover all expenses related to
              running a professional fraternity, such as professional,
              technical, and social events. If you are unable to pay the dues in
              full, you will have the opportunity to submit a financial hardship
              appeal to our Director of Finance. More information will be
              provided once bids are awarded.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="q5">
            <AccordionTrigger className="py-6 text-left text-xl sm:text-2xl font-semibold text-black hover:bg-gray-50">
              If I`&apos;`m selected for an interbiew, what commitments should I plan
              for?
            </AccordionTrigger>
            <AccordionContent className="pb-6 text-gray-700 text-base leading-relaxed">
              In the event you advance in our recruitment process, please clear
              your calendar for a 15-20 minute interview slot on TBD as well as
              a finalist dinner on TBD. More details will be provided over email
              via invitation to these events.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      <Footer />
    </main>
  );
}
