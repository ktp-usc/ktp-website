'use client';
import React from 'react';

export default function ImageViewer({ src, alt }: { src?: string; alt?: string }) {
    return (
        <img
            src={src ?? '/placeholder-headshot.png'}
            alt={alt ?? 'headshot'}
            style={{ width: 160, height: 160, objectFit: 'cover', borderRadius: 8 }}
        />
    );
}