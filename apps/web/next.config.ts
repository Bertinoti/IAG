import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  transpilePackages: ["@airline-ai/ui"],
  outputFileTracingRoot: path.join(__dirname, "../.."),
};
export default nextConfig;
