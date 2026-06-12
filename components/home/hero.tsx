"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Award, Star, Truck, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-navy text-white">
      {/* Gold radial accent — inline style avoids Tailwind v3 --tw-gradient-stops */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 100% 0%, hsla(43,89%,51%,0.18) 0%, transparent 70%)",
        }}
      />

      <div className="container mx-auto px-4 max-w-7xl py-20 md:py-28 lg:py-36">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 border border-gold/40 bg-gold/10 text-gold text-sm font-semibold px-3 py-1.5 rounded-full">
              <Star className="h-3.5 w-3.5 fill-gold" />
              Trusted by 500+ organisations
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-white">
              Awards That{" "}
              <span className="text-gold">Inspire</span>{" "}
              Excellence
            </h1>

            <p className="text-lg text-white/85 max-w-lg leading-relaxed">
              Bespoke trophies and recognition awards crafted with precision.
              From corporate ceremonies to sporting achievements — make every
              moment unforgettable.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                asChild
                size="xl"
                className="bg-gold hover:bg-gold/90 text-navy font-semibold"
              >
                <Link href="/products">
                  Shop Awards
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="xl"
                variant="outline"
                className="!bg-transparent !border-white/50 !text-white hover:!bg-white/10 hover:!border-white"
              >
                <Link href="/about">Our Story</Link>
              </Button>
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap gap-6 pt-4">
              {[
                { icon: Award, text: "500+ Products" },
                { icon: Star, text: "4.9★ Rated" },
                { icon: Truck, text: "Free Delivery ₹15,000+" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-sm text-white/80">
                  <Icon className="h-4 w-4 text-gold shrink-0" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Visual — product showcase grid */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="relative pb-6"
          >
            <div className="grid grid-cols-2 gap-3 lg:gap-4">

              {/* Featured card — Crystal Trophy */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.35 }}
                className="col-span-2 relative rounded-2xl overflow-hidden h-44 lg:h-56 border border-gold/25"
                style={{ background: "linear-gradient(135deg, hsl(222,47%,14%) 0%, hsl(222,52%,9%) 100%)" }}
              >
                {/* Gold glow right side */}
                <div
                  className="absolute inset-0"
                  style={{ background: "radial-gradient(ellipse 50% 90% at 88% 50%, hsla(43,89%,51%,0.22) 0%, transparent 65%)" }}
                />
                <div className="relative h-full flex items-center justify-between px-6 lg:px-8">
                  <div className="space-y-1.5">
                    <span className="inline-block text-[11px] font-bold text-navy bg-gold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Best Seller
                    </span>
                    <h3 className="text-white font-bold text-xl lg:text-2xl">Crystal Trophy</h3>
                    <p className="text-white/55 text-sm">Hand-cut optical crystal, custom engraved</p>
                    <p className="text-gold font-bold text-lg">From ₹2,499</p>
                  </div>
                  <div className="shrink-0 h-20 w-20 lg:h-24 lg:w-24 rounded-2xl bg-gold/10 border border-gold/30 flex items-center justify-center">
                    <Award className="h-10 w-10 lg:h-12 lg:w-12 text-gold" />
                  </div>
                </div>
              </motion.div>

              {/* Card 2 — Gold Plaque */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.45 }}
                className="relative rounded-2xl overflow-hidden h-40 lg:h-52 border border-white/[0.08]"
                style={{ background: "linear-gradient(160deg, hsl(222,44%,17%) 0%, hsl(222,50%,10%) 100%)" }}
              >
                <div
                  className="absolute bottom-0 inset-x-0 h-1/2"
                  style={{ background: "linear-gradient(to top, hsla(43,89%,51%,0.09), transparent)" }}
                />
                <div className="relative h-full flex flex-col justify-between p-4 lg:p-5">
                  <div className="h-10 w-10 rounded-xl bg-gold/15 border border-gold/25 flex items-center justify-center">
                    <Trophy className="h-5 w-5 text-gold" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">Gold Plaque</p>
                    <p className="text-white/50 text-xs mt-0.5">Engraved brass finish</p>
                    <p className="text-gold font-bold mt-1.5">₹1,299+</p>
                  </div>
                </div>
              </motion.div>

              {/* Card 3 — Sports Medal */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.55 }}
                className="relative rounded-2xl overflow-hidden h-40 lg:h-52 border border-white/[0.08]"
                style={{ background: "linear-gradient(160deg, hsl(222,44%,17%) 0%, hsl(222,50%,10%) 100%)" }}
              >
                <div
                  className="absolute bottom-0 inset-x-0 h-1/2"
                  style={{ background: "linear-gradient(to top, hsla(200,80%,60%,0.07), transparent)" }}
                />
                <div className="relative h-full flex flex-col justify-between p-4 lg:p-5">
                  <div className="h-10 w-10 rounded-xl bg-white/[0.08] border border-white/15 flex items-center justify-center">
                    <Star className="h-5 w-5 text-white/60 fill-white/20" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">Sports Medal</p>
                    <p className="text-white/50 text-xs mt-0.5">Die-cast zinc alloy</p>
                    <p className="text-gold font-bold mt-1.5">₹899+</p>
                  </div>
                </div>
              </motion.div>

            </div>

            {/* Floating badge */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.65 }}
              className="absolute -bottom-2 -left-4 bg-white text-navy rounded-xl p-4 shadow-2xl"
            >
              <p className="text-2xl font-bold text-gold">500+</p>
              <p className="text-sm font-medium text-navy/80">Happy clients</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
