import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/classes(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

export default clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req)) {
    auth().protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|.*\\.(?:css|js|png|jpg|jpeg|gif|svg|ico|txt|map)).*)",
    "/(api|trpc)(.*)",
  ],
};
