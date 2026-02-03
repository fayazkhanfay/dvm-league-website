"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function deleteCaseFile(fileId: string, storagePath: string) {
    const supabase = await createClient()

    try {
        // 1. Remove from Supabase Storage
        const { error: storageError } = await supabase.storage.from("case-bucket").remove([storagePath])

        if (storageError) {
            console.error("Error removing file from storage:", storageError)
            return { success: false, error: "Failed to remove file from storage" }
        }

        // 2. Delete from case_files table
        const { error: dbError } = await supabase.from("case_files").delete().eq("id", fileId)

        if (dbError) {
            console.error("Error deleting file record:", dbError)
            return { success: false, error: "Failed to delete file record" }
        }

        // 3. Revalidate path (revalidating more liberally to ensure UI updates)
        // We don't have the caseId easily available here without an extra query, 
        // but the client usually triggers a refresh or update. 
        // However, let's try to pass the case ID if we can, 
        // or just revalidate the generic paths if possible.
        // For now we will rely on the client optimistic update and eventual consistency,
        // but returning success allows the client to know it's done.

        return { success: true }
    } catch (error) {
        console.error("Unexpected error deleting case file:", error)
        return { success: false, error: "An unexpected error occurred" }
    }
}
