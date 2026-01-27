import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const email = searchParams.get('email')?.trim();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // Check if email exists in accounts table
        const existingAccount = await prisma.accounts.findFirst({
            where: {
                OR: [
                    { schoolEmail: email },
                    { personalEmail: email }
                ]
            }
        });

        return NextResponse.json({ exists: !!existingAccount });
    } catch (error) {
        console.error('Check email error:', error);
        return NextResponse.json({ error: 'Failed to check email' }, { status: 500 });
    }
}
