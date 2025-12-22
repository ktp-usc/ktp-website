"use client";

import Image from "next/image";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import {Element} from "react-scroll";
import React from "react";

// Project data
const data = [
    {
        id: 1,
        title: "SC Economics",
        text: "The South Carolina Council on Economic Education promotes financial and economic literacy for students and teachers across the state. Our members are collaborating directly with the organization’s executive leadership to design and implement a digital solution that streamlines operations and strengthens the impact of economic education throughout South Carolina.",
        image: "/partners/scecon.png",
    },
    {
        id: 2,
        title: "Ella's Stuff A Stocking",
        text: "Ella’s Stuff a Stocking is a holiday donation drive established in memory of Gabriella Shumate, dedicated to spreading joy by providing gifts and essentials to those in need during the holiday season. Our team is rebuilding their site from the ground up, creating a reliable, user-friendly platform that enhances community engagement and ensures the continued success of their annual giving campaign.",
        image: "/partners/ellas.png",
    },
    {
        id: 3,
        title: "Wheels Harbison Area Transit",
        text: "Wheels Harbison Area Transit is a local nonprofit that provides essential mobility services to low-income seniors and disabled residents in the Harbison area. Our team is developing a professional website and digital presence for Wheels Harbison, enabling them to share their mission, accept online donations, and attract corporate sponsorships to sustain their operations.",
        image: "/partners/wheels.png",
    },
];

// Network company data
const networkCompanies = [
    { src: "/network/google.png", alt: "Google" },
    { src: "/network/microsoft.png", alt: "Microsoft" },
    { src: "/network/deloitte.png", alt: "Deloitte" },
    { src: "/network/jpmorgan.png", alt: "JP Morgan" },
    { src: "/network/meta.png", alt: "Meta" },
    { src: "/network/citadel.png", alt: "Citadel" },
    { src: "/network/capital_one.png", alt: "Capital One" },
    { src: "/network/spotify.png", alt: "Spotify" },
    { src: "/network/bloomberg.png", alt: "Bloomberg" },
    { src: "/network/doordash.png", alt: "Doordash" },
    { src: "/network/hudson_river_trading.png", alt: "Hudson River Trading" },
    { src: "/network/amazon.png", alt: "Amazon" },
    { src: "/network/apple.png", alt: "Apple" },
    { src: "/network/tiktok.png", alt: "Tiktok" },
    { src: "/network/nvidia.png", alt: "Nvidia" },
    { src: "/network/duolingo.png", alt: "Duolingo" },
    { src: "/network/jane_street.png", alt: "Jane Street" },
    { src: "/network/pwc.png", alt: "PWC" },
    { src: "/network/ey.png", alt: "EY" },
    { src: "/network/accenture.png", alt: "Accenture" },
    { src: "/network/linkedin.png", alt: "LinkedIn" },
    { src: "/network/tesla.png", alt: "Tesla" },
    { src: "/network/ibm.png", alt: "IBM" },
    { src: "/network/cisco.png", alt: "Cisco" },
    { src: "/network/asana.png", alt: "Asana" },
    { src: "/network/slack.png", alt: "Slack" },
    { src: "/network/figma.png", alt: "Figma" },
    { src: "/network/bleacher_report.png", alt: "Bleacher Report" },
    { src: "/network/stripe.png", alt: "Stripe" },
    { src: "/network/pnc.png", alt: "PNC" },
    { src: "/network/boeing.png", alt: "Boeing" },
    { src: "/network/salesforce.png", alt: "Salesforce" },
    { src: "/network/mongo_db.png", alt: "MongoDB" },
    { src: "/network/vmware.png", alt: "VMware" },
    { src: "/network/nike.png", alt: "Nike" },
    { src: "/network/uber.png", alt: "Uber" },
    { src: "/network/netskope.png", alt: "Netskope" },
    { src: "/network/att.png", alt: "AT&T" },
    { src: "/network/ford.png", alt: "Ford" },
    { src: "/network/modern_treasury.png", alt: "Modern Treasury" },
    { src: "/network/indeed.png", alt: "Indeed" },
    { src: "/network/bank_of_america.png", alt: "Bank of America" },
    { src: "/network/workday.png", alt: "Workday" },
    { src: "/network/caterpillar.png", alt: "Caterpillar" },
    { src: "/network/p&g.png", alt: "P&G" },
    { src: "/network/viget.png", alt: "Viget" },
    { src: "/network/united.png", alt: "United" },
];

export default function Home() {
    return (
        <div className="font-sans min-h-screen flex flex-col overflow-x-clip">
            <main className="flex flex-col items-center flex-grow p-8 pb-0">

                {/* Background blobs top */}
                <div className="flex flex-row justify-center xl:justify-between mb-12 md:mb-20 lg:mb-32 px-6 sm:px-8 md:px-12 lg:px-20">
                    <div className="absolute inset-0 blob-c z-0 hidden md:block">
                        <div className="shape-blob ten" />
                        <div className="shape-blob eleven" />
                    </div>
                </div>

                <div className="flex flex-col items-center w-full">
                    <section className="px-6 sm:px-8 md:px-16 lg:px-24 xl:px-32 py-8 sm:py-12 md:py-16 w-full">
                        {/* Top section: logo + headshot + passion */}
                        <div className="relative flex flex-col items-center pb-10">
                            {/* Mobile blobs */}
                            <div className="absolute inset-0 blob-c z-0 block md:hidden overflow-hidden">
                                <div className="shape-blob twelve" />
                                <div className="shape-blob thirteen" />
                            </div>

                            <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 lg:gap-20 mb-20">

                                {/* Left Image */}
                                <img
                                    src="/Images/Halloween.JPEG"
                                    alt="Headshot"
                                    className="rounded-xl border-8 object-cover
                   w-40 h-40 sm:w-48 sm:h-48 md:w-60 md:h-60 lg:w-72 lg:h-72"
                                    style={{
                                        borderLeftColor: "#d1fae5",
                                        borderRightColor: "#d1fae5",
                                        borderTopColor: "#e5e7eb",
                                        borderBottomColor: "#e5e7eb",
                                    }}
                                />

                                {/* Middle Logo */}
                                <div className="flex flex-col items-center justify-center leading-none">
                                    <img
                                        src="/Images/ktp_logo_trimmed.png"
                                        alt="Kappa Theta Pi logo"
                                        className="w-96 h-auto object-contain block m-0 p-0"
                                        style={{ display: "block" }}
                                    />
                                    <p
                                        className="text-2xl sm:text-3xl pt-4 font-thin italic playfair text-center m-0 leading-none mt-4 whitespace-nowrap"
                                    >
                                        for the love of technology
                                    </p>
                                </div>

                                {/* Right Image */}
                                <img
                                    src="/Images/Glow_Sticks.JPEG"
                                    alt="Headshot"
                                    className="rounded-xl border-8 object-cover
                   w-40 h-40 sm:w-48 sm:h-48 md:w-60 md:h-60 lg:w-72 lg:h-72"
                                    style={{
                                        borderLeftColor: "#d1fae5",
                                        borderRightColor: "#d1fae5",
                                        borderTopColor: "#e5e7eb",
                                        borderBottomColor: "#e5e7eb",
                                    }}
                                />
                            </div>
                        </div>

                        {/* About Us: President's Welcome and History */}
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
                                    Welcome to the Alpha Theta chapter of Kappa Theta Pi at the University of
                                    South Carolina. We are a professional technology fraternity
                                    committed to building a community of inspired
                                    technologists, innovators, and leaders. Through hands-on projects,
                                    networking events, and professional workshops, we
                                    empower members to grow both professionally and personally.
                                </p>
                            </div>
                        </div>

                        {/* Sections */}
                        <div className="flex flex-col space-y-12">
                            <Element name="presidents-welcome-section" id="presidents-welcome-section">
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

                            <Element name="history-section" id="history-section">
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

                        {/* Projects */}
                        <div className="max-w-3xl w-full mx-auto">
                            <h2 className="relative z-10 text-3xl font-bold text-left mt-10">
                                Ongoing Projects
                            </h2>
                            <div className="relative z-10">
                                <Carousel className="w-full border-2 border-gray-400 rounded-xl p-6 shadow-md mt-4">
                                    <CarouselContent>
                                        {data.map((p) => (
                                            <CarouselItem key={p.id} className="w-full">
                                                <div className="flex flex-col md:flex-row items-start">
                                                    <div className="w-full md:w-1/2 p-2">
                                                        <h2 className="text-xl font-semibold mb-2 text-gray-900">
                                                            {p.title}
                                                        </h2>
                                                        <p className="leading-relaxed text-gray-700">
                                                            {p.text}
                                                        </p>
                                                    </div>

                                                    <div className="relative w-full md:w-1/2 h-64 md:h-auto p-4 flex items-center justify-center">
                                                        <div className="relative w-full h-full overflow-hidden rounded-xl">
                                                            <AspectRatio ratio={5 / 4}>
                                                                <Image
                                                                    src={p.image}
                                                                    alt={`${p.title} logo`}
                                                                    fill
                                                                    className="object-cover w-full max-w-full"
                                                                />
                                                            </AspectRatio>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>
                                    <CarouselPrevious aria-label="Previous" />
                                    <CarouselNext aria-label="Next" />
                                </Carousel>
                            </div>
                        </div>

                        {/* Network */}
                        <div className="px-6 sm:px-8 md:px-12 lg:px-20">
                            <div
                                className="flex justify-left text-3xl lg:text-4xl font-semibold mt-10 mb-12 font-inter"
                                style={{ fontWeight: 680, letterSpacing: "-0.02em" }}
                            >
                                Our Network
                            </div>
                            <div className="flex flex-wrap justify-center items-center pb-10 gap-4 lg:gap-8 mb-8 min-h-[160px] lg:min-h-[180px]">
                                {networkCompanies.map((company, index) => (
                                    <Image
                                        key={company.alt}
                                        src={company.src}
                                        alt={company.alt}
                                        width={200}
                                        height={200}
                                        className="max-h-6 lg:max-h-8 w-auto transition-all duration-300 hover:scale-110 drop-shadow-md"
                                        style={{
                                            animationDelay: `${index * 50}ms`,
                                            animationFillMode: "forwards",
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
