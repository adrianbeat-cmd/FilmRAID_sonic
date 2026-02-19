'use client';

import React, { useState } from 'react';

import { Mail, MapPin } from 'lucide-react';
import { useForm, SubmitHandler } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SITE_KEY, grecaptchaReady, getEnterpriseToken } from '@/lib/recaptcha';

interface ContactFormData {
  name: string;
  email: string;
  message: string;
  [key: string]: string;
}

const ACTION = 'CONTACT_FORM';

export default function Contact() {
  const {
    handleSubmit,
    reset,
    register,
    formState: { errors },
  } = useForm<ContactFormData>();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState<{ type: '' | 'success' | 'error'; msg: string }>({
    type: '',
    msg: '',
  });

  const onSubmit: SubmitHandler<ContactFormData> = async (formData) => {
    try {
      setNotice({ type: '', msg: '' });
      setIsSubmitting(true);

      if (!SITE_KEY) throw new Error('Missing NEXT_PUBLIC_RECAPTCHA_SITE_KEY');

      await grecaptchaReady();
      const token = await getEnterpriseToken(ACTION);

      const res = await fetch('/.netlify/functions/submit-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          siteKey: SITE_KEY,
          expectedAction: ACTION,
          templateId: 'template_gvnlb36',
          templateParams: {
            ...formData,
            time: new Date().toISOString(),
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Send failed');

      setNotice({
        type: 'success',
        msg: `Message sent successfully! We'll reply shortly.`,
      });
      reset();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to send message. Please try again.';
      setNotice({ type: 'error', msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="section-padding container max-w-5xl">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Contact Us</h1>
        <p className="text-muted-foreground mt-4 text-lg">
          We're here to help with your FilmRAID needs.
        </p>
      </div>

      {/* Restored banner image */}
      <div className="mt-10 overflow-hidden rounded-2xl">
        <img src="/layout/map.jpg" alt="FilmRAID Location Map" className="w-full" />
      </div>

      <div className="mt-12 grid gap-12 md:grid-cols-5">
        {/* Contact Info */}
        <div className="space-y-8 md:col-span-2">
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center gap-4">
                <Mail className="text-primary h-6 w-6" />
                <div>
                  <p className="font-medium">General Inquiries</p>
                  <a href="mailto:hello@filmraid.pro" className="text-primary hover:underline">
                    hello@filmraid.pro
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8">
              <div className="flex items-center gap-4">
                <Mail className="text-primary h-6 w-6" />
                <div>
                  <p className="font-medium">Orders</p>
                  <a href="mailto:orders@filmraid.pro" className="text-primary hover:underline">
                    orders@filmraid.pro
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8">
              <div className="flex items-center gap-4">
                <MapPin className="text-primary h-6 w-6" />
                <div>
                  <p className="font-medium">Address</p>
                  <p className="text-muted-foreground text-sm">
                    Carrer del Valles 55
                    <br />
                    08030 Barcelona, Spain
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-3">
          <Card>
            <CardContent className="p-8">
              <h3 className="mb-6 text-2xl font-semibold">Send us a message</h3>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
                <div>
                  <Label htmlFor="name">Your Name</Label>
                  <Input
                    id="name"
                    {...register('name', { required: true })}
                    placeholder="Your Name"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Your Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email', { required: true })}
                    placeholder="you@email.com"
                  />
                </div>

                <div>
                  <Label htmlFor="message">Your Message</Label>
                  <Textarea
                    id="message"
                    {...register('message', { required: true })}
                    rows={6}
                    placeholder="How can we help you?"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>

                <p className="text-muted-foreground text-center text-xs">
                  This site is protected by reCAPTCHA to prevent spam and abuse. See our{' '}
                  <a href="/privacy-policy" className="hover:text-primary underline">
                    Privacy Policy
                  </a>{' '}
                  for details.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
