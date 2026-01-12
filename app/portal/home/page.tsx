"use client"
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import ThemeToggle from '@/components/ui/themeToggle';
import { ca } from 'date-fns/locale';

// Mock user data - replace with actual auth/data fetching
const mockUser = {
  name: "John Doe",
  role: "applicant", // "exec, applicant, member"
  headshot: "/placeholder-headshot.jpg",
  application: {
    id: "app-001",
    status: 6,
    submittedDate: "Dec 15, 2024",
    major: "Computer Science",
    year: "Junior",
    gpa: "3.8",
    LinkedIn: "https://linkedin.com/in/johndoe",
    pc: "2026"
  }
};

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState(mockUser);
  



  const getStatusColor = (status: number) => {
    switch (status) {
      case 0:
        return 'bg-green-100 text-green-800 border-green-200 ';
      case 1:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 2:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 3:
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 4:
        return 'bg-green-100 text-green-800 border-green-200';
      case 5:
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 6:
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const [spin, setSpin] = useState(false);

    useEffect(() => {
      const interval = setInterval(() => {
        setSpin(true);
        setTimeout(() => setSpin(false), 800);
      }, 4000);

      return () => clearInterval(interval);
    }, []);


  const getStatusText = (status: number) => {
    switch (status) {
      case 0:
        return 'Approved';
      case 1:
        return 'Under Review';
      case 2:
        return 'Interviews';
      case 3:
        return 'Waitlist';
      case 4:
        return 'Bid offered';
      case 5:
        return 'Bid declined';
      case 6:
        return 'Bid accepted';
      default:
        return 'Unknown';
    }
  };

  return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-800 transition-colors duration-300">
        <ThemeToggle />
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 dark:bg-gray-900 dark:border-gray-700 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            {/* Logo and Welcome */}
          <div className="flex items-center gap-6">
            <Image
              src="KTPLettersW.svg"
              alt="Kappa Theta Pi logo"
              className="hidden dark:block"
              width={100}
              height={60}
              priority
              />
            <Image
              src="/KTPLetters.svg"
              alt="Kappa Theta Pi logo"
              className="block dark:hidden"
              width={100}
              height={60}
              />
            <div className="hidden sm:block h-8 w-px bg-gray-300"></div>
            <h1 className="text-xl font-semibold text-gray-900 hidden sm:block  dark:text-white transition-colors duration-300">
              Member Portal
            </h1>
          </div>

          {/* User Info and Settings */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <Image
                src={user.headshot}
                alt={user.name}
                width={40}
                height={40}
                className="rounded-full border-2 border-blue-200 dark:border-gray-600 transition-colors duration-300"
              />
              <span className="text-sm font-medium text-gray-700 hidden md:block  dark:text-white transition-colors duration-300">
                {user.name}
              </span>
            </div>
            <button
              onClick={() => router.push('/settings')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Settings"
            >
              <svg
                className="w-7 h-7 text-gray-600  dark:text-white transition-transform duration-400 hover:rotate-90"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 bg-white-100 bg-transparent transition-colors duration-300">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2 dark:text-white transition-colors duration-300">
            Welcome, {user.name.split(' ')[0]}!
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {user.role === 'exec' 
              ? 'Manage applications and chapter roster from your dashboard.' 
              : 'Track your application status and stay updated.'}
          </p>
        </div>

        {/* Applicant View */}
        {user.role === 'applicant' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-300">Your Application</h3>
            
            <div
              onClick={() => router.push('/application/view')}
              className="bg-white rounded-xl shadow-md hover:shadow-lg dark:bg-gray-900 dark:border-gray-600 dark:hover:border-gray-400 transition-all cursor-pointer border border-gray-200 overflow-hidden group"
            >
              <div className="p-6">
                <div className="flex items-start justify-between gap-6 mb-4">

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300">
                        Spring 2026 Application
                      </h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(user.application.status)}`}>
                        {getStatusText(user.application.status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
                      Submitted on {user.application.submittedDate}
                    </p>
                  </div>

                  <div className="flex gap-6 text-left">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-white transition-colors duration-300">Major</p>
                      <p className="text-sm mt-2 font-medium text-gray-900 dark:text-gray-300 transition-colors duration-300">
                        {user.application.major}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-white transition-colors duration-300">Year</p>
                      <p className="text-sm mt-2 font-medium text-gray-900 dark:text-gray-300 transition-colors duration-300">
                        {user.application.year}
                      </p>
                    </div>
                  </div>

                  {/* Arrow */}
                  <svg
                    className="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          )}

        {/* Exec View */}
        {user.role === 'exec' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-300">Executive Dashboard</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* View Applicants Card */}
              <button
                onClick={() => router.push('/exec/applicants')}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-8 text-left border border-gray-200 hover:border-blue-300 group dark:bg-gray-900 dark:border-gray-700  duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 dark:bg-gray-700 dark:group-hover:bg-gray-600 transition-colors">
                    <svg
                      className="w-6 h-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2 dark:text-white transition-colors duration-300">
                  View Spring 2026 Applicants
                </h4>
                <p className="text-gray-600 text-sm dark:text-gray-400 transition-colors duration-300">
                  Review and manage all applications for the Spring 2026 recruitment cycle.
                </p>
              </button>

              {/* Modify Roster Card */}
              <button
                onClick={() => router.push('/exec/roster')}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-8 text-left border border-gray-200 hover:border-blue-300 group dark:bg-gray-900 dark:border-gray-700  duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 dark:bg-gray-700 dark:group-hover:bg-gray-600 transition-colors">
                    <svg
                      className="w-6 h-6 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2 dark:text-white transition-colors duration-300">
                  Modify Chapter Roster
                </h4>
                <p className="text-gray-600 text-sm dark:text-gray-400 transition-colors duration-300">
                  Update member information and manage the active chapter roster.
                </p>
              </button>
            </div>
          </div>
        )}
        {/* Member View */}
        {user.role === 'member' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-300">Member Dashboard</h3>

            
          </div>
        )}
      </main>
    </div>
  );
}