"use client";

import type { Metadata } from "next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { contactSchema, type ContactInput } from "@/lib/validations";
import { toast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin, Loader2 } from "lucide-react";

export default function ContactPage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactInput) => {
    // In production, send to an email API (e.g., Resend, SendGrid)
    // For now, just show success toast
    await new Promise((r) => setTimeout(r, 500));
    toast({
      title: "Message sent!",
      description: "We'll get back to you within 1 business day.",
    });
    reset();
  };

  return (
    <div className="container mx-auto px-4 max-w-5xl py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-navy mb-3">Get in Touch</h1>
        <p className="text-muted-foreground text-lg">
          Have a question or need a custom quote? We&apos;d love to hear from you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact info */}
        <div className="space-y-6">
          {[
            {
              icon: Mail,
              title: "Email",
              value: "hello@awardcraft.co.uk",
              href: "mailto:hello@awardcraft.co.uk",
            },
            {
              icon: Phone,
              title: "Phone",
              value: "+44 (0)121 000 0000",
              href: "tel:+441210000000",
            },
            {
              icon: MapPin,
              title: "Address",
              value: "123 Crafts Quarter, Birmingham, B1 1AA",
              href: null,
            },
          ].map(({ icon: Icon, title, value, href }) => (
            <div key={title} className="flex gap-4">
              <div className="h-10 w-10 bg-gold/10 rounded-lg flex items-center justify-center shrink-0">
                <Icon className="h-5 w-5 text-gold" />
              </div>
              <div>
                <p className="font-medium">{title}</p>
                {href ? (
                  <a
                    href={href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {value}
                  </a>
                ) : (
                  <p className="text-muted-foreground">{value}</p>
                )}
              </div>
            </div>
          ))}

          <div className="bg-navy text-white rounded-xl p-6">
            <h3 className="font-semibold text-gold mb-2">Bulk Orders</h3>
            <p className="text-sm text-white/70">
              Ordering 50+ units? Contact us for volume pricing and dedicated
              account management.
            </p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Send a Message</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" {...register("name")} className="mt-1" />
                  {errors.name && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <Label htmlFor="company">Company (optional)</Label>
                  <Input id="company" {...register("company")} className="mt-1" />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  className="mt-1"
                />
                {errors.email && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" {...register("subject")} className="mt-1" />
                {errors.subject && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.subject.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  rows={5}
                  {...register("message")}
                  className="mt-1 resize-none"
                />
                {errors.message && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.message.message}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Message"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
