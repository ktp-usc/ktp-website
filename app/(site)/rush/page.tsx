"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, forwardRef } from "react";

import CalendarIcon from "@/components/CalendarIcon";
import PinIcon from "@/components/PinIcon";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

interface FloatingImageProps {
    className?: string;
}

/* floating cards image */
const FloatingCardsImage = forwardRef<HTMLDivElement, FloatingImageProps>(function FloatingCardsImage({ className = "" }, ref) {
    return (
        <div
            ref={ref}
            aria-hidden="true"
            className={`pointer-events-none hidden sm:block absolute -left-80 top-0 w-44 h-44 ktp-float-cards ${className}`}
        >
            <div className="relative w-full h-full">
                <Image src="/Images/cards.png" alt="" fill style={{ objectFit: "contain" }} />
            </div>
        </div>
    );
});

/* floating chips image */
const AnimatedChipsImage = forwardRef<HTMLDivElement, FloatingImageProps>(function AnimatedChipsImage({ className = "" }, ref) {
    return (
        <div
            ref={ref}
            aria-hidden="true"
            className={`pointer-events-none hidden sm:block absolute -right-80 top-0 w-40 h-40 ktp-chips-anim ${className}`}
        >
            <div className="relative w-full h-full">
                <Image src="/Images/chips.png" alt="" fill style={{ objectFit: "contain" }} />
            </div>
        </div>
    );
});

export default function Page2() {
    const cardsRef = useRef(null);
    const chipsRef = useRef(null);

    return (
    <main className="relative min-h-screen">
        {/* Background blobs */}
        <div className="absolute inset-0 bg-white">
            <div className="absolute inset-0 blob-c z-0">
                <div className="shape-blob eight" />
                <div className="shape-blob nine" />
            </div>
        </div>

        <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-16">
            <div className="w-full max-w-5xl text-center">
                <h1 className="mb-10 text-5xl font-extrabold sm:text-6xl">
                    Coming soon...
                </h1>

                <div className="relative mx-auto aspect-[16/9] w-full overflow-hidden rounded-2xl shadow-2xl">
                    <Image
                        src="/Images/coming-soon.avif"
                        alt="Coming soon"
                        fill
                        priority
                        className="object-cover"
                    />
                </div>
            </div>
        </div>
    </main>
);
}