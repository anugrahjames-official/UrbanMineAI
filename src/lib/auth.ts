import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export type UserRole = 'recycler' | 'dealer' | 'oem'

export interface RoleValidationResult {
    isValid: boolean
    userRole: string | null
    userId: string | null
}

/**
 * Validates if the user's role matches one of the allowed roles
 * @param allowedRoles - Array of roles that are allowed to access the resource
 * @returns Object containing validation result, user role, and user ID
 */
export async function validateUserRole(allowedRoles: UserRole[]): Promise<RoleValidationResult> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { isValid: false, userRole: null, userId: null }
    }

    const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!profile || !profile.role) {
        return { isValid: false, userRole: null, userId: user.id }
    }

    const isValid = allowedRoles.includes(profile.role as UserRole)
    return { isValid, userRole: profile.role, userId: user.id }
}

/**
 * Requires user to have one of the specified roles, redirects to appropriate dashboard if not
 * @param allowedRoles - Array of roles that are allowed to access the resource
 * @throws Redirects to login if not authenticated, or to role dashboard if unauthorized
 */
export async function requireRole(allowedRoles: UserRole[]): Promise<{ userId: string; role: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!profile || !profile.role) {
        redirect('/login')
    }

    const userRole = profile.role as UserRole

    if (!allowedRoles.includes(userRole)) {
        // Redirect to the user's appropriate dashboard
        redirectToRoleDashboard(userRole)
    }

    return { userId: user.id, role: userRole }
}

/**
 * Redirects user to their role-specific dashboard
 * @param role - User's role
 */
export function redirectToRoleDashboard(role: string): never {
    switch (role) {
        case 'recycler':
            redirect('/recycler/dashboard')
        case 'dealer':
            redirect('/dealer/dashboard')
        case 'oem':
            redirect('/oem/dashboard')
        default:
            redirect('/login')
    }
}

/**
 * Validates if a user can access a specific route based on their role
 * @param pathname - The route pathname to validate
 * @param userRole - The user's role
 * @returns true if user can access the route, false otherwise
 */
export function validateRouteAccess(pathname: string, userRole: string | null): boolean {
    if (!userRole) return false

    // Extract the role from the pathname (e.g., /recycler/dashboard -> recycler)
    const routeRole = pathname.split('/')[1]

    // Public routes that don't require role validation
    const publicRoutes = ['login', 'register', 'role-selection', 'api', '_next', 'favicon.ico']
    if (publicRoutes.includes(routeRole)) {
        return true
    }

    // Check if the route role matches the user role
    return routeRole === userRole
}

/**
 * Gets the appropriate dashboard path for a given role
 * @param role - User's role
 * @returns Dashboard path for the role
 */
export function getRoleDashboardPath(role: string): string {
    switch (role) {
        case 'recycler':
            return '/recycler/dashboard'
        case 'dealer':
            return '/dealer/dashboard'
        case 'oem':
            return '/oem/dashboard'
        default:
            return '/login'
    }
}
