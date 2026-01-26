import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchJson } from '@/client/api/jsonutils';
import { qk } from '@/client/queries/keys';

export type VoteOption = {
  id: string;
  label: string;
};

export type ActiveQuestion = {
  id: string;
  question: string;
  options: VoteOption[];
  isActive: boolean;
  closesAt: string | null;
};

export type ActiveVoteResponse = {
  question: ActiveQuestion | null;
  eligible: boolean;
  hasVoted: boolean;
};

export type VoteEligibilityItem = {
  id: string;
  name: string;
  email: string;
  eligible: boolean;
  hasVoted: boolean;
};

export type VoteResultsOption = {
  id: string;
  label: string;
  count: number;
  percent: number;
};

export type VoteResultsResponse = {
  question: { id: string; question: string };
  totalVotes: number;
  options: VoteResultsOption[];
};

export type VoteHistoryOption = {
  id: string;
  label: string;
  count: number;
  percent: number;
};

export type VoteHistoryItem = {
  id: string;
  question: string;
  isActive: boolean;
  createdAt: string;
  closesAt: string | null;
  options: VoteHistoryOption[];
  totalVotes: number;
  eligibleCount: number;
};

export type VoteHistoryResponse = {
  items: VoteHistoryItem[];
};

export type CreateVotePayload = {
  question: string;
  options: string[];
  eligibleAccountIds?: string[];
  isActive?: boolean;
  closesAt?: string | null;
};

export function useActiveVoteQuery() {
  return useQuery({
    queryKey: qk.activeVote,
    queryFn: () => fetchJson<ActiveVoteResponse>('/api/votes/active'),
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true
  });
}

export function useSubmitVoteMutation(questionId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ optionId }: { optionId: string }) =>
      fetchJson(`/api/votes/${questionId}/vote`, {
        method: 'POST',
        body: JSON.stringify({ optionId })
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: qk.activeVote });
      await qc.invalidateQueries({ queryKey: qk.voteResults(questionId) });
      await qc.invalidateQueries({ queryKey: qk.voteEligibility(questionId) });
    }
  });
}

export function useVoteEligibilityQuery(questionId: string) {
  return useQuery({
    queryKey: qk.voteEligibility(questionId),
    queryFn: () => fetchJson<{ items: VoteEligibilityItem[] }>(`/api/votes/${questionId}/eligibility`),
    enabled: Boolean(questionId)
  });
}

export function useSetVoteEligibilityMutation(questionId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (accountIds: string[]) =>
      fetchJson(`/api/votes/${questionId}/eligibility`, {
        method: 'PUT',
        body: JSON.stringify({ accountIds })
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: qk.voteEligibility(questionId) });
      await qc.invalidateQueries({ queryKey: qk.voteResults(questionId) });
    }
  });
}

export function useVoteResultsQuery(questionId: string) {
  return useQuery({
    queryKey: qk.voteResults(questionId),
    queryFn: () => fetchJson<VoteResultsResponse>(`/api/votes/${questionId}/results`),
    enabled: Boolean(questionId)
  });
}

export function useVoteHistoryQuery() {
  return useQuery({
    queryKey: qk.voteHistory,
    queryFn: () => fetchJson<VoteHistoryResponse>('/api/votes/history')
  });
}

export function useCreateVoteQuestionMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateVotePayload) =>
      fetchJson('/api/votes', {
        method: 'POST',
        body: JSON.stringify(payload)
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: qk.activeVote });
    }
  });
}
