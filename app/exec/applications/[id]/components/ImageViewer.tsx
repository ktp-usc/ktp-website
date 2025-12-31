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
                (e.currentTarget as HTMLImageElement).src = '/insert-headshot.png';
            }}
            style={{
                width: 160,
                height: 160,
                objectFit: 'cover',
                borderRadius: 8,
                border: '1px solid #e6eaf0',
                background: '#f6f8fb',
            }}
        />
    );
}