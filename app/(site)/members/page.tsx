"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ReactTyped } from "react-typed";
import { motion, AnimatePresence } from "framer-motion";
import membersData from @data/membersData.json;

interface Member {
    name: string;
    imageUrl?: string;
    category?: string;
    linkedin?: string;
    instagram?: string;
    role?: string;
    major?: string;
    year?: string;
    bio?: string;
}

const categories = ["Actives", "Executive Board", "Chairs", "Founding Class"];

const sortByLastName = (members: Member[]): Member[] =>
    [...members].sort((a, b) => {
        const lastA = (a.name || "").split(" ").slice(-1)[0];
        const lastB = (b.name || "").split(" ").slice(-1)[0];
        return lastA.localeCompare(lastB);
    });

/* -------------------------
    Modal component
   ------------------------- */

function MemberModal({ member, onClose }: { member: Member | null; onClose: () => void; }) {
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        if (!member) return;
        setImageError(false);
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [member, onClose]);

    if (!member) return null;

    const cleanedRole = member.role && member.role.trim().toLowerCase() === "member" ? undefined : member.role?.trim();
    const showRoleLine = Boolean(cleanedRole || member.major || member.year);
    const imageUrl = member.imageUrl && member.imageUrl.trim() !== "" && !imageError ? member.imageUrl : "/Images/default.jpg";

    return (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={onClose} />
            <div className="relative z-10 bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 overflow-y-auto max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute right-4 top-4 text-gray-500 hover:text-gray-800 p-2 cursor-pointer z-20">✕</button>
                <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left mt-4 sm:mt-0">
                    <div className="w-36 h-36 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0 relative">
                        <Image src={imageUrl} alt={member.name} fill className="object-cover" onError={() => setImageError(true)} sizes="288px" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-2xl font-semibold">{member.name}</h3>
                        {showRoleLine && (
                            <p className="text-sm text-gray-600 mt-1">
                                {cleanedRole ? cleanedRole + (member.major || member.year ? " • " : "") : ""}
                                {member.major ? member.major + (member.year ? " • " : "") : ""}
                                {member.year || ""}
                            </p>
                        )}
                        <div className="mt-4">
                            {member.linkedin && member.linkedin !== "#" && (
                                <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="bg-[#315CA9] text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-[#23498F] cursor-pointer transition-colors">View LinkedIn</a>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* -------------------------
    Card Components
   ------------------------- */

function MemberCard({ member, imageError, onImageError }: { member: Member; imageError: boolean; onImageError: () => void; }) {
    const imageUrl = member.imageUrl && !imageError ? member.imageUrl : "/Images/default.jpg";
    return (
        <div className="w-full aspect-square rounded-2xl overflow-hidden relative">
            <Image
                src={imageUrl}
                alt={member.name}
                fill
                className="object-cover transition-all duration-300 group-hover:brightness-75"
                onError={onImageError}
                sizes="(max-width: 640px) 50vw, 300px"
            />
            {/* Blue ring removed here */}
            <div className="absolute inset-0 rounded-2xl ring-4 ring-blue-100 transition-all duration-300 pointer-events-none" />
        </div>
    );
}

function ProfileCard({ member, imageError, onImageError }: { member: Member; imageError: boolean; onImageError: () => void; }) {
    const imageUrl = member.imageUrl && !imageError ? member.imageUrl : "/Images/default.jpg";
    return (
        <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden ring-4 ring-blue-100 group-hover:ring-[#315CA9] transition-all duration-300 relative mx-auto">
            <Image src={imageUrl} alt={member.name} fill className="object-cover group-hover:brightness-50 transition-all duration-300" onError={onImageError} sizes="320px" />
            <div className="absolute bottom-0 left-0 right-0 flex justify-center translate-y-full group-hover:translate-y-0 transition-transform duration-300 pb-4">
                <div className="bg-[#315CA9] rounded-full p-2 shadow-lg">
                    <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                </div>
            </div>
        </div>
    );
}

/* -------------------------
    Main component
   ------------------------- */

export default function Members() {
    const [selectedCategory, setSelectedCategory] = useState("Actives");
    const [activeMember, setActiveMember] = useState<Member | null>(null);
    const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

    const allMembers: Member[] = [
        ...(membersData.eBoard || []),
        ...(membersData.chairs || []),
        ...(membersData.foundingClass || []),
        ...(membersData.actives || []),
    ];

    const filtered =
        selectedCategory === "Actives"
            ? sortByLastName(allMembers.filter((m) => (m.category || "Actives") === "Actives"))
            : allMembers.filter((m) => (m.category || "") === selectedCategory);

    const handleImageError = (memberName: string) => {
        setImageErrors(prev => ({ ...prev, [memberName]: true }));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

                <div className="text-center mb-8 sm:mb-12">
                    <h1 className="text-2xl sm:text-4xl md:text-5xl font-black mb-0 tracking-tight" style={{ fontFamily: "Inter, sans-serif" }}>
                        Meet Our{" "}
                        <span className="text-[#315CA9] block sm:inline">
              <ReactTyped strings={["Actives", "Executive Board", "Chairs", "Founding Class"]} typeSpeed={60} backSpeed={50} backDelay={1500} loop />
            </span>
                    </h1>
                    <p className="text-sm sm:text-xl mt-4 sm:mt-8 mb-4 sm:mb-8 font-medium text-gray-600 max-w-2xl mx-auto px-2">
                        From our passionate actives to our visionary founding class, discover the individuals driving our mission forward.
                    </p>
                </div>

                <div className="mb-8 sm:mb-12">
                    <div className="flex sm:justify-center overflow-x-auto no-scrollbar gap-4 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
                        {categories.map((c) => (
                            <button
                                key={c}
                                onClick={() => setSelectedCategory(c)}
                                className={`px-4 sm:px-5 py-2 rounded-full font-semibold transition-all cursor-pointer whitespace-nowrap flex-shrink-0 text-sm sm:text-base ${
                                    selectedCategory === c
                                        ? "bg-[#315CA9] text-white shadow-md translate-y-0"
                                        : "bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-sm hover:-translate-y-[1px]"
                                }`}
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                </div>

                <AnimatePresence initial={false}>
                    <motion.div
                        key={selectedCategory}
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                    >
                        {selectedCategory === "Actives" && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-8">
                                {filtered.map((member) => (
                                    <div key={member.name} className="flex flex-col items-center">
                                        <a
                                            href="#"
                                            onClick={(e) => { e.preventDefault(); setActiveMember(member); }}
                                            className="group w-full cursor-pointer flex flex-col items-center"
                                        >
                                            <div className="relative block rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 hover:scale-105 w-full">
                                                <MemberCard member={member} imageError={imageErrors[member.name] || false} onImageError={() => handleImageError(member.name)} />
                                            </div>
                                            {/* Blue hover text color removed here */}
                                            <p className="mt-3 text-xs sm:text-base font-semibold text-gray-900 text-center line-clamp-1 transition-colors">{member.name}</p>
                                        </a>
                                    </div>
                                ))}
                            </div>
                        )}

                        {selectedCategory === "Founding Class" && (
                            <div>
                                <div className="max-w-4xl mx-auto mb-10 px-2">
                                    <div className="bg-white/50 border border-blue-100 rounded-2xl p-6 sm:p-8 text-center shadow-sm">
                                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Founders of Kappa Theta Pi Alpha Theta</h2>
                                        <p className="text-gray-600 text-sm sm:text-lg">Meet the members that laid the foundation for Kappa Theta Pi at the University of South Carolina. Their vision and dedication have shaped our organization into what it is today.</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-8">
                                    {filtered.map((member) => (
                                        <div key={member.name} className="flex flex-col items-center">
                                            <a
                                                href="#"
                                                onClick={(e) => { e.preventDefault(); setActiveMember(member); }}
                                                className="group w-full cursor-pointer flex flex-col items-center"
                                            >
                                                <div className="relative block rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 hover:scale-105 w-full">
                                                    <MemberCard member={member} imageError={imageErrors[member.name] || false} onImageError={() => handleImageError(member.name)} />
                                                </div>
                                                {/* Blue hover text color removed here */}
                                                <p className="mt-3 text-xs sm:text-base font-semibold text-gray-900 text-center line-clamp-1 transition-colors">{member.name}</p>
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {(selectedCategory === "Executive Board" || selectedCategory === "Chairs") && (
                            <div className={selectedCategory === "Executive Board" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col sm:flex-row sm:justify-center gap-6 flex-wrap"}>
                                {filtered.map((member) => (
                                    <a key={member.name} href={member.linkedin || "#"} target="_blank" rel="noopener noreferrer" className="group bg-white rounded-xl shadow-lg border-2 border-blue-200 overflow-hidden transition-all duration-300 hover:scale-[1.02] cursor-pointer block w-full sm:max-w-sm">
                                        <div className="flex flex-col items-center p-6">
                                            <ProfileCard member={member} imageError={imageErrors[member.name] || false} onImageError={() => handleImageError(member.name)} />
                                            <div className="text-center w-full mt-4">
                                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#315CA9] transition-colors">{member.name}</h3>
                                                <p className="text-xs text-gray-600 mb-2">{member.major} • {member.year}</p>
                                                <p className="text-sm font-medium text-gray-700">{member.role}</p>
                                            </div>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                <MemberModal member={activeMember} onClose={() => setActiveMember(null)} />
            </div>

            <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
        </div>
    );
}