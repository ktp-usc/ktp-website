'use client';
import React from 'react';

type Props = {
    src?: string;
    alt?: string;
};

export default function ImageViewer({ src, alt }: Props) {
    return (
        <img
            src={src || '/placeholder-headshot.png'}
            alt={alt || 'Headshot'}
            onError={(e) => {
                e.currentTarget.src = '/insert-headshot.png';
            }}
            style={{
                width: 96,
                height: 96,
                objectFit: 'cover',
                borderRadius: 0,
                border: '1px solid #e6eaf0',
                background: '#f6f8fb',
                display: 'block',
            }}
        />
    );
}
