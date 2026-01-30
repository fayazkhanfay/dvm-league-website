"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface FinalReportData {
    caseDisposition: string
    finalDiagnosis: string
    clinicalInterpretation: string
    treatmentPlan: string
    followUpInstructions: string
    clientSummary: string
    finalReportPath?: string
}

export async function submitFinalReport(caseId: string, data: FinalReportData) {
    const supabase = await createClient()

    try {
        const { error } = await supabase
            .from("cases")
            .update({
                case_disposition: data.caseDisposition,
                final_diagnosis: data.finalDiagnosis,
                clinical_interpretation: data.clinicalInterpretation,
                treatment_plan: data.treatmentPlan,
                follow_up_instructions: data.followUpInstructions,
                client_summary: data.clientSummary,
                final_report_path: data.finalReportPath || null,
                status: "completed",
                updated_at: new Date().toISOString(),
            })
            .eq("id", caseId)

        if (error) {
            console.error("Error submitting final report:", error)
            return { success: false, error: "Failed to submit final report" }
        }

        revalidatePath(`/gp/case/${caseId}`)
        revalidatePath(`/specialist/case/${caseId}`)
        revalidatePath("/specialist-dashboard")

        // Send email notification to GP
        const { notifyGPOfCaseCompletion } = await import("@/lib/email")
        await notifyGPOfCaseCompletion(caseId)

        return { success: true }
    } catch (error) {
        console.error("Unexpected error submitting final report:", error)
        return { success: false, error: "An unexpected error occurred" }
    }
}
