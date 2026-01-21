"use client";

import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Element } from "react-scroll";

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

/* ---------------- Photo Strip ---------------- */

function PhotoStrip({ images }: { images: string[] }) {
    return (
        <section className="w-full py-16">
            <div className="max-w-screen-2xl mx-auto px-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {images.map((src, i) => (
                        <div
                            key={i}
                            className="relative aspect-3/2 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition"
                        >
                            <Image
                                src={src}
                                alt={`KTP collage ${i + 1}`}
                                fill
                                className="object-cover"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}


/* ---------------- Data ---------------- */

const collageTop = [
    "/Images/collagephoto6.jpeg",
    "/Images/collagephoto10.jpeg",
    "/Images/collagephoto7.jpeg",
];

const collageBottom = [
    "/Images/collagephoto9.jpeg",
    "/Images/collagephoto11.jpeg",
    "/Images/collagephoto12.png",
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
            <main className="flex flex-col items-center grow pt-4 px-8 pb-0">
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
                                        The University of South Carolina&apos;s premier professional technology fraternity
                                    </p>

                                    <div className="mt-8 max-w-xl mx-auto flex justify-center">
                                        <a
                                            href="/rush"
                                            className="inline-flex items-center justify-center bg-[#315CA9] text-white px-6 py-3 rounded-lg font-medium transform transition-transform duration-300 hover:-translate-y-1"
                                        >
                                            Rush KTP →
                                        </a>
                                    </div>

                                </div>

                                {/* Collage */}
                                <div className="lg:col-span-6 order-first lg:order-last">
                                    <div className="relative w-full overflow-visible flex justify-center">
                                        <div className="collage-scale relative z-0 w-140 h-105 md:w-180 md:h-120">
                                            {/* Top-left */}
                                            <div
                                                className="absolute top-0 left-[6%] z-10 rounded-xl overflow-hidden border-8"
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
                                                className="absolute top-0 right-[2%] z-0 rounded-xl overflow-hidden border-8"
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
                                                className="absolute z-20 rounded-xl overflow-hidden border-8 shadow-xl"
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
                                                className="absolute z-10 rounded-xl overflow-hidden border-8"
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
                                                className="absolute z-10 rounded-xl overflow-hidden border-8"
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

                                        /* desktop */
                                        @media (min-width: 1025px) {
                                        }

                                        /* large tablets/smaller desktops */
                                        @media (max-width: 1024px) {
                                        }

                                        /* tablet */
                                        @media (max-width: 900px) {
                                        }

                                        /* small tablets/large phones */
                                        @media (max-width: 700px) {
                                        }

                                        /* phones */
                                        @media (max-width: 480px) {
                                        }
                                    `}</style>
                                </div>
                            </div>
                        </div>

                        {/* ---------- COLLAGE BEFORE ABOUT ---------- */}
                        <PhotoStrip images={collageTop} />


                        {/* About Us */}
                        <section className="w-full py-10">
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

                        {/* ---------- COLLAGE AFTER ABOUT ---------- */}
                        <PhotoStrip images={collageBottom} />


                        {/* President's Welcome */}
                        <div className="flex flex-col space-y-10">
                            <Element name="presidents-welcome-section" id="presidents-welcome-section">
                                <section className="w-full relative-ml-[50vw] -mr-[50vw] py-16 sm:py-20 md:py-24 bg-transparent">
                                <div className="relative flex flex-col items-center lg:flex-row lg:items-start space-y-12 lg:space-y-0 lg:space-x-12 pb-10">
                                    <div className="relative w-full lg:w-2/5 flex justify-center overflow-visible translate-y-12 sm:translate-y-16 md:translate-y-10">
                                        <div className="absolute inset-x-0 -top-16 h-[200%] blob-c z-0 flex justify-center items-center pointer-events-none">
                                            <div className="shape-blob eight absolute" />
                                            <div className="shape-blob nine absolute" />
                                        </div>

                                        <img
                                            src="/Images/presidentheadshot.png"
                                            alt="President's Headshot"
                                            className="relative z-10 w-3/4 h-auto rounded-full border-8 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg transform transition-transform duration-300 hover:-translate-y-3"
                                            style={{
                                                borderLeftColor: "#d1fae5",
                                                borderRightColor: "#d1fae5",
                                                borderTopColor: "#e5e7eb",
                                                borderBottomColor: "#e5e7eb",
                                            }}
                                        />
                                    </div>




                                    <div className="w-full lg:w-3/5 text-left relative z-10">
                                            <h2 className="text-center text-2xl sm:text-4xl font-black mb-10">President&apos;s Welcome</h2>
                                            <div className="text-base sm:text-md leading-relaxed space-y-2">
                                                <p>Welcome to the Alpha Theta Chapter of Kappa Theta Pi, a co-ed professional technology fraternity
                                                    at the University of South Carolina. On behalf of our chapter, I welcome you to our website,
                                                    where you can learn about the work we do and the values we strive to embody. I believe that
                                                    we offer our members unmatched professional and technical development opportunities that build
                                                    skills applicable in the workplace and beyond.</p>

                                                <p>Our chapter is set apart by being the first nationally to pioneer an innovative nonprofit
                                                    consulting initiative. Each semester, we take on 3-4 nonprofit clients, and assign a student
                                                    team to work on a project to help further their goals. This creates a win-win arrangement:
                                                    nonprofits get pro bono support that helps them focus resources on their core mission, while
                                                    students get real-world technology project experience using industry-standard tools.</p>

                                                <p>From being a founding member to becoming its president, I’ve been honored to be a part of this
                                                    organization. Beyond the professional work, I’ve had so much fun getting to know the incredible
                                                    community that makes every event something to look forward to. We welcome new members from all
                                                    majors and all backgrounds, brought together by our shared commitment to personal and professional
                                                    growth. Whether you’re a student looking for opportunities while in college or a nonprofit
                                                    interested in working with us, we would love to hear from you!</p>

                                                <p>Sincerely,<br />Luke Jannazzo<br />President, Spring 2026</p>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </Element>
                        </div>

                        {/* Network */}
                        <div className="px-6 sm:px-8 md:px-12 lg:px-20">
                            <div className="flex justify-center text-3xl lg:text-4xl font-semibold mt-10 mb-12 font-inter" style={{ fontWeight: 680, letterSpacing: "-0.02em" }}>
                                Our Network
                            </div>
                            <div className="flex flex-wrap justify-center items-center pb-10 gap-4 lg:gap-8 mb-8 min-h-40 lg:min-h-45">
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
