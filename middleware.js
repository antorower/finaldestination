import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/(.*)", // Προσθέτουμε όλα τα API routes ως public
  "/education",
]);

export default clerkMiddleware(async (auth, request) => {
  const url = new URL(request.url);
  const path = url.pathname;
  console.log(path);

  if (!isPublicRoute(request)) {
    await auth.protect();

    const { sessionClaims } = await auth();
    if (!sessionClaims.metadata.registered && path !== "/register") {
      return NextResponse.redirect(new URL("/register", request.url));
    }

    if (sessionClaims.metadata.registered && !sessionClaims.metadata.accepted && path !== "/user-pending") {
      return NextResponse.redirect(new URL("/user-pending", request.url));
    }

    if (sessionClaims.metadata.registered && sessionClaims.metadata.accepted && (path === "/user-pending" || path === "/register")) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
