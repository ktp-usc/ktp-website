"use client";

import { useState } from "react";
import { ChevronDown, ExternalLink } from "lucide-react";
import nonprofits from "./nonprofits.json";

type Nonprofit = {
  name: string;
  image: string;
  description: string;
  website: string;
};

interface NonprofitAccordionProps {
  nonprofit: Nonprofit;
  align: "left" | "right";
  expanded: boolean;
  onClick: () => void;
}

function NonprofitAccordion({
  nonprofit,
  align,
  expanded,
  onClick,
}: NonprofitAccordionProps) {
  return (
    <div
      className={`w-full my-8 flex ${
        align === "left" ? "justify-start" : "justify-end"
      }`}
    >
      <div
        className={`relative transition-all duration-500 bg-white rounded-2xl
        shadow-[0_8px_40px_rgba(49,92,169,0.08)]
        hover:shadow-[0_12px_56px_rgba(49,92,169,0.15)]
        border border-gray-100/50 cursor-pointer overflow-hidden
        w-full sm:w-[95%] md:w-[90%] lg:w-[85%] xl:w-[75%]
        transform hover:scale-[1.01] hover:-translate-y-1
        ${align === "left" ? "ml-0 mr-auto" : "mr-0 ml-auto"}`}
        onClick={onClick}
      >
        <div className="relative z-10 p-5 md:p-8">
          <div
            className={`flex w-full flex-col ${
              align === "left" ? "md:flex-row" : "md:flex-row-reverse"
            } items-center gap-8 md:gap-12`}
          >
            {/* Mockup Image (larger, transparent background) */}
            <div className="relative w-full md:w-3/5 bg-transparent">
              <img
                src={nonprofit.image}
                alt={`${nonprofit.name} website mockup`}
                className="
                  w-full
                  bg-transparent
                  shadow-none
                  rounded-none
                  object-contain
                  scale-105
                  transition-transform
                  duration-500
                  hover:scale-[1.08]
                "
              />
            </div>

            {/* Text Section (aligned per side) */}
            <div
              className={`flex-1 w-full flex flex-col ${
                align === "left" ? "items-start text-left" : "items-end text-right"
              }`}
            >
              {/* Smaller title */}
              <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900 mb-2 leading-snug">
                {nonprofit.name}
              </h2>

              {/* Helper text row */}
              <div className="flex items-center gap-2 mt-3">
                <span className="text-[#315CA9] text-xs sm:text-sm font-medium">
                  {expanded ? "Click to collapse" : "Click to learn more"}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-[#315CA9] transition-transform duration-500 ${
                    expanded ? "rotate-180" : "rotate-0"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Expanded Content */}
          <div
            className={`transition-all duration-500 ease-in-out overflow-hidden ${
              expanded
                ? "max-h-96 mt-6 opacity-100"
                : "max-h-0 mt-0 opacity-0"
            }`}
          >
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50/30 px-5 md:px-7 py-5 rounded-xl border border-blue-100/50">
              {/* Smaller body text */}
              <p className="text-sm md:text-base leading-relaxed text-gray-700 mb-5">
                {nonprofit.description}
              </p>

              {/* Smaller button */}
              <a
                href={nonprofit.website}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-2 px-4 py-2
                bg-[#315CA9] text-white rounded-md text-sm font-medium
                hover:bg-[#1e3a8a] hover:shadow-md hover:-translate-y-0.5
                transition-all duration-200"
              >
                Visit Website
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Clients() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
        <h1
        className="text-3xl sm:text-4xl md:text-5xl font-black mb-0 text-black"
         style={{ fontFamily: "Inter, sans-serif", letterSpacing: "-0.02em", }}
>        Our Work
        </h1>


          <p className="text-base sm:text-lg mt-6 mb-8 font-medium text-gray-600 max-w-2xl mx-auto">
            We partner with nonprofits to build elevated websites that
            amplify their mission. Take a look at our past projects. 
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {nonprofits.map((n, i) => (
            <NonprofitAccordion
              key={n.name}
              nonprofit={n}
              align={i % 2 === 0 ? "left" : "right"}
              expanded={openIdx === i}
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
