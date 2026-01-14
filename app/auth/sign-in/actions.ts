'use server';

import { redirect } from 'next/navigation';
import { authServer } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma';
import { type as AccountType } from '@prisma/client';

type SignInState = { error?: string };

function isValidScEduEmail(email: string): boolean {
    const lower = email.toLowerCase().trim();
    const parts = lower.split('@');
    if (parts.length !== 2) return false;
    return parts[1].endsWith('sc.edu');
}

function splitName(fullName: string): { firstName: string; lastName: string } {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return { firstName: 'john', lastName: 'smith' };
    if (parts.length === 1) return { firstName: parts[0], lastName: 'smith' };
    return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
}

export async function signInWithEmail(_prevState: SignInState | null, formData: FormData): Promise<SignInState> {
    const email = String(formData.get('email') || '').trim();
    const password = String(formData.get('password') || '');
    const callbackURL = String(formData.get('callbackURL') || '/portal');

    if (!email) return { error: 'Please enter your email.' };
    if (!password) return { error: 'Please enter your password.' };

    if (!isValidScEduEmail(email)) return { error: 'Please use a valid USC email address.' };

    const result = await authServer.signIn.email({
        email,
        password,
        callbackURL
    });

    if (result.error) return { error: result.error.message };

    // ensure the matching row exists in public.accounts
    try {
        const session = await authServer.getSession();
        const user = session?.data?.user;

        if (user?.id) {
            const { firstName, lastName } = splitName(user.name ?? '');

            await prisma.accounts.upsert({
                where: { id: user.id },
                create: {
                    id: user.id,
                    firstName,
                    lastName,
                    majors: [],
                    minors: [],
                    schoolEmail: user.email ?? email,
                    personalEmail: user.email ?? email,
                    type: AccountType.APPLICANT,
                    isNew: true
                },
                update: {
                    // do not overwrite names/type if they already exist,
                    // but keep emails in sync if they're missing
                    schoolEmail: user.email ?? email,
                    personalEmail: user.email ?? email
                }
            });
        }
    } catch (e) {
        console.error('failed to upsert accounts row after sign-in', { email, e });
        // don't block sign-in; let them in, and you can handle missing account row elsewhere if needed
    }

    redirect(callbackURL);
}
