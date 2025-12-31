'use client';
import React, { useEffect, useRef, useState } from 'react';

type Reply = {
    id: number | string;
    authorName: string;
    authorAvatar?: string | null;
    text: string;
    createdAt?: string;
};

type Comment = {
    id: number | string;
    authorName: string;
    authorAvatar?: string | null;
    text: string;
    createdAt?: string;
    replies?: Reply[];
};

//replace with actual current user from auth
const CURRENT_USER_NAME = 'You';

export default function CommentsSidebar({ applicationId }: { applicationId?: number | string }) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [text, setText] = useState('');

    const [replyTo, setReplyTo] = useState<number | string | null>(null);
    const [replyText, setReplyText] = useState('');

    const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

    const menusRef = useRef<Record<string, HTMLDivElement | null>>({});

    // load comments
    useEffect(() => {
        if (!applicationId) return;
        fetch(`/api/applications/${applicationId}/comments`)
            .then((r) => (r.ok ? r.json() : null))
            .then((j: any) => {
                const data = j?.comments ?? j ?? [];
                const normalized: Comment[] = (Array.isArray(data) ? data : []).map((c: any) => ({
                    ...c,
                    replies: Array.isArray(c.replies) ? c.replies : [],
                }));
                setComments(normalized);
            })
            .catch(() => {
                setComments([]);
            });
    }, [applicationId]);

    useEffect(() => {
        function onDocClick(e: MouseEvent) {
            if (!menuOpenId) return;
            const el = menusRef.current[menuOpenId];
            if (!el || !el.contains(e.target as Node)) {
                setMenuOpenId(null);
            }
        }
        document.addEventListener('click', onDocClick);
        return () => document.removeEventListener('click', onDocClick);
    }, [menuOpenId]);

    async function post() {
        if (!text.trim() || !applicationId) return;
        const newComment: Comment = {
            id: `local-${Date.now()}`,
            authorName: CURRENT_USER_NAME,
            authorAvatar: '/placeholder-headshot.png',
            text: text.trim(),
            createdAt: new Date().toISOString(),
            replies: [],
        };
        setComments((c) => [...c, newComment]);
        setText('');
        try {
            await fetch(`/api/applications/${applicationId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: newComment.text }),
            });
        } catch {}
    }

    function openReplyBox(commentId: number | string) {
        setReplyTo(commentId);
        setReplyText('');
    }
    function cancelReply() {
        setReplyTo(null);
        setReplyText('');
    }

    async function submitReply(parentId: number | string) {
        if (!replyText.trim() || !applicationId) return;
        const newReply: Reply = {
            id: `local-reply-${Date.now()}`,
            authorName: CURRENT_USER_NAME,
            authorAvatar: '/placeholder-headshot.png',
            text: replyText.trim(),
            createdAt: new Date().toISOString(),
        };
        setComments((prev) =>
            prev.map((c) =>
                String(c.id) === String(parentId)
                    ? { ...c, replies: [...(c.replies ?? []), newReply] }
                    : c
            )
        );
        setReplyText('');
        setReplyTo(null);
        try {
            await fetch(`/api/applications/${applicationId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: newReply.text, parentId }),
            });
        } catch {}
    }

    function openMenuForComment(commentId: number | string) {
        setMenuOpenId(`c:${commentId}`);
    }
    function openMenuForReply(parentId: number | string, replyId: number | string) {
        setMenuOpenId(`r:${parentId}:${replyId}`);
    }

    // delete comment
    async function deleteComment(commentId: number | string) {
        if (!applicationId) return;
        if (!confirm('Delete this comment?')) return;
        setComments((prev) => prev.filter((c) => String(c.id) !== String(commentId)));
        setMenuOpenId(null);
        try {
            await fetch(`/api/applications/${applicationId}/comments/${commentId}`, {
                method: 'DELETE',
            });
        } catch {}
    }

    // delete reply
    async function deleteReply(parentId: number | string, replyId: number | string) {
        if (!applicationId) return;
        if (!confirm('Delete this reply?')) return;
        setComments((prev) =>
            prev.map((c) =>
                String(c.id) === String(parentId)
                    ? { ...c, replies: (c.replies ?? []).filter((r) => String(r.id) !== String(replyId)) }
                    : c
            )
        );
        setMenuOpenId(null);
        try {
            await fetch(`/api/applications/${applicationId}/comments/${replyId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ parentId }),
            });
        } catch {}
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Comments</div>

            <textarea
                placeholder="Write a comment..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                style={{
                    width: '100%',
                    minHeight: 72,
                    borderRadius: 6,
                    padding: 8,
                    border: '1px solid #e6eaf0',
                    resize: 'none',
                }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8, marginBottom: 12 }}>
                <button
                    onClick={post}
                    disabled={!text.trim()}
                    style={{
                        background: text.trim() ? '#0366d6' : '#d1d5db',
                        color: '#fff',
                        border: 'none',
                        padding: '8px 12px',
                        borderRadius: 8,
                        cursor: text.trim() ? 'pointer' : 'default',
                    }}
                >
                    Post Comment
                </button>
            </div>

            <div style={{ overflowY: 'auto', flex: 1 }}>
                {comments.length === 0 ? (
                    <div style={{ color: '#666' }}>No comments yet</div>
                ) : (
                    comments.map((c) => (
                        <div key={c.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 14 }}>
                            <img
                                src={c.authorAvatar ?? '/placeholder-headshot.png'}
                                alt={c.authorName}
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                    border: '1px solid #e9eef4',
                                    background: '#f6f8fb',
                                }}
                            />
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                    <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                                        <div style={{ fontWeight: 700 }}>{c.authorName}</div>
                                        <div style={{ fontSize: 12, color: '#9aa6b8' }}>
                                            {c.createdAt ? new Date(c.createdAt).toLocaleString() : ''}
                                        </div>
                                    </div>

                                    {String(c.authorName) === String(CURRENT_USER_NAME) && (
                                        <div style={{ position: 'relative' }}>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openMenuForComment(c.id);
                                                }}
                                                style={{
                                                    border: 'none',
                                                    background: 'transparent',
                                                    cursor: 'pointer',
                                                    padding: '4px 8px',
                                                    fontSize: 18,
                                                    color: '#6b7280',
                                                }}
                                            >
                                                ⋯
                                            </button>

                                            {menuOpenId === `c:${c.id}` && (
                                                <div
                                                    ref={(el) => {
                                                        const key = `c:${c.id}`;
                                                        if (el) menusRef.current[key] = el;
                                                        else delete menusRef.current[key];
                                                    }}
                                                    style={{
                                                        position: 'absolute',
                                                        right: 0,
                                                        top: 28,
                                                        background: '#fff',
                                                        border: '1px solid rgba(0,0,0,0.08)',
                                                        borderRadius: 8,
                                                        boxShadow: '0 8px 24px rgba(6,25,40,0.12)',
                                                        zIndex: 60,
                                                        minWidth: 120,
                                                    }}
                                                >
                                                    <button
                                                        onClick={() => deleteComment(c.id)}
                                                        style={{
                                                            width: '100%',
                                                            textAlign: 'left',
                                                            padding: '8px 12px',
                                                            background: 'transparent',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            color: '#e04836',
                                                        }}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div
                                    style={{
                                        marginTop: 6,
                                        borderRadius: 10,
                                        border: '1px solid #eef2f6',
                                        padding: 10,
                                        background: '#fbfdff',
                                    }}
                                >
                                    {c.text}
                                </div>

                                <div style={{ marginTop: 8 }}>
                                    <button
                                        onClick={() => openReplyBox(c.id)}
                                        style={{
                                            background: 'transparent',
                                            border: '1px solid #e6eef7',
                                            padding: '6px 10px',
                                            borderRadius: 8,
                                            cursor: 'pointer',
                                            color: '#0366d6',
                                        }}
                                    >
                                        Reply
                                    </button>
                                </div>

                                {String(replyTo) === String(c.id) && (
                                    <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                                        <input
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            placeholder="Write a reply..."
                                            style={{
                                                flex: 1,
                                                height: 36,
                                                padding: '6px 10px',
                                                borderRadius: 8,
                                                border: '1px solid #e6eaf0',
                                            }}
                                        />
                                        <button
                                            onClick={() => submitReply(c.id)}
                                            disabled={!replyText.trim()}
                                            style={{
                                                background: replyText.trim() ? '#0366d6' : '#d1d5db',
                                                color: '#fff',
                                                border: 'none',
                                                padding: '6px 10px',
                                                borderRadius: 8,
                                                cursor: replyText.trim() ? 'pointer' : 'default',
                                            }}
                                        >
                                            Reply
                                        </button>
                                        <button
                                            onClick={cancelReply}
                                            style={{
                                                background: 'transparent',
                                                border: 'none',
                                                color: '#6b7280',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                )}

                                {(c.replies ?? []).map((r) => (
                                    <div key={r.id} style={{ marginTop: 10, display: 'flex', gap: 10 }}>
                                        <div style={{ width: 40 }} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 700, fontSize: 13 }}>{r.authorName}</div>
                                            <div
                                                style={{
                                                    marginTop: 6,
                                                    borderRadius: 10,
                                                    border: '1px solid #eef2f6',
                                                    padding: 10,
                                                    background: '#fff',
                                                }}
                                            >
                                                {r.text}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
