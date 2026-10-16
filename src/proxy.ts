import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/proxy';

/**
 * Creates a NextResponse.redirect while carrying over any refreshed
 * session cookies from the Supabase SSR response.
 */
function createRedirectWithCookies(url: URL, sourceResponse: NextResponse): NextResponse {
  const redirectResponse = NextResponse.redirect(url);
  sourceResponse.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
  });
  return redirectResponse;
}

/**
 * Validates local redirect path and prevents open-redirect and protocol evasion.
 */
function sanitizeRedirect(path: string | null | undefined, fallback = '/'): string {
  if (!path) return fallback;
  let decoded = path.trim();
  try {
    decoded = decodeURIComponent(decoded);
  } catch {
    return fallback;
  }
  // Must begin with a single '/' and cannot start with '//' or '/\'
  if (!decoded.startsWith('/') || decoded.startsWith('//') || decoded.startsWith('/\\')) {
    return fallback;
  }
  // Prevent redirect loops back to /login
  if (decoded === '/login' || decoded.startsWith('/login?') || decoded.startsWith('/login/')) {
    return fallback;
  }
  return path.trim();
}

/**
 * Next.js 16 Proxy Convention
 * Runs on the Node.js runtime before requests complete.
 *
 * Responsibilities:
 * 1. Refresh Supabase session tokens on incoming requests.
 * 2. Guard /organizer route from unauthenticated users and unauthorized students.
 * 3. Redirect authenticated users away from /login to safe local destinations.
 * 4. Keep all public directories (/, /houses, /societies, /events, /standings) open.
 */
export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const { supabaseResponse, user, supabase } = await updateSession(request);

  // If user is authenticated, retrieve profile role and house_id for route guards
  let profile: { role: string; house_id: string | null } | null = null;
  if (user) {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('role, house_id')
        .eq('id', user.id)
        .maybeSingle();
      profile = data;
    } catch {
      // Non-blocking: continue without profile if query fails to prevent redirect loops
    }
  }

  // 1. Guard /organizer
  if (pathname.startsWith('/organizer')) {
    if (!user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirectTo', pathname);
      return createRedirectWithCookies(loginUrl, supabaseResponse);
    }

    if (!profile || (profile.role !== 'organizer' && profile.role !== 'warden')) {
      const accessDeniedUrl = new URL('/?error=unauthorized_organizer', request.url);
      return createRedirectWithCookies(accessDeniedUrl, supabaseResponse);
    }
  }

  // 2. Guard /onboarding
  if (pathname.startsWith('/onboarding')) {
    if (!user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirectTo', '/onboarding');
      return createRedirectWithCookies(loginUrl, supabaseResponse);
    }

    if (profile) {
      // Non-students cannot access student onboarding
      if (profile.role !== 'student') {
        const dest = profile.role === 'organizer' || profile.role === 'warden' ? '/organizer' : '/';
        return createRedirectWithCookies(new URL(dest, request.url), supabaseResponse);
      }

      // Students with an already assigned house are not prompted again
      if (profile.house_id) {
        const rawRedirect = searchParams.get('redirectTo');
        const destination = sanitizeRedirect(rawRedirect, '/');
        const safeDest = destination === '/organizer' ? '/' : destination;
        return createRedirectWithCookies(new URL(safeDest, request.url), supabaseResponse);
      }
    }
  }

  // 3. Redirect authenticated users visiting /login
  if (pathname === '/login' && user) {
    const rawRedirect = searchParams.get('redirectTo');
    const destination = sanitizeRedirect(rawRedirect, '/');

    const role = profile?.role || 'student';
    const houseId = profile?.house_id || null;

    // Organizers/wardens route to /organizer by default
    if (role === 'organizer' || role === 'warden') {
      const target = destination && destination !== '/' ? destination : '/organizer';
      return createRedirectWithCookies(new URL(target, request.url), supabaseResponse);
    }

    // Resident student routing
    if (!houseId) {
      const onboardingUrl = new URL('/onboarding', request.url);
      if (destination && destination !== '/' && destination !== '/organizer') {
        onboardingUrl.searchParams.set('redirectTo', destination);
      }
      return createRedirectWithCookies(onboardingUrl, supabaseResponse);
    }

    const safeDest = destination === '/organizer' ? '/' : destination;
    return createRedirectWithCookies(new URL(safeDest, request.url), supabaseResponse);
  }

  // 4. Guard student dashboard / for students without an assigned house
  if (pathname === '/' && user) {
    const role = profile?.role || 'student';
    const houseId = profile?.house_id || null;
    if (role === 'student' && !houseId) {
      const onboardingUrl = new URL('/onboarding', request.url);
      return createRedirectWithCookies(onboardingUrl, supabaseResponse);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets (.svg, .png, .jpg, .jpeg, .gif, .webp)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
