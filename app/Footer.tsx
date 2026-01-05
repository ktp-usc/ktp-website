'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="relative z-10 w-full bg-[#003166] border-t mt-auto font-inter">
            <div className="max-w-6xl mx-auto px-6 py-14">

                {/* Top section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

                    {/* Left: Logo + description + socials */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <Image
                                src="/Images/palm-tree.jpg"
                                alt="Kappa Theta Pi Logo"
                                width={40}
                                height={40}
                                className="object-contain"
                                priority
                            />
                            <h3 className="text-xl font-bold text-white">Kappa Theta Pi</h3>
                        </div>

                        <div className="text-white max-w-sm">
                            <p>Alpha Theta Chapter at the University of South Carolina</p>
                            <p className="mt-2">Where technology meets impact</p>
                        </div>

                        {/* Social Icons */}
                        <div className="flex gap-5 mt-2 text-white">

                            {/* Instagram */}
                            <a
                                href="https://www.instagram.com/ktpusc/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-gray-300 transition-colors"
                                aria-label="Instagram"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    className="h-5 w-5"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M7 2C4.243 2 2 4.243 2 7v10c0 2.757 2.243 5 5 5h10c2.757 0 5-2.243 5-5V7c0-2.757-2.243-5-5-5H7zm10 2H7C5.346 4 4 5.346 4 7v10c0 1.654 1.346 3 3 3h10c1.654 0 3-1.346 3-3V7c0-1.654-1.346-3-3-3zm-5 3a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6zm4.75-.75a1.25 1.25 0 11-2.5 0 1.25 1.25 0 012.5 0z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </a>

                            {/* LinkedIn */}
                            <a
                                href="https://www.linkedin.com/company/ktpusc/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-gray-300 transition-colors"
                                aria-label="LinkedIn"
                            >
                                <svg
                                    viewBox="-4 -2 48 48"
                                    fill="currentColor"
                                    className="h-5 w-5"
                                >
                                    <path d="M44.45 0H3.54C1.58 0 0 1.55 0 3.46V44.53C0 46.44 1.58 48 3.54 48H44.45C46.41 48 48 46.44 48 44.54V3.46C48 1.55 46.41 0 44.45 0ZM14.24 40.9H7.12V17.99H14.24V40.9ZM10.68 14.87C8.39 14.87 6.54 13.02 6.54 10.74C6.54 8.47 8.39 6.62 10.68 6.62C12.96 6.62 14.8 8.47 14.8 10.74C14.8 13.01 12.96 14.87 10.68 14.87ZM40.9 40.9H33.79V29.77C33.79 27.11 33.74 23.69 30.08 23.69C26.38 23.69 25.82 26.59 25.82 29.58V40.9H18.71V17.99H25.54V21.12H25.63C26.58 19.32 28.9 17.42 32.36 17.42C39.57 17.42 40.9 22.16 40.9 28.33V40.9Z" />
                                </svg>
                            </a>

                            {/* GarnetGate */}
                            <a
                                href="https://garnetgate.sa.sc.edu/organization/ktp"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-gray-300 transition-colors"
                                aria-label="GarnetGate"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="2 2 23 23"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    className="h-5 w-5"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                                    />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Middle: Quick Links */}
                    <div className="flex flex-col gap-3 md:items-start md:mx-auto">
                        <h4 className="font-semibold text-white">Quick Links</h4>
                        <Link href="/" className="text-white hover:text-gray-300">Home</Link>
                        <Link href="/members" className="text-white hover:text-gray-300">Members</Link>
                        <Link href="/rush" className="text-white hover:text-gray-300">Rush</Link>
                        <Link href="/apply" className="text-white hover:text-gray-300">Apply</Link>
                    </div>

                    {/* Right: Contact */}
                    <div className="flex flex-col gap-3">
                        <h4 className="font-semibold text-white">Contact</h4>
                        <a
                            href="mailto:soktp@mailbox.sc.edu"
                            className="text-white hover:text-gray-300"
                        >
                            soktp@mailbox.sc.edu
                        </a>
                        <p className="text-white">University of South Carolina</p>
                        <p className="text-white">Columbia, SC</p>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-white/20 mt-12 pt-6 text-sm text-white text-center">
                    © 2025 Kappa Theta Pi Alpha Theta. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
