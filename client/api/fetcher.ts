export async function fetchJson<T>(input: string, init?: RequestInit): Promise<T> {
    const res = await fetch(input, {
        credentials: 'include',
        headers: { 'content-type': 'application/json', ...(init?.headers ?? {}) },
        ...init
    });

    const text = await res.text();
    const json = text ? JSON.parse(text) : null;

    if (!res.ok) {
        const message = json?.error ?? `request_failed_${res.status}`;
        throw new Error(message);
    }

    return (json?.data ?? json) as T;
}
