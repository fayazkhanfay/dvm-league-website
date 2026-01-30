"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { FinalReportData } from "./submit-final-report"

// Reuse the interface from submit-final-report, but make fields optional for draft
export interface DraftReportData extends Partial<FinalReportData> {
    finalReportPath?: string
}

export async function saveReportDraft(caseId: string, data: DraftReportData) {
    const supabase = await createClient()

    try {
        const { error } = await supabase
            .from("cases")
            .update({
                case_disposition: data.caseDisposition || null,
                final_diagnosis: data.finalDiagnosis || null,
                clinical_interpretation: data.clinicalInterpretation || null,
                treatment_plan: data.treatmentPlan || null,
                follow_up_instructions: data.followUpInstructions || null,
                client_summary: data.clientSummary || null,
                // Only update final_report_path if it's provided (don't overwrite with null if not provided)
                ...(data.finalReportPath !== undefined && { final_report_path: data.finalReportPath }),
                updated_at: new Date().toISOString(),
            })
            .eq("id", caseId)

        if (error) {
            console.error("Error saving report draft:", error)
            return { success: false, error: "Failed to save draft" }
        }

        revalidatePath(`/gp/case/${caseId}`)
        revalidatePath(`/specialist/case/${caseId}`)

        return { success: true }
    } catch (error) {
        console.error("Unexpected error saving report draft:", error)
        return { success: false, error: "An unexpected error occurred" }
    }
}
