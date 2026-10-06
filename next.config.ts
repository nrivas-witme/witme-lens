import type { NextConfig } from "next";

const staticExport = process.env.STATIC_EXPORT === "1";
const basePath = process.env.NEXT_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  ...(staticExport
    ? {
        output: "export",
        images: { unoptimized: true },
        ...(basePath
          ? {
              basePath,
              assetPrefix: `${basePath}/`,
            }
          : {}),
      }
    : {}),
};

export default nextConfig;
