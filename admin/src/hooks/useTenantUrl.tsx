"use client";

import { usePathname, useParams } from 'next/navigation';

export function useTenantUrl() {
  const pathname = usePathname();
  const params = useParams();
  const gymId = params?.gymId as string | undefined;

  // We enforce subdomain mode, so URLs are always root-relative to the subdomain.
  // e.g. /members, /schedule
  
  const getUrl = (path: string) => {
    // Normalize path to start with /
    if (!path.startsWith('/')) path = '/' + path;
    
    // Always return the path as is, relying on the browser to resolve it relative to current subdomain.
    // If we are in the root domain (global context), this might be just /login, which is also fine.
    return path; 
  };

  return { getUrl, gymId };
}
