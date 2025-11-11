"use client"

import Image from 'next/image';
import { useState, useEffect } from 'react';
import logo from '../CircleLogo-Transparent.png';
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
            <div className="relative flex items-center justify-between w-full px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 py-4 z-10">
                {/*Logo*/}
                <Link href="/" className="flex justify-start">
                    <Image src={logo} alt="Logo" width={40} height={40}  className="hover "/>
                </Link>

                {/*NavBar*/}
                <div className='flex justify-center space-x-8 sm:space-x-12 md:space-x-16 lg:space-x-20'>
                    <Link className="hover:text-[#315CA9] font-medium" href="/">Home</Link>
                    <Link className="hover:text-[#315CA9] font-medium" href="/about">About Us</Link>
                    <Link className="hover:text-[#315CA9] font-medium" href="/Members">Members</Link>
                    <Link className="hover:text-[#315CA9] font-medium" href="/Rush">Rush</Link>
                    <Link className="hover:text-[#315CA9] font-medium" href="/Application">Apply</Link>
                </div>

            </div>
        </header>
    );
}