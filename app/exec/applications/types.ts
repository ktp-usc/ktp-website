// shared application type for the exec application viewer
import type { applicationStatus } from '@prisma/client';

export type ApplicationResponseItem = {
    question?: string;
    answer?: string | number | boolean | null;
};

export type ApplicationResponses =
    | Record<string, string | number | boolean | null>
    | ApplicationResponseItem[];

export type Application = {
    id: string | number;

    fullName: string;
    preferred_first_name?: string | null;

    email: string;
    phone: string;
    classification: string;
    gpa: string;

    submittedAt: Date;
    
    extenuating?: string | null;
    major: string;
    minor?: string | null;
    hometown?: string | null;

    resumeUrl: string;
    headshotUrl: string;

    linkedin?: string | null;
    github?: string | null;

    responses?: ApplicationResponses;

    rushEvents?: string[];
    status?: applicationStatus;
};
