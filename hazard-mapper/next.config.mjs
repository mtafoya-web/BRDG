import { networkInterfaces } from "node:os";

const localNetworkAddresses = Object.values(networkInterfaces())
  .flat()
  .filter(
    (network) =>
      network?.family === "IPv4" &&
      !network.internal
  )
  .map((network) => network.address);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow phones and other LAN devices without hard-coding this computer's IP.
  allowedDevOrigins: localNetworkAddresses,
  reactCompiler: true,
};

export default nextConfig;
