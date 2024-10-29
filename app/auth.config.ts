import { NextAuthConfig } from "next-auth"

export const authConfig = {
    pages: {
        signIn: "/login",
    },
    callbacks: {
      authorized({ auth, request: { nextUrl } }) {
        const isLoggedIn = !!auth?.user
        const isOnDashboard = nextUrl.pathname.startsWith("/dashboard")
        if (isOnDashboard) {
          if (isLoggedIn) {
            return true
          }
          return false // Redirect unauthenticated users to login page
        }
        return true
      },
      redirect({ url, baseUrl }) {
        // If the redirect URL is set to the root page, let signOut redirect there
        if (url === "/") {
            return url
        }
    
        // Otherwise, redirect to the dashboard by default after a successful signIn
        return url.startsWith(`${baseUrl}/dashboard`) ? url : `${baseUrl}/dashboard`
      },
    },
    providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig
