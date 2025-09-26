export function FAQSection() {
  const faqs = [
    {
      question: "What is expected of me as a member of the 'Founder's Circle'?",
      answer:
        'Our expectation is simple: that you will use your free "Complete Case Consult" on a real, challenging case and, in return, provide us with your honest, direct feedback on the experience. You are not just a user; you are a founding partner, and your insights will be instrumental in helping us build the future of veterinary consultation.',
    },
    {
      question: "What are the specific turnaround times (SLAs) for the two phases of the consult?",
      answer:
        "For our founding partners, we are guaranteeing a professional and reliable timeline. Phase 1 (The Diagnostic Plan) will be delivered within 1-2 business days. Phase 2 (The Complete Treatment Plan) will be delivered by 9:00 AM ET the next business morning after you upload your follow-up results. Our internal goal is always to over-deliver on this promise.",
    },
    {
      question: "How do you handle the VCPR and liability?",
      answer:
        "You are always in control. You, the GP, maintain the Veterinarian-Client-Patient Relationship (VCPR) at all times and are the ultimate clinical authority. Our platform is a B2B consultation tool designed to support your decisions and reduce your liability by adding a board-certified specialist's documented guidance to your medical record.",
    },
    {
      question: "What are the qualifications of your specialists?",
      answer:
        'The standard is the standard. Every specialist in the League is an active, U.S.-based, board-certified diplomate of their respective American specialty college and has a minimum of 5-7 years of post-residency clinical experience. We do not accept "board-eligible" candidates.',
    },
    {
      question: "What happens after the Founder's Circle is full?",
      answer:
        'The "Grand Slam Offer"—the free $395 Complete Case Consult—is an exclusive opportunity for our founding members. Once the pilot program is complete, the platform will transition to its standard paid model. This is a limited-time opportunity to experience the full value of the DVM League at zero risk.',
    },
  ]

  return (
    <section id="faq" className="py-24 sm:py-32 bg-white">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <h2 className="text-center font-serif text-5xl font-bold tracking-tight text-brand-navy text-balance">
          Your Questions, Answered
        </h2>
        <div className="mt-12 text-left space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="p-6 bg-brand-offwhite/80 rounded-lg border border-brand-stone">
              <h3 className="font-bold text-brand-navy">{faq.question}</h3>
              <p className="mt-2 text-sm text-brand-navy/90">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
