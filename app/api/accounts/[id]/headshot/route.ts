import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Ctx = {
    params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: Ctx) {
    const { id } = await params;

    if (!id) {
        return NextResponse.json({ headshotBlobURL: null }, { status: 400 });
    }

    const account = await prisma.accounts.findUnique({
        where: { id },
        select: { headshotBlobURL: true }
    });

    return NextResponse.json({ headshotBlobURL: account?.headshotBlobURL ?? null });
}