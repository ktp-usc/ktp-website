import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireFeature } from "@/lib/auth/guards";
import { hasExecAccess } from "@/lib/auth/roles";

// DELETE a review
export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const authed = await requireFeature("career");
        if ("response" in authed) return authed.response;

        const account = await prisma.accounts.findUnique({
            where: { id: authed.user.id },
        });

        if (!account) {
            return NextResponse.json({ error: "Account not found" }, { status: 404 });
        }

        const review = await prisma.career_reviews.findUnique({
            where: { id },
        });

        if (!review) {
            return NextResponse.json({ error: "Review not found" }, { status: 404 });
        }

        const isOwner = review.authorId === account.id;
        const isExec = hasExecAccess(account.type);

        if (!isOwner && !isExec) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        await prisma.career_reviews.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
    }
}

// PATCH — edit a review
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const authed = await requireFeature("career");
        if ("response" in authed) return authed.response;

        const account = await prisma.accounts.findUnique({
            where: { id: authed.user.id },
        });

        if (!account) {
            return NextResponse.json({ error: "Account not found" }, { status: 404 });
        }

        const review = await prisma.career_reviews.findUnique({
            where: { id },
        });

        if (!review) {
            return NextResponse.json({ error: "Review not found" }, { status: 404 });
        }

        const isOwner = review.authorId === account.id;
        const isExec = hasExecAccess(account.type);

        if (!isOwner && !isExec) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await req.json();
        const updated = await prisma.career_reviews.update({
            where: { id },
            data: {
                company: body.company,
                role: body.role,
                location: body.location,
                appTimeline: body.appTimeline,
                interviewQs: body.interviewQuestions
                    .split("\n")
                    .map((q: string) => q.trim())
                    .filter(Boolean),
                technicalDetails: body.technicalDetails,
                canRefer: body.canRefer ?? false,
                pros: body.pros,
                cons: body.cons,
                advice: body.advice,
            },
        });

        return NextResponse.json({ review: updated });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
    }
}