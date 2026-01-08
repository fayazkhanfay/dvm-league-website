import { Resend } from "resend"
import CaseSubmissionEmail from "@/components/emails/CaseSubmissionEmail"
import SpecialistCaseNotificationEmail from "@/components/emails/SpecialistCaseNotificationEmail"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendCaseConfirmation(email: string, gpName: string, patientName: string, caseId: string) {
  try {
    // UPDATED: Pointing to the specific Case View, not the Dashboard
    const caseLink = `${process.env.NEXT_PUBLIC_SITE_URL || "https://dvmleague.com"}/gp/case/${caseId}`

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
  gpQuestions: string,
  patientSpecies: string,
) {
  try {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()

    // Format Species (Capitalize first letter)
    const formattedSpecies = patientSpecies
      ? patientSpecies.charAt(0).toUpperCase() + patientSpecies.slice(1).toLowerCase()
      : "Veterinary"

    console.log("[Email] ========== SPECIALIST NOTIFICATION DEBUG ==========")
    console.log("[Email] Input specialty:", specialty)
    console.log("[Email] Input caseId:", caseId)
    console.log("[Email] Input patientName:", patientName)

    const { data: specialists, error: fetchError } = await supabase
      .from("profiles")
      .select("id, email, full_name, specialty, role")
      .eq("role", "specialist")
      .eq("specialty", specialty)

    console.log("[Email] Query executed: profiles.select().eq('role', 'specialist').eq('specialty', '${specialty}')")
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
      return { success: true, message: "No specialists found", sent: 0, failed: 0 }
    }

    console.log(`[Email] ✓ Found ${specialists.length} specialist(s) for ${specialty}:`)
    specialists.forEach((s) => console.log(`  - ${s.full_name} (${s.email}) - Specialties: ${s.specialty}`))

    // UPDATED: Pointing to the specific Case View, not the Dashboard
    const caseLink = `${process.env.NEXT_PUBLIC_SITE_URL || "https://dvmleague.com"}/specialist/case/${caseId}`
    console.log("[Email] Case link being sent:", caseLink)

    const emailResults = []

    for (const specialist of specialists) {
      try {
        console.log(`[Email] Sending to ${specialist.email}...`)

        const { data, error } = await resend.emails.send({
          from: "DVM League <notifications@mail.dvmleague.com>",
          to: specialist.email,
          replyTo: "khan@dvmleague.com",
          subject: `New ${formattedSpecies} Case Available - ${patientName}`,
          react: SpecialistCaseNotificationEmail({
            specialistName: specialist.full_name,
            patientName,
            specialty,
            caseId,
            caseLink,
            patientSignalment,
            presentingComplaint,
            gpQuestions,
          }),
        })

        if (error) {
          console.error(`[Email] ❌ Resend API error for ${specialist.email}:`, error)
          emailResults.push({ email: specialist.email, success: false, error })
        } else {
          console.log(`[Email] ✓ Email sent to ${specialist.email} - ID: ${data?.id}`)
          emailResults.push({ email: specialist.email, success: true, id: data?.id })
        }

        if (specialists.indexOf(specialist) < specialists.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 600))
        }
      } catch (error) {
        console.error(`[Email] ❌ Exception sending to ${specialist.email}:`, error)
        emailResults.push({ email: specialist.email, success: false, error })
      }
    }

    const successCount = emailResults.filter((r) => r.success).length
    const failCount = emailResults.filter((r) => !r.success).length

    console.log(`[Email] ✓ Specialist notifications: ${successCount} sent, ${failCount} failed`)
    emailResults.forEach((result) => {
      if (!result.success) {
        console.error(`[Email] ❌ Failed to send to ${result.email}:`, result.error)
      }
    })
    console.log("[Email] ========== END DEBUG ==========")

    return {
      success: true,
      sent: successCount,
      failed: failCount,
      details: emailResults,
    }
  } catch (error) {
    console.error("[Email] ❌ Unexpected error notifying specialists:", error)
    return { success: false, error }
  }
}

export async function notifyGPOfPhaseUpdate(caseId: string, updateType: "phase1_complete" | "phase2_complete") {
  try {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()

    const { data: caseData, error: caseError } = await supabase
      .from("cases")
      .select(
        `
        id,
        patient_name,
        gp_id,
        specialist_id,
        gp:profiles!cases_gp_id_fkey(email, full_name),
        specialist:profiles!cases_specialist_id_fkey(full_name)
      `,
      )
      .eq("id", caseId)
      .single()

    if (caseError || !caseData) {
      console.error("[Email] Error fetching case data:", caseError)
      return { success: false, error: caseError }
    }

    const gpEmail = caseData.gp.email
    const gpName = caseData.gp.full_name
    const specialistName = caseData.specialist.full_name
    const caseLink = `${process.env.NEXT_PUBLIC_SITE_URL || "https://dvmleague.com"}/gp/case/${caseId}`

    const { default: GPCaseUpdateEmail } = await import("@/components/emails/GPCaseUpdateEmail")

    const { data, error } = await resend.emails.send({
      from: "DVM League <notifications@mail.dvmleague.com>",
      to: gpEmail,
      replyTo: "khan@dvmleague.com",
      subject:
        updateType === "phase1_complete"
          ? `Diagnostic Plan Ready - ${caseData.patient_name}`
          : `Final Report Complete - ${caseData.patient_name}`,
      react: GPCaseUpdateEmail({
        gpName,
        patientName: caseData.patient_name,
        caseId,
        caseLink,
        updateType,
        specialistName,
      }),
    })

    if (error) {
      console.error("[Email] Failed to notify GP:", error)
      return { success: false, error }
    }

    console.log("[Email] ✓ GP notified successfully:", data?.id)
    return { success: true, data }
  } catch (error) {
    console.error("[Email] Unexpected error notifying GP:", error)
    return { success: false, error }
  }
}

export async function notifySpecialistOfDiagnostics(caseId: string) {
  try {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()

    const { data: caseData, error: caseError } = await supabase
      .from("cases")
      .select(
        `
        id,
        patient_name,
        gp_id,
        specialist_id,
        specialist:profiles!cases_specialist_id_fkey(email, full_name),
        gp:profiles!cases_gp_id_fkey(full_name)
      `,
      )
      .eq("id", caseId)
      .single()

    if (caseError || !caseData) {
      console.error("[Email] Error fetching case data:", caseError)
      return { success: false, error: caseError }
    }

    const specialistEmail = caseData.specialist.email
    const specialistName = caseData.specialist.full_name
    const gpName = caseData.gp.full_name
    const caseLink = `${process.env.NEXT_PUBLIC_SITE_URL || "https://dvmleague.com"}/specialist/case/${caseId}`

    const { default: SpecialistCaseUpdateEmail } = await import("@/components/emails/SpecialistCaseUpdateEmail")

    const { data, error } = await resend.emails.send({
      from: "DVM League <notifications@mail.dvmleague.com>",
      to: specialistEmail,
      replyTo: "khan@dvmleague.com",
      subject: `Diagnostic Results Available - ${caseData.patient_name}`,
      react: SpecialistCaseUpdateEmail({
        specialistName,
        patientName: caseData.patient_name,
        caseId,
        caseLink,
        updateType: "diagnostics_uploaded",
        gpName,
      }),
    })

    if (error) {
      console.error("[Email] Failed to notify specialist:", error)
      return { success: false, error }
    }

    console.log("[Email] ✓ Specialist notified of diagnostics:", data?.id)
    return { success: true, data }
  } catch (error) {
    console.error("[Email] Unexpected error notifying specialist:", error)
    return { success: false, error }
  }
}
