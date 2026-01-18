"use client";

import { useState } from "react";
import { ExternalLink, ChevronDown } from "lucide-react";
import nonprofits from "./nonprofits.json";

type Nonprofit = {
    name: string;
    image: string;
    description: string;
    website: string;
    logo?: string;
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
                                onClick
                            }: NonprofitAccordionProps) {
    return (
        <div
            className={ `w-full my-8 flex ${
                align === "left" ? "justify-start" : "justify-end"
            }` }
        >
            <div
                className={ `relative transition-all duration-500 bg-white rounded-2xl
        shadow-[0_8px_40px_rgba(49,92,169,0.08)]
        hover:shadow-[0_12px_56px_rgba(49,92,169,0.15)]
        border border-gray-100/50 cursor-pointer overflow-hidden
        w-full sm:w-[95%] md:w-[90%] lg:w-[85%] xl:w-[75%]
        transform hover:scale-[1.01] hover:-translate-y-1
        ${ align === "left" ? "ml-0 mr-auto" : "mr-0 ml-auto" }` }
                onClick={ onClick }
            >
                {/* Logo Badge - positioned in top corner */ }
                <div className={ `absolute top-6 ${ nonprofit.name === "SC Economics" ? "left-6" : "right-6" } z-20` }>
                    { nonprofit.logo ? (
                        <img
                            src={ nonprofit.logo }
                            alt={ `${ nonprofit.name } logo` }
                            className={ `w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl object-contain shadow-lg border-2 border-gray-200 bg-white ${
                                nonprofit.name === "SC Economics" ? "p--2" : "p-0.5"
                            }` }
                        />
                    ) : (
                        <div
                            className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl bg-white flex items-center justify-center shadow-lg border-2 border-gray-200">
                            <span className="text-gray-400 text-xs">Logo</span>
                        </div>
                    ) }
                </div>

                <div className="relative z-10 p-5 md:p-8">
                    <div
                        className={ `flex w-full flex-col ${
                            align === "left" ? "md:flex-row" : "md:flex-row-reverse"
                        } items-center gap-8 md:gap-12` }
                    >
                        {/* Mockup Image (larger, transparent background) */ }
                        <div className="relative w-full md:w-3/5 bg-transparent">
                            <img
                                src={ nonprofit.image }
                                alt={ `${ nonprofit.name } website mockup` }
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
                                onError={ (e) => {
                                    const img = e.currentTarget as HTMLImageElement;
                                    img.style.objectFit = "contain";
                                } }
                            />
                        </div>

                        {/* Text Section (aligned per side) */ }
                        <div
                            className={ `flex-1 w-full flex flex-col ${
                                align === "left" ? "items-start text-left" : "items-end text-right"
                            }` }
                        >
                            {/* Title */ }
                            <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900 mb-2 leading-snug">
                                { nonprofit.name }
                            </h2>

                            {/* Helper text row */ }
                            <div className="flex items-center gap-2 mt-3">
                <span className="text-[#315CA9] text-xs sm:text-sm font-medium">
                  { expanded ? "Click to collapse" : "Click to learn more" }
                </span>
                                <ChevronDown
                                    className={ `w-4 h-4 text-[#315CA9] transition-transform duration-300 ${
                                        expanded ? "rotate-180" : ""
                                    }` }
                                />
                            </div>
                        </div>
                    </div>

                    {/* Expanded Content (kept for nonprofit accordions) */ }
                    <div
                        className={ `transition-all duration-500 ease-in-out overflow-hidden ${
                            expanded ? "max-h-96 mt-6 opacity-100" : "max-h-0 mt-0 opacity-0"
                        }` }
                    >
                        <div className="bg-linear-to-br from-blue-50 to-indigo-50/30 px-5 md:px-7 py-5 rounded-xl border border-blue-100/50">
                            {/* Smaller body text */ }
                            <p className="text-sm md:text-base leading-relaxed text-gray-700 mb-5">
                                { nonprofit.description }
                            </p>

                            {/* Smaller button */ }
                            <a
                                href={ nonprofit.website }
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={ (e) => e.stopPropagation() }
                                className="inline-flex items-center gap-2 px-4 py-2
                bg-[#315CA9] text-white rounded-md text-sm font-medium
                hover:bg-[#1e3a8a] hover:shadow-md hover:-translate-y-0.5
                transition-all duration-200"
                            >
                                Visit Website
                                <ExternalLink className="w-4 h-4"/>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/** inline SVG placeholder for missing images */
const SVG_PLACEHOLDER_DATA_URI =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'>
      <rect width='100%' height='100%' fill='#F3F4F6' />
      <g fill='#9CA3AF' font-family='Inter, Arial, sans-serif' font-weight='600'>
        <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='18'>Image unavailable</text>
      </g>
    </svg>`
    );

export default function OurWork() {
    const [openIdx, setOpenIdx] = useState<number | null>(null);

    // Use the nonprofits array directly
    const ordered = nonprofits;

    // image paths (assuming public/Images/*.jpeg)
    const topRow = [
        "/Images/collagephoto1.JPG",
        "/Images/collagephoto4.JPG",
        "/Images/collagephoto3.JPG",
        "/Images/symposium8.jpeg"
    ];
    const middleLeft = "/Images/symposium6.jpeg";
    const middleRight = "/Images/symposium5.jpeg";
    const bottomRow = [
        "/Images/symposium4.jpeg",
        "/Images/symposium1.jpeg",
        "/Images/symposium2.jpeg",
        "/Images/symposium3.jpeg"
    ];

    const photoHoverClasses =
        "transform transition-all duration-300 hover:-translate-y-2 hover:scale-[1.03] hover:shadow-xl";

    return (
        <div className="min-h-screen bg-linear-to-br from-blue-50 to-white">
            <div className="max-w-7xl mx-auto px-6 py-12">
                {/* Header */ }
                <div className="text-center mb-12">
                    <h1
                        className="text-3xl sm:text-4xl md:text-5xl font-black mb-0 text-black"
                        style={ { fontFamily: "Inter, sans-serif", letterSpacing: "-0.02em" } }
                    >
                        Our Work
                    </h1>

                    <p className="text-base sm:text-lg mt-6 mb-8 font-medium text-gray-600 max-w-2xl mx-auto">
                        We partner with nonprofits to build elevated websites that
                        amplify their mission. Take a look at our past projects.
                    </p>
                </div>

                <div className="mt-8 space-y-6">
                    { ordered.map((n, i) => (
                        <NonprofitAccordion
                            key={ n.name }
                            nonprofit={ n }
                            align={ i % 2 === 0 ? "left" : "right" }
                            expanded={ openIdx === i }
                            onClick={ () => setOpenIdx(openIdx === i ? null : i) }
                        />
                    )) }
                </div>

                {/* Symposium section (center shows title only; no expand/collapse) */ }
                <section className="mt-24 mb-12">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid grid-cols-4 gap-4 items-stretch">
                            {/* Row 1 */ }
                            { topRow.map((src, i) => (
                                <div
                                    key={ `top-${ i }` }
                                    className={ `relative aspect-4/3 rounded-xl overflow-hidden bg-gray-100 ${ photoHoverClasses }` }
                                >
                                    <img
                                        src={ src }
                                        alt={ `Symposium ${ i + 1 }` }
                                        className="w-full h-full object-cover object-center"
                                        onError={ (e) => {
                                            const img = e.currentTarget;
                                            if (img.dataset.fallbackApplied === "true") return;
                                            img.dataset.fallbackApplied = "true";
                                            img.src = SVG_PLACEHOLDER_DATA_URI;
                                            img.alt = "Image unavailable";
                                        } }
                                    />
                                </div>
                            )) }

                            {/* Row 2 - left image */ }
                            <div
                                className={ `relative aspect-4/3 rounded-xl overflow-hidden bg-gray-100 ${ photoHoverClasses }` }
                            >
                                <img
                                    src={ middleLeft }
                                    alt="Symposium 5"
                                    className="w-full h-full object-cover object-center"
                                    onError={ (e) => {
                                        const img = e.currentTarget;
                                        if (img.dataset.fallbackApplied === "true") return;
                                        img.dataset.fallbackApplied = "true";
                                        img.src = SVG_PLACEHOLDER_DATA_URI;
                                        img.alt = "Image unavailable";
                                    } }
                                />
                            </div>

                            {/* CENTER TEXT CARD (col-span-2) - title only — fills the grid cell */ }
                            <div className="col-span-2 flex items-stretch">
                                <div className="w-full flex-1 flex items-center justify-center px-2">
                                    {/* Desktop horizontal card (fills height) */ }
                                    <div className="hidden md:flex items-center justify-center bg-white rounded-xl
                              shadow-md border border-gray-200/60 p-6 md:p-8 lg:p-10 w-full h-full">
                                        <h2
                                            className="text-4xl md:text-5xl lg:text-6xl font-black text-black text-center"
                                            style={ { fontFamily: "Inter, sans-serif", letterSpacing: "-0.02em" } }
                                        >
                                            Symposium Night
                                        </h2>
                                    </div>

                                    {/* Mobile band */ }
                                    <div
                                        className="md:hidden bg-white rounded-xl shadow-sm border border-gray-200/60 p-4 w-full text-center">
                                        <h3
                                            className="text-2xl font-black"
                                            style={ { fontFamily: "Inter, sans-serif", letterSpacing: "-0.02em" } }
                                        >
                                            Symposium Night
                                        </h3>
                                    </div>
                                </div>
                            </div>

                            {/* Row 2 - right image */ }
                            <div
                                className={ `relative aspect-4/3 rounded-xl overflow-hidden bg-gray-100 ${ photoHoverClasses }` }
                            >
                                <img
                                    src={ middleRight }
                                    alt="Symposium 6"
                                    className="w-full h-full object-cover object-center"
                                    onError={ (e) => {
                                        const img = e.currentTarget;
                                        if (img.dataset.fallbackApplied === "true") return;
                                        img.dataset.fallbackApplied = "true";
                                        img.src = SVG_PLACEHOLDER_DATA_URI;
                                        img.alt = "Image unavailable";
                                    } }
                                />
                            </div>

                            {/* Row 3 - bottom-left image */ }
                            <div
                                className={ `relative aspect-4/3 rounded-xl overflow-hidden bg-gray-100 ${ photoHoverClasses }` }
                            >
                                <img
                                    src={ bottomRow[0] }
                                    alt="Symposium bottom left"
                                    className="w-full h-full object-cover object-center"
                                    onError={ (e) => {
                                        const img = e.currentTarget;
                                        if (img.dataset.fallbackApplied === "true") return;
                                        img.dataset.fallbackApplied = "true";
                                        img.src = SVG_PLACEHOLDER_DATA_URI;
                                        img.alt = "Image unavailable";
                                    } }
                                />
                            </div>

                            {/* Row 3 - remaining images */ }
                            { bottomRow.slice(1).map((src, i) => (
                                <div
                                    key={ `bottom-${ i }` }
                                    className={ `relative aspect-4/3 rounded-xl overflow-hidden bg-gray-100 ${ photoHoverClasses }` }
                                >
                                    <img
                                        src={ src }
                                        alt={ `Symposium bottom ${ i + 2 }` }
                                        className="w-full h-full object-cover object-center"
                                        onError={ (e) => {
                                            const img = e.currentTarget;
                                            if (img.dataset.fallbackApplied === "true") return;
                                            img.dataset.fallbackApplied = "true";
                                            img.src = SVG_PLACEHOLDER_DATA_URI;
                                            img.alt = "Image unavailable";
                                        } }
                                    />
                                </div>
                            )) }
                        </div>

                        {/* Symposium Description Card - below the grid */ }
                        <div className="mt-8">
                            <div
                                className="bg-white rounded-xl shadow-md border border-gray-200/60 p-6 md:p-8 max-w-4xl mx-auto">
                                <h3 className="text-2xl md:text-3xl font-black text-black mb-4 text-center"
                                    style={ { fontFamily: "Inter, sans-serif", letterSpacing: "-0.02em" } }>
                                    About Symposium Night
                                </h3>
                                <p className="text-sm md:text-base text-gray-600 text-center leading-relaxed font-medium">
                                    Symposium night is an event where each team showcases the culmination of their work
                                    with the nonprofits they have partnered with
                                    throughout the semester. It is an opportunity for teams to present their projects to
                                    clients, faculty advisors, and peers, highlighting
                                    the impact of their contributions and celebrating the collaborative efforts that
                                    have driven positive change.

                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}