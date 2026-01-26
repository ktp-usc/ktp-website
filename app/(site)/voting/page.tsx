'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSessionQuery } from '@/client/hooks/auth';
import { useMyAccountQuery } from '@/client/hooks/accounts';
import { useActiveVoteQuery, useSubmitVoteMutation } from '@/client/hooks/votes';

export default function VotingPage() {
  const session = useSessionQuery();
  const account = useMyAccountQuery();
  const userId = session.data?.user?.id ?? null;
  const accountType = account.data?.type ?? null;
  const isActiveMember = accountType === 'BROTHER' || accountType === 'LEADERSHIP';
  const isGateLoading = session.isFetching || (userId ? account.isFetching : false);

  const { data, isFetching, isError, error: queryError } = useActiveVoteQuery();
  const activeQuestion = data?.question ?? null;
  const eligible = data?.eligible ?? false;
  const hasVoted = data?.hasVoted ?? false;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const submitVoteMutation = useSubmitVoteMutation(activeQuestion?.id ?? '');

  useEffect(() => {
    setSelectedId(null);
  }, [activeQuestion?.id]);

  const canSubmit = useMemo(
    () => Boolean(activeQuestion?.isActive && selectedId && eligible && !hasVoted),
    [activeQuestion, selectedId, eligible, hasVoted]
  );

  const submitVote = () => {
    setLocalError(null);
    if (!selectedId) {
      setLocalError('Select an option before submitting.');
      return;
    }
    submitVoteMutation.mutate({ optionId: selectedId });
  };

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <div className="mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vote</h1>
          <p className="text-gray-600 mt-1">Cast your vote on the active question.</p>
        </div>
      </div>

      <Card className="bg-white border border-gray-200 rounded-xl shadow-md">
        <CardContent className="p-6">
          {!userId && !session.isFetching ? (
            <div className="space-y-3">
              <div className="text-sm text-gray-600">Sign in to access voting.</div>
              <div>
                <Link className="text-sm text-blue-600 hover:text-blue-700" href="/auth/sign-in">
                  Go to sign in
                </Link>
              </div>
            </div>
          ) : isGateLoading ? (
            <div className="text-sm text-gray-600">Checking access...</div>
          ) : userId && !isActiveMember ? (
            <div className="text-sm text-gray-600">Only active brothers can access voting.</div>
          ) : isFetching ? (
            <div className="text-sm text-gray-600">Loading active question...</div>
          ) : isError ? (
            <div className="text-sm text-red-600">{(queryError as Error)?.message ?? 'Failed to load vote.'}</div>
          ) : !activeQuestion ? (
            <div className="text-sm text-gray-600">No active question at the moment.</div>
          ) : !activeQuestion.isActive ? (
            <div className="text-sm text-gray-600">Voting is closed for this question.</div>
          ) : !eligible ? (
            <div className="text-sm text-gray-600">You are not eligible to vote on this question.</div>
          ) : (
            <div className="space-y-6">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Active question</p>
                <h2 className="text-xl font-semibold text-gray-900 mt-1">{activeQuestion.question}</h2>
              </div>

              <div className="space-y-3">
                {activeQuestion.options.map((opt) => (
                  <label
                    key={opt.id}
                    className={`flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors ${
                      selectedId === opt.id ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="vote-option"
                      checked={selectedId === opt.id}
                      onChange={() => setSelectedId(opt.id)}
                      className="accent-blue-600"
                    />
                    <span className="text-gray-900">{opt.label}</span>
                  </label>
                ))}
              </div>

              {localError ? <div className="text-sm text-red-600">{localError}</div> : null}
              {submitVoteMutation.isError ? (
                <div className="text-sm text-red-600">{(submitVoteMutation.error as Error)?.message ?? 'Vote failed.'}</div>
              ) : null}
              {hasVoted ? <div className="text-sm text-green-700">Vote received.</div> : null}

              <div className="flex items-center gap-3">
                <Button onClick={submitVote} disabled={!canSubmit || submitVoteMutation.isPending}>
                  {submitVoteMutation.isPending ? 'Submitting...' : 'Submit vote'}
                </Button>
                <span className="text-xs text-gray-500">Results are available to exec after voting.</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
