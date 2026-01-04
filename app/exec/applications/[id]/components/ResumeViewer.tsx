'use client';
import React from 'react';

type Props = {
    url: string;
    height?: number | string;
    fill?: boolean;
    onClick?: () => void;
    disableClickOverlay?: boolean;
};

export default function ResumeViewer({
                                         url,
                                         height,
                                         fill = false,
                                         onClick,
                                         disableClickOverlay = false,
                                     }: Props) {
    const wrapperStyle: React.CSSProperties = fill
        ? { width: '100%', height: '100%', position: 'relative' }
        : {
            width: '100%',
            height: typeof height === 'number' ? `${height}px` : height || '520px',
            position: 'relative',
        };

    const iframeSrc = url.toLowerCase().endsWith('.pdf') ? `${url}#toolbar=0` : url;

    return (
        <div style={wrapperStyle}>
            <iframe
                src={iframeSrc}
                title="Resume"
                style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    display: 'block',
                    background: '#fff',
                }}
                allowFullScreen
            />

            {!disableClickOverlay && onClick && (
                <div
                    onClick={onClick}
                    style={{
                        position: 'absolute',
                        inset: 0,
                        cursor: 'zoom-in',
                        background: 'transparent',
                    }}
                />
            )}
        </div>
    );
}
