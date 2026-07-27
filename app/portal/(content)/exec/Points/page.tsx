'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAllAccountsQuery } from '@/client/hooks/accounts';

type PointCategory = 'Activities' | 'Charity' | 'Events' | 'Coffee chat';

type MemberPointEntry = {
    name: string;
    points: number;
    category: PointCategory;
};

const pointCategories: PointCategory[] = ['Activities', 'Charity', 'Events', 'Coffee chat'];

function getRosterMembers(accounts: Array<{ firstName?: string | null; lastName?: string | null; type?: string | null; leaderType?: string | null }>): MemberPointEntry[] {
    return accounts
        .filter((account) => {
            const isLeadership = account.type === 'LEADERSHIP' || account.leaderType === 'PRESIDENT' || account.leaderType === 'VICE_PRESIDENT' || account.leaderType === 'SECRETARY' || account.leaderType === 'VP_OUTREACH' || account.leaderType === 'VP_MARKETING' || account.leaderType === 'VP_FINANCE' || account.leaderType === 'VP_TECHDEV' || account.leaderType === 'VP_PROFDEV' || account.leaderType === 'VP_ENGAGEMENT' || account.leaderType === 'CHAIR_CONFERENCES' || account.leaderType === 'CHAIR_INFRASTRUCTURE';
            return account.type === 'BROTHER' && !isLeadership;
        })
        .map((account) => ({
            name: [account.firstName, account.lastName].filter(Boolean).join(' ') || 'Unnamed Member',
            points: 0,
            category: 'Activities' as PointCategory,
        }));
}

export default function PointsPage() {
    const { data, isLoading, isError } = useAllAccountsQuery();
    const rosterAccounts = data?.items ?? [];
    const [members, setMembers] = useState<MemberPointEntry[]>([]);
    const [search, setSearch] = useState('');
    const firstMatchRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        setMembers(getRosterMembers(rosterAccounts));
    }, [rosterAccounts]);

    const totalPoints = useMemo(
        () => members.reduce((sum, member) => sum + member.points, 0),
        [members]
    );

    const filteredMembers = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return members;

        const matches = members.filter((member) => member.name.toLowerCase().includes(query));
        const nonMatches = members.filter((member) => !member.name.toLowerCase().includes(query));

        return [...matches, ...nonMatches];
    }, [members, search]);

    const addPoints = (memberName: string, category: PointCategory) => {
        setMembers((current) =>
            current.map((member) =>
                member.name === memberName
                    ? { ...member, points: member.points + 1, category }
                    : member
            )
        );
    };

    useEffect(() => {
        if (!search.trim()) return;

        const query = search.trim().toLowerCase();
        const matchedMember = filteredMembers.find((member) => member.name.toLowerCase().includes(query));

        if (matchedMember && firstMatchRef.current) {
            firstMatchRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [filteredMembers, search]);

    return (
        <div className="space-y-6">
            <Card className="border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
                <CardContent className="p-5 sm:p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-300">
                                Find a member
                            </p>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Search by name to jump to a specific member card.
                            </p>
                        </div>
                        <div className="w-full max-w-md">
                            <Input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search members..."
                                className="h-11"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                <span className="font-medium text-gray-700 dark:text-gray-200">Total points: {totalPoints}</span>
                <span>•</span>
                <span>{filteredMembers.length} visible member{filteredMembers.length === 1 ? '' : 's'}</span>
            </div>

            {isLoading ? (
                <div className="rounded-xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
                    Loading roster members...
                </div>
            ) : isError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
                    Failed to load roster members.
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {filteredMembers.map((member, index) => {
                        const isFirstMatch = !!search.trim() && index === 0;

                        return (
                            <div
                                key={member.name}
                                ref={isFirstMatch ? firstMatchRef : null}
                            >
                                <Card className="border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
                                    <CardContent className="p-5">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{member.name}</h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{member.category}</p>
                                            </div>
                                            <div className="rounded-2xl bg-blue-50 px-3 py-2 text-center dark:bg-blue-950/40">
                                                <p className="text-xs font-medium uppercase tracking-wide text-blue-600 dark:text-blue-300">
                                                    Points
                                                </p>
                                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{member.points}</p>
                                            </div>
                                        </div>

                                        <div className="mt-4 grid grid-cols-3 gap-2">
                                            {pointCategories.map((category) => (
                                                <Button
                                                    key={`${member.name}-${category}`}
                                                    type="button"
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-9 px-2 text-xs"
                                                    onClick={() => addPoints(member.name, category)}
                                                >
                                                    {category}
                                                </Button>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
