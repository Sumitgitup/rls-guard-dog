// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({ request: req })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            req.cookies.set(name, value)
            res.cookies.set(name, value, options)
          }
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // --- CHANGE 1: Check for all protected routes ---
  const isProtectedRoute = 
    req.nextUrl.pathname.startsWith('/teacher') ||
    req.nextUrl.pathname.startsWith('/student') ||
    req.nextUrl.pathname.startsWith('/head-teacher');

  if (!user && isProtectedRoute) {
    // --- CHANGE 2: Redirect to the homepage ('/') instead of '/login' ---
    return NextResponse.redirect(new URL('/', req.url))
  }

  return res
}

export const config = {
  // --- CHANGE 3: Add all protected routes to the matcher ---
  matcher: ['/teacher/:path*', '/student/:path*', '/head-teacher/:path*'],
}