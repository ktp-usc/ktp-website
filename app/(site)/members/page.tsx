"use client";

import React, { useEffect, useRef, useState } from "react";
import { ReactTyped } from "react-typed";
import membersData from "./members.json";

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

const categories = ["Actives", "E-Board", "Chairs", "Founding Class"];

// Sort utility
const sortByLastName = (members: Member[]): Member[] =>
  [...members].sort((a, b) => {
    const lastA = (a.name || "").split(" ").slice(-1)[0];
    const lastB = (b.name || "").split(" ").slice(-1)[0];
    return lastA.localeCompare(lastB);
  });

// ✅ SAFE image fallback helper (prevents infinite 404 loop)
const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  const img = e.currentTarget;
  if (img.dataset.fallback !== "true") {
    img.dataset.fallback = "true";
    img.src = "/Images/default.jpg";
  }
};

/* -------------------------
   Modal component
   ------------------------- */

/**
 * MemberModal handles its own entrance and exit animation.
 * - When it mounts with `member`, it animates in.
 * - When user requests close (click backdrop, press Escape, or press X),
 *   it plays the exit animation then calls onClose (so the parent can actually unset the member).
 */
function MemberModal({
  member,
  onClose,
}: {
  member: Member | null;
  onClose: () => void; // called after exit animation completes
}) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false); // triggers entrance animation
  const isClosingRef = useRef(false); // guard to avoid double-close

  // when modal first appears, trigger mounted -> true on next frame to run the CSS transition
  useEffect(() => {
    if (!member) return;
    isClosingRef.current = false;
    setMounted(false);
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, [member]);

  // keyboard handling: Escape triggers animated close
  useEffect(() => {
    if (!member) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") startClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [member]);

  // if modal not present, render nothing
  if (!member) return null;

  // treat literal "Member" (case-insensitive) as absent
  const cleanedRole =
    member.role && member.role.trim().toLowerCase() === "member"
      ? undefined
      : member.role && member.role.trim().length
      ? member.role.trim()
      : undefined;

  const showRoleLine = Boolean(cleanedRole || member.major || member.year);

  // Called to begin the closing animation. After transition end, call onClose()
  const startClose = () => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    setMounted(false);
    // We rely on transitionend to call onClose() below; but also set a safety timeout
    // in case transitionend doesn't fire for some reason.
    const timeout = window.setTimeout(() => {
      // last resort: call onClose if not already unmounted
      if (isClosingRef.current) {
        isClosingRef.current = false;
        onClose();
      }
    }, 400 + 50); // duration + small buffer (match CSS duration)
    // cleanup will clear timeout when transitionend fires
    const ref = dialogRef.current;
    const onTransitionEnd = (e: TransitionEvent) => {
      // only react to the modal container's opacity/transform transition
      if (e.target !== ref) return;
      window.clearTimeout(timeout);
      if (isClosingRef.current) {
        isClosingRef.current = false;
        onClose();
      }
    };
    if (ref) {
      ref.addEventListener("transitionend", onTransitionEnd, { once: true });
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 transition-opacity duration-300 ease-out ${
          mounted ? "opacity-100" : "opacity-0"
        }`}
        onClick={startClose}
      />

      {/* content */}
      <div
        ref={dialogRef}
        // animation classes -- start from scale-95 + opacity-0 and transition to scale-100 + opacity-100
        className={`relative z-10 bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 transform transition-all duration-300 ease-out ${
          mounted ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-2"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close X */}
        <button
          onClick={startClose}
          aria-label="Close card"
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-800 cursor-pointer"
        >
          ✕
        </button>

        <div className="flex gap-6 items-start">
          <div className="w-36 h-36 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
            {member.imageUrl && member.imageUrl.trim() !== "" ? (
              <img
                src={member.imageUrl}
                alt={member.name}
                className="w-full h-full object-cover"
                onError={handleImageError}
                loading="lazy"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-white font-bold"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(49,92,169,0.9), rgba(35,73,143,0.9))",
                }}
              >
                {member.name
                  .split(" ")
                  .map((s) => s[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </div>
            )}
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

            <div className="mt-4 flex flex-wrap gap-3">
              {member.linkedin && member.linkedin !== "#" ? (
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#315CA9] text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-[#23498F] transition-colors"
                >
                  View LinkedIn
                </a>
              ) : null}

              {member.instagram && member.instagram !== "#" ? (
                <a
                  href={member.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-pink-500 text-white px-4 py-2 rounded-full text-sm font-semibold hover:brightness-90 transition"
                >
                  View Instagram
                </a>
              ) : null}
            </div>

            <div className="mt-6 text-sm text-gray-700">
              <h4 className="font-semibold mb-2">About</h4>
              <p>{member.bio || "No bio provided."}</p>
            </div>
          </div>
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
  const categoryRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [activeMember, setActiveMember] = useState<Member | null>(null);

  // Build a quick map of exec roles by name from the eBoard array
  const execRoleMap: Record<string, string> = {};
  (membersData.eBoard || []).forEach((m: Member) => {
    if (m && m.name) {
      const roleClean =
        m.role && m.role.trim().toLowerCase() === "member" ? undefined : m.role?.trim();
      if (roleClean) execRoleMap[m.name] = roleClean;
    }
  });

  const allMembers: Member[] = [
    ...(membersData.eBoard || []),
    ...(membersData.chairs || []),
    ...(membersData.foundingClass || []),
    ...(membersData.actives || []),
  ];

  useEffect(() => {
    // underline logic intentionally no-op (we removed underline visually)
  }, [selectedCategory]);

  const filtered =
    selectedCategory === "Actives"
      ? sortByLastName(allMembers.filter((m) => (m.category || "Actives") === "Actives"))
      : allMembers.filter((m) => (m.category || "") === selectedCategory);

  // helper to open modal with role resolved (prefers explicit role on record, else exec map)
  const openMemberModal = (m: Member) => {
    const roleOnRecord =
      m.role && m.role.trim().toLowerCase() === "member" ? undefined : m.role?.trim();
    const execRole = execRoleMap[m.name];
    // prefer roleOnRecord if it's meaningful, otherwise use execRole if present
    const resolvedRole = roleOnRecord || execRole;
    setActiveMember({ ...m, role: resolvedRole });
  };

  // close handler invoked after the modal's exit animation completes
  const handleModalCloseAfterAnimation = () => {
    setActiveMember(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-black mb-0"
            style={{
              fontFamily: "Inter, sans-serif",
              letterSpacing: "-0.02em",
            }}
          >
            Meet Our Team Of{" "}
            <span className="text-[#315CA9]">
              <ReactTyped
                strings={[
                  "Developers",
                  "Leaders",
                  "Innovators",
                  "Engineers",
                  "Problem Solvers",
                ]}
                typeSpeed={60}
                backSpeed={50}
                backDelay={1500}
                loop
              />
            </span>
          </h1>

          <p className="text-base sm:text-xl mt-8 mb-8 font-medium text-gray-600 max-w-2xl mx-auto">
            Our community is built on shared passion for technology and diverse backgrounds coming together.
          </p>
        </div>

        {/* Category Buttons */}
        <div className="flex justify-center gap-4 mb-12">
          {categories.map((c, i) => (
            <button
              key={c}
              ref={(el) => {
                categoryRefs.current[i] = el;
              }}
              onClick={() => setSelectedCategory(c)}
              className={`px-4 py-2 rounded-full font-semibold transition-all cursor-pointer ${
                selectedCategory === c ? "bg-[#315CA9] text-white shadow-md" :
                "bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-sm hover:-translate-y-[1px]"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* ================= ACTIVES ================= */}
        {selectedCategory === "Actives" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {filtered.map((member) => (
              <div key={member.name} className="flex flex-col items-center">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    openMemberModal(member);
                  }}
                  className="flex flex-col items-center group w-full"
                >
                  <div className="relative block rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 hover:scale-105 w-full">
                    <div className="w-full aspect-square rounded-2xl overflow-hidden relative">
                      <img
                        src={member.imageUrl && member.imageUrl.trim() !== "" ? member.imageUrl : "/Images/default.jpg"}
                        alt={member.name}
                        className="w-full h-full object-cover transition-all duration-300 group-hover:brightness-75"
                        onError={handleImageError}
                        loading="lazy"
                      />

                      {/* Hover ring left intact */}
                      <div className="absolute inset-0 rounded-2xl ring-4 ring-blue-100 group-hover:ring-[#315CA9] transition-all duration-300 pointer-events-none" />
                    </div>
                  </div>

                  <p className="mt-4 text-sm sm:text-base font-semibold text-gray-900 text-center whitespace-nowrap">
                    {member.name}
                  </p>
                </a>
              </div>
            ))}
          </div>
        )}

        {/* ================= E-Board ================= */}
        {selectedCategory === "E-Board" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((member) => (
              <a
                key={member.name}
                href={member.linkedin || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white rounded-xl shadow-lg hover:shadow-2xl border border-gray-100 overflow-hidden transition-all duration-300 hover:scale-105 cursor-pointer block"
              >
                <div className="flex flex-col items-center p-6">
                  <div className="mb-4 relative">
                    <div className="w-40 h-40 rounded-full overflow-hidden ring-4 ring-blue-100 group-hover:ring-[#315CA9] transition-all duration-300 relative">
                      <img
                        src={member.imageUrl && member.imageUrl.trim() !== "" ? member.imageUrl : "/Images/default.jpg"}
                        alt={member.name}
                        className="w-full h-full object-cover group-hover:brightness-50 transition-all duration-300"
                        onError={handleImageError}
                        loading="lazy"
                      />
                      {/* LinkedIn Icon - slides up from bottom */}
                      <div className="absolute bottom-0 left-0 right-0 flex justify-center translate-y-full group-hover:translate-y-0 transition-transform duration-300 pb-4">
                        <div className="bg-[#315CA9] rounded-full p-2 shadow-lg">
                          <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-center w-full">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#315CA9] transition-colors">
                      {member.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {member.major} • {member.year}
                    </p>
                    <div className="inline-block bg-[#315CA9] text-white px-4 py-2 rounded-full text-sm font-semibold group-hover:bg-[#23498F] transition-colors">
                      {member.role}
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}

        {/* ================= Chairs ================= */}
        {selectedCategory === "Chairs" && (
          <div className="flex justify-center gap-6 flex-wrap">
            {filtered.map((member) => (
              <a
                key={member.name}
                href={member.linkedin || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white rounded-xl shadow-lg hover:shadow-2xl border border-gray-100 overflow-hidden transition-all duration-300 hover:scale-105 cursor-pointer block w-full max-w-sm"
              >
                <div className="flex flex-col items-center p-6">
                  <div className="mb-4 relative">
                    <div className="w-40 h-40 rounded-full overflow-hidden ring-4 ring-blue-100 group-hover:ring-[#315CA9] transition-all duration-300 relative">
                      <img
                        src={member.imageUrl && member.imageUrl.trim() !== "" ? member.imageUrl : "/Images/default.jpg"}
                        alt={member.name}
                        className="w-full h-full object-cover group-hover:brightness-50 transition-all duration-300"
                        onError={handleImageError}
                        loading="lazy"
                      />
                      {/* LinkedIn Icon - slides up from bottom */}
                      <div className="absolute bottom-0 left-0 right-0 flex justify-center translate-y-full group-hover:translate-y-0 transition-transform duration-300 pb-4">
                        <div className="bg-[#315CA9] rounded-full p-2 shadow-lg">
                          <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-center w-full">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#315CA9] transition-colors">{member.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{member.major} • {member.year}</p>
                    <div className="inline-block bg-[#315CA9] text-white px-4 py-2 rounded-full text-sm font-semibold group-hover:bg-[#23498F] transition-colors">
                      {member.role}
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}

        {/* Member modal (click X or backdrop or press Escape to close) */}
        <MemberModal member={activeMember} onClose={handleModalCloseAfterAnimation} />

        {/* Founding Class intentionally not rendered (keeps parity with prior code) */}
      </div>
    </div>
  );
}
