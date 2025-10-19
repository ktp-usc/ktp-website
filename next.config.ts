// next.config.js
const nextConfig = {
    async headers() {
        return [
            {
                source: "/(.*)", // apply to all routes
                headers: [
                    {
                        key: "Access-Control-Allow-Origin",
                        value: "http://100.110.188.3:3001", // allow your dev origin
                    },
                    {
                        key: "Access-Control-Allow-Methods",
                        value: "GET,POST,PUT,DELETE,OPTIONS",
                    },
                    {
                        key: "Access-Control-Allow-Headers",
                        value: "Content-Type, Authorization",
                    },
                ],
            },
        ];
    },
};

module.exports = nextConfig;