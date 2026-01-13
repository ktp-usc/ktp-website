// app/(site)/profile/ProfileDashboard.tsx
'use client';

import { useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FileText, LogOut, Settings, Shield, User } from 'lucide-react';
import type { accounts, applications } from '@prisma/client';

import { authClient } from '@/lib/auth/client';

import ProfileForm from './ProfileForm';
import ApplicationSection from '../application/ApplicationSection';
import AdminSection from './AdminSection';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type TabKey = 'profile' | 'application' | 'admin';

export default function ProfileDashboard({
                                             account,
                                             application,
                                             isAdmin,
                                             activeTab
                                         }: {
    account: accounts;
    application: applications | null;
    isAdmin: boolean;
    activeTab: string;
}) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const tab = useMemo<TabKey>(() => {
        const t = (activeTab ?? 'profile') as TabKey;
        if (t === 'admin' && !isAdmin) return 'profile';
        if (t !== 'profile' && t !== 'application' && t !== 'admin') return 'profile';
        return t;
    }, [activeTab, isAdmin]);

    function setTab(next: TabKey) {
        const params = new URLSearchParams(searchParams.toString());
        params.set('tab', next);
        router.replace(`/profile?${params.toString()}`);
    }

    async function handleLogout() {
        await authClient.signOut({ fetchOptions: { throw: false } });
        window.location.href = '/';
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
            {/* sidebar */}
            <Card className="h-fit overflow-hidden">
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={account.headshotBlobURL ?? ''} />
                            <AvatarFallback>
                                <User className="h-5 w-5" />
                            </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0">
                            <CardTitle className="text-base truncate">
                                {account.firstName} {account.lastName}
                            </CardTitle>
                            <CardDescription className="truncate">
                                {account.schoolEmail || account.personalEmail || ' '}
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <Separator />

                <CardContent className="px-2 py-2">
                    <div className="flex flex-col gap-2">
                        {/* general */}
                        <NavSectionLabel>General</NavSectionLabel>

                        <div className="flex flex-col gap-1">
                            <SidebarButton
                                active={tab === 'profile'}
                                icon={<Settings className="h-4 w-4" />}
                                label="Profile settings"
                                onClick={() => setTab('profile')}
                            />
                            <SidebarButton
                                active={tab === 'application'}
                                icon={<FileText className="h-4 w-4" />}
                                label="Application configuration"
                                onClick={() => setTab('application')}
                            />
                        </div>

                        {/* admin */}
                        {isAdmin ? (
                            <>
                                <Separator className="my-1" />
                                <NavSectionLabel>Admin</NavSectionLabel>

                                <div className="flex flex-col gap-1">
                                    <SidebarButton
                                        active={tab === 'admin'}
                                        icon={<Shield className="h-4 w-4" />}
                                        label="Admin tools"
                                        onClick={() => setTab('admin')}
                                    />
                                </div>
                            </>
                        ) : null}

                        {/* logout */}
                        <Separator className="my-1" />

                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleLogout}
                            className={cn(
                                'w-full justify-start',
                                'h-10 px-3',
                                'gap-3 rounded-lg',
                                'cursor-pointer select-none',
                                'hover:bg-muted'
                            )}
                        >
              <span className="shrink-0 text-muted-foreground">
                <LogOut className="h-4 w-4" />
              </span>
                            <span className="truncate">Logout</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* content */}
            <div className="space-y-6">
                {tab === 'profile' ? (
                    <SectionCard title="Profile settings" subtitle="Update your account details (public.accounts).">
                        <ProfileForm initialAccount={account} embedded />
                    </SectionCard>
                ) : null}

                {tab === 'application' ? (
                    <SectionCard title="Application configuration" subtitle="Edit your draft application and submit when ready.">
                        <ApplicationSection embedded initialApplication={application} />
                    </SectionCard>
                ) : null}

                {tab === 'admin' && isAdmin ? (
                    <SectionCard title="Admin tools" subtitle="Shortcuts for leadership workflows.">
                        <AdminSection />
                    </SectionCard>
                ) : null}
            </div>
        </div>
    );
}

function SidebarButton({
                           active,
                           icon,
                           label,
                           onClick
                       }: {
    active: boolean;
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
}) {
    return (
        <Button
            type="button"
            variant="ghost"
            onClick={onClick}
            className={cn(
                'w-full justify-start',
                'h-10 px-3',
                'gap-3 rounded-lg',
                'cursor-pointer select-none',
                'hover:bg-muted',
                active && 'bg-muted'
            )}
        >
            <span className="shrink-0 text-muted-foreground">{icon}</span>
            <span className="truncate">{label}</span>
        </Button>
    );
}

function NavSectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <div className="px-2 pt-1 pb-0 text-xs font-semibold text-muted-foreground">
            {children}
        </div>
    );
}

function SectionCard({
                         title,
                         subtitle,
                         children
                     }: {
    title: string;
    subtitle: string;
    children: React.ReactNode;
}) {
    return (
        <Card className="shadow-xl dark:shadow-black/30">
            <CardHeader>
                <CardTitle className="text-2xl">{title}</CardTitle>
                <CardDescription>{subtitle}</CardDescription>
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    );
}
