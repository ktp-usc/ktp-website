"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

const DONATION_URL =
    "https://give4garnet.sc.edu/giving-day/104390/department/116973";

const marqueeRows = [
    [
        "/Images/collagephoto1.JPG",
        "/Images/collagephoto3.JPG",
        "/Images/symposium8.jpeg",
        "/Images/collagephoto12.png",
        "/Images/symposium6.jpeg",
        "/Images/collagephoto7.jpeg",
        "/Images/symposium4.jpeg"
    ],
    [
        "/Images/collagephoto9.jpeg",
        "/Images/symposium2.jpeg",
        "/Images/collagephoto11.jpeg",
        "/Images/symposium5.jpeg",
        "/Images/collagephoto10.jpeg",
        "/Images/alphaclass.jpeg",
        "/Images/symposium1.jpeg"
    ],
    [
        "/Images/collagephoto4.JPG",
        "/Images/symposium3.jpeg",
        "/Images/collagephoto6.jpeg",
        "/Images/group-photo.png",
        "/Images/collagephoto8.jpeg",
        "/Images/symposium9.jpeg",
        "/Images/collagephoto2.JPEG"
    ]
];

function MarqueeRow({
    images,
    reverse = false,
    duration
}: {
    images: string[];
    reverse?: boolean;
    duration: number;
}) {
    const prefersReducedMotion = useReducedMotion();
    const [windowWidth, setWindowWidth] = useState(0);

    useEffect(() => {
        const onResize = () => setWindowWidth(window.innerWidth);
        onResize();
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    const repeats = useMemo(() => {
        const cardWidth = windowWidth >= 640 ? 256 : 176;
        const gap = windowWidth >= 640 ? 20 : 12;
        const rowLength = images.length * cardWidth + (images.length - 1) * gap;
        const needed = Math.ceil(windowWidth / Math.max(rowLength, 1)) + 1;
        return Math.max(2, needed);
    }, [images.length, windowWidth]);

    const loopedImages = useMemo(
        () => Array.from({ length: repeats }, () => images).flat(),
        [images, repeats]
    );

    const segmentShift = `${100 / repeats}%`;
    const animationValues = reverse ? [`-${segmentShift}`, "0%"] : ["0%", `-${segmentShift}`];

    return (
        <div className="w-full overflow-hidden">
            <motion.div
                className="flex w-max items-center gap-3 sm:gap-5"
                animate={prefersReducedMotion ? undefined : { x: animationValues }}
                transition={
                    prefersReducedMotion
                        ? undefined
                        : {
                              duration,
                              ease: "linear",
                              repeat: Infinity
                          }
                }
            >
                {loopedImages.map((src, index) => (
                    <div
                        key={`${src}-${index}`}
                        className="relative h-32 w-44 shrink-0 overflow-hidden rounded-2xl shadow-lg sm:h-44 sm:w-64"
                    >
                        <Image
                            src={src}
                            alt={`KTP moment ${index + 1}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 176px, 256px"
                            priority={index < 4}
                        />
                    </div>
                ))}
            </motion.div>
        </div>
    );
}

export default function DonatePage() {
    return (
        <main className="relative overflow-hidden">
            <section className="relative isolate flex min-h-[calc(100vh-5.5rem)] items-center justify-center px-4 py-8 sm:px-6">
                <div className="absolute inset-0 -z-20">
                    <div className="flex h-full flex-col justify-center gap-3 opacity-40 sm:gap-5">
                        <MarqueeRow images={marqueeRows[0]} duration={95} />
                        <MarqueeRow images={marqueeRows[1]} duration={105} reverse />
                        <MarqueeRow images={marqueeRows[2]} duration={115} />
                    </div>
                    <div className="absolute inset-x-0 top-0 h-40 bg-linear-to-b from-blue-50 via-blue-50/85 to-transparent" />
                    <div className="absolute inset-0 bg-linear-to-b from-blue-50/45 via-white/75 to-white/90" />
                </div>

                <div className="pointer-events-none absolute -left-24 top-10 -z-10 h-72 w-72 rounded-full bg-[#a8d4ff]/70 blur-3xl" />
                <div className="pointer-events-none absolute -right-24 bottom-8 -z-10 h-72 w-72 rounded-full bg-[#9ceb9c]/55 blur-3xl" />

                <div className="w-full max-w-3xl rounded-3xl border border-blue-100/80 bg-white/82 p-8 text-center shadow-[0_18px_70px_rgba(49,92,169,0.22)] backdrop-blur-md sm:p-10">
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#315CA9]">
                        Fuel The Mission
                    </p>
                    <h1 className="mt-4 text-4xl font-black leading-tight text-slate-900 sm:text-5xl md:text-6xl">
                        Support Us
                    </h1>
                    <p className="mx-auto mt-4 max-w-2xl text-base text-slate-700 sm:text-lg">
                        Support Kappa Theta Pi’s mission to provide free tech consulting for local nonprofits on Give for Garnet.
                    </p>

                    <div className="mt-8 flex justify-center">
                        <a
                            href={DONATION_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center rounded-2xl bg-[#315CA9] px-16 py-5 text-2xl font-extrabold text-white shadow-[0_14px_45px_rgba(49,92,169,0.45)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#23498F] hover:shadow-[0_18px_50px_rgba(49,92,169,0.55)]"
                        >
                            Donate
                        </a>
                    </div>
                </div>
            </section>
        </main>
    );
}
