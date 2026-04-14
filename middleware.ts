// middleware.ts — security headers pass-through
// Rate limiting removed for simplicity. The API routes use Zod validation
// and the security headers in next.config.js protect all pages.
export { default } from "next/dist/server/web/spec-extension/response";

export const config = {
  matcher: [],
};
