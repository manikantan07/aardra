import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Admin routes require ADMIN role
    if (pathname.startsWith('/admin') && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        // /account and /admin require login
        if (pathname.startsWith('/account') || pathname.startsWith('/admin')) {
          return !!token;
        }
        // /checkout requires login
        if (pathname.startsWith('/checkout')) {
          return !!token;
        }
        return true;
      },
    },
  }
);

export const config = {
  matcher: ['/account/:path*', '/admin/:path*', '/checkout/:path*'],
};
