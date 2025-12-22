import { Resend } from "resend"
import CaseSubmissionEmail from "@/components/emails/CaseSubmissionEmail"
import SpecialistCaseNotificationEmail from "@/components/emails/SpecialistCaseNotificationEmail"

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

export async function notifyMatchingSpecialists(
  specialty: string,
  caseId: string,
  patientName: string,
  patientSignalment: string,
  presentingComplaint: string,
) {
  try {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()

    console.log("[Email] ========== SPECIALIST NOTIFICATION DEBUG ==========")
    console.log("[Email] Input specialty:", specialty)
    console.log("[Email] Input caseId:", caseId)
    console.log("[Email] Input patientName:", patientName)

    // Find all specialists with matching specialty (case-insensitive contains search)
    // This handles comma-separated specialties like "Internal Medicine, Cardiology, Dermatology"
    const { data: specialists, error: fetchError } = await supabase
      .from("profiles")
      .select("id, email, full_name, specialty, role")
      .eq("role", "specialist")
      .ilike("specialty", `%${specialty}%`) // Wildcard search to find specialty anywhere in the string

    console.log(
      "[Email] Query executed: profiles.select().eq('role', 'specialist').ilike('specialty', '%${specialty}%')",
    )
    console.log("[Email] Query returned error:", fetchError)
    console.log("[Email] Query returned data:", specialists)
    console.log("[Email] Number of specialists found:", specialists?.length || 0)

    if (fetchError) {
      console.error("[Email] ❌ Error fetching specialists:", fetchError)
      return { success: false, error: fetchError }
    }

    if (!specialists || specialists.length === 0) {
      console.log("[Email] ⚠️ No specialists found for specialty:", specialty)
      console.log("[Email] Tip: Check that specialist profiles have the 'specialty' field set correctly")
      console.log(
        "[Email] Run this SQL to check: SELECT id, full_name, email, specialty, role FROM profiles WHERE role = 'specialist';",
      )
      return { success: true, message: "No specialists found", sent: 0, failed: 0 }
    }

    console.log(`[Email] ✓ Found ${specialists.length} specialist(s) for ${specialty}:`)
    specialists.forEach((s) => console.log(`  - ${s.full_name} (${s.email}) - Specialties: ${s.specialty}`))

    const caseLink = `${process.env.NEXT_PUBLIC_SITE_URL || "https://dvmleague.com"}/specialist-dashboard/cases/${caseId}`
    console.log("[Email] Case link being sent:", caseLink)

    // Send emails to all matching specialists
    const emailPromises = specialists.map((specialist) =>
      resend.emails.send({
        from: "DVM League <notifications@mail.dvmleague.com>",
        to: specialist.email,
        replyTo: "khan@dvmleague.com",
        subject: `New ${specialty} Case Available - ${patientName}`,
        react: SpecialistCaseNotificationEmail({
          specialistName: specialist.full_name,
          patientName,
          specialty,
          caseId,
          caseLink,
          patientSignalment,
          presentingComplaint,
        }),
      }),
    )

    const results = await Promise.allSettled(emailPromises)

    const successCount = results.filter((r) => r.status === "fulfilled").length
    const failCount = results.filter((r) => r.status === "rejected").length

    console.log(`[Email] ✓ Specialist notifications: ${successCount} sent, ${failCount} failed`)
    results.forEach((result, index) => {
      if (result.status === "rejected") {
        console.error(`[Email] Failed to send to ${specialists[index].email}:`, result.reason)
      } else {
        console.log(`[Email] ✓ Email sent to ${specialists[index].email}`)
      }
    })
    console.log("[Email] ========== END DEBUG ==========")

    return {
      success: true,
      sent: successCount,
      failed: failCount,
    }
  } catch (error) {
    console.error("[Email] ❌ Unexpected error notifying specialists:", error)
    return { success: false, error }
  }
}
