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
import { Element } from "react-scroll";
import React, { useEffect, useState, useRef } from "react";

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

function TypeTwoLines({
                          line1 = "Kappa",
                          line2 = "Theta Pi",
                          speed = 70,
                          delayBetween = 300,
                          className = "text-6xl md:text-7xl lg:text-[6.25rem] leading-tight font-extrabold tracking-tight",
                      }) {
    const [d1, setD1] = useState("");
    const [d2, setD2] = useState("");
    const mounted = useRef(true);

    useEffect(() => {
        mounted.current = true;
        let t: ReturnType<typeof setTimeout> | null = null;

        // type kappa
        let i = 0;
        function typeLine1() {
            if (!mounted.current) return;
            if (i < line1.length) {
                setD1(line1.slice(0, i + 1));
                i++;
                t = setTimeout(typeLine1, speed);
            } else {
                // finished line1 -> wait then start line2
                t = setTimeout(typeLine2Start, delayBetween);
            }
        }

        // type theta pi
        let j = 0;
        function typeLine2Start() {
            if (!mounted.current) return;
            j = 0;
            typeLine2();
        }
        function typeLine2() {
            if (!mounted.current) return;
            if (j < line2.length) {
                setD2(line2.slice(0, j + 1));
                j++;
                t = setTimeout(typeLine2, speed);
            } else {

            }
        }

        typeLine1();

        return () => {
            mounted.current = false;
            if (t) clearTimeout(t);
        };
    }, [line1, line2, speed, delayBetween]);

    return (
        <div className="relative inline-block">
            <div className="absolute inset-0 pointer-events-none opacity-0 select-none whitespace-pre-wrap">
                <div className={className}>{line1}</div>
                <div className={className}>{line2}</div>
            </div>

            <div className="relative">
                <div className={className} style={{ whiteSpace: "pre-wrap" }}>
                    <span>{d1}</span>
                </div>

                <div className={className} style={{ whiteSpace: "pre-wrap" }}>
                    <span>{d2}</span>
                </div>
            </div>

            <style jsx>{`
        .animate-blink {
          animation: blink 1s steps(2, start) infinite;
        }
        @keyframes blink {
          0%,
          100% {
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
        </div>
    );
}

export default function Home() {
    return (
        <div className="font-sans min-h-screen flex flex-col overflow-x-clip">
            <main className="flex flex-col items-center flex-grow pt-4 px-8 pb-0">
                {/* Background blobs */}
                <div className="flex flex-row justify-center xl:justify-between mb-0 px-6 sm:px-8 md:px-12 lg:px-20 pointer-events-none">
                    <div className="absolute inset-0 blob-c z-0 hidden md:block">
                        <div className="shape-blob ten" />
                        <div className="shape-blob eleven" />
                    </div>
                </div>

                <div className="flex flex-col items-center w-full">
                    <section className="px-6 sm:px-8 md:px-16 lg:px-24 xl:px-32 pt-6 pb-8 sm:pt-8 md:pt-10 w-full">
                        <div className="relative w-full overflow-visible">
                            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                                {/* Header + subtitle + Rush button */}
                                <div className="lg:col-span-6 lg:order-first order-last flex flex-col justify-center items-center lg:items-start text-center lg:text-left">
                                    <h1 className="whitespace-pre-line">
                                        <TypeTwoLines
                                            line1="Kappa"
                                            line2="Theta Pi"
                                            speed={70}
                                            delayBetween={300}
                                            className="text-6xl md:text-7xl lg:text-[6.25rem] leading-tight font-extrabold tracking-tight"
                                        />
                                    </h1>

                                    <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-xl">
                                        Professional technology fraternity at the University of South Carolina.
                                    </p>

                                    <div className="mt-8 max-w-xl mx-auto flex justify-center">
                                        <a
                                            href="/Rush"
                                            className="inline-flex items-center justify-center bg-[#315CA9] text-white px-6 py-3 rounded-lg font-medium transform transition-transform duration-300 hover:-translate-y-1"
                                        >
                                            Rush KTP →
                                        </a>
                                    </div>

                                </div>

                                {/* Collage */}
                                <div className="lg:col-span-6 order-first lg:order-last">
                                    <div className="relative w-full overflow-visible flex justify-center">
                                        <div className="collage-scale relative w-[560px] h-[420px] md:w-[720px] md:h-[480px]">
                                            {/* Top-left */}
                                            <div
                                                className="absolute top-0 left-[6%] z-20 rounded-xl overflow-hidden border-8"
                                                style={{
                                                    width: "48%",
                                                    height: "44%",
                                                    transform: "translate(-5%, -6%)",
                                                    borderLeftColor: "#d1fae5",
                                                    borderRightColor: "#d1fae5",
                                                    borderTopColor: "#e5e7eb",
                                                    borderBottomColor: "#e5e7eb",
                                                }}
                                            >
                                                <div className="relative w-full h-full">
                                                    <Image src="/Images/collagephoto1.JPG" alt="KTP Symposium" fill style={{ objectFit: "cover" }} />
                                                </div>
                                            </div>

                                            {/* Top-right */}
                                            <div
                                                className="absolute top-0 right-[2%] z-10 rounded-xl overflow-hidden border-8"
                                                style={{
                                                    width: "35%",
                                                    height: "50%",
                                                    transform: "translate(6%, -8%)",
                                                    borderLeftColor: "#d1fae5",
                                                    borderRightColor: "#d1fae5",
                                                    borderTopColor: "#e5e7eb",
                                                    borderBottomColor: "#e5e7eb",
                                                }}
                                            >
                                                <div className="relative w-full h-full">
                                                    <Image src="/Images/collagephoto2.JPEG" alt="KTP pumpkin carving" fill style={{ objectFit: "cover" }} />
                                                </div>
                                            </div>

                                            {/* center */}
                                            <div
                                                className="absolute z-50 rounded-xl overflow-hidden border-8 shadow-xl"
                                                style={{
                                                    left: "55%",
                                                    top: "28%",
                                                    width: "56%",
                                                    height: "44%",
                                                    transform: "translate(-50%, -8%)",
                                                    borderLeftColor: "#d1fae5",
                                                    borderRightColor: "#d1fae5",
                                                    borderTopColor: "#e5e7eb",
                                                    borderBottomColor: "#e5e7eb",
                                                }}
                                            >
                                                <div className="relative w-full h-full">
                                                    <Image src="/Images/collagephoto3.JPG" alt="KTP Alpha class" fill style={{ objectFit: "cover" }} />
                                                </div>
                                            </div>

                                            {/* bottom-left */}
                                            <div
                                                className="absolute z-30 rounded-xl overflow-hidden border-8"
                                                style={{
                                                    bottom: "3%",
                                                    left: "5%",
                                                    width: "46%",
                                                    height: "38%",
                                                    transform: "translate(-4%, 8%)",
                                                    borderLeftColor: "#d1fae5",
                                                    borderRightColor: "#d1fae5",
                                                    borderTopColor: "#e5e7eb",
                                                    borderBottomColor: "#e5e7eb",
                                                }}
                                            >
                                                <div className="relative w-full h-full">
                                                    <Image src="/Images/collagephoto4.JPG" alt="KTP speaker" fill style={{ objectFit: "cover" }} />
                                                </div>
                                            </div>

                                            {/* bottom-right */}
                                            <div
                                                className="absolute z-40 rounded-xl overflow-hidden border-8"
                                                style={{
                                                    bottom: "5%",
                                                    right: "-5%",
                                                    width: "50%",
                                                    height: "40%",
                                                    borderLeftColor: "#d1fae5",
                                                    borderRightColor: "#d1fae5",
                                                    borderTopColor: "#e5e7eb",
                                                    borderBottomColor: "#e5e7eb",
                                                }}
                                            >
                                                <div className="relative w-full h-full">
                                                    <Image
                                                        src="/Images/collagephoto5.JPG"
                                                        alt="KTP symposium presentation"
                                                        fill
                                                        style={{ objectFit: "cover" }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <style jsx>{`
                                        .collage-scale {
                                            transition: transform 200ms ease;
                                            transform-origin: center;
                                            display: inline-block;
                                        }

                                        /* desktop */
                                        @media (min-width: 1025px) {
                                            .collage-scale {
                                                transform: scale(1);
                                            }
                                        }

                                        /* large tablets/smaller desktops */
                                        @media (max-width: 1024px) {
                                            .collage-scale {
                                                transform: scale(0.98);
                                            }
                                        }

                                        /* tablet */
                                        @media (max-width: 900px) {
                                            .collage-scale {
                                                transform: scale(0.9);
                                            }
                                        }

                                        /* small tablets/large phones */
                                        @media (max-width: 700px) {
                                            .collage-scale {
                                                transform: scale(0.82);
                                            }
                                        }

                                        /* phones */
                                        @media (max-width: 480px) {
                                            .collage-scale {
                                                transform: scale(0.74);
                                            }
                                        }
                                    `}</style>
                                </div>
                            </div>
                        </div>

                        {/* About Us */}
                        <section className="w-full py-45">
                            <div className="relative max-w-6xl mx-auto bg-gray-50 rounded-2xl overflow-hidden">
                                <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-8 lg:gap-12 px-6 sm:px-8 md:px-12 lg:px-16 py-12">
                                    {/* heading on left */}
                                    <div className="lg:col-span-7 xl:col-span-6">
                                        <h2 className="text-4xl lg:text-5xl font-extrabold mb-6 leading-tight text-center">About KTP</h2>

                                        <p className="text-gray-700 text-base md:text-lg leading-relaxed max-w-2xl text-center">
                                            Welcome to the Alpha Theta chapter of Kappa Theta Pi at the
                                            University of South Carolina. We are a professional technology
                                            fraternity committed to building a community of inspired technologists,
                                            innovators, and leaders. Through hands-on projects, networking events,
                                            and professional workshops, we empower members to grow both
                                            professionally and personally.
                                        </p>
                                    </div>

                                    {/* alpha class image on right */}
                                    <div className="lg:col-span-5 xl:col-span-6 flex justify-center lg:justify-end relative">
                                        {/* green blob behind image */}
                                        <div className="absolute -top-25 -right-25 z-0 blob-c">
                                            <div className="shape-blob eight absolute" />
                                            <div className="shape-blob nine absolute" />
                                        </div>
                                        {/* image container */}
                                        <div
                                            className="relative z-10 w-full max-w-md lg:max-w-lg rounded-xl overflow-hidden border-8 transform transition-transform duration-300 hover:-translate-y-3"
                                            style={{
                                                borderLeftColor: "#d1fae5",
                                                borderRightColor: "#d1fae5",
                                                borderTopColor: "#e5e7eb",
                                                borderBottomColor: "#e5e7eb",
                                            }}
                                        >
                                            <Image src="/Images/alphaclass.jpeg" alt="KTP Alpha class" width={900} height={600} className="object-cover w-full h-full block" priority={false} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* President's Welcome */}
                        <div className="flex flex-col space-y-10">
                            <Element name="presidents-welcome-section" id="presidents-welcome-section">
                                <section className="px-6 sm:px-8 md:px-16 lg:px-24 xl:px-32 py-8 sm:py-12 md:py-16">
                                    <div className="relative flex flex-col items-center lg:flex-row lg:items-start space-y-12 lg:space-y-0 lg:space-x-12 pb-10">
                                        <div className="relative w-full lg:w-2/5 flex justify-center">
                                            <div className="absolute blob-c z-0 flex justify-center items-center">
                                                <div className="shape-blob eight absolute" />
                                                <div className="shape-blob nine absolute" />
                                            </div>
                                            <img
                                                src="/Images/presidentheadshot.png"
                                                alt="President's Headshot"
                                                className="relative z-10 w-3/4 h-auto rounded-full border-8 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg transform transition-transform duration-300 hover:-translate-y-3"
                                                style={{ borderLeftColor: "#d1fae5", borderRightColor: "#d1fae5", borderTopColor: "#e5e7eb", borderBottomColor: "#e5e7eb" }}
                                            />
                                        </div>

                                        <div className="w-full lg:w-3/5 text-left relative z-10">
                                            <h2 className="text-center text-2xl sm:text-4xl font-black mb-10">President&apos;s Welcome</h2>
                                            <div className="text-base sm:text-lg leading-relaxed space-y-4">
                                                <p>Welcome to Kappa Theta Pi, USC&apos;s premier professional technology fraternity. On behalf of our chapter, I’m excited to welcome you to our fraternity&apos;s new website, where you can catch a glimpse of the passion and excellence that our chapter celebrates.</p>
                                                <p>Kappa Theta Pi offers brothers the support to be extraordinary during their time at South Carolina with resources centered around professional development, alumni connections, social growth, technological advancement, and academic support. From nonprofit project teams and study groups to professional development workshops and hackathons, we foster a culture of growth encouraging members to pursue their tech passions. Our chapter values diversity, with brothers contributing unique experiences and excelling as student leaders. We celebrate our diverse brotherhood, welcoming all united by a passion for technology.</p>
                                                <p>Founding the South Carolina chapter of KTP has been the most impactful part of my college experience. I’ve had the immense privilege of building this community and watching it grow into a home for USC&apos;s most exceptional and ambitious professionals, seeing first-hand the incredible things they do. Our nonprofit consulting initiative, undertaken by no other KTP chapter nationally, has seen immense success with 5 clients in the span of a single semester. Most importantly, this chapter is built upon the promise of not only professional excellence, but also creating lifelong bonds that will serve as a constant source of inspiration and support for every member to be their full and best self.</p>
                                                <p>Sincerely,<br />Owen Coulam<br />President, 2025</p>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </Element>

                            {/* History */}
                            <Element name="history-section" id="history-section">
                                <section className="w-full py-16">
                                    <div className="relative max-w-6xl mx-auto bg-gray-50 rounded-2xl overflow-hidden">
                                        <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-8 lg:gap-12 px-6 sm:px-8 md:px-12 lg:px-16 py-12">
                                            {/* image on left */}
                                            <div className="lg:col-span-5 xl:col-span-6 flex justify-center lg:justify-start relative order-first lg:order-first">
                                                {/* green blob behind image */}
                                                <div className="absolute -top-20 -left-20 z-0 blob-c pointer-events-none">
                                                    <div className="shape-blob eight absolute" />
                                                    <div className="shape-blob nine absolute" />
                                                </div>

                                                {/* image container */}
                                                <div className="relative z-10 w-full max-w-md lg:max-w-lg rounded-xl overflow-hidden border-8 transform transition-transform duration-300 hover:-translate-y-3" style={{ borderLeftColor: "#d1fae5", borderRightColor: "#d1fae5", borderTopColor: "#e5e7eb", borderBottomColor: "#e5e7eb" }}>
                                                    <Image src="/Images/history-photo.JPG" alt="KTP Alpha Class" width={900} height={600} className="object-cover w-full h-full block" priority={false} />
                                                </div>
                                            </div>

                                            {/* text on right */}
                                            <div className="lg:col-span-7 xl:col-span-6">
                                                <h2 className="text-4xl lg:text-5xl font-extrabold mb-6 leading-tight text-center">History</h2>

                                                <p className="indent-8 mb-6 text-gray-700 text-base md:text-lg leading-relaxed max-w-2xl text-center">
                                                    Kappa Theta Pi is a professional technology fraternity focused on
                                                    building a strong community of tech-driven students across the
                                                    country. Founded in 2012 at the University of Michigan by seven
                                                    students with a shared passion for technology, we’ve grown into
                                                    a national organization guided by our motto, “For the Love of
                                                    Technology.”
                                                </p>

                                                <p className="indent-6 text-gray-700 text-base md:text-lg leading-relaxed max-w-2xl text-center">
                                                    Today, we continue to support and inspire new generations
                                                    of students through hands-on learning and collaboration. We’re
                                                    excited to introduce the 2025 Alpha Class, who put their skills
                                                    to work during the rush process by partnering with three non-profits
                                                    and making a positive impact on our local community.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </Element>
                        </div>

                        {/* Projects */}
                        <div className="max-w-3xl w-full mx-auto mb-32">
                            <h2 className="relative z-10 text-3xl font-bold text-center mt-10">Ongoing Projects</h2>
                            <div className="relative z-10">
                                <Carousel className="w-full border-2 border-gray-400 rounded-xl p-6 shadow-md mt-4">
                                    <CarouselContent>
                                        {data.map((p) => (
                                            <CarouselItem key={p.id} className="w-full">
                                                <div className="flex flex-col md:flex-row items-start">
                                                    <div className="w-full md:w-1/2 p-2">
                                                        <h2 className="text-xl font-semibold mb-2 text-gray-900">{p.title}</h2>
                                                        <p className="leading-relaxed text-gray-700">{p.text}</p>
                                                    </div>

                                                    <div className="relative w-full md:w-1/2 h-64 md:h-auto p-4 flex items-center justify-center">
                                                        <div className="relative w-full h-full overflow-hidden rounded-xl transform transition-transform duration-300 hover:-translate-y-3">
                                                            <AspectRatio ratio={5 / 4}>
                                                                <Image src={p.image} alt={`${p.title} logo`} fill className="object-cover w-full max-w-full" />
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
                            <div className="flex justify-center text-3xl lg:text-4xl font-semibold mt-10 mb-12 font-inter" style={{ fontWeight: 680, letterSpacing: "-0.02em" }}>
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
                                        className="max-h-6 lg:max-h-8 w-auto transform transition-transform duration-300 hover:-translate-y-2 hover:scale-105"
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
