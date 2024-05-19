import { NextRequest, NextResponse } from 'next/server'
// import type { NextRequest } from 'next/server'
export {default} from 'next-auth/middleware' 
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {

  const token = await getToken({req: request})
  const url = request.nextUrl

  if(token && (
    url.pathname.startsWith('/sign-in') || 
    url.pathname.startsWith('/sign-up') || 
    url.pathname.startsWith('/verify') || 
    url.pathname.startsWith('/')
    )) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  // return NextResponse.redirect(new URL('/sign-in', request.url))
}
 
// paths in which middleware will run 
export const config = {
  matcher: [
    '/sign-in',
    '/sign-up',
    '/',
    '/dashboard/:path*',    // in all dashboard path,
    '/verify/:path*'        
  ],
}
