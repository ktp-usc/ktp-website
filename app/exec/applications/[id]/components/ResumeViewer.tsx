'use client';
import React from 'react';
import DocViewer, { DocViewerRenderers } from 'react-doc-viewer';

export default function ResumeViewer({ url }: { url: string }) {
    const docs = [{ uri: url }];
    return (
        <div style={{ width: '100%', height: '520px' }}>
            <DocViewer documents={docs} pluginRenderers={DocViewerRenderers as any} />
        </div>
    );
}
