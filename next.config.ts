import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "*.public.blob.vercel-storage.com",
                pathname: "/**"
            }
        ]
    },
    outputFileTracingIncludes: {
        "/api/employers/resumes": [
            "./app/api/employers/resumes/**/*.pdf",
            "./app/api/employers/resumes/**/*.docx"
        ],
        "/api/employers/resumes/[id]": [
            "./app/api/employers/resumes/**/*.pdf",
            "./app/api/employers/resumes/**/*.docx"
        ],
        "/api/employers/resumes/download": [
            "./app/api/employers/resumes/**/*.pdf",
            "./app/api/employers/resumes/**/*.docx"
        ]
    }
};

export default nextConfig;
