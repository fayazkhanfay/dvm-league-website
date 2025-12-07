import { Resend } from "resend"
import CaseSubmissionEmail from "@/components/emails/CaseSubmissionEmail"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendCaseConfirmation(email: string, gpName: string, patientName: string, caseId: string) {
  try {
    const caseLink = `${process.env.NEXT_PUBLIC_SITE_URL || "https://dvmleague.com"}/gp-dashboard?case=${caseId}`

    const { data, error } = await resend.emails.send({
      from: "DVM League <notifications@mail.dvmleague.com>",
      to: email,
      replyTo: "khan@dvmleague.com",
      subject: `Case Confirmation: ${patientName}`,
      react: CaseSubmissionEmail({
        gpName,
        patientName,
        caseId,
        caseLink,
      }),
    })

    if (error) {
      console.error("[Email] Failed to send case confirmation:", error)
      return { success: false, error }
    }

    console.log("[Email] Case confirmation sent successfully:", data?.id)
    return { success: true, data }
  } catch (error) {
    console.error("[Email] Unexpected error sending case confirmation:", error)
    return { success: false, error }
  }
}
