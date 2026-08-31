import { createBrowserClient } from "@supabase/ssr";
import { toSessionCookie } from "./session-cookie";

function parseDocumentCookies() {
  return document.cookie
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const index = part.indexOf("=");
      const name = index === -1 ? part : part.slice(0, index);
      const value = index === -1 ? "" : part.slice(index + 1);
      return { name, value: decodeURIComponent(value) };
    });
}

function serializeCookie(
  name: string,
  value: string,
  options: {
    path?: string;
    domain?: string;
    sameSite?: string | boolean;
    secure?: boolean;
    maxAge?: number;
  },
) {
  let cookie = `${name}=${encodeURIComponent(value)}`;
  if (options.maxAge !== undefined) cookie += `; Max-Age=${options.maxAge}`;
  if (options.path) cookie += `; Path=${options.path}`;
  if (options.domain) cookie += `; Domain=${options.domain}`;
  if (typeof options.sameSite === "string") cookie += `; SameSite=${options.sameSite}`;
  if (options.secure) cookie += `; Secure`;
  return cookie;
}

export function createClient() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => parseDocumentCookies(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) => {
          document.cookie = serializeCookie(name, value, toSessionCookie(options));
        });
      },
    },
  });
}
