/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',  // ✅ Allows your Supabase storage URLs
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com', // ✅ Allows future Cloudinary uploads
      },
    ],
  },
};

module.exports = nextConfig;