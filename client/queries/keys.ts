export const qk = {
    session: ['session'] as const,

    myAccount: ['accounts', 'me'] as const,
    myApplication: ['applications', 'me'] as const,

    applications: (filters: Record<string, unknown>) => ['applications', filters] as const,
    application: (id: string) => ['applications', id] as const,

    accounts: (filters: Record<string, unknown>) => ['accounts', filters] as const,
    account: (id: string) => ['accounts', id] as const,

    activeVote: ['votes', 'active'] as const,
    voteEligibility: (id: string) => ['votes', id, 'eligibility'] as const,
    voteResults: (id: string) => ['votes', id, 'results'] as const,
    voteHistory: ['votes', 'history'] as const
};
