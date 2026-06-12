import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "AwardCraft's privacy policy — how we collect, use, and protect your personal data.",
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 max-w-3xl py-16">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
      <p className="text-muted-foreground mb-8">
        Last updated: {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
      </p>

      <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground">
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">1. Information We Collect</h2>
          <p>We collect information you provide directly, including name, email address, billing and shipping addresses, and order details. We also collect usage data and cookies to improve our services.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">2. How We Use Your Information</h2>
          <p>We use your information to process orders, send transactional emails, personalise your experience, and comply with legal obligations. We do not sell your personal data to third parties.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">3. Payment Processing</h2>
          <p>All payments are processed securely by Stripe. AwardCraft does not store your card details. Please review <a href="https://stripe.com/privacy" className="underline">Stripe&apos;s Privacy Policy</a> for more information.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">4. Data Retention</h2>
          <p>We retain your account information for as long as your account is active. Order records are kept for 7 years to comply with UK accounting regulations.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">5. Your Rights (UK GDPR)</h2>
          <p>You have the right to access, rectify, erase, and port your personal data. To exercise these rights, contact us at privacy@awardcraft.co.uk.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">6. Contact</h2>
          <p>For privacy enquiries, email: privacy@awardcraft.co.uk</p>
        </section>
      </div>
    </div>
  );
}
