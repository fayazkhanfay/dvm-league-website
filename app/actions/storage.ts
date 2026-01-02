"use server"

import { createClient } from "@/lib/supabase/server"

/**
 * Get a signed URL for a file in the case-bucket storage.
 * @param path - The storage object path
 * @returns An object with success status and either signedUrl or error
 */
export async function getSignedFileUrl(path: string) {
  const supabase = await createClient()

  // Verify user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Not authenticated" }
  }

  // Generate signed URL with 1 hour expiry
  const { data, error } = await supabase.storage.from("case-bucket").createSignedUrl(path, 3600)

  if (error) {
    console.error("[v0] Error generating signed URL:", error)
    return { success: false, error: error.message }
  }

  if (!data || !data.signedUrl) {
    return { success: false, error: "Failed to generate signed URL" }
  }

  return { success: true, signedUrl: data.signedUrl }
}
