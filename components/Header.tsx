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
        <header className={`sticky top-0 w-full z-[9999] transition-all duration-900 ${isScrolled ? 'bg-white' +
            ' shadow-md' : 'bg-transparent'}`}>
            <div className="relative flex items-center justify-center w-full px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 py-4 z-10">

                {/*Logo on the left*/}
                <Link href="/" className="absolute left-6 sm:left-8 md:left-12 lg:left-16 xl:left-20">
                    <Image src={logo} alt="Logo" width={45} height={45}  className=" transition-all duration-900
                    hover:scale-110 hover: drop-shadow-[0_0_15px_rgba(49,92,169,1)]" />
                </Link>

                {/*NavBar*/}
                <div className='flex justify-center space-x-8 sm:space-x-12 md:space-x-16 lg:space-x-20'>
                    {/*<Link className="hover:text-[#315CA9] font-medium" href="/">Home</Link>*/}
                    <Link className="hover:text-[#315CA9] font-medium" href="/about">About Us</Link>
                    <Link className="hover:text-[#315CA9] font-medium" href="/Members">Members</Link>
                    <Link className="hover:text-[#315CA9] font-medium" href="/Rush">Rush</Link>
                    <Link className="hover:text-[#315CA9] font-medium" href="/Application">Apply</Link>
                </div>

            </div>
        </header>
    );
}