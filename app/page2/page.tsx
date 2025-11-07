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
      <Header />
      <div className="border-2 border-gray-400 rounded-xl p-6 text-center shadow-md mt-10 max-w-3xl mx-auto bg-white/5 backdrop-blur-sm">
        <h1 className="text-2xl p-4 pb-5">Why rush</h1>
        <div>
          <form>{/* Form fields for page 2 go here */}</form>
        </div>
      </div>

      <div className="flex justify-center mt-6 mb-10">
        <Link
          href="/Application"
          className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400 inline-block"
        >
          Rush application
        </Link>
      </div>

      <div className="mb-10 flex items-center relative">
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 -translate-x-1/2">
          <div className="w-4 h-4 rounded-full bg-[#315CA9] z-10"></div>
        </div>
      </div>

      <div className="ml-8 pl-4">
        <h2 className="text-lg sm:text-xl font-bold mb-3">
          Application Office Hours
        </h2>
      </div>

      <div className="mb-4">
        <div className="flex items-center mb-2">
          <CalendarIcon />
          <span className="ml-1 font-semibold text-black text-[13px] sm:text-base">
            Thursday, September 4, 8:00-9:00 PM
          </span>
        </div>
      </div>

      <div className="flex items-center">
        <PinIcon />
        <span className="ml-1 font-semibold text-black text-[13px] sm:text-base">
          Virtual (Zoom)
        </span>
      </div>

      <br />

      <div className="mb-10 flex items-center relative">
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 -translate-x-1/2">
          <div className="w-4 h-4 rounded-full bg-[#315CA9] z-10"></div>
        </div>
      </div>

      <div className="ml-8 pl-4">
        <h2 className="text-lg sm:text-xl font-bold mb-3">
          Application Office Hours
        </h2>
      </div>

      <div className="mb-4">
        <div className="flex items-center mb-2">
          <CalendarIcon />
          <span className="ml-1 font-semibold text-black text-[13px] sm:text-base">
            Thursday, September 4, 8:00-9:00 PM
          </span>
        </div>
      </div>

      <div className="flex items-center">
        <PinIcon />
        <span className="ml-1 font-semibold text-black text-[13px] sm:text-base">
          Virtual (Zoom)
        </span>
      </div>

      {/* ===== FAQ Accordion (added here) ===== */}
      <section className="max-w-4xl mx-auto mt-16 mb-24 px-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-center mb-10">
          Frequently Asked Questions
        </h1>

        {/* clean list — no outer box */}
        <Accordion type="multiple" className="w-full divide-y divide-gray-200">
          <AccordionItem value="q1">
            <AccordionTrigger className="py-6 text-left text-xl sm:text-2xl font-semibold text-black hover:bg-gray-50">
              I'm not majoring in the MCEC, can I still apply?
            </AccordionTrigger>
            <AccordionContent className="pb-6 text-gray-700 text-base leading-relaxed">
              Yes! All majors are welcome, and we encourage applicants from
              different backgrounds to rush, as long as you have an interest in
              the tech industry.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="q2">
            <AccordionTrigger className="py-6 text-left text-xl sm:text-2xl font-semibold text-black hover:bg-gray-50">
              I'm not able to attend one of the rush events. How will this
              affect my chances?
            </AccordionTrigger>
            <AccordionContent className="pb-6 text-gray-700 text-base leading-relaxed">
              We understand that various circumstances prevent applicants from
              attending all of our events. Please contact our Executive
              Secretary at least an hour before the event takes place if you
              aren't able to attend.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="q3">
            <AccordionTrigger className="py-6 text-left text-xl sm:text-2xl font-semibold text-black hover:bg-gray-50">
              Can I rush multiple professional fraternities alongside Kappa
              Theta Pi?
            </AccordionTrigger>
            <AccordionContent className="pb-6 text-gray-700 text-base leading-relaxed">
              Yes, but if you receive a bid from us, we ask that you only pledge
              our organization this semester. You're also able to hold
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
              If I'm selected for an interbiew, what commitments should I plan
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
