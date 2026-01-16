import { NextResponse } from 'next/server';

export function ok(data: unknown, init?: ResponseInit) {
    return NextResponse.json({ data }, { status: 200, ...init });
}
export function created(data: unknown) {
    return NextResponse.json({ data }, { status: 201 });
}
export function badRequest(message: string, details?: unknown) {
    return NextResponse.json({ error: message, details }, { status: 400 });
}
export function serverError(message = 'server_error') {
    return NextResponse.json({ error: message }, { status: 500 });
}
