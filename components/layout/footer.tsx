import Link from "next/link";
import { Award } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe/server";

async function getServiceStatus() {
  const [dbOk, stripeOk] = await Promise.all([
    (async () => {
      try {
        if (
          !process.env.NEXT_PUBLIC_SUPABASE_URL ||
          !process.env.SUPABASE_SERVICE_ROLE_KEY
        )
          return false;
        const client = createAdminClient();
        const { error } = await client.from("categories").select("id").limit(1);
        return !error;
      } catch {
        return false;
      }
    })(),
    (async () => {
      try {
        if (!process.env.STRIPE_SECRET_KEY) return false;
        await stripe.balance.retrieve();
        return true;
      } catch {
        return false;
      }
    })(),
  ]);
  return { dbOk, stripeOk };
}

const footerLinks = {
  shop: [
    { href: "/products", label: "All Awards" },
    { href: "/products?category=corporate-awards", label: "Corporate Awards" },
    { href: "/products?category=sports-trophies", label: "Sports Trophies" },
    { href: "/products?category=crystal-awards", label: "Crystal Awards" },
    { href: "/products?category=glass-awards", label: "Glass Awards" },
  ],
  company: [
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact" },
    { href: "/about#process", label: "Our Process" },
  ],
  support: [
    { href: "/dashboard/orders", label: "Track Order" },
    { href: "/contact", label: "Help Centre" },
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms & Conditions" },
  ],
};

export async function Footer() {
  const { dbOk, stripeOk } = await getServiceStatus();

  return (
    <footer className="bg-navy text-white mt-auto">
      <div className="container mx-auto px-4 max-w-7xl py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Award className="h-7 w-7 text-gold" />
              <span className="font-bold text-xl">
                Award<span className="text-gold">Craft</span>
              </span>
            </Link>
            <p className="text-sm text-white/70 max-w-xs leading-relaxed">
              Premium bespoke awards and trophies crafted for organisations and
              individuals who value excellence.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-semibold text-gold mb-4 text-sm uppercase tracking-wider">
              Shop
            </h3>
            <ul className="space-y-2">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-gold mb-4 text-sm uppercase tracking-wider">
              Company
            </h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-gold mb-4 text-sm uppercase tracking-wider">
              Support
            </h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8 bg-white/10" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/50">
          <p>
            &copy; {new Date().getFullYear()} AwardCraft Ltd. All rights
            reserved.
          </p>

          {/* Service status indicators */}
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span
                className={`inline-block h-2 w-2 rounded-full ${dbOk ? "bg-green-400" : "bg-red-500"}`}
                title={dbOk ? "Database connected" : "Database unreachable"}
              />
              <span className={dbOk ? "text-green-400" : "text-red-400"}>
                Database
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className={`inline-block h-2 w-2 rounded-full ${stripeOk ? "bg-green-400" : "bg-red-500"}`}
                title={stripeOk ? "Stripe connected" : "Stripe unreachable"}
              />
              <span className={stripeOk ? "text-green-400" : "text-red-400"}>
                Stripe
              </span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
