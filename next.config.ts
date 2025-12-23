import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './stories/**/*.{js,ts,jsx,tsx,mdx}',
  ],

};

export default nextConfig;
