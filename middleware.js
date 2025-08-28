import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)", "/api/(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  const url = new URL(request.url);
  const path = url.pathname;

  if (path === "/not-found") return NextResponse.next();

  if (!isPublicRoute(request)) {
    await auth.protect();
    const { userId, sessionClaims } = await auth();

    console.log("Middleware User Id: ", userId);
    console.log("Middleware Session Claims: ", sessionClaims);
    console.log("Middleware First Name: ", sessionClaims.firstName);
    console.log("Middleware First Name: ", sessionClaims.lastName);

    //#region Authentication
    if (!sessionClaims.metadata.registered && path !== "/register") {
      return NextResponse.redirect(new URL("/register", request.url));
    }

    if (sessionClaims.metadata.registered && !sessionClaims.metadata.accepted && path !== "/user-pending") {
      return NextResponse.redirect(new URL("/user-pending", request.url));
    }

    if (sessionClaims.metadata.registered && sessionClaims.metadata.accepted && (path === "/user-pending" || path === "/register")) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    //#endregion

    //#region Admin Permissions
    if (path.startsWith("/admin")) {
      if (!sessionClaims.metadata.isOwner && !sessionClaims.metadata.isLeader) return NextResponse.redirect(new URL("/not-found", request.url));
      //return NextResponse.redirect(new URL("/not-found", request.url));
    }

    if (path.startsWith("/admin/new-users") && !sessionClaims.metadata.isOwner) return NextResponse.redirect(new URL("/not-found", request.url));
    if (path.startsWith("/admin/payouts") && !sessionClaims.metadata.isOwner) return NextResponse.redirect(new URL("/not-found", request.url));
    if (path.startsWith("/admin/companies") && !sessionClaims.metadata.isOwner) return NextResponse.redirect(new URL("/not-found", request.url));
    if (path.startsWith("/admin/pairs") && !sessionClaims.metadata.isOwner) return NextResponse.redirect(new URL("/not-found", request.url));
    if (path.startsWith("/admin/schedule") && !sessionClaims.metadata.isOwner) return NextResponse.redirect(new URL("/not-found", request.url));
    if (path.startsWith("/admin/settings") && !sessionClaims.metadata.isOwner) return NextResponse.redirect(new URL("/not-found", request.url));
    if (path.startsWith("/admin/stats") && !sessionClaims.metadata.isOwner) return NextResponse.redirect(new URL("/not-found", request.url));

    if (path.startsWith("/admin/tasks") && !sessionClaims.metadata.isOwner && !sessionClaims.metadata.isLeader) return NextResponse.redirect(new URL("/not-found", request.url));
    if (path.startsWith("/admin/traders") && !sessionClaims.metadata.isOwner && !sessionClaims.metadata.isLeader) return NextResponse.redirect(new URL("/not-found", request.url));
    if (path.startsWith("/admin/accounts") && !sessionClaims.metadata.isOwner && !sessionClaims.metadata.isLeader) return NextResponse.redirect(new URL("/not-found", request.url));
    if (path.startsWith("/admin/trades") && !sessionClaims.metadata.isOwner && !sessionClaims.metadata.isLeader) return NextResponse.redirect(new URL("/not-found", request.url));
    if (path.startsWith("/admin/payments") && !sessionClaims.metadata.isOwner && !sessionClaims.metadata.isLeader) return NextResponse.redirect(new URL("/not-found", request.url));
    if (path.startsWith("/admin/charges") && !sessionClaims.metadata.isOwner && !sessionClaims.metadata.isLeader) return NextResponse.redirect(new URL("/not-found", request.url));
    //#endregion

    //asdfsd
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
