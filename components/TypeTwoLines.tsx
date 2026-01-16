"use client";

import { useEffect, useRef, useState } from "react";

export default function TypeTwoLines({
                                         line1 = "Kappa",
                                         line2 = "Theta Pi",
                                         speed = 70,
                                         delayBetween = 300,
                                         className = "text-6xl md:text-7xl lg:text-[6.25rem] leading-tight font-extrabold tracking-tight"
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
                <div className={ className }>{ line1 }</div>
                <div className={ className }>{ line2 }</div>
            </div>

            <div className="relative">
                <div className={ className } style={ { whiteSpace: "pre-wrap" } }>
                    <span>{ d1 }</span>
                </div>

                <div className={ className } style={ { whiteSpace: "pre-wrap" } }>
                    <span>{ d2 }</span>
                </div>
            </div>

            <style jsx>{ `
                @keyframes blink {
                    0%,
                    100% {
                        opacity: 0;
                    }
                    50% {
                        opacity: 1;
                    }
                }
            ` }</style>
        </div>
    );
}