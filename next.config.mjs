/** @type {import('next').NextConfig} */
const nextConfig = {
    allowedDevOrigins: [
      '3000-firebase-mm-premium-menu-1779059471151.cluster-xvr5pmatm5a4gx76fmat6kxt6o.cloudworkstations.dev'
    ],
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: '*.supabase.co',
        },
      ],
    },
  };
  
  export default nextConfig;