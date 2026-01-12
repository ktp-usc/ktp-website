"use client"

import Image from 'next/image';
import { useState, useEffect } from 'react';
import logo from "../CircleLogo-Transparent.png";
import Link from 'next/link';

export function Header() {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            setIsScrolled(scrollTop > 0);
        };

        // Set initial state based on current scroll position
        const scrollTop = window.scrollY;
        setIsScrolled(scrollTop > 0);

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <header className={`sticky top-0 w-full z-9999 transition-all duration-700 p-2 sm:p-4 ${isScrolled ? 'bg-white shadow-md' : 'bg-transparent'}`}>
            <div className="relative flex items-center justify-center w-full px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 py-2 sm:py-3 z-10">

                {/* Logo - Scales from w-8 (mobile) back to your original w-11 (desktop) */}
                <Link href="/" className="absolute left-2 sm:left-6 md:left-12 lg:left-16 xl:left-20">
                    <Image
                        src={logo}
                        alt="Logo"
                        width={45}
                        height={45}
                        className="w-8 h-8 sm:w-11 sm:h-11 transition-all duration-300 hover:scale-110 hover:drop-shadow-[0_0_15px_rgba(49,92,169,1)]"
                    />
                </Link>

                {/*NavBar*/}
                <nav className='flex flex-wrap justify-center text-xs sm:text-md md:text-lg space-x-4 sm:space-x-8 md:space-x-12 lg:space-x-16'>
                    {/*<Link className="hover:text-[#315CA9] font-medium" href="/">Home</Link>*/}

                    <Link className="hover:text-[#315CA9] font-medium" href="/members">Members</Link>
                    <Link className="hover:text-[#315CA9] font-medium" href="/rush">Rush</Link>
                    <Link className="hover:text-[#315CA9] font-medium" href="/clients">Our Work</Link>
                    <Link className="hover:text-[#315CA9] font-medium" href="/application">Apply</Link>
                </nav>

                <div className="absolute right-1 sm:right-6 md:right-12 lg:right-16 xl:right-20">
                    <Link
                        className="bg-[#315CA9] text-white font-medium px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-base hover:bg-[#23498F] transition-all duration-300 transform shadow-lg hover:drop-shadow-lg"
                        href="/login">
                        Login
                    </Link>
                </div>
            </div>
        </header>
    );
}