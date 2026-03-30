import { withAuth } from "next-auth/middleware";

export const proxy = withAuth({
  callbacks: {
    authorized({ token }) {
      return !!token;
    },
  },
});

export const config = {
  matcher: ["/dashboard/:path*", "/api/upload/:path*"],
};
