'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useSessionQuery } from '@/client/hooks/auth';
import { useMyAccountQuery } from '@/client/hooks/accounts';
import {
  useActiveVoteQuery,
  useCreateVoteQuestionMutation,
  useDeleteVoteQuestionMutation,
  useDeleteAllVoteQuestionsMutation,
  useSetVoteEligibilityMutation,
  useVoteEligibilityQuery,
  useVoteHistoryQuery,
  useVoteResultsQuery
} from '@/client/hooks/votes';
import { leaderType as LeaderType } from "@prisma/client";

function formatDate(dateLike?: string | null) {
  if (!dateLike) return '—';
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function ExecVotingPage() {
  const session = useSessionQuery();
  const account = useMyAccountQuery();
  const userId = session.data?.user?.id ?? null;
  const leaderType = account.data?.leaderType ?? null;
  const isAdmin =
    account.data?.type === 'LEADERSHIP' || (leaderType && leaderType !== LeaderType.N_A);
  const isGateLoading = session.isFetching || (userId ? account.isFetching : false);

  const { data: activeData, isFetching: isQuestionLoading } = useActiveVoteQuery();
  const activeQuestion = activeData?.question ?? null;

  const { data: eligibilityData, isFetching: isEligibilityLoading } = useVoteEligibilityQuery(activeQuestion?.id ?? '');
  const voters = eligibilityData?.items ?? [];

  const { data: resultsData, isFetching: isResultsLoading } = useVoteResultsQuery(activeQuestion?.id ?? '');
  const { data: historyData, isFetching: isHistoryLoading } = useVoteHistoryQuery();
  const [eligibleIds, setEligibleIds] = useState<Set<string>>(new Set());
  const setEligibilityMutation = useSetVoteEligibilityMutation(activeQuestion?.id ?? '');
  const createQuestionMutation = useCreateVoteQuestionMutation();
  const deleteQuestionMutation = useDeleteVoteQuestionMutation();
  const deleteAllQuestionsMutation = useDeleteAllVoteQuestionsMutation();

  const [questionText, setQuestionText] = useState('');
  const [optionInputs, setOptionInputs] = useState<string[]>(['Yes', 'No']);
  const [closesAt, setClosesAt] = useState('');
  const [makeActive, setMakeActive] = useState(true);
  const [rolloverEligible, setRolloverEligible] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const setsEqual = (a: Set<string>, b: Set<string>) => {
    if (a.size !== b.size) return false;
    for (const v of a) {
      if (!b.has(v)) return false;
    }
    return true;
  };

  useEffect(() => {
    if (!activeQuestion?.id) {
      setEligibleIds((prev) => (prev.size ? new Set() : prev));
      return;
    }

    const next = new Set(voters.filter((v) => v.eligible).map((v) => v.id));
    setEligibleIds((prev) => (setsEqual(prev, next) ? prev : next));
  }, [activeQuestion?.id, voters]);

  const eligibleVoters = useMemo(() => voters.filter((v) => eligibleIds.has(v.id)), [voters, eligibleIds]);
  const pendingVoters = useMemo(
    () => eligibleVoters.filter((v) => !v.hasVoted),
    [eligibleVoters],
  );

  const totalVotes = resultsData?.totalVotes ?? 0;

  const toggleEligible = (id: string) => {
    setEligibleIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setEligibleIds(new Set(voters.map((v) => v.id)));
  };

  const clearEligible = () => {
    setEligibleIds(new Set());
  };

  const saveEligibility = () => {
    if (!activeQuestion) return;
    setEligibilityMutation.mutate(Array.from(eligibleIds));
  };

  const addOption = () => {
    setOptionInputs((prev) => [...prev, '']);
  };

  const updateOption = (idx: number, value: string) => {
    setOptionInputs((prev) => prev.map((opt, i) => (i === idx ? value : opt)));
  };

  const removeOption = (idx: number) => {
    setOptionInputs((prev) => prev.filter((_, i) => i !== idx));
  };

  const submitQuestion = () => {
    setCreateError(null);
    const cleanedQuestion = questionText.trim();
    const cleanedOptions = optionInputs.map((opt) => opt.trim()).filter(Boolean);

    if (!cleanedQuestion) {
      setCreateError('Enter a question.');
      return;
    }
    if (cleanedOptions.length < 2) {
      setCreateError('Provide at least two options.');
      return;
    }

    const eligibleAccountIds = rolloverEligible ? Array.from(eligibleIds) : undefined;

    createQuestionMutation.mutate(
      {
        question: cleanedQuestion,
        options: cleanedOptions,
        isActive: makeActive,
        closesAt: closesAt ? new Date(closesAt).toISOString() : null,
        eligibleAccountIds
      },
      {
        onSuccess: () => {
          setQuestionText('');
          setOptionInputs(['Yes', 'No']);
          setClosesAt('');
          setMakeActive(true);
          setRolloverEligible(false);
        }
      }
    );
  };

  const deleteQuestion = (id: string) => {
    const confirmed = window.confirm('Delete this question? This will remove all related votes.');
    if (!confirmed) return;
    deleteQuestionMutation.mutate(id);
  };

  const deleteAllQuestions = () => {
    const confirmed = window.confirm('Delete ALL questions? This will remove all related votes.');
    if (!confirmed) return;
    deleteAllQuestionsMutation.mutate();
  };

  if (!userId && !session.isFetching) {
    return (
      <main className="max-w-4xl mx-auto px-6 py-10">
        <Card className="bg-white border border-gray-200 rounded-xl shadow-md">
          <CardContent className="p-6 space-y-3">
            <div className="text-sm text-gray-600">Sign in to access exec voting.</div>
            <Link className="text-sm text-blue-600 hover:text-blue-700" href="/auth/sign-in">
              Go to sign in
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (isGateLoading) {
    return (
      <main className="max-w-4xl mx-auto px-6 py-10">
        <Card className="bg-white border border-gray-200 rounded-xl shadow-md">
          <CardContent className="p-6 text-sm text-gray-600">Checking access...</CardContent>
        </Card>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="max-w-4xl mx-auto px-6 py-10">
        <Card className="bg-white border border-gray-200 rounded-xl shadow-md">
          <CardContent className="p-6 text-sm text-gray-600">Admin access required.</CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Exec Voting</h1>
        <p className="text-gray-600 mt-1">Manage eligible voters and review live results.</p>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">Active Vote</TabsTrigger>
          <TabsTrigger value="history">Question History</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <Card className="mb-6 bg-white border border-gray-200 rounded-xl shadow-md">
            <CardContent className="p-6 space-y-5">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Create question</p>
                <h2 className="text-lg font-semibold text-gray-900 mt-1">Start a new vote</h2>
              </div>

              <div className="space-y-3">
                <label className="text-sm text-gray-700">Question</label>
                <input
                  type="text"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Enter the question"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm text-gray-700">Options</label>
                <div className="space-y-2">
                  {optionInputs.map((opt, idx) => (
                    <div key={`opt-${idx}`} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => updateOption(idx, e.target.value)}
                        placeholder={`Option ${idx + 1}`}
                        className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => removeOption(idx)}
                        disabled={optionInputs.length <= 2}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
                <Button type="button" variant="outline" onClick={addOption}>
                  Add option
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-700">Close time (optional)</label>
                  <input
                    type="datetime-local"
                    value={closesAt}
                    onChange={(e) => setClosesAt(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <input
                    id="make-active"
                    type="checkbox"
                    checked={makeActive}
                    onChange={(e) => setMakeActive(e.target.checked)}
                    className="accent-blue-600"
                  />
                  <label htmlFor="make-active" className="text-sm text-gray-700">
                    Make active immediately
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  id="rollover-eligible"
                  type="checkbox"
                  checked={rolloverEligible}
                  onChange={(e) => setRolloverEligible(e.target.checked)}
                  disabled={!activeQuestion || eligibleIds.size === 0}
                  className="accent-blue-600"
                />
                <label htmlFor="rollover-eligible" className="text-sm text-gray-700">
                  Keep current eligible voters for the next question
                </label>
              </div>

              {createError ? <div className="text-sm text-red-600">{createError}</div> : null}
              {createQuestionMutation.isError ? (
                <div className="text-sm text-red-600">
                  {(createQuestionMutation.error as Error)?.message ?? 'Failed to create question.'}
                </div>
              ) : null}

              <div className="flex items-center gap-3">
                <Button onClick={submitQuestion} disabled={createQuestionMutation.isPending}>
                  {createQuestionMutation.isPending ? 'Creating...' : 'Create question'}
                </Button>
                <span className="text-xs text-gray-500">Active votes are visible on the public page.</span>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 bg-white border border-gray-200 rounded-xl shadow-md">
              <CardContent className="p-6 space-y-6">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">Active question</p>
                  <h2 className="text-xl font-semibold text-gray-900 mt-1">
                    {isQuestionLoading ? 'Loading...' : activeQuestion?.question ?? 'No active question'}
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="outline" onClick={selectAll} disabled={!voters.length}>
                    Select all
                  </Button>
                  <Button variant="outline" onClick={clearEligible} disabled={!voters.length}>
                    Clear selection
                  </Button>
                  <Button onClick={saveEligibility} disabled={!activeQuestion || setEligibilityMutation.isPending}>
                    {setEligibilityMutation.isPending ? 'Saving...' : 'Save eligibility'}
                  </Button>
                  <div className="text-sm text-gray-500">
                    Eligible: <span className="font-medium text-gray-900">{eligibleVoters.length}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Pending: <span className="font-medium text-gray-900">{pendingVoters.length}</span>
                  </div>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <div className="grid grid-cols-12 bg-gray-50 text-xs uppercase tracking-wide text-gray-500 px-4 py-2">
                    <div className="col-span-1">Eligible</div>
                    <div className="col-span-4">Name</div>
                    <div className="col-span-4">Email</div>
                    <div className="col-span-3">Status</div>
                  </div>
                  {isEligibilityLoading ? (
                    <div className="px-4 py-6 text-sm text-gray-500">Loading eligible voters...</div>
                  ) : voters.length === 0 ? (
                    <div className="px-4 py-6 text-sm text-gray-500">No voters found.</div>
                  ) : voters.map((v) => (
                    <div
                      key={v.id}
                      className="grid grid-cols-12 items-center px-4 py-3 border-t text-sm"
                    >
                      <div className="col-span-1">
                        <input
                          type="checkbox"
                          checked={eligibleIds.has(v.id)}
                          onChange={() => toggleEligible(v.id)}
                          className="accent-blue-600"
                        />
                      </div>
                      <div className="col-span-4 text-gray-900">{v.name}</div>
                      <div className="col-span-4 text-gray-600 break-all">{v.email}</div>
                      <div className="col-span-3">
                        <span className={v.hasVoted ? 'text-green-700' : 'text-gray-400'}>
                          {v.hasVoted ? 'Voted' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-900 mb-2">Still needs to vote</p>
                  {pendingVoters.length === 0 ? (
                    <p className="text-sm text-gray-500">All eligible voters have submitted.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {pendingVoters.map((v) => (
                        <span key={v.id} className="text-xs px-2 py-1 rounded-full bg-yellow-50 text-yellow-800 border border-yellow-200">
                          {v.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 rounded-xl shadow-md">
              <CardContent className="p-6 space-y-6">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">Results</p>
                  <div className="text-2xl font-semibold text-gray-900 mt-1">
                    {isResultsLoading ? '-' : `${totalVotes} vote${totalVotes === 1 ? '' : 's'}`}
                  </div>
                </div>

                <div className="space-y-4">
                  {(resultsData?.options ?? activeQuestion?.options ?? []).map((opt) => {
                    const count = 'count' in opt ? opt.count : 0 as any;
                    const percent = 'percent' in opt ? opt.percent : 0;
                    return (
                      <div key={opt.id} className="space-y-2">
                        <div className="flex items-center justify-between text-sm text-gray-700">
                          <span>{opt.label}</span>
                          <span>
                            {count} ({percent}%)
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                          <div className="h-full bg-blue-500" style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="text-xs text-gray-500">
                  Percentages update automatically based on eligible votes only.
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card className="bg-white border border-gray-200 rounded-xl shadow-md">
            <CardContent className="p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">Question history</p>
                  <h2 className="text-lg font-semibold text-gray-900 mt-1">Past votes</h2>
                </div>
                <Button
                  variant="outline"
                  onClick={deleteAllQuestions}
                  disabled={!historyData?.items?.length || deleteAllQuestionsMutation.isPending}
                >
                  {deleteAllQuestionsMutation.isPending ? 'Deleting...' : 'Delete all'}
                </Button>
              </div>

              {isHistoryLoading ? (
                <div className="text-sm text-gray-500">Loading history...</div>
              ) : historyData?.items?.length ? (
                <div className="space-y-3">
                  {historyData.items.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <div className="text-sm text-gray-500">
                            {formatDate(item.createdAt)}{item.closesAt ? ` • closes ${formatDate(item.closesAt)}` : ''}
                          </div>
                          <div className="text-base font-semibold text-gray-900">{item.question}</div>
                        </div>
                        <div className="text-sm text-gray-700">
                          {item.totalVotes} vote{item.totalVotes === 1 ? '' : 's'} • {item.eligibleCount} eligible
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {item.options.map((opt) => (
                          <span key={opt.id} className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                            {opt.label}: {opt.count} ({opt.percent}%)
                          </span>
                        ))}
                        {item.isActive ? (
                          <span className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
                            Active
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-1 rounded-full bg-gray-50 text-gray-500 border border-gray-200">
                            Closed
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => deleteQuestion(item.id)}
                          disabled={deleteQuestionMutation.isPending}
                          className="text-xs px-2 py-1 rounded-full border border-red-200 text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500">No previous questions yet.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
