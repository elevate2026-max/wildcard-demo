/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  poweredByHeader: false,
  // Supplied art is served byte-for-byte as delivered — no optimizer re-encoding.
  images: { unoptimized: true },
};
export default nextConfig;
