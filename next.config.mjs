/** @type {import("next").NextConfig} */

const nextConfig = {
    experimental: {
        ppr: "incremental",
    }
};

export default nextConfig

// The "incremental" value allows you to adopt PPR (partial prerendering) for specific routes.
