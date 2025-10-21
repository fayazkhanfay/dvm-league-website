"use client"; // Mark this as a Client Component

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, CheckCircle } from "lucide-react";

export function RequestInvitationFormGoogle() {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    clinic: "",
    email: "",
    phone: "",
  });
  // This ref tracks if the initial page load has happened.
  const isMounted = useRef(false);

  useEffect(() => {
    // This runs once after the component mounts, setting the ref.
    isMounted.current = true;
  }, []);

  // This handler now only runs after the form is submitted to the iframe.
  // The isMounted ref prevents it from firing on the initial page load.
  const handleIframeLoad = () => {
    // A small delay ensures React has time to re-render before we check the ref.
    setTimeout(() => {
      if (isMounted.current) {
        setShowConfirmation(true);
      }
    }, 100);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create FormData object
    const formDataObj = new FormData();
    formDataObj.append('entry.808390915', formData.name);
    formDataObj.append('entry.1798631954', formData.clinic);
    formDataObj.append('entry.17595844', formData.email);
    formDataObj.append('entry.1260275027', formData.phone);
    
    try {
      // Submit directly to Google Forms
      const response = await fetch('https://docs.google.com/forms/d/e/1FAIpQLSc3KLhDz6nHsQUVJheyIFJ01MKhsX6CwoTx9ZSEqN8PEQyq9Q/formResponse', {
        method: 'POST',
        mode: 'no-cors', // Important for cross-origin requests
        body: formDataObj
      });
      
      // Show confirmation since we can't check response due to no-cors
      setShowConfirmation(true);
    } catch (error) {
      console.error('Form submission error:', error);
      // Still show confirmation as a fallback
      setShowConfirmation(true);
    }
  };
  
  return (
    <div className="mx-auto w-full max-w-lg">
      {!showConfirmation ? (
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
          
           <form
             onSubmit={handleFormSubmit}
             className="mt-10 space-y-6 rounded-lg border-2 border-brand-stone bg-white p-8 shadow-xl hover-lift"
           >
            {/* Your Name */}
            <div>
              <Label htmlFor="name" className="text-sm font-bold text-brand-navy">
                Your Name
              </Label>
              <Input
                type="text"
                id="name"
                name="entry.808390915"
                required
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
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
                name="entry.1798631954"
                required
                value={formData.clinic}
                onChange={(e) => handleInputChange("clinic", e.target.value)}
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
                name="entry.17595844"
                required
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
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
                name="entry.1260275027"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="mt-2 border-2 border-brand-stone px-4 py-3 text-brand-navy shadow-sm transition-all focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
              />
            </div>
            
            <div className="pt-4">
              {/* I've replaced the custom Button component with a standard HTML button
                  to ensure the default form submission behavior is triggered correctly. */}
              <button
                type="submit"
                className="w-full transform rounded-md bg-brand-gold px-8 py-4 text-lg font-bold text-brand-navy shadow-lg transition-all duration-300 hover:scale-105 hover:bg-brand-navy hover:text-white"
              >
                Request My Invitation
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="animate-scale-in rounded-lg border-2 border-brand-stone bg-white p-10 text-center shadow-xl hover-glow sm-p-12">
          <h2 className="mt-8 font-serif text-4xl font-bold text-brand-navy sm:text-5xl text-balance">
            Welcome to the DVM League.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-brand-navy/80 text-pretty">
            Thank you. Your invitation request has been received. We are finalizing our elite specialist roster and
            will personally reach out to Founder&apos;s Circle members in the coming weeks with instructions on how
            to activate your free consult.
          </p>
          <div className="mt-10">
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

