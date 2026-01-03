// shared application type for the exec application viewer
export type Application = {
    id: string | number;
    full_name: string;                 // required
    preferred_first_name?: string | null;
    email: string;                     // required
    phone: string;                     // required
    year: string;                      // required dropdown
    gpa: string;                       // required
    extenuating?: string | null;       // optional
    major: string;                     // required
    minor?: string | null;             // optional
    hometown?: string | null;          // optional
    headshot_url: string;              // required
    resume_url: string;                // required (pdf)
    linkedin?: string | null;          // optional
    github?: string | null;            // optional
    responses?: Record<string, any> | Array<{ question?: string; answer?: string }>;
    rushEvents?: string[];             // attended rush events
    status?: number;
};
