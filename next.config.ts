import type { NextConfig } from "next";

// Static export for GitHub Pages -- no server here (the "shell" is a fake
// one running entirely client-side), and no next/image use. basePath only
// applies in production: GitHub Pages serves this as a project site at
// /ide-portfolio/, but `next dev` still needs to run at "/" locally.
const repoName = "ide-portfolio";
const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export",
  basePath: isProd ? `/${repoName}` : "",
  assetPrefix: isProd ? `/${repoName}/` : "",
  images: { unoptimized: true },
};

export default nextConfig;
