"use server"

import { createClient } from "@/lib/supabase/server"

/**
 * Get signed URLs for multiple files in one batch request
 * This is much more efficient than individual getSignedFileUrl calls
 * @param paths - Array of storage object paths
 * @returns Map of path to signed URL
 */
export async function getSignedUrlsBatch(paths: string[]) {
  const supabase = await createClient()

  // Verify user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Not authenticated", urls: {} }
  }

  // Generate all signed URLs in parallel (3600 seconds = 1 hour expiry)
  const urlPromises = paths.map(async (path) => {
    const { data, error } = await supabase.storage.from("case-bucket").createSignedUrl(path, 3600)

    return {
      path,
      url: data?.signedUrl || null,
      error: error?.message || null,
    }
  })

  const results = await Promise.all(urlPromises)

  // Convert to map
  const urlMap: Record<string, string> = {}
  results.forEach((result) => {
    if (result.url) {
      urlMap[result.path] = result.url
    }
  })

  return { success: true, urls: urlMap }
}
