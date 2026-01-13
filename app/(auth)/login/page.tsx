"use client"
import Background from "@/components/Background";
import ThemeToggle from "@/components/ui/themeToggle";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from "next/image";




export default function LoginPage() {
  const router = useRouter();
  const handleHomeClick = () => {
    document.documentElement.classList.remove('dark');
    router.push('/');
  };
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 dark:bg-gray-900 transition-colors duration-300">
      <ThemeToggle />
      
      {/* Left Side - Gradient Background Section */}
      <div className="relative hidden md:flex">

        <Background className="absolute inset-0" />
        <button
        onClick={handleHomeClick}
        className="fixed top-6 left-12 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium text-sm"
        aria-label="Return to homepage"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        Home
      </button>
        <div className="relative z-10 flex flex-col justify-center px-12 lg:px-16">
          
          <div className="space-y-6">
            
            <div className="inline-block">
              <Image
              src="KTPLettersW.svg"
              alt="Kappa Theta Pi logo"
              width={220}
              height={140}
              priority
              />
            <div className="h-1 w-20 bg-white/80 rounded-full"></div>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-white">
              Welcome Back
            </h2>
            <p className="text-lg lg:text-xl max-w-md text-white/90 leading-relaxed">
              Sign in to continue to your dashboard and manage your account.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex items-center justify-center px-6 py-12 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
        <div className="w-full max-w-md">
          {/* Mobile Logo */} 
            <div className="flex justify-center mb-6">
            <Image
            src="/KTPLettersW.svg"
            alt="Kappa Theta Pi logo"
            className="hidden dark:block"
            width={120}
            height={40}
            />
            <Image
            src="/KTPLetters.svg"
            alt="Kappa Theta Pi logo"
            className="block dark:hidden"
            width={120}
            height={40}
            />

            </div>
          {/* Form Container */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl dark:shadow-gray-900/50 p-8 lg:p-10 transition-colors duration-300 border dark:border-gray-700">
            <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Sign In</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-5">Enter your credentials to access your account</p>
            
            <form className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="example@email.sc.edu"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </label>
                  <Link href="/login/forgotpassword" className="text-sm text-blue-900 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 font-medium">
                    Forgot?
                  </Link>
                </div>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              {/* Testing Purposes */}
              <button
                type="submit"
                //onClick={() => router.push("/homepage")}
                className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 py-3 text-white font-semibold hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-lg shadow-blue-500/30"
              >
                Sign In
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}