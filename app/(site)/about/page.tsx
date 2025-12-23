"use client";

import React, {useState} from 'react';
import {Link as ScrollLink, Element} from 'react-scroll';

const categories = ["President's Welcome", "History"];

function makeId(text: string) {
    return (
        text
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "") + "-section"
    );
}

export default function About(): React.JSX.Element {
    const [selectedCategory, setSelectedCategory] = useState<string>(
        categories[0]
    );

    return (
        <div className="min-h-screen">
            <main className="flex flex-col items-center flex-grow p-8 pb-0">
                {/* Top blobs/background */}
                <div className="relative bg-white w-full">
                    <div className="absolute inset-0 blob-c z-0">
                        <div className="shape-blob eight"/>
                        <div className="shape-blob nine"/>
                    </div>

                    {/* Page header */}
                    <div className="relative w-full">
                        <div className="relative pt-12 sm:pt-16 z-10 px-6 sm:px-8 md:px-16 lg:px-20 text-center">
                            <h1
                                className="text-3xl sm:text-4xl md:text-5xl font-black mb-0"
                                style={{
                                    fontFamily: "Inter, sans-serif",
                                    letterSpacing: "-0.02em",
                                }}
                            >
                                About Us
                            </h1>
                            <p className="text-base sm:text-xl mt-8 mb-8 font-medium text-gray-600 max-w-2xl mx-auto">
                                Learn more about who we are at Kappa Theta Pi!
                            </p>
                        </div>
                    </div>

                    {/* Category buttons */}
                    <div className="relative sm:mt-0 mb-8 sm:mb-12 lg:mb-16 px-6 sm:px-8 md:px-16 lg:px-24 xl:px-32">
                        <div
                            className="grid grid-cols-2 sm:flex sm:flex-wrap sm:justify-center gap-2 sm:gap-4 md:gap-6 lg:gap-8">
                            {categories.map((category) => {
                                const id = makeId(category);
                                return (
                                    <ScrollLink
                                        key={category}
                                        to={id}
                                        smooth={true}
                                        duration={400}
                                        spy={true}
                                        offset={-80}
                                        activeClass="ktp-active-category"
                                        className={`px-3 sm:px-4 py-2 rounded-[40px] text-xs sm:text-sm md:text-base font-semibold transition-all duration-300 hover:scale-105 hover:shadow-md cursor-pointer whitespace-nowrap text-center ${
                                            selectedCategory === category
                                                ? "bg-[#315CA9] text-white"
                                                : "bg-gray-200/60 text-gray-700 hover:bg-gray-300/80"
                                        }`}
                                        onClick={() => setSelectedCategory(category)}
                                    >
                                        {category}
                                    </ScrollLink>
                                );
                            })}
                        </div>
                    </div>

                    {/* Sections */}
                    <div className="flex flex-col space-y-12">
                        <Element
                            name={makeId("President's Welcome")}
                            id={makeId("President's Welcome")}
                        >
                            <section className="px-6 sm:px-8 md:px-16 lg:px-24 xl:px-32 py-8 sm:py-12 md:py-16">
                                <div
                                    className="relative flex flex-col items-center lg:flex-row lg:items-start space-y-12 lg:space-y-0 lg:space-x-12 pb-10">
                                    <div className="relative w-full lg:w-2/5 flex justify-center">
                                        <div className="absolute blob-c z-0 flex justify-center items-center">
                                            <div className="shape-blob eight absolute"/>
                                            <div className="shape-blob nine absolute"/>
                                        </div>
                                        <img
                                            src="/Images/Screenshot Owen.png"
                                            alt="President's Headshot"
                                            className="relative z-10 w-3/4 h-auto rounded-full border-8 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg"
                                            style={{
                                                borderLeftColor: "#d1fae5",
                                                borderRightColor: "#d1fae5",
                                                borderTopColor: "#e5e7eb",
                                                borderBottomColor: "#e5e7eb",
                                            }}
                                        />
                                    </div>

                                    <div className="w-full lg:w-3/5 text-left relative z-10">
                                        <h2 className="text-center text-2xl sm:text-4xl font-black mb-10">
                                            President&apos;s Welcome
                                        </h2>
                                        <div className="text-base sm:text-lg leading-relaxed space-y-4">
                                            <p>Welcome to Kappa Theta Pi, USC&apos;s premier professional technology fraternity. On behalf of our chapter, I’m excited to welcome you to our fraternity&apos;s new website, where you can catch a glimpse of the passion and excellence that our chapter celebrates.</p>
                                            <p>Kappa Theta Pi offers brothers the support to be extraordinary during their time at South Carolina with resources centered around professional development, alumni connections, social growth, technological advancement, and academic support. From nonprofit project teams and study groups to professional development workshops and hackathons, we foster a culture of growth encouraging members to pursue their tech passions. Our chapter values diversity, with brothers contributing unique experiences and excelling as student leaders. We celebrate our diverse brotherhood, welcoming all united by a passion for technology.</p>
                                            <p>Founding the South Carolina chapter of KTP has been the most impactful part of my college experience. I’ve had the immense privilege of building this community and watching it grow into a home for USC&apos;s most exceptional and ambitious professionals, seeing first-hand the incredible things they do. Our nonprofit consulting initiative, undertaken by no other KTP chapter nationally, has seen immense success with 5 clients in the span of a single semester. Most importantly, this chapter is built upon the promise of not only professional excellence, but also creating lifelong bonds that will serve as a constant source of inspiration and support for every member to be their full and best self.</p>
                                            <p>
                                                Sincerely,
                                                <br/>
                                                Owen Coulam
                                                <br/>
                                                President, 2025
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </Element>

                        <Element name={makeId("History")} id={makeId("History")}>
                            <section className="px-6 sm:px-8 md:px-16 lg:px-24 xl:px-32 py-8 sm:py-12 md:py-16">
                                <div
                                    className="relative flex flex-col items-center lg:flex-row lg:items-start space-y-12 lg:space-y-0 lg:space-x-12 pb-10">
                                    <div className="relative w-full lg:w-2/5 flex justify-center">
                                        <div className="absolute blob-c z-0 flex justify-center items-center">
                                            <div className="shape-blob eight absolute"/>
                                            <div className="shape-blob nine absolute"/>
                                        </div>
                                        <img
                                            src="/Images/group-photo.png"
                                            alt="History image"
                                            className="relative z-10 w-3/4 h-auto rounded-full border-8 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg"
                                            style={{
                                                borderLeftColor: "#d1fae5",
                                                borderRightColor: "#d1fae5",
                                                borderTopColor: "#e5e7eb",
                                                borderBottomColor: "#e5e7eb",
                                            }}
                                        />
                                    </div>

                                    <div className="w-full lg:w-3/5 text-left relative z-10">
                                        <h2 className="text-center text-2xl sm:text-4xl font-black mb-10">
                                            History
                                        </h2>
                                        <div className="text-base sm:text-lg leading-relaxed space-y-4 text-center">
                                            <p>
                                                Regarded as one of the first professional technology
                                                fraternities, Kappa Theta Pi is a technical and
                                                professional incubation hub that produces first class
                                                brothers nationwide. We were ignited in 2012 at University
                                                of Michigan by a group of 7 aspiring students looking to
                                                create a diverse community for tech interested
                                                individuals. Today our national organization holds
                                                steadfast to our motto, “For the Love of Technology”,
                                                while concurrently enriching new generations of students.
                                                This year we are happy to announce our Alpha Class! The
                                                2025 Alpha Class of the Kappa Theta Pi UofSC have
                                                showcased their skills gained through the rush process by
                                                contributing to three non-profits and creating a
                                                betterment in the social and economic landscape of our
                                                local community.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                            </section>

                        </Element>

                    </div>
                </div>
            </main>
        </div>
    );
}
