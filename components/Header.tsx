"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Menu, User } from "lucide-react";

import logo from "../public/CircleLogo-Transparent.png";
import { useSessionQuery } from "@/client/hooks/auth";
import { useMyAccountQuery } from "@/client/hooks/accounts";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const SIGN_IN_HREF = "/auth/sign-in";
const SIGN_UP_HREF = "/auth/sign-up";
const PROFILE_HREF = "/portal";

const NAV_LINKS = [
    { href: "/", label: "Home" },
    { href: "/members", label: "Members" },
    { href: "/clients", label: "Our Work" },
    { href: "/rush", label: "Rush" },
    { href: "/apply", label: "Apply" }
] as const;

export function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const { data: sessionData, isFetching: sessionFetching } = useSessionQuery();
    const isSignedIn = Boolean(sessionData?.user?.id);

    const { data: account, isFetching: accountFetching } = useMyAccountQuery();
    const headshotUrl = account?.headshotBlobURL ?? null;

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 0);
        setIsScrolled(window.scrollY > 0);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const profileButton = useMemo(() => {
        if (sessionFetching) return null;
        if (!isSignedIn) return null;

        return (
            <Link
                href={PROFILE_HREF}
                aria-label="Go to profile"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#315CA9] shadow-lg transition-all duration-300 hover:bg-[#23498F] hover:drop-shadow-lg cursor-pointer"
                onClick={() => setMobileOpen(false)}
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
                        <User className={`h-5 w-5 text-white ${accountFetching ? "opacity-60" : ""}`} />
                    </span>
                )}
            </Link>
        );
    }, [sessionFetching, isSignedIn, headshotUrl, accountFetching]);

    const desktopAuthButtons = useMemo(() => {
        if (sessionFetching) return null;

        if (isSignedIn) return profileButton;

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
    }, [sessionFetching, isSignedIn, profileButton]);

    const mobileMenuAuth = useMemo(() => {
        if (sessionFetching) return null;

        if (isSignedIn) {
            return (
                <Link
                    href={PROFILE_HREF}
                    className="w-full rounded-xl px-4 py-3 text-sm font-medium bg-[#315CA9] text-white shadow-lg transition-all duration-300 hover:bg-[#23498F]"
                    onClick={() => setMobileOpen(false)}
                >
                    Go to Portal
                </Link>
            );
        }

        return (
            <div className="grid grid-cols-2 gap-3">
                <Link
                    className="rounded-xl px-4 py-3 text-center text-sm font-medium border border-[#315CA9]/25 text-[#315CA9] hover:bg-[#315CA9]/10 transition-all duration-300"
                    href={SIGN_IN_HREF}
                    onClick={() => setMobileOpen(false)}
                >
                    Sign In
                </Link>
                <Link
                    className="rounded-xl px-4 py-3 text-center text-sm font-medium bg-[#315CA9] text-white shadow-lg hover:bg-[#23498F] transition-all duration-300"
                    href={SIGN_UP_HREF}
                    onClick={() => setMobileOpen(false)}
                >
                    Sign Up
                </Link>
            </div>
        );
    }, [sessionFetching, isSignedIn]);

    return (
        <header
            className={`sticky top-0 w-full z-50 transition-all duration-700 p-2 sm:p-4 ${
                isScrolled ? "bg-white shadow-md" : "bg-transparent"
            }`}
        >
            <div className="relative flex items-center justify-between w-full px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 py-2 sm:py-3">
                {/* logo */}
                <Link href="/" className="cursor-pointer" onClick={() => setMobileOpen(false)}>
                    <Image
                        src={logo}
                        alt="Logo"
                        width={45}
                        height={45}
                        className="w-8 h-8 sm:w-11 sm:h-11 transition-all duration-300 hover:scale-110 hover:drop-shadow-[0_0_15px_rgba(49,92,169,1)]"
                    />
                </Link>

                {/* desktop nav */}
                <nav className="hidden sm:flex flex-wrap justify-center text-xs sm:text-md md:text-lg space-x-4 sm:space-x-8 md:space-x-12 lg:space-x-16">
                    {NAV_LINKS.map((l) => (
                        <Link
                            key={l.href}
                            className="hover:text-[#315CA9] font-medium transition-colors cursor-pointer"
                            href={l.href}
                        >
                            {l.label}
                        </Link>
                    ))}
                </nav>

                {/* right side */}
                <div className="flex items-center gap-2">
                    {/* desktop auth/profile */}
                    <div className="hidden sm:flex items-center gap-2">{desktopAuthButtons}</div>

                    {/* mobile profile (signed-in only) */}
                    <div className="sm:hidden">{profileButton}</div>

                    {/* mobile menu (shadcn Sheet) */}
                    <div className="sm:hidden">
                        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                            <SheetTrigger asChild>
                                <button
                                    type="button"
                                    aria-label={mobileOpen ? "Close menu" : "Open menu"}
                                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg hover:bg-black/5 transition-colors"
                                >
                                    <Menu className="h-6 w-6 text-gray-700" />
                                </button>
                            </SheetTrigger>

                            <SheetContent side="top" className="p-0">
                                <div className="px-4 pt-6 pb-5">
                                    <SheetHeader className="px-0">
                                        <SheetTitle className="text-left text-base font-semibold">Menu</SheetTitle>
                                    </SheetHeader>

                                    <div className="mt-4 flex flex-col gap-1">
                                        {NAV_LINKS.map((l) => (
                                            <Link
                                                key={l.href}
                                                href={l.href}
                                                onClick={() => setMobileOpen(false)}
                                                className="rounded-xl px-4 py-3 text-sm font-medium text-gray-800 hover:bg-gray-100 transition-colors"
                                            >
                                                {l.label}
                                            </Link>
                                        ))}
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-gray-200">{mobileMenuAuth}</div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </header>
    );
}
