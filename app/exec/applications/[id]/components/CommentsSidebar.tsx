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

/** === Helpers: runtime validators / normalizers === **/

function isObject(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null;
}

function asString(x: unknown): string | undefined {
  if (typeof x === 'string') return x;
  if (typeof x === 'number' || typeof x === 'boolean') return String(x);
  return undefined;
}

function isId(x: unknown): x is string | number {
  return typeof x === 'string' || typeof x === 'number';
}

function normalizeReply(raw: unknown): Reply | null {
  if (!isObject(raw)) return null;

  const idRaw = raw.id ?? raw['Id'] ?? raw['ID'];
  const text = asString(raw['text'] ?? raw['body'] ?? raw['comment']);
  const authorName = asString(raw['authorName'] ?? raw['name'] ?? raw['commenter']) ?? 'Unknown';
  const authorAvatar = asString(raw['authorAvatar'] ?? raw['avatar']) ?? null;
  const createdAt = asString(raw['createdAt'] ?? raw['created_at'] ?? raw['timestamp']) ?? undefined;

  // Narrow id to string | number and require text
  if (!isId(idRaw) || typeof text === 'undefined') return null;

  return {
    id: idRaw,
    text,
    authorName,
    authorAvatar,
    createdAt,
  };
}

function normalizeComment(raw: unknown): Comment | null {
  if (!isObject(raw)) return null;

  const idRaw = raw['id'] ?? raw['Id'] ?? raw['ID'];
  const text = asString(raw['text'] ?? raw['body'] ?? raw['comment']);
  const authorName = asString(raw['authorName'] ?? raw['name'] ?? raw['commenter']) ?? 'Unknown';
  const authorAvatar = asString(raw['authorAvatar'] ?? raw['avatar']) ?? null;
  const createdAt = asString(raw['createdAt'] ?? raw['created_at'] ?? raw['timestamp']) ?? undefined;

  if (!isId(idRaw) || typeof text === 'undefined') return null;

  // normalize replies array if present
  const repliesRaw = raw['replies'] ?? raw['children'] ?? raw['replies_list'];
  const replies: Reply[] = Array.isArray(repliesRaw)
    ? repliesRaw.map(normalizeReply).filter((r): r is Reply => r !== null)
    : [];

  return {
    id: idRaw,
    text,
    authorName,
    authorAvatar,
    createdAt,
    replies,
  };
}

/** === Component === **/

export default function CommentsSidebar({
  applicationId,
  refreshKey,
}: {
  applicationId?: number | string;
  refreshKey?: number;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState('');
  const [currentUserName, setCurrentUserName] = useState('You');
  const [currentUserAvatar, setCurrentUserAvatar] = useState<string | null>(null);

  const [replyTo, setReplyTo] = useState<number | string | null>(null);
  const [replyText, setReplyText] = useState('');

  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const menusRef = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    async function loadAccount() {
      try {
        const res = await fetch('/api/accounts/me');
        if (!res.ok) return;
        const payload = await res.json();
        const data = payload?.data ?? payload;
        const first = (data?.firstName ?? '').toString().trim();
        const last = (data?.lastName ?? '').toString().trim();
        const full = `${first} ${last}`.trim();
        if (full) setCurrentUserName(full);
        const avatar =
          (data?.headshotBlobURL ?? data?.headshotBlobUrl ?? '').toString().trim() || null;
        if (avatar) setCurrentUserAvatar(avatar);
      } catch {
        // keep defaults
      }
    }
    loadAccount();
  }, []);

  function applyCurrentUserAvatar(list: Comment[]) {
    if (!currentUserAvatar) return list;
    return list.map((comment) => {
      const authorAvatar =
        comment.authorName === currentUserName
          ? comment.authorAvatar ?? currentUserAvatar
          : comment.authorAvatar;
      const replies = (comment.replies ?? []).map((reply) => ({
        ...reply,
        authorAvatar:
          reply.authorName === currentUserName
            ? reply.authorAvatar ?? currentUserAvatar
            : reply.authorAvatar,
      }));
      return { ...comment, authorAvatar, replies };
    });
  }

  // load comments
  useEffect(() => {
    if (!applicationId) return;

    let cancelled = false;

    async function loadComments() {
      try {
        const url = `/api/applications/${encodeURIComponent(String(applicationId))}/comments`;
        const res = await fetch(url);
        if (!res.ok) {
          if (!cancelled) setComments([]);
          return;
        }

        const j: unknown = await res.json();

        // server might return:
        //  - an array: [...]
        //  - an object with `comments` array: { comments: [...] }
        //  - an object with `data` array: { data: [...] }
        let data: unknown[] = [];

        if (Array.isArray(j)) {
          data = j;
        } else if (isObject(j)) {
          const maybeComments = j['comments'];
          const maybeData = j['data'];
          if (Array.isArray(maybeComments)) data = maybeComments;
          else if (Array.isArray(maybeData)) data = maybeData;
          else data = [];
        }

        const normalized: Comment[] = data
          .map((c) => normalizeComment(c))
          .filter((c): c is Comment => c !== null);

        if (!cancelled) {
          const withAvatar = applyCurrentUserAvatar(normalized);
          setComments(withAvatar.slice().reverse());
        }
      } catch {
        if (!cancelled) setComments([]);
      }
    }

    loadComments();
    return () => {
      cancelled = true;
    };
  }, [applicationId, refreshKey]);

  useEffect(() => {
    if (!currentUserAvatar) return;
    setComments((prev) => applyCurrentUserAvatar(prev));
  }, [currentUserAvatar, currentUserName]);

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
      authorName: currentUserName,
      authorAvatar: currentUserAvatar ?? '/placeholder-headshot.png',
      text: text.trim(),
      createdAt: new Date().toISOString(),
      replies: [],
    };
    setComments((c) => [newComment, ...c]);
    setText('');
    try {
      await fetch(`/api/applications/${encodeURIComponent(String(applicationId))}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newComment.text, commenter: currentUserName }),
      });
    } catch {
      // silently ignore network errors (already optimistic)
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
    if (!replyText.trim() || !applicationId) return;
    const newReply: Reply = {
      id: `local-reply-${Date.now()}`,
      authorName: currentUserName,
      authorAvatar: currentUserAvatar ?? '/placeholder-headshot.png',
      text: replyText.trim(),
      createdAt: new Date().toISOString(),
    };
    setComments((prev) =>
      prev.map((c) => (c.id == parentId ? { ...c, replies: [...(c.replies ?? []), newReply] } : c))
    );
    setReplyText('');
    setReplyTo(null);
    try {
      await fetch(`/api/applications/${encodeURIComponent(String(applicationId))}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newReply.text, parentId, commenter: currentUserName }),
      });
    } catch {
      // ignore
    }
  }

  function openMenuForComment(commentId: number | string) {
    setMenuOpenId(`c:${commentId}`);
  }

  async function deleteComment(commentId: number | string) {
    if (!applicationId) return;
    if (!confirm('Delete this comment?')) return;
    setComments((prev) => prev.filter((c) => c.id != commentId));
    setMenuOpenId(null);
    try {
      await fetch(
        `/api/applications/${encodeURIComponent(String(applicationId))}/comments/${encodeURIComponent(String(commentId))}`,
        {
          method: 'DELETE',
        }
      );
    } catch {}
  }

  async function deleteReply(parentId: number | string, replyId: number | string) {
    if (!applicationId) return;
    if (!confirm('Delete this reply?')) return;

    setComments((prev) =>
      prev.map((c) => (c.id == parentId ? { ...c, replies: (c.replies ?? []).filter((r) => r.id != replyId) } : c))
    );

    setMenuOpenId(null);
    try {
      await fetch(
        `/api/applications/${encodeURIComponent(String(applicationId))}/comments/${encodeURIComponent(String(replyId))}`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ parentId }),
        }
      );
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
            <div key={String(c.id)} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 14 }}>
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

                  {c.authorName == currentUserName && (
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

                {replyTo == c.id && (
                  <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <input
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write a reply..."
                      style={{
                        flex: '1 1 160px',
                        height: 36,
                        padding: '6px 10px',
                        borderRadius: 8,
                        border: '1px solid #e6eaf0',
                        minWidth: 120,
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
                      aria-label="Cancel reply"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#6b7280',
                        cursor: 'pointer',
                        fontSize: 18,
                        lineHeight: '1',
                        padding: '4px 8px',
                      }}
                    >
                      ✕
                    </button>
                  </div>
                )}

                {(c.replies ?? []).map((r) => (
                  <div key={String(r.id)} style={{ marginTop: 10, display: 'flex', gap: 10 }}>
                    <div style={{ width: 40 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                          <div style={{ fontWeight: 700, fontSize: 13 }}>{r.authorName}</div>
                          <div style={{ fontSize: 12, color: '#9aa6b8' }}>
                            {r.createdAt ? new Date(r.createdAt).toLocaleString() : ''}
                          </div>
                        </div>

                        {r.authorName == currentUserName && (
                          <div style={{ position: 'relative' }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setMenuOpenId(`r:${c.id}:${r.id}`);
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
                                  onClick={() => deleteReply(c.id, r.id)}
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
