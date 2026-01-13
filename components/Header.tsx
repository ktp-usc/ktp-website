'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import logo from '../public/CircleLogo-Transparent.png';
import { User } from 'lucide-react';

import { useSessionQuery } from '@/hooks/useSessionQuery';

const SIGN_IN_HREF = '/auth/sign-in';
const SIGN_UP_HREF = '/auth/sign-up';
const PROFILE_HREF = '/profile';

type AccountHeadshotResponse = { headshotBlobURL: string | null };

export function Header() {
    const [isScrolled, setIsScrolled] = useState(false);

    const { data, isFetching } = useSessionQuery();
    const userId = data?.user?.id ?? null;
    const isSignedIn = !!userId;

    const [headshotUrl, setHeadshotUrl] = useState<string | null>(null);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 0);
        setIsScrolled(window.scrollY > 0);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (!userId) {
            setHeadshotUrl(null);
            return;
        }

        let cancelled = false;

        async function load() {
            try {
                const res = await fetch(`/api/accounts/${userId}/headshot`, { cache: 'no-store' });
                if (!res.ok) {
                    if (!cancelled) setHeadshotUrl(null);
                    return;
                }
                const body = (await res.json()) as AccountHeadshotResponse;
                if (!cancelled) setHeadshotUrl(body.headshotBlobURL ?? null);
            } catch {
                if (!cancelled) setHeadshotUrl(null);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, [userId]);

    const rightSide = useMemo(() => {
        if (isFetching) return null;

        if (isSignedIn) {
            return (
                <Link
                    href={PROFILE_HREF}
                    aria-label="Go to profile"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#315CA9] shadow-lg transition-all duration-300 hover:bg-[#23498F] hover:drop-shadow-lg cursor-pointer"
                >
                    {headshotUrl ? (
                        <Image
                            src={headshotUrl}
                            alt="Profile"
                            width={36}
                            height={36}
                            className="h-9 w-9 rounded-full object-cover"
                        />
                    ) : (
                        <span className="h-9 w-9 rounded-full bg-white/15 flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </span>
                    )}
                </Link>
            );
        }

        return (
            <>
                <Link
                    className="bg-transparent text-[#315CA9] font-medium px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-base hover:bg-[#315CA9]/10 transition-all duration-300 cursor-pointer"
                    href={SIGN_IN_HREF}
                >
                    Sign In
                </Link>
                <Link
                    className="bg-[#315CA9] text-white font-medium px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-base hover:bg-[#23498F] transition-all duration-300 transform shadow-lg hover:drop-shadow-lg cursor-pointer"
                    href={SIGN_UP_HREF}
                >
                    Sign Up
                </Link>
            </>
        );
    }, [headshotUrl, isFetching, isSignedIn]);

    return (
        <header
            className={`sticky top-0 w-full z-9999 transition-all duration-700 p-2 sm:p-4 ${
                isScrolled ? 'bg-white shadow-md' : 'bg-transparent'
            }`}
        >
            <div className="relative flex items-center justify-center w-full px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 py-2 sm:py-3 z-10">
                <Link href="/" className="absolute left-2 sm:left-6 md:left-12 lg:left-16 xl:left-20 cursor-pointer">
                    <Image
                        src={logo}
                        alt="Logo"
                        width={45}
                        height={45}
                        className="w-8 h-8 sm:w-11 sm:h-11 transition-all duration-300 hover:scale-110 hover:drop-shadow-[0_0_15px_rgba(49,92,169,1)]"
                    />
                </Link>

                <nav className="flex flex-wrap justify-center text-xs sm:text-md md:text-lg space-x-4 sm:space-x-8 md:space-x-12 lg:space-x-16">
                    <Link className="hover:text-[#315CA9] font-medium transition-colors cursor-pointer" href="/members">
                        Members
                    </Link>
                    <Link className="hover:text-[#315CA9] font-medium transition-colors cursor-pointer" href="/rush">
                        Rush
                    </Link>
                    <Link className="hover:text-[#315CA9] font-medium transition-colors cursor-pointer" href="/apply">
                        Apply
                    </Link>
                </nav>

                <div className="absolute right-1 sm:right-6 md:right-12 lg:right-16 xl:right-20 flex items-center gap-2">
                    {rightSide}
                </div>
            </div>
        </header>
    );
}
