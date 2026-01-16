'use client';

import Background from '@/components/Background';
import ThemeToggle from '@/components/ThemeToggle';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useActionState } from 'react';

import { signUpWithEmail } from './actions';
import { passwordMeetsRequirements } from '@/lib/passwordMeetsRequirements';
import { useSessionQuery } from '@/client/hooks/auth';

type SignUpState = { error?: string } | null;

export default function SignUpPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // keep controlled inputs (same design / UX as sign in)
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // backend-driven state
    const [state, formAction, isPending] = useActionState<SignUpState, FormData>(signUpWithEmail, null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // where to go after sign-up
    const redirectTo = useMemo(() => searchParams.get('redirectTo') || '/portal', [searchParams]);

    // session-aware redirect (prevents signed-in users from seeing sign-up)
    const session = useSessionQuery();
    useEffect(() => {
        if (session.data?.user) {
            router.replace(redirectTo);
        }
    }, [session.data?.user, router, redirectTo]);

    useEffect(() => {
        setErrorMessage(state?.error ?? null);
    }, [state?.error]);

    const handleHomeClick = () => {
        document.documentElement.classList.remove('dark');
        router.push('/');
    };

    // client-side validation (backend still validates)
    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        setErrorMessage(null);

        if (!name || !email || !password) {
            event.preventDefault();
            setErrorMessage('Name, email, and password are required.');
            return;
        }

        const normalizedEmail = email.toLowerCase().trim();
        const domain = normalizedEmail.split('@')[1] || '';
        if (!domain.endsWith('sc.edu')) {
            event.preventDefault();
            setErrorMessage('Please use a valid USC email address.');
            return;
        }

        if (!passwordMeetsRequirements(password)) {
            event.preventDefault();
            setErrorMessage('Password does not meet requirements. Please ensure password is 8 characters long, contains at least one uppercase letter, one lowercase letter, one number, and one symbol.');
        }
    };

    // avoid form flicker if session is still loading
    const blockForm = session.isLoading || Boolean(session.data?.user);

    return (
        <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 dark:bg-gray-900 transition-colors duration-300">
            <ThemeToggle />

            {/* left side - gradient background section */}
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
                        <h2 className="text-3xl lg:text-4xl font-bold text-white">Create Your Account</h2>
                        <p className="text-lg lg:text-xl max-w-md text-white/90 leading-relaxed">
                            Sign up to access the portal and start your application.
                        </p>
                    </div>
                </div>
            </div>

            {/* right side - signup form */}
            <div className="flex items-center justify-center px-6 py-12 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
                <div className="w-full max-w-md">
                    {/* mobile logo */}
                    <div className="flex justify-center mb-6">
                        <Image src="/KTPLettersW.svg" alt="Kappa Theta Pi logo" className="hidden dark:block" width={120} height={40} />
                        <Image src="/KTPLetters.svg" alt="Kappa Theta Pi logo" className="block dark:hidden" width={120} height={40} />
                    </div>

                    {/* form container */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl dark:shadow-gray-900/50 p-8 lg:p-10 transition-colors duration-300 border dark:border-gray-700">
                        <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Sign Up</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-5">Create your account to get started</p>

                        {session.isLoading ? (
                            <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                Checking your session…
                            </div>
                        ) : null}

                        <form className="space-y-5" action={formAction} onSubmit={handleSubmit}>
                            {/* keep callbackURL name: action expects it */}
                            <input type="hidden" name="callbackURL" value={redirectTo} />

                            {errorMessage ? (
                                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                                    {errorMessage}
                                </div>
                            ) : null}

                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Full Name
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    name="name"
                                    autoComplete="name"
                                    value={name}
                                    onChange={(event) => setName(event.target.value)}
                                    disabled={isPending || blockForm}
                                    placeholder="John Doe"
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-70"
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    USC Email Address
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
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    name="password"
                                    autoComplete="new-password"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    disabled={isPending || blockForm}
                                    placeholder="••••••••"
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-70"
                                />
                                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                    Use a strong password that meets the portal requirements.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={isPending || blockForm}
                                className="w-full rounded-lg bg-linear-to-r from-blue-600 to-blue-700 py-3 text-white font-semibold hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-lg shadow-blue-500/30 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {isPending ? 'Creating Account...' : 'Create Account'}
                            </button>

                            <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
                                Already have an account?{' '}
                                <Link
                                    href={`/auth/sign-in?redirectTo=${encodeURIComponent(redirectTo)}`}
                                    className="text-blue-900 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 font-medium"
                                >
                                    Sign in
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
