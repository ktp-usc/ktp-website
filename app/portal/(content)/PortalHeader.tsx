// app/portal/components/PortalHeader.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { LogOut, User } from "lucide-react";

import { usePathname } from "next/navigation";

import { useSessionQuery, useSignOutMutation } from "@/client/hooks/auth";
import { useMyAccountQuery } from "@/client/hooks/accounts";
import ThemeToggleInline from "@/components/ThemeToggleInline";
import {
    hasExecAccess,
    portalHomePath,
} from "@/lib/auth/roles";

function buildDisplayName(account: any | null, sessionUser: any | null) {
    const first = (account?.firstName ?? "").trim();
    const last = (account?.lastName ?? "").trim();
    const full = `${ first } ${ last }`.trim();
    if (full) return full;

    const sessionName = (sessionUser?.name ?? "").trim();
    if (sessionName) return sessionName;

    const sessionEmail = (sessionUser?.email ?? "").trim();
    if (sessionEmail) return sessionEmail;

    return "User";
}

export default function PortalHeader() {
    const session = useSessionQuery();
    const account = useMyAccountQuery();
    const signOut = useSignOutMutation();
    const pathname = usePathname();

    const sessionUser = session.data?.user ?? null;
    const accountData = account.data ?? null;
    const homeHref = portalHomePath(accountData?.type);
    const showLeadershipNav = hasExecAccess(accountData?.type);

    const isLoading = session.isLoading || account.isLoading;

    const headshotUrl: string | null =
        (accountData?.headshotBlobURL as string | null | undefined) ?? null;

    const fullName = buildDisplayName(accountData, sessionUser);

    async function handleLogout() {
        try {
            await signOut.mutateAsync();
            window.location.assign("/");
        } catch (err) {
            console.error("[logout] failed", err);
        }
    }

    return (
        <header
            className="bg-white shadow-sm border-b border-gray-200 dark:bg-gray-900 dark:border-gray-700 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                {/* logo + title */}
                <div className="flex items-center gap-6">
                    <Link
                        href="/"
                        className="flex items-center cursor-pointer"
                        aria-label="Go to home"
                    >
                        <Image
                            src="/KTPLettersW.svg"
                            alt="Kappa Theta Pi logo"
                            className="hidden dark:block"
                            width={100}
                            height={60}
                            priority
                        />
                        <Image
                            src="/KTPLetters.svg"
                            alt="Kappa Theta Pi logo"
                            className="block dark:hidden"
                            width={100}
                            height={60}
                        />
                    </Link>
                    <div className="hidden sm:block h-8 w-px bg-gray-300 dark:bg-gray-700" />
                    <Link
                        href={homeHref}
                        className="hidden sm:block cursor-pointer"
                        aria-label="Go to portal home"
                    >
                        <h1 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-300">
                            Member Portal
                        </h1>
                    </Link>
                    {showLeadershipNav ? (
                        <nav className="flex items-center gap-0.5 rounded-lg bg-gray-100 dark:bg-gray-800 p-0.5">
                            {[
                                { href: "/portal/leadership", label: "Leadership" },
                                { href: "/portal/active", label: "Active" },
                                { href: "/portal/pledge", label: "Pledge" },
                            ].map((item) => {
                                const active =
                                    pathname === item.href ||
                                    pathname.startsWith(`${item.href}/`);
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`px-2.5 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                                            active
                                                ? "bg-white text-blue-700 shadow-sm dark:bg-gray-700 dark:text-blue-300"
                                                : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                                        }`}
                                    >
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>
                    ) : null}
                </div>

                {/* user + actions */ }
                <div className="flex items-center gap-4">
                    <span
                        className="h-10 w-10 rounded-full border-2 border-blue-200 dark:border-gray-600 overflow-hidden flex items-center justify-center bg-white/30 dark:bg-gray-800 transition-colors duration-300">
                        { headshotUrl ? (
                            <Image
                                src={ headshotUrl }
                                alt={ fullName }
                                width={ 40 }
                                height={ 40 }
                                className="h-10 w-10 object-cover"
                            />
                        ) : (
                            <User className="h-5 w-5 text-gray-700 dark:text-gray-200"/>
                        ) }
                    </span>

                    <span
                        className="text-sm font-medium text-gray-700 hidden md:block dark:text-white transition-colors duration-300">
                        { isLoading ? "Loading…" : fullName }
                    </span>

                    <ThemeToggleInline/>

                    <Link
                        href="/portal/settings"
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer inline-flex"
                        aria-label="Settings"
                    >
                        <svg
                            className="w-5 h-5 text-gray-600 dark:text-white transition-transform duration-300 hover:rotate-90 origin-center"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={ 2 }
                                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={ 2 }
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                        </svg>
                    </Link>

                    <button
                        type="button"
                        onClick={ handleLogout }
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer inline-flex"
                        aria-label="Logout"
                    >
                        <LogOut className="w-5 h-5 text-gray-600 dark:text-white transition-colors duration-300"/>
                    </button>
                </div>
            </div>
        </header>
    );
}
