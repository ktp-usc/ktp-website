'use client';
import React from 'react';

type Props = {
    url: string;
    height?: number | string;
};

export default function ResumeViewer({ url, height }: Props) {
    const wrapperStyle: React.CSSProperties = {
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
            />
        </div>
    );
}
