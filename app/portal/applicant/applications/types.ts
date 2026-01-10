// shared application type for the exec application viewer

export type ApplicationResponseItem = {
    question?: string;
    answer?: string | number | boolean | null;
};

export type ApplicationResponses =
    | Record<string, string | number | boolean | null>
    | ApplicationResponseItem[];

export type Application = {
    id: string | number;

    full_name: string;
    preferred_first_name?: string | null;

    email: string;
    phone: string;
    year: string;
    gpa: string;

    extenuating?: string | null;
    major: string;
    minor?: string | null;
    hometown?: string | null;

    headshot_url: string;
    resume_url: string;

    linkedin?: string | null;
    github?: string | null;

    responses?: ApplicationResponses;

    rushEvents?: string[];
    status?: number;
};
