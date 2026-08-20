"use client";

import { useEffect, useRef } from "react";

const GLYPHS =
    "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワン0123456789ΚΘΠ<>{}[]/*+-=$#@%&";

const FONT_SIZE = 16;
const FRAME_MS = 55;

/**
 * Full-viewport "digital rain" backdrop. Fixed, so it stays put while the page
 * scrolls, and paints below the header (z-50) and footer (z-10).
 */
export default function MatrixRain() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        let width = 0;
        let height = 0;
        let drops: number[] = [];
        let raf = 0;
        let lastFrame = 0;

        const randomGlyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

        const paintColumn = (column: number, headY: number, alpha: number) => {
            const x = column * FONT_SIZE;

            // faded trail character above the head
            ctx.fillStyle = `rgba(0, 190, 60, ${0.55 * alpha})`;
            ctx.fillText(randomGlyph(), x, headY - FONT_SIZE);

            // bright leading character
            ctx.fillStyle = `rgba(190, 255, 210, ${alpha})`;
            ctx.fillText(randomGlyph(), x, headY);
        };

        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            width = window.innerWidth;
            height = window.innerHeight;

            canvas.width = Math.floor(width * dpr);
            canvas.height = Math.floor(height * dpr);
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;

            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.font = `${FONT_SIZE}px ui-monospace, SFMono-Regular, Menlo, monospace`;
            ctx.textBaseline = "top";

            ctx.fillStyle = "#000";
            ctx.fillRect(0, 0, width, height);

            const columns = Math.ceil(width / FONT_SIZE);
            const rows = Math.ceil(height / FONT_SIZE);

            // Seed across the full height (plus some headroom) so the rain is
            // already falling on the first frame rather than dropping in.
            drops = Array.from({ length: columns }, () => Math.random() * (rows + 40) - 40);

            paintStaticFrame();
        };

        // Scattered glyph field. Gives the animation something to start from,
        // and is the whole effect for users who asked not to see motion.
        const paintStaticFrame = () => {
            const rows = Math.ceil(height / FONT_SIZE);
            for (let column = 0; column < drops.length; column++) {
                for (let row = 0; row < rows; row++) {
                    if (Math.random() > 0.07) continue;
                    ctx.fillStyle = `rgba(0, 190, 60, ${0.18 + Math.random() * 0.3})`;
                    ctx.fillText(randomGlyph(), column * FONT_SIZE, row * FONT_SIZE);
                }
            }
        };

        const draw = (timestamp: number) => {
            raf = requestAnimationFrame(draw);
            if (timestamp - lastFrame < FRAME_MS) return;
            lastFrame = timestamp;

            // translucent wash instead of a clear, which leaves the trails
            ctx.fillStyle = "rgba(0, 0, 0, 0.09)";
            ctx.fillRect(0, 0, width, height);

            for (let column = 0; column < drops.length; column++) {
                const headY = drops[column] * FONT_SIZE;
                if (headY > 0) paintColumn(column, headY, 0.9);

                if (headY > height && Math.random() > 0.975) {
                    drops[column] = 0;
                }
                drops[column]++;
            }
        };

        resize();
        window.addEventListener("resize", resize);
        if (!reduceMotion) raf = requestAnimationFrame(draw);

        return () => {
            window.removeEventListener("resize", resize);
            cancelAnimationFrame(raf);
        };
    }, []);

    return <canvas ref={canvasRef} aria-hidden="true" className="matrix-rush__rain" />;
}
