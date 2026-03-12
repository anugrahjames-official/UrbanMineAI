import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set({ name, value, ...options }))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set({ name, value, ...options })
          )
        },
      },
    }
  )

  // Refresh the auth token
  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/register', '/role-selection', '/marketplace']
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route))

  // API routes should not be blocked by authentication middleware
  const isApiRoute = pathname.startsWith('/api/')

  // If user is not authenticated and trying to access protected route (excluding API routes)
  if (!user && !isPublicRoute && !isApiRoute) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    return NextResponse.redirect(redirectUrl)
  }

  // If user is authenticated, validate role-based access
  if (user) {
    // Get user role from database
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    // If we can't get the profile, allow the request to continue
    // The layout will handle the redirect via requireRole
    if (profileError || !profile?.role) {
      return supabaseResponse
    }

    const userRole = profile.role

    // Define role-based route patterns
    const roleRoutes = {
      recycler: /^\/recycler\/.*/,
      dealer: /^\/dealer\/.*/,
      oem: /^\/oem\/.*/,
    }

    // Check if user is trying to access a role-specific route
    for (const [role, pattern] of Object.entries(roleRoutes)) {
      if (pattern.test(pathname)) {
        // If the route doesn't match the user's role, redirect to their dashboard
        if (role !== userRole) {
          const redirectUrl = request.nextUrl.clone()

          // Redirect to user's appropriate dashboard
          switch (userRole) {
            case 'recycler':
              redirectUrl.pathname = '/recycler/dashboard'
              break
            case 'dealer':
              redirectUrl.pathname = '/dealer/dashboard'
              break
            case 'oem':
              redirectUrl.pathname = '/oem/dashboard'
              break
            default:
              redirectUrl.pathname = '/login'
          }

          // Prevent redirect loop - only redirect if not already at target
          if (redirectUrl.pathname !== pathname) {
            return NextResponse.redirect(redirectUrl)
          }
        }
        break
      }
    }
  }

  return supabaseResponse
}
