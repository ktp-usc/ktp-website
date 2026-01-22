'use client';

import Background from '@/components/Background';
import ThemeToggle from '@/components/ThemeToggle';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useActionState } from 'react';

import { signInWithEmail } from './actions';
import { useSessionQuery } from '@/client/hooks/auth';

type SignInState = { error?: string } | null;

export default function SignInPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [state, formAction, isPending] = useActionState<SignInState, FormData>(signInWithEmail, null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const redirectTo = useMemo(() => searchParams.get('redirectTo') ?? '/portal', [searchParams]);

    // session-aware redirect (prevents signed-in users from seeing sign-in)
    const session = useSessionQuery();
    useEffect(() => {
        if (session.data?.user) router.replace(redirectTo);
    }, [session.data?.user, router, redirectTo]);

    useEffect(() => {
        setErrorMessage(state?.error ?? null);
    }, [state?.error]);

    const handleHomeClick = () => {
        document.documentElement.classList.remove('dark');
        router.push('/');
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        setErrorMessage(null);

        if (!email || !password) {
            event.preventDefault();
            setErrorMessage('Email and password are required.');
        }
    };

    const blockForm = session.isLoading || Boolean(session.data?.user);

    return (
        <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 dark:bg-gray-900 transition-colors duration-300">
            <ThemeToggle />

            {/* left side */}
            <div className="relative hidden md:flex">
                <Background className="absolute inset-0" />

                <button
                    onClick={handleHomeClick}
                    className="cursor-pointer fixed top-6 left-12 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium text-sm"
                    aria-label="Return to homepage"
                    type="button"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Home
                </button>

                <div className="relative z-10 flex flex-col justify-center px-12 lg:px-16">
                    <div className="space-y-6">
                        <div className="inline-block">
                            <Image src="/KTPLettersW.svg" alt="Kappa Theta Pi logo" width={220} height={140} priority />
                            <div className="h-1 w-20 bg-white/80 rounded-full"></div>
                        </div>
                        <h2 className="text-3xl lg:text-4xl font-bold text-white">Welcome Back</h2>
                        <p className="text-lg lg:text-xl max-w-md text-white/90 leading-relaxed">
                            Sign in to continue to the portal and manage your account.
                        </p>
                    </div>
                </div>
            </div>

            {/* right side */}
            <div className="flex items-center justify-center px-6 py-12 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
                <div className="w-full max-w-md">
                    <div className="flex justify-center mb-6">
                        <Image src="/KTPLettersW.svg" alt="Kappa Theta Pi logo" className="hidden dark:block" width={120} height={40} />
                        <Image src="/KTPLetters.svg" alt="Kappa Theta Pi logo" className="block dark:hidden" width={120} height={40} />
                    </div>

                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl dark:shadow-gray-900/50 p-8 lg:p-10 transition-colors duration-300 border dark:border-gray-700">
                        <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Sign In</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-5">Enter your credentials to access your account</p>

                        {session.isLoading ? (
                            <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                Checking your session…
                            </div>
                        ) : null}

                        <form className="space-y-5" action={formAction} onSubmit={handleSubmit}>
                            <input type="hidden" name="callbackURL" value={redirectTo} />

                            {errorMessage ? (
                                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                                    {errorMessage}
                                </div>
                            ) : null}

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    autoComplete="email"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    disabled={isPending || blockForm}
                                    placeholder="example@email.sc.edu"
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-70"
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Password
                                    </label>
                                    <Link
                                        href="/auth/forgot-password"
                                        className="text-sm text-blue-900 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 font-medium"
                                    >
                                        Forgot?
                                    </Link>
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    name="password"
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    disabled={isPending || blockForm}
                                    placeholder="••••••••"
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-70"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isPending || blockForm}
                                className="w-full rounded-lg bg-linear-to-r from-blue-600 to-blue-700 py-3 text-white font-semibold hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-lg shadow-blue-500/30 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {isPending ? 'Signing In...' : 'Sign In'}
                            </button>

                            <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
                                Don&apos;t have an account?{' '}
                                <Link
                                    href={`/auth/sign-up?redirectTo=${encodeURIComponent(redirectTo)}`}
                                    className="text-blue-900 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 font-medium"
                                >
                                    Sign up
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
