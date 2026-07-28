import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/guards";

// GET — fetch all reviews
export async function GET() {
    try {
        const reviews = await prisma.career_reviews.findMany({
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json({ reviews });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
    }
}

// POST — submit a new review
export async function POST(req: NextRequest) {
    try {
        const authed = await requireUser();
        if ("response" in authed) return authed.response;

        const account = await prisma.accounts.findUnique({
            where: { id: authed.user.id },
        });

        if (!account) {
            return NextResponse.json({ error: "Account not found" }, { status: 404 });
        }

        const body = await req.json();
        const {
            company, role, location, appTimeline,
            interviewQuestions, technicalDetails, canRefer,
            pros, cons, advice,
        } = body;

        const review = await prisma.career_reviews.create({
            data: {
                authorId: account.id,
                authorName: `${account.firstName} ${account.lastName}`,
                company,
                role,
                location,
                appTimeline,
                interviewQs: interviewQuestions
                    .split("\n")
                    .map((q: string) => q.trim())
                    .filter(Boolean),
                technicalDetails,
                canRefer: canRefer ?? false,
                pros,
                cons,
                advice,
            },
        });

        return NextResponse.json({ review });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to save review" }, { status: 500 });
    }
}