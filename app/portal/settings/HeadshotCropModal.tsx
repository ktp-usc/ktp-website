'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

type HeadshotCropModalProps = {
    open: boolean;
    imageSrc: string | null;
    isDark: boolean;
    originalFile: File | null;

    size?: number; // default 300

    onCancelAction: () => void;
    onSaveAction: (croppedFile: File) => Promise<void> | void;
};

function clamp(n: number, min: number, max: number) {
    return Math.min(max, Math.max(min, n));
}

export default function HeadshotCropModal(props: HeadshotCropModalProps) {
    const { open, imageSrc, isDark, originalFile, size = 300, onCancelAction, onSaveAction } = props;

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const imageRef = useRef<HTMLImageElement | null>(null);

    // start with something safe; real value is computed on image load
    const [scale, setScale] = useState(0.1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState({ min: 0.05, max: 0.5 });

    // ensure we only "auto-init" once per imageSrc
    const lastInitSrcRef = useRef<string | null>(null);

    const strokeColor = useMemo(() => (isDark ? '#60a5fa' : '#3b82f6'), [isDark]);

    const drawCanvas = () => {
        const canvas = canvasRef.current;
        const image = imageRef.current;
        if (!canvas || !image) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = size;
        canvas.height = size;

        ctx.clearRect(0, 0, size, size);

        ctx.save();

        // circle clip
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        const s = clamp(scale, zoom.min, zoom.max);

        const imgWidth = image.naturalWidth * s;
        const imgHeight = image.naturalHeight * s;
        const x = (size - imgWidth) / 2 + position.x;
        const y = (size - imgHeight) / 2 + position.y;

        ctx.drawImage(image, x, y, imgWidth, imgHeight);

        ctx.restore();

        // border
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 3;
        ctx.stroke();
    };

    // redraw when controls change
    useEffect(() => {
        if (!open || !imageSrc) return;
        if (!imageRef.current) return;
        drawCanvas();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, imageSrc, scale, position.x, position.y, strokeColor, size, zoom.min, zoom.max]);

    // when opening a new image, reset position (but NOT scale—scale is computed onLoad)
    useEffect(() => {
        if (!open || !imageSrc) return;
        setPosition({ x: 0, y: 0 });
    }, [open, imageSrc]);

    const handleImageLoad = () => {
        const img = imageRef.current;
        if (!img || !imageSrc) return;

        // if we already initialized for this src, don't overwrite user changes
        if (lastInitSrcRef.current === imageSrc) {
            drawCanvas();
            return;
        }

        // cover-fit scale (ensures crop circle is fully filled; no blank edges)
        const fitScale = Math.max(size / img.naturalWidth, size / img.naturalHeight);

        // give a comfortable slider range around fit
        const min = fitScale * 0.8;
        const max = fitScale * 3.0;

        setZoom({
            min: clamp(min, 0.0001, 10),
            max: clamp(max, 0.0001, 10)
        });

        // start exactly at fit (not zoomed in)
        setScale(clamp(fitScale, 0.0001, 10));
        setPosition({ x: 0, y: 0 });

        lastInitSrcRef.current = imageSrc;

        // draw after state settles (next tick)
        setTimeout(drawCanvas, 0);
    };

    const handleSave = async () => {
        const canvas = canvasRef.current;
        if (!canvas || !originalFile) return;

        const blob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob(
                (b) => {
                    if (!b) {
                        reject(new Error('canvas.toBlob returned null'));
                        return;
                    }
                    resolve(b);
                },
                'image/jpeg',
                0.95
            );
        });

        const croppedFile = new File([blob], originalFile.name, { type: 'image/jpeg' });
        await onSaveAction(croppedFile);
    };

    if (!open || !imageSrc) return null;

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4'>
            <div className='bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-md w-full'>
                <h3 className='text-xl font-semibold text-gray-900 dark:text-white mb-4'>
                    Crop Your Headshot
                </h3>

                <div className='flex flex-col items-center gap-4'>
                    <img
                        ref={imageRef}
                        src={imageSrc}
                        alt='Source'
                        style={{ display: 'none' }}
                        onLoad={handleImageLoad}
                    />

                    <canvas
                        ref={canvasRef}
                        className='border-2 border-gray-300 dark:border-gray-600 rounded-full'
                        style={{ maxWidth: `${size}px`, width: '100%', height: 'auto' }}
                    />

                    <div className='w-full'>
                        <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                            Zoom
                        </label>
                        <input
                            type='range'
                            min={zoom.min}
                            max={zoom.max}
                            step={(zoom.max - zoom.min) / 200}
                            value={scale}
                            onChange={(e) => setScale(Number(e.target.value))}
                            className='w-full'
                        />
                    </div>

                    <div className='w-full grid grid-cols-2 gap-3'>
                        <div>
                            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                                Horizontal
                            </label>
                            <input
                                type='range'
                                min={-200}
                                max={200}
                                value={position.x}
                                onChange={(e) => setPosition((prev) => ({ ...prev, x: Number(e.target.value) }))}
                                className='w-full'
                            />
                        </div>

                        <div>
                            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                                Vertical
                            </label>
                            <input
                                type='range'
                                min={-200}
                                max={200}
                                value={position.y}
                                onChange={(e) => setPosition((prev) => ({ ...prev, y: Number(e.target.value) }))}
                                className='w-full'
                            />
                        </div>
                    </div>
                </div>

                <div className='flex gap-3 mt-6'>
                    <button
                        onClick={handleSave}
                        className='flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium'
                        type='button'
                    >
                        Save
                    </button>
                    <button
                        onClick={onCancelAction}
                        className='flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium'
                        type='button'
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
