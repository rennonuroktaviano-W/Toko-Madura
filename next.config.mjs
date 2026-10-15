const SECRET_DEV = "warung-madura-dev-secret-change-me";

if (process.env.NODE_ENV === "production") {
  const secret = process.env.AUTH_SECRET;

  if (!secret || secret === SECRET_DEV) {
    throw new Error(
      "AUTH_SECRET belum diset. Wajib diisi sebelum build production karena session login ditandatangani dengan nilai ini. Contoh: openssl rand -hex 32"
    );
  }
  if (secret.length < 32) {
    throw new Error(
      `AUTH_SECRET cuma ${secret.length} karakter, minimal 32. Contoh: openssl rand -hex 32`
    );
  }
}

const nextConfig = {
  allowedDevOrigins: ["192.168.110.185", "192.168.110.*"],
  poweredByHeader: false,
  images: {
    unoptimized: true,
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
