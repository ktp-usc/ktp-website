import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
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
        console.error("GET /api/career/reviews failed:", error);

        return NextResponse.json(
            { error: "Failed to fetch reviews" },
            { status: 500 }
        );
    }
}

// POST — submit a new review
export async function POST(req: NextRequest) {
    try {
        const authed = await requireUser();

        if ("response" in authed) {
            return authed.response;
        }

        const account = await prisma.accounts.findUnique({
            where: { id: authed.user.id },
        });

        if (!account) {
            return NextResponse.json(
                { error: "Account not found" },
                { status: 404 }
            );
        }

        const body = await req.json();

        console.log("Incoming request body:", body);

        const {
            company,
            role,
            location,
            appTimeline,
            interviewQuestions,
            technicalDetails,
            canRefer,
            pros,
            cons,
            advice,
        } = body;

        // Confirm the schema used by the current database connection.
        const schemaCheck = await prisma.$queryRaw<
            Array<{
                column_name: string;
                is_nullable: string;
                column_default: string | null;
            }>
        >`
            SELECT
                column_name::text AS column_name,
                is_nullable::text AS is_nullable,
                column_default::text AS column_default
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'career_reviews'
            ORDER BY ordinal_position
        `;

        console.log("Production career_reviews schema:", schemaCheck);

        const reviewData = {
            authorId: account.id,

            authorName:
                [account.firstName, account.lastName]
                    .filter(Boolean)
                    .join(" ")
                    .trim() || null,

            company:
                typeof company === "string"
                    ? company.trim() || null
                    : null,

            role:
                typeof role === "string"
                    ? role.trim() || null
                    : null,

            location:
                typeof location === "string"
                    ? location.trim() || null
                    : null,

            appTimeline:
                typeof appTimeline === "string"
                    ? appTimeline.trim() || null
                    : null,

            interviewQs:
                typeof interviewQuestions === "string"
                    ? interviewQuestions
                          .split("\n")
                          .map((question: string) => question.trim())
                          .filter(Boolean)
                    : [],

            technicalDetails:
                typeof technicalDetails === "string"
                    ? technicalDetails.trim() || null
                    : null,

            canRefer:
                typeof canRefer === "boolean"
                    ? canRefer
                    : false,

            pros:
                typeof pros === "string"
                    ? pros.trim() || null
                    : null,

            cons:
                typeof cons === "string"
                    ? cons.trim() || null
                    : null,

            advice:
                typeof advice === "string"
                    ? advice.trim() || null
                    : null,
        };

        console.log("Career review data:", reviewData);

        const review = await prisma.career_reviews.create({
            data: reviewData,
        });

        console.log("Created career review:", {
            id: review.id,
            authorId: review.authorId,
        });

        return NextResponse.json(
            { review },
            { status: 201 }
        );
    } catch (error) {
        console.error("POST /api/career/reviews failed:");

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            console.error({
                name: error.name,
                code: error.code,
                meta: error.meta,
                message: error.message,
            });
        } else if (error instanceof Error) {
            console.error({
                name: error.name,
                message: error.message,
                stack: error.stack,
            });
        } else {
            console.error(error);
        }

        return NextResponse.json(
            {
                error: "Failed to save review",
                details:
                    process.env.NODE_ENV === "development" &&
                    error instanceof Error
                        ? error.message
                        : undefined,
            },
            { status: 500 }
        );
    }
}