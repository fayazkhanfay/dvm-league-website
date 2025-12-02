import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        if (typeof document !== "undefined") {
          const value = document.cookie.match("(^|;)\\s*" + name + "\\s*=\\s*([^;]+)")?.pop() || ""
          return value
        }
        return ""
      },
      set(name: string, value: string, options: any) {
        if (typeof document !== "undefined") {
          document.cookie = `${name}=${value}; path=${options.path || "/"}; max-age=${options.maxAge || 31536000}; SameSite=${options.sameSite || "Lax"}; ${options.secure ? "Secure" : ""}`
        }
      },
      remove(name: string, options: any) {
        if (typeof document !== "undefined") {
          document.cookie = `${name}=; path=${options.path || "/"}; max-age=0`
        }
      },
    },
  })
}
