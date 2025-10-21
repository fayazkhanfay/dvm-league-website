"use client"; // Mark this as a Client Component

import React, { useState, useRef } from "react";
// import Link from "next/link"; // Removed this line which caused the error
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, CheckCircle } from "lucide-react";

export function RequestInvitationFormGoogle() {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const formSubmittedRef = useRef(false);

  // This handler runs when the hidden iframe finishes loading.
  // The iframe loads twice: once on page render, and once after the form submits.
  // The `formSubmittedRef` ensures we only show the confirmation after the submission.
  const handleIframeLoad = () => {
    if (formSubmittedRef.current) {
      setShowConfirmation(true);
    }
  };
  
  // This handler marks the form as submitted when the user clicks the button.
  const handleFormSubmit = () => {
    formSubmittedRef.current = true;
  };

  return (
    <div className="mx-auto w-full max-w-lg">
      {/* This hidden iframe is the target for the form submission. 
          This prevents the user from being redirected to the Google Form page. */}
      <iframe
        name="hidden_iframe"
        style={{ display: "none" }}
        onLoad={handleIframeLoad}
      ></iframe>

      {!showConfirmation ? (
        // Form State
        <div className="animate-fade-in-rise">
          <div className="text-center">
            <h1 className="font-serif text-5xl font-bold text-brand-navy sm:text-6xl text-balance">
              Join the Founder&apos;s Circle
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-brand-navy/80 text-pretty">
              Request your invitation below. Founding members get priority access and their first Complete Case
              Consult—a $395 value—is on us.
            </p>
          </div>
          
          {/* STEP 1: Find your Google Form's `action` URL and paste it below.
            To find it, view your live form, right-click, "View Page Source", and search for `form action=`.
          */}
          <form
            action="https://docs.google.com/forms/d/e/1FAIpQLSc3KLhDz6nHsQUVJheyIFJ01MKhsX6CwoTx9ZSEqN8PEQyq9Q/formResponse"
            method="POST"
            target="hidden_iframe"
            onSubmit={handleFormSubmit}
            className="mt-10 space-y-6 rounded-lg border-2 border-brand-stone bg-white p-8 shadow-xl hover-lift"
          >
            {/* STEP 2: For each input, find its unique `name` attribute and paste it below.
              In the form's source code, it will look like `name="entry.123456789"`.
            */}

            {/* Your Name */}
            <div>
              <Label htmlFor="name" className="text-sm font-bold text-brand-navy">
                Your Name
              </Label>
              <Input
                type="text"
                id="name"
                name="entry.1815564860" // <-- TODO: Replace with "Your Name" entry ID
                required
                className="mt-2 border-2 border-brand-stone px-4 py-3 text-brand-navy shadow-sm transition-all focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
              />
            </div>
            
            {/* Clinic Name */}
            <div>
              <Label htmlFor="clinic" className="text-sm font-bold text-brand-navy">
                Clinic Name
              </Label>
              <Input
                type="text"
                id="clinic"
                name="entry.125715545" // <-- TODO: Replace with "Clinic Name" entry ID
                required
                className="mt-2 border-2 border-brand-stone px-4 py-3 text-brand-navy shadow-sm transition-all focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
              />
            </div>
            
            {/* Email Address */}
            <div>
              <Label htmlFor="email" className="text-sm font-bold text-brand-navy">
                Email Address
              </Label>
              <Input
                type="email"
                id="email"
                name="entry.1051360182" // <-- TODO: Replace with "Email Address" entry ID
                required
                className="mt-2 border-2 border-brand-stone px-4 py-3 text-brand-navy shadow-sm transition-all focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
              />
            </div>
            
            {/* Phone Number */}
            <div>
              <Label htmlFor="phone" className="text-sm font-bold text-brand-navy">
                Phone Number
              </Label>
              <p className="mt-1 text-xs text-brand-navy/60">
                (Optional, for a direct, personal follow-up from our founder)
              </p>
              <Input
                type="tel"
                id="phone"
                name="entry.1312132051" // <-- TODO: Replace with "Phone Number" entry ID
                className="mt-2 border-2 border-brand-stone px-4 py-3 text-brand-navy shadow-sm transition-all focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
              />
            </div>
            
            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                className="w-full transform rounded-md bg-brand-gold px-8 py-4 text-lg font-bold text-brand-navy shadow-lg transition-all duration-300 hover:scale-105 hover:bg-brand-navy hover:text-white"
              >
                Request My Invitation
              </Button>
            </div>
          </form>
        </div>
      ) : (
        // Confirmation State - No changes needed here.
        <div className="animate-scale-in rounded-lg border-2 border-brand-stone bg-white p-10 text-center shadow-xl hover-glow sm:p-12">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-gold/20">
            <Shield className="h-12 w-12 text-brand-gold" />
            <CheckCircle className="absolute h-8 w-8 translate-x-3 translate-y-3 text-brand-gold" />
          </div>
          <h2 className="mt-8 font-serif text-4xl font-bold text-brand-navy sm:text-5xl text-balance">
            Welcome to the League.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-brand-navy/80 text-pretty">
            Thank you. Your invitation request has been received. We are finalizing our elite specialist roster and
            will personally reach out to Founder&apos;s Circle members in the coming weeks with instructions on how
            to activate your free consult.
          </p>
          <div className="mt-10">
            {/* The <Link> component was replaced with a standard <a> tag to fix the error. */}
            <a
              href="/"
              className="inline-block transform rounded-md bg-brand-navy px-8 py-3 text-base font-bold text-white shadow-md transition-all duration-300 hover:scale-105 hover:bg-brand-red"
            >
              ← Back to Home
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

