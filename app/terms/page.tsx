import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "AwardCraft Terms and Conditions of sale and use.",
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 max-w-3xl py-16">
      <h1 className="text-4xl font-bold mb-8">Terms &amp; Conditions</h1>
      <p className="text-muted-foreground mb-8">
        Last updated: {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
      </p>

      <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground">
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
          <p>By accessing or using AwardCraft you agree to be bound by these Terms. If you do not agree, do not use the platform.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">2. Orders & Payment</h2>
          <p>All prices are in INR and include applicable taxes. Orders are confirmed upon successful payment via Stripe. We reserve the right to refuse or cancel any order.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">3. Customisation</h2>
          <p>You are responsible for the accuracy of all engraving text and uploaded artwork. We accept no liability for errors in customer-supplied content.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">4. Delivery</h2>
          <p>Estimated delivery times are indicative only. We are not liable for delays caused by couriers or circumstances beyond our control.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">5. Returns & Refunds</h2>
          <p>Customised products cannot be returned unless they are defective. Non-customised items may be returned within 14 days in original condition.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">6. Intellectual Property</h2>
          <p>All content on AwardCraft is owned by or licensed to AwardCraft Ltd and may not be reproduced without written consent.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">7. Governing Law</h2>
          <p>These Terms are governed by the laws of England and Wales.</p>
        </section>
      </div>
    </div>
  );
}
