"use client"

import React from "react";
import Image from "next/image";
import Link from "next/link";

const members = [
    {
        name: "Owen Coulam",
        role: "President",
        imageSrc: "/Images/Screenshot Owen.png",
        linkedin: "https://www.linkedin.com/in/owencoulam/"
    },
    {
        name: "Darssan Eswaramoorthi",
        role: "Vice President",
        imageSrc: "/Images/Screenshot Darssan.png",
        linkedin: "https://www.linkedin.com/in/ledarssan/"
    },
    {
        name: "Josiah White",
        role: "Executive Secretary",
        imageSrc: "/Images/Screenshot Josiah.png",
        linkedin: "https://www.linkedin.com/in/josiahawhite/"
    },
    {
        name: "Luke Jannazzo",
        role: "Director of Outreach",
        imageSrc: "/Images/Screenshot Luke.png",
        linkedin: "https://www.linkedin.com/in/lukejannazzo/"
    },
    {
        name: "Braden Guliano",
        role: "Director of Technical Development",
        imageSrc: "/Images/Screenshot Braden.png",
        linkedin: "https://www.linkedin.com/in/bguliano/"
    },
    {
        name: "Sara Muthuselvam",
        role: "Director of Finance",
        imageSrc: "/Images/Screenshot Sara.png",
        linkedin: "https://www.linkedin.com/in/sara-muthu/"
    },
    {
        name: "Katie Jones",
        role: "Director of Marketing",
        imageSrc: "/Images/Screenshot Katie.png",
        linkedin: "https://www.linkedin.com/in/katiejones404/"
    },
    {
        name: "Tarun Ramkumar",
        role: "Director of Professional Development",
        imageSrc: "/Images/Screenshot Tarun.png",
        linkedin: "https://www.linkedin.com/in/tarun-ramkumar/"
    },
    {
        name: "Sai Kotapalli",
        role: "Director of Engagement",
        imageSrc: "/Images/Screenshot Sai.png",
        linkedin: "https://www.linkedin.com/in/sai-kottapali-153695288/"
    },
];

export default function Members() {
    return (
        <div className="overflow-x-clip">
            <div className="w-full flex flex-col items-center">
                <h2 className="text-3xl font-bold text-center mt-12 mb-8">
                    Meet the Executive Board
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 pb-10 justify-items-center">
                    {members.map((member) => (
                        <div key={member.name} className="flex flex-col items-center">

                            {/* Consistent image size */}
                            <div className="w-[200px] h-[200px] rounded-md overflow-hidden">
                                <Image
                                    src={member.imageSrc}
                                    alt={`${member.role} - ${member.name}`}
                                    width={200}
                                    height={200}
                                    className="object-cover w-full h-full"
                                    priority
                                />
                            </div>

                            {/* Button — styled directly, no wrapper */}
                            <Link
                                href={member.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-4 px-6 py-3 bg-[#315CA9] text-white rounded-lg font-semibold transition-all duration-300 hover:bg-[#23498F] hover:scale-110 hover:drop-shadow-md"
                            >
                                {member.role}: {member.name}
                            </Link>

                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
