import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    "/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)",
  ],
};

export default function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get("host") || ""; // e.g. "gym-a.localhost:3000"

  // Define the root domain. In dev it's localhost:3000. In prod it might be gym-nexus.app
  // You can set this via environment variable, e.g. NEXT_PUBLIC_ROOT_DOMAIN
  // Default to localhost:3000 if not set.
  // Note: removing port for cleaner subdomain extraction logic might be needed
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN!;
  
  // Check if the current hostname is the root domain or www
  // We need to handle port presence logic broadly.
  // Also treat Vercel preview URLs (containing 'gym-nexus') as root to prevent redirection loop.
  const isRoot = 
      hostname === rootDomain || 
      hostname === `www.${rootDomain}` || 
      hostname === 'gym-nexus.vercel.app' ||
      hostname.includes('gym-nexus-admin'); // Catch Vercel previews

  if (isRoot) {
     // If it's the root domain, we normally serve the app as is.
     // BUT, if the path looks like /GymA/, we want to REDIRECT to GymA.domain.com/
     // Exempt paths: /login, /super-admin, /_next, /api, /favicon, etc.
     
     const path = url.pathname;
     const parts = path.split('/').filter(Boolean);
     const firstSegment = parts[0];

      const RESERVED_PATHS = ['super-admin', 'api', '_next', '_static', 'favicon.ico'];
     // Also skip if no segment (root)
     if (firstSegment && !RESERVED_PATHS.includes(firstSegment)) {
         // Assume it is a Gym ID. 
         // Redirect: localhost:3000/GymA/dashboard -> GymA.localhost:3000/dashboard
         
         const newSubdomain = firstSegment;
         // Remove the first segment from path
         const newPath = path.replace(`/${firstSegment}`, '') || '/';
         
         // Construct new hostname
         // Preserve port if present
         const portSuffix = rootDomain.includes(':') ? `:${rootDomain.split(':')[1]}` : '';
         const bareRoot = rootDomain.split(':')[0];
         const newHost = `${newSubdomain}.${bareRoot}${portSuffix}`;
         
         return NextResponse.redirect(new URL(newPath, `http://${newHost}`)); 
         // Note: protocol is hardcoded to http for localhost. In prod, use req.nextUrl.protocol
     }

     return NextResponse.next();
  }

  // Extract subdomain
  // logic: gym-a.localhost:3000 -> gym-a
  // logic: gym-a.gym-nexus.app -> gym-a
  let subdomain = hostname.replace(`.${rootDomain}`, '');
  // Clean up any remaining port if distinct environment mapping fails
  subdomain = subdomain.split(':')[0];

  // If we couldn't extract a subdomain or it is practically the root
  if (!subdomain || subdomain === hostname) {
      return NextResponse.next();
  }

  // Rewrite:
  // e.g. gym-a.localhost:3000/members -> internal: /gym-a/members
  // The [gymId] folder will catch "gym-a" as the gymId param.
  
  // Note: we must ensure we don't infinitely rewrite if the path already starts with the subdomain (unlikely with this matcher)
  
  const searchParams = req.nextUrl.searchParams.toString();
  const path = `${url.pathname}${
    searchParams.length > 0 ? `?${searchParams}` : ""
  }`;

  return NextResponse.rewrite(new URL(`/${subdomain}${path}`, req.url));
}
