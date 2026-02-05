import { createClient } from "@/lib/supabase/server"
import { CaseDetails } from "@/app/actions/get-case-details"

export interface ReportMetadata {
    finalReportUrl: string | null
    specialistName: string | null
    submittedAt: string | undefined
}

export async function getReportMetadata(
    caseDetails: CaseDetails,
): Promise<ReportMetadata> {
    const supabase = await createClient()

    let finalReportUrl = null
    let specialistName = null
    let submittedAt = undefined

    // 1. Generate Signed URL if report exists
    if (caseDetails.final_report_path) {
        const { data: signedUrlData } = await supabase
            .storage
            .from('final_reports')
            .createSignedUrl(caseDetails.final_report_path, 3600) // 1 hour expiry

        if (signedUrlData?.signedUrl) {
            finalReportUrl = signedUrlData.signedUrl
        }
    }

    // 2. Fetch Specialist Name if assigned
    if (caseDetails.specialist_id) {
        const { data: specialistProfile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', caseDetails.specialist_id)
            .single()

        if (specialistProfile) {
            specialistName = specialistProfile.full_name
        }
    }

    // 3. Use updated_at as submission time if status is completed
    // We prioritize the updated_at from the case details
    if (caseDetails.status === "completed") {
        submittedAt = caseDetails.updated_at
    }

    return {
        finalReportUrl,
        specialistName,
        submittedAt
    }
}
