import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Shield, CheckCircle } from "lucide-react"
import type { Metadata } from 'next';
// import { RequestInvitationForm } from "@/components/request-invitation-form";
import { RequestInvitationFormGoogle } from "@/components/request-invitation-form-google";
export const metadata: Metadata = {
  title: "Request Invitation | Founder's Circle | DVM League",
  description: "Join the DVM League Founder's Circle. Get priority access and your first $395 Complete Case Consult free. Request your invitation today.",
  robots: { // Discourage indexing of this specific page if desired, otherwise omit this line
    index: false,
    follow: true,
  },
  alternates: {
    canonical: '/request-invitation',
  },
};

export default function RequestInvitationPage() {
  return (
    <div className="min-h-screen bg-brand-offwhite">
      <Header />
      <main className="flex min-h-screen items-center justify-center px-4 py-24 sm:py-32">
        {/* <RequestInvitationForm /> */}
        <RequestInvitationFormGoogle />
      </main>
      <Footer />
    </div>
  );
}
