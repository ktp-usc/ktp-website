import React, { useEffect, useState } from "react";

interface Blob {
    id: number;
    x: number;
    y: number;
    size: number;
    color: string;
    duration: number;
    delay: number;
}

const AnimatedBlobs: React.FC = () => {
    const [blobs, setBlobs] = useState<Blob[]>([]);

    useEffect(() => {
        const colors = ["#3b82f6", "#60a5fa", "#10b981", "#34d399", "#06b6d4"];
        const blobCount = 8;

        const newBlobs: Blob[] = Array.from({ length: blobCount }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 300 + 200,
            color: colors[Math.floor(Math.random() * colors.length)],
            duration: Math.random() * 4 + 3,
            delay: Math.random() * 2
        }));

        setBlobs(newBlobs);
    }, []);

    return (
        <div className="relative w-full h-screen bg-black overflow-hidden">
            { blobs.map((blob) => (
                <div
                    key={ blob.id }
                    className="absolute rounded-full animate-pulse"
                    style={ {
                        left: `${ blob.x }%`,
                        top: `${ blob.y }%`,
                        width: `${ blob.size }px`,
                        height: `${ blob.size }px`,
                        background: `radial-gradient(circle, ${ blob.color }80 0%, ${ blob.color }00 70%)`,
                        filter: "blur(60px)",
                        animation: `pulse ${ blob.duration }s ease-in-out ${ blob.delay }s infinite alternate`,
                        transform: "translate(-50%, -50%)"
                    } }
                />
            )) }

            <style>{ `
  @keyframes pulse {
    0% {
      opacity: 0.3;
      transform: translate(-50%, -50%) scale(0.8);
    }
    100% {
      opacity: 0.8;
      transform: translate(-50%, -50%) scale(1.2);
    }
  }
` }</style>
        </div>
    );
};

interface BackgroundProps {
    className?: string;
}

export default function Background({ className }: BackgroundProps) {
    return <div className={ className }><AnimatedBlobs/></div>;
}