"use client";

import { motion } from "framer-motion";
import { Shield, Truck, Paintbrush, HeadphonesIcon, Award, Star } from "lucide-react";

const features = [
  {
    icon: Paintbrush,
    title: "Fully Customisable",
    description: "Engraving, logos, materials and sizes personalised to your exact requirements.",
  },
  {
    icon: Shield,
    title: "Premium Quality",
    description: "Only the finest glass, crystal, and metal used by our specialist craftspeople.",
  },
  {
    icon: Truck,
    title: "Fast UK Delivery",
    description: "Standard delivery in 5–7 days. Express options available for urgent orders.",
  },
  {
    icon: HeadphonesIcon,
    title: "Expert Support",
    description: "Dedicated account managers for corporate clients and bulk orders.",
  },
  {
    icon: Award,
    title: "500+ Designs",
    description: "An extensive catalogue covering every occasion, industry and budget.",
  },
  {
    icon: Star,
    title: "4.9★ Reviews",
    description: "Over 5,000 five-star reviews from satisfied clients across the UK.",
  },
];

export function WhyUs() {
  return (
    <section className="py-16 md:py-20">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-12">
          <p className="text-sm font-medium text-gold uppercase tracking-wider mb-2">
            Why Choose Us
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-navy">
            Excellence in Every Award
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            For over a decade, AwardCraft has been the trusted partner for
            recognition programmes across the UK.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="flex gap-4 p-6 rounded-xl border hover:border-gold/40 hover:shadow-sm transition-all"
            >
              <div className="h-10 w-10 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                <feature.icon className="h-5 w-5 text-gold" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
