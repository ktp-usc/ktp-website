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

//replace with current user
const CURRENT_USER_NAME = 'You';

export default function CommentsSidebar({ applicationId }: { applicationId?: number | string }) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [text, setText] = useState('');

    const [replyTo, setReplyTo] = useState<number | string | null>(null);
    const [replyText, setReplyText] = useState('');

    const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

    const menusRef = useRef<Map<string, HTMLDivElement | null>>(new Map());

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
            .catch(() => setComments([]));
    }, [applicationId]);

    useEffect(() => {
        function onDocClick(e: Event) {
            const openId = menuOpenId;
            if (!openId) return;
            const el = menusRef.current.get(openId) ?? null;
            if (!el) {
                setMenuOpenId(null);
                return;
            }
            const target = e.target as Node | null;
            if (!target || !el.contains(target)) setMenuOpenId(null);
        }
        document.addEventListener('click', onDocClick);
        return () => document.removeEventListener('click', onDocClick);
    }, [menuOpenId]);

    async function post() {
        if (!text.trim()) return;
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
        } catch (e) {
            console.error('post comment failed', e);
        }
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
        if (!replyText.trim()) return;
        const newReply: Reply = {
            id: `local-reply-${Date.now()}`,
            authorName: CURRENT_USER_NAME,
            authorAvatar: '/placeholder-headshot.png',
            text: replyText.trim(),
            createdAt: new Date().toISOString(),
        };
        setComments((prev) =>
            prev.map((c) => (String(c.id) === String(parentId) ? { ...c, replies: [...(c.replies ?? []), newReply] } : c))
        );
        setReplyText('');
        setReplyTo(null);
        try {
            await fetch(`/api/applications/${applicationId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: newReply.text, parentId }),
            });
        } catch (e) {
            console.error('post reply failed', e);
        }
    }

    function openMenuForComment(commentId: number | string) {
        setMenuOpenId(`c:${commentId}`);
    }
    function openMenuForReply(parentId: number | string, replyId: number | string) {
        setMenuOpenId(`r:${parentId}:${replyId}`);
    }

    async function deleteComment(commentId: number | string) {
        if (!confirm('Delete this comment?')) return;
        setComments((prev) => prev.filter((c) => String(c.id) !== String(commentId)));
        setMenuOpenId(null);
        try {
            await fetch(`/api/applications/${applicationId}/comments/${commentId}`, { method: 'DELETE' });
        } catch (e) {
            console.error('delete comment failed', e);
        }
    }

    async function deleteReply(parentId: number | string, replyId: number | string) {
        if (!confirm('Delete this reply?')) return;
        setComments((prev) =>
            prev.map((c) =>
                String(c.id) === String(parentId) ? { ...c, replies: (c.replies ?? []).filter((r) => String(r.id) !== String(replyId)) } : c
            )
        );
        setMenuOpenId(null);
        try {
            await fetch(`/api/applications/${applicationId}/comments/${replyId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ parentId }),
            });
        } catch (e) {
            console.error('delete reply failed', e);
        }
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
                    style={
                        text.trim()
                            ? {
                                background: '#0366d6',
                                color: '#fff',
                                border: 'none',
                                padding: '8px 12px',
                                borderRadius: 8,
                                cursor: 'pointer',
                                transition: 'transform .12s',
                            }
                            : {
                                background: '#d1d5db',
                                color: '#fff',
                                border: 'none',
                                padding: '8px 12px',
                                borderRadius: 8,
                                cursor: 'default',
                            }
                    }
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
                                        <div style={{ fontSize: 12, color: '#9aa6b8' }}>{c.createdAt ? new Date(c.createdAt).toLocaleString() : ''}</div>
                                    </div>

                                    <div style={{ position: 'relative' }}>
                                        {String(c.authorName) === String(CURRENT_USER_NAME) && (
                                            <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                                                <button
                                                    aria-label="Open menu"
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
                                                            if (el) menusRef.current.set(key, el);
                                                            else menusRef.current.delete(key);
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
                                                            overflow: 'hidden',
                                                        }}
                                                    >
                                                        <button
                                                            onClick={() => deleteComment(c.id)}
                                                            style={{
                                                                display: 'block',
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
                                </div>

                                <div style={{ marginTop: 6, borderRadius: 10, border: '1px solid #eef2f6', padding: 10, background: '#fbfdff', color: '#222' }}>
                                    {c.text}
                                </div>

                                <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
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
                                    <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
                                        <input
                                            autoFocus
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    submitReply(c.id);
                                                } else if (e.key === 'Escape') {
                                                    cancelReply();
                                                }
                                            }}
                                            placeholder="Write a reply..."
                                            style={{
                                                flex: 1,
                                                height: 36,
                                                padding: '6px 10px',
                                                borderRadius: 8,
                                                border: '1px solid #e6eaf0',
                                                outline: 'none',
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
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                                <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                                                    <div style={{ fontWeight: 700, fontSize: 13 }}>{r.authorName}</div>
                                                    <div style={{ fontSize: 12, color: '#9aa6b8' }}>{r.createdAt ? new Date(r.createdAt).toLocaleString() : ''}</div>
                                                </div>

                                                <div style={{ position: 'relative' }}>
                                                    {String(r.authorName) === String(CURRENT_USER_NAME) && (
                                                        <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                                                            <button
                                                                aria-label="Open menu"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    openMenuForReply(c.id, r.id);
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

                                                            {menuOpenId === `r:${c.id}:${r.id}` && (
                                                                <div
                                                                    ref={(el) => {
                                                                        const key = `r:${c.id}:${r.id}`;
                                                                        if (el) menusRef.current.set(key, el);
                                                                        else menusRef.current.delete(key);
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
                                                                        overflow: 'hidden',
                                                                    }}
                                                                >
                                                                    <button
                                                                        onClick={() => deleteReply(c.id, r.id)}
                                                                        style={{
                                                                            display: 'block',
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
                                            </div>

                                            <div style={{ marginTop: 6, borderRadius: 10, border: '1px solid #eef2f6', padding: 10, background: '#fff', color: '#222' }}>
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
