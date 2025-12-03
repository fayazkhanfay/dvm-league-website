import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    // Initialize Supabase client
    const supabase = await createClient()

    // Auth Check: Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("[v0] Auth error in checkout:", authError)
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // Get Case ID from search params
    const searchParams = request.nextUrl.searchParams
    const caseId = searchParams.get("case_id")

    if (!caseId) {
      console.error("[v0] No case_id provided to checkout")
      return NextResponse.redirect(new URL("/gp-dashboard", request.url))
    }

    console.log("[v0] Processing checkout for case:", caseId, "user:", user.id)

    const { data: caseData, error: caseError } = await supabase.from("cases").select("*").eq("id", caseId).single()

    if (caseError || !caseData) {
      console.error("[v0] Case not found:", caseError)
      return NextResponse.redirect(new URL("/gp-dashboard?error=case_not_found", request.url))
    }

    // Get Customer ID: Query profiles table
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name, clinic_name, stripe_customer_id")
      .eq("id", user.id)
      .single()

    if (profileError) {
      console.error("[v0] Error fetching profile:", profileError)
    }

    // Initialize Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2024-12-18.acacia",
    })

    let customerId = profile?.stripe_customer_id

    // CRITICAL FIX: Ensure Customer ID exists and is saved to Supabase
    if (!customerId) {
      console.log("[v0] Creating new Stripe customer for:", user.email)

      const newCustomer = await stripe.customers.create({
        email: user.email,
        name: profile?.full_name || "DVM League User",
        metadata: {
          supabase_id: user.id,
        },
      })

      customerId = newCustomer.id

      // Save to Supabase immediately so we remember them next time
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id)

      if (updateError) {
        console.error("[v0] Failed to save stripe_customer_id:", updateError)
        // We continue anyway so the payment can proceed, but log the error
      }
    } else {
      console.log("[v0] Using existing Stripe customer:", customerId)
    }

    const receiptDescription = `Patient: ${caseData.patient_name} - ${caseData.specialty_requested}`

    // Create Checkout Session
    const origin = request.nextUrl.origin
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Complete Case Consult",
              description: receiptDescription,
            },
            unit_amount: 39500,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      invoice_creation: {
        enabled: true,
      },
      payment_intent_data: {
        setup_future_usage: "on_session",
        description: receiptDescription,
        metadata: {
          case_id: caseId,
          patient_name: caseData.patient_name,
          specialty: caseData.specialty_requested,
          gp_name: profile?.full_name || "Unknown GP",
          clinic_name: profile?.clinic_name || "N/A",
        },
      },
      success_url: `${origin}/submit-success?case_id=${caseId}`,
      cancel_url: `${origin}/gp-dashboard`,
    })

    console.log("[v0] Stripe checkout session created:", session.id)

    if (!session.url) {
      throw new Error("No checkout URL returned from Stripe")
    }

    return NextResponse.redirect(session.url)
  } catch (error) {
    console.error("[v0] Stripe checkout error:", error)
    return NextResponse.redirect(new URL("/gp-dashboard?error=checkout_failed", request.url))
  }
}
