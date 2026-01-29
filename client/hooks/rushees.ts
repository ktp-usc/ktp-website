import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchJson } from '@/client/api/jsonutils';

export type RusheeItem = {
    accountId: string;
    applicationId: string | null;
    fullName: string;
    status: string;
    userId: string;
    headshotUrl: string | null;
    myComment: { id: string; body: string; createdAt: string } | null;
};

type RusheesResponse = { items: RusheeItem[]; commenter: string };

export function useRusheesQuery(enabled = true) {
    return useQuery({
        queryKey: ['rushees'],
        queryFn: () => fetchJson<RusheesResponse>('/api/rushees'),
        enabled,
        staleTime: 0,
        gcTime: 0,
        refetchOnMount: 'always',
        refetchOnWindowFocus: true,
        refetchOnReconnect: true
    });
}

export function useUpsertRusheeCommentMutation() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: ({ applicationId, body }: { applicationId: string; body: string }) =>
            fetchJson(`/api/rushees/${ applicationId }/comment`, {
                method: 'POST',
                body: JSON.stringify({ body })
            }),
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: ['rushees'] });
        }
    });
}
