import { NextRequest, NextResponse } from 'next/server';
import { authServer } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma';
import { type as AccountType, gradSemester } from '@prisma/client';
import { put } from '@vercel/blob';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isValidScEduEmail(email: string): boolean {
    const lower = email.toLowerCase().trim();
    const parts = lower.split('@');
    if (parts.length !== 2) return false;
    return parts[1].endsWith('sc.edu');
}

function passwordMeetsRequirements(password: string): boolean {
    if (password.length < 8) return false;
    if (!/[A-Z]/.test(password)) return false;
    if (!/[a-z]/.test(password)) return false;
    if (!/[0-9]/.test(password)) return false;
    return true;
}

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();

        const firstName = (formData.get('firstName') as string)?.trim();
        const lastName = (formData.get('lastName') as string)?.trim();
        const email = (formData.get('email') as string)?.trim();
        const password = formData.get('password') as string;
        const phone = (formData.get('phone') as string)?.trim();
        const gradYear = parseInt((formData.get('gradYear') as string)?.trim(), 10);
        const gradSemesterValue = formData.get('gradSemester') as string;
        const pledgeClass = (formData.get('pledgeClass') as string)?.trim();
        const major = (formData.get('major') as string)?.trim();
        const minor = (formData.get('minor') as string)?.trim() || null;
        const hometown = (formData.get('hometown') as string)?.trim() || null;
        const linkedin = (formData.get('linkedin') as string)?.trim() || null;
        const github = (formData.get('github') as string)?.trim() || null;

        const photo = formData.get('photo') as File;
        const resume = formData.get('resume') as File;

        // Validate required fields
        if (!firstName || !lastName || !email || !password) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (!isValidScEduEmail(email)) {
            return NextResponse.json({ error: 'Please use a valid USC email address' }, { status: 400 });
        }

        if (!passwordMeetsRequirements(password)) {
            return NextResponse.json({ error: 'Password does not meet requirements' }, { status: 400 });
        }

        // Check if email already exists
        const existingAccount = await prisma.accounts.findFirst({
            where: {
                OR: [
                    { schoolEmail: email },
                    { personalEmail: email }
                ]
            }
        });

        if (existingAccount) {
            return NextResponse.json({ error: 'An account with this email already exists' }, { status: 400 });
        }

        // Create neon auth user
        const result = await authServer.signUp.email({
            email,
            password,
            name: `${firstName} ${lastName}`,
        });

        if (result.error) {
            return NextResponse.json({ error: result.error.message }, { status: 400 });
        }

        const userId = result.data?.user?.id;
        if (!userId) {
            return NextResponse.json({ error: 'Account created but user id was missing' }, { status: 500 });
        }

        // Upload photo to blob storage
        let headshotUrl: string | null = null;
        if (photo && photo.size > 0) {
            const photoBlob = await put(`headshots/${userId}-${Date.now()}.jpg`, photo, {
                access: 'public',
                contentType: 'image/jpeg',
            });
            headshotUrl = photoBlob.url;
        }

        // Upload resume to blob storage
        let resumeUrl: string | null = null;
        if (resume && resume.size > 0) {
            const resumeBlob = await put(`resumes/${userId}-${Date.now()}.pdf`, resume, {
                access: 'public',
                contentType: 'application/pdf',
            });
            resumeUrl = resumeBlob.url;
        }

        // Parse gradSemester enum
        const gradSem = gradSemesterValue === 'FALL' ? gradSemester.FALL : gradSemester.SPRING;

        // Create account in database
        await prisma.accounts.create({
            data: {
                id: userId,
                firstName,
                lastName,
                majors: major ? [major] : [],
                minors: minor ? [minor] : [],
                schoolEmail: email,
                personalEmail: email,
                type: AccountType.BROTHER,
                phoneNum: phone || null,
                gradYear: isNaN(gradYear) ? null : gradYear,
                gradSemester: gradSem,
                pledgeClass: pledgeClass || 'n/a',
                hometown,
                linkedin,
                github,
                headshotBlobURL: headshotUrl,
                resumeBlobURL: resumeUrl,
                isNew: true,
            }
        });

        return NextResponse.json({ success: true, userId });
    } catch (error) {
        console.error('Brother signup error:', error);
        return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
    }
}
