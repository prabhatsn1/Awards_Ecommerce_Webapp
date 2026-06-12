import type { Metadata } from "next";
import { Award, Users, Star, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about AwardCraft — our story, craftsmanship, and commitment to excellence in bespoke awards and trophies.",
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 max-w-4xl py-16">
      <div className="text-center mb-12">
        <p className="text-gold font-medium uppercase tracking-wider text-sm mb-2">
          Our Story
        </p>
        <h1 className="text-4xl font-bold text-navy mb-4">
          Crafting Recognition Since 2012
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          AwardCraft was founded with a single belief: every achievement deserves
          to be recognised with a piece that truly reflects its significance.
        </p>
      </div>

      <div className="prose prose-lg max-w-none text-muted-foreground space-y-6 mb-16">
        <p>
          From our workshop in Birmingham, our team of skilled artisans combine
          traditional craftsmanship with modern manufacturing techniques to
          produce awards that stand the test of time.
        </p>
        <p>
          Whether you&apos;re ordering a single crystal trophy for an annual
          gala, or a thousand engraved medals for a corporate incentive
          programme, we treat every order with the same level of care and
          attention to detail.
        </p>
      </div>

      <div id="process" className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-16">
        {[
          { icon: Award, title: "500+ Designs", desc: "An extensive catalogue spanning every occasion and budget." },
          { icon: Users, title: "500+ Clients", desc: "From FTSE 100 companies to local sports clubs." },
          { icon: Star, title: "5,000+ Reviews", desc: "Average 4.9 stars across all platforms." },
          { icon: Shield, title: "Quality Guarantee", desc: "100% satisfaction or we remake it free of charge." },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex gap-4 p-6 border rounded-xl">
            <Icon className="h-8 w-8 text-gold shrink-0" />
            <div>
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
