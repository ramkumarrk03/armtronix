import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev only: let phones and other machines on the local network load the
  // dev bundles (real-device testing). Covers the private IPv4 ranges so it
  // keeps working when the Mac's Wi-Fi address changes.
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "172.*.*.*", "*.local"],
};

export default nextConfig;
