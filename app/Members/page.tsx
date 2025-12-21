"use client"

import React, { useState, useEffect, useRef } from "react";
import { ReactTyped } from "react-typed";

interface Member {
    name: string;
    imageUrl: string;
    category: string;
    linkedin: string;
    role: string;
}

// Member categories
const categories = ['Actives', 'E-Board', 'Chairs', 'Founding Class'];

const hardcodedMembers = [
    { name: 'Luke Jannazzo', imageUrl: '/Images/Screenshot Luke.png', category: 'E-Board', role: 'President', linkedin: 'https://www.linkedin.com/in/lukejannazzo/' },
    { name: 'Gwendalyn Krauss', imageUrl: '/Images/Gwendalyn.jpg', category: 'E-Board', role: 'Vice President', linkedin: 'https://www.linkedin.com/in/gwendalynkrauss/' },
    { name: 'Josiah White', imageUrl: '/Images/Screenshot Josiah.png', category: 'E-Board', role: 'Executive Secretary', linkedin: 'https://www.linkedin.com/in/josiahawhite/' },
    { name: 'Samuel Tadamatla', imageUrl: '/Images/Samuel.jpg', category: 'E-Board', role: 'Director of Outreach', linkedin: 'https://www.linkedin.com/in/tadamatla/' },
    { name: 'Alexa Adams', imageUrl: '/Images/Alexa.jpg', category: 'E-Board', role: 'Director of Marketing', linkedin: 'https://www.linkedin.com/in/alexaadams1/' },
    { name: 'Neya Murugesan', imageUrl: '/Images/Neya.jpg', category: 'E-Board', role: 'Director of Finance', linkedin: 'https://www.linkedin.com/in/neyamurugesan/' },
    { name: 'Braden Guliano', imageUrl: '/Images/Screenshot Braden.png', category: 'E-Board', role: 'Director of Technical Development', linkedin: 'https://www.linkedin.com/in/bguliano/' },
    { name: 'Dao Bui', imageUrl: '/Images/Dao.jpg', category: 'E-Board', role: 'Director of Professional Development', linkedin: 'https://www.linkedin.com/in/daotbui/' },
    { name: 'Galen Miller', imageUrl: '/Images/Galen.jpg', category: 'E-Board', role: 'Director of Engagement', linkedin: 'https://www.linkedin.com/in/galenemiller/' },   
];

const hardcodedChairs = [
    { name: 'Brett Eckstrom', imageUrl: '/Images/Screenshot Brett.png', category: 'Chairs', role: 'Conferences & Hackathons Chair', linkedin: '#' },
    { name: 'Christian Wolfe', imageUrl: '/Images/Screenshot Christian.png', category: 'Chairs', role: 'Infrastructure Chair', linkedin: '#' },
];

const foundingClass = [
    { name: "Owen Coulam", role: "President", imageUrl: "/Images/Screenshot Owen.png", linkedin: "https://www.linkedin.com/in/owencoulam/", category: 'Founding Class' },
    { name: "Darssan Eswaramoorthi", role: "Vice President", imageUrl: "/Images/Screenshot Darssan.png", linkedin: "https://www.linkedin.com/in/ledarssan/", category: 'Founding Class' },
    { name: "Josiah White", role: "Executive Secretary", imageUrl: "/Images/Screenshot Josiah.png", linkedin: "https://www.linkedin.com/in/josiahawhite/", category: 'Founding Class' },
    { name: "Luke Jannazzo", role: "Director of Outreach", imageUrl: "/Images/Screenshot Luke.png", linkedin: "https://www.linkedin.com/in/lukejannazzo/", category: 'Founding Class' },
    { name: "Braden Guliano", role: "Director of Technical Development", imageUrl: "/Images/Screenshot Braden.png", linkedin: "https://www.linkedin.com/in/bguliano/", category: 'Founding Class' },
    { name: "Sara Muthuselvam", role: "Director of Finance", imageUrl: "/Images/Screenshot Sara.png", linkedin: "https://www.linkedin.com/in/sara-muthu/", category: 'Founding Class' },
    { name: "Katie Jones", role: "Director of Marketing", imageUrl: "/Images/Screenshot Katie.png", linkedin: "https://www.linkedin.com/in/katiejones404/", category: 'Founding Class' },
    { name: "Tarun Ramkumar", role: "Director of Professional Development", imageUrl: "/Images/Screenshot Tarun.png", linkedin: "https://www.linkedin.com/in/tarun-ramkumar/", category: 'Founding Class' },
    { name: "Sai Kotapalli", role: "Director of Engagement", imageUrl: "/Images/Screenshot Sai.png", linkedin: "https://www.linkedin.com/in/sai-kottapali-153695288/", category: 'Founding Class' },
];

const allMembers = [...hardcodedMembers, ...hardcodedChairs, ...foundingClass];

export default function Members() {
    const [selectedCategory, setSelectedCategory] = useState('Actives');
    const categoryRefs = useRef<(HTMLButtonElement | null)[]>([]);

    useEffect(() => {
        const selectedIndex = categories.indexOf(selectedCategory);
        if (categoryRefs.current[selectedIndex]) {
            const { offsetLeft, offsetWidth } = categoryRefs.current[selectedIndex];
            const underline = document.querySelector('.underline') as HTMLElement;
            if (underline) {
                underline.style.left = `${offsetLeft}px`;
                underline.style.width = `${offsetWidth}px`;
            }
        }
    }, [selectedCategory]);

    const filteredMembers = allMembers.filter(member => member.category === selectedCategory);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
            <div className="max-w-7xl mx-auto px-6 py-12">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <h1 
                        className="text-3xl sm:text-4xl md:text-5xl font-black mb-0"
                        style={{
                            fontFamily: "Inter, sans-serif",
                            letterSpacing: "-0.02em",
                        }}
                    >
                        Meet Our Team Of {' '}
                        <span className="text-[#315CA9]">
                            <ReactTyped
                                strings={['Developers', 'Leaders', 'Innovators', 'Engineers', 'Problem Solvers']}
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

                {/* Category Filter Buttons */}
                <div style={{ marginBottom: '3rem', position: 'relative' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem' }}>
                        {categories.map((category, index) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                ref={(el) => { categoryRefs.current[index] = el; }}
                                style={{
                                    padding: '0.5rem 1.5rem',
                                    borderRadius: '9999px',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    backgroundColor: selectedCategory === category ? '#315CA9' : '#E5E7EB',
                                    color: selectedCategory === category ? 'white' : '#374151',
                                    boxShadow: selectedCategory === category ? '0 4px 6px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.1)'
                                }}
                                onMouseEnter={(e) => {
                                    if (selectedCategory !== category) {
                                        e.currentTarget.style.backgroundColor = '#D1D5DB';
                                    }
                                    e.currentTarget.style.transform = 'scale(1.05)';
                                }}
                                onMouseLeave={(e) => {
                                    if (selectedCategory !== category) {
                                        e.currentTarget.style.backgroundColor = '#E5E7EB';
                                    }
                                    e.currentTarget.style.transform = 'scale(1)';
                                }}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Members Grid */}
                {selectedCategory === 'E-Board' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredMembers.map((member) => (
                            <a
                                key={member.name}
                                href={member.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group bg-white rounded-xl shadow-lg hover:shadow-2xl border border-gray-100 overflow-hidden transition-all duration-300 hover:scale-105 cursor-pointer block"
                            >
                                <div className="flex flex-col items-center p-6">
                                    <div className="mb-4">
                                        <div className="w-40 h-40 rounded-full overflow-hidden ring-4 ring-blue-100 group-hover:ring-[#315CA9] transition-all duration-300">
                                            <img 
                                                src={member.imageUrl} 
                                                alt={member.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>
                                    <div className="text-center w-full">
                                        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#315CA9] transition-colors">
                                            {member.name}
                                        </h3>
                                        <div className="inline-block bg-[#315CA9] text-white px-4 py-2 rounded-full text-sm font-semibold group-hover:bg-[#23498F] transition-colors">
                                            {member.role}
                                        </div>
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                ) : selectedCategory === 'Chairs' || selectedCategory === 'Founding Class' ? (
                    null
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {filteredMembers.map((member) => (
                            <div key={member.name} className="text-center group">
                                <div className="relative w-full aspect-square mb-4">
                                    <img 
                                        src={member.imageUrl} 
                                        alt={member.name}
                                        className="w-full h-full object-cover rounded-lg shadow-md group-hover:shadow-xl transition-all duration-300"
                                    />
                                </div>
                                <p className="font-semibold text-gray-900">{member.name}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}