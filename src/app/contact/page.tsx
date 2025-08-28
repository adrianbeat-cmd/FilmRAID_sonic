'use client';

import React, { useState } from 'react';

import Script from 'next/script';

import emailjs from '@emailjs/browser';
import { Mail, MapPin } from 'lucide-react';
import { useForm, SubmitHandler } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ContactFormData {
  name: string;
  email: string;
  message: string;
  [key: string]: string; // EmailJS compat
}

interface VerifyResponse {
  success: boolean;
  score?: number;
  reasons?: string[];
  action?: string;
  hostname?: string;
}

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY as string;
const ACTION = 'CONTACT_FORM';

function grecaptchaReady(): Promise<void> {
  return new Promise<void>((resolve) => {
    const check = () => {
      if (typeof window !== 'undefined' && window.grecaptcha?.enterprise) {
        resolve();
      } else {
        setTimeout(check, 50);
      }
    };
    check();
  });
}

async function getEnterpriseToken(action: string): Promise<string> {
  if (!window.grecaptcha?.enterprise) throw new Error('reCAPTCHA not ready');
  // Como cargamos con ?render=SITE_KEY, llamamos sin pasar la key:
  const token = await window.grecaptcha.enterprise.execute({ action });
  if (!token) throw new Error('Could not obtain reCAPTCHA token');
  return token;
}

async function verifyTokenOnServer(token: string): Promise<{ ok: boolean; data: VerifyResponse }> {
  const res = await fetch('/.netlify/functions/verify-recaptcha-enterprise', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, siteKey: SITE_KEY, expectedAction: ACTION }),
  });
  const data = (await res.json()) as VerifyResponse;
  return { ok: res.ok, data };
}

export default function Contact() {
  const {
    handleSubmit,
    reset,
    register,
    formState: { errors },
  } = useForm<ContactFormData>();

  const [status, setStatus] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const onSubmit: SubmitHandler<ContactFormData> = async (formData) => {
    try {
      setStatus('');
      setIsSubmitting(true);

      if (!SITE_KEY) throw new Error('Missing NEXT_PUBLIC_RECAPTCHA_SITE_KEY');

      // 1) Obtener token (Enterprise, invisible)
      await grecaptchaReady();
      const token = await getEnterpriseToken('CONTACT_FORM'); // o 'QUOTE_FORM'

      // 2) Verificar token en Netlify (Assessments)
      const { ok, data } = await verifyTokenOnServer(token);
      if (!ok || !data?.success) throw new Error('Captcha verification failed.');

      // 3) Enviar email (EmailJS - cliente)
      const payload: ContactFormData = {
        ...formData,
        time: new Date().toISOString(), // si tu template lo usa
      };

      await emailjs.send(
        'service_cybppme', // SERVICE ID
        'template_gvnlb36', // TEMPLATE ID
        payload,
        'Rbqf0P3F5FR_B-ndQ', // PUBLIC KEY (user key)
      );

      setStatus(
        `Message sent successfully!${typeof data.score === 'number' ? ` (reCAPTCHA score: ${data.score.toFixed(2)})` : ''}`,
      );
      reset();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send message. Please try again.';
      setStatus(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="section-padding container space-y-10.5">
      {/* Script de reCAPTCHA Enterprise */}
      <Script
        id="recaptcha-enterprise"
        src={`https://www.google.com/recaptcha/enterprise.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`}
        strategy="afterInteractive"
      />

      <h2 className="text-center text-3xl font-bold text-black dark:text-white">Contact Us</h2>
      <div className="mx-auto max-w-3xl space-y-6 text-lg">
        <p className="text-center font-semibold text-gray-600 dark:text-gray-300">
          We're here to assist with your film storage needs.
        </p>

        <div className="rounded-lg bg-gray-100 p-4 text-center shadow-sm dark:bg-gray-800">
          <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Reach out for <strong>custom configurations</strong>, <strong>support</strong>, or any{' '}
            <strong>questions</strong>:
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="md:col-span-1">
            <Card className="dark:bg-gray-800">
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center gap-4">
                  <Mail className="text-primary h-6 w-6" />
                  <div>
                    <p className="font-semibold text-black dark:text-white">General Inquiries</p>
                    <a href="mailto:hello@filmraid.pro" className="text-primary hover:underline">
                      hello@filmraid.pro
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Mail className="text-primary h-6 w-6" />
                  <div>
                    <p className="font-semibold text-black dark:text-white">Orders</p>
                    <a href="mailto:orders@filmraid.pro" className="text-primary hover:underline">
                      orders@filmraid.pro
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Mail className="text-primary h-6 w-6" />
                  <div>
                    <p className="font-semibold text-black dark:text-white">Tech Support</p>
                    <a href="mailto:support@filmraid.pro" className="text-primary hover:underline">
                      support@filmraid.pro
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4 md:col-span-1">
            <Card className="dark:bg-gray-800">
              <CardContent className="flex items-center gap-4 p-6">
                <MapPin className="text-primary h-6 w-6" />
                <div>
                  <p className="font-semibold text-black dark:text-white">Address</p>
                  <p className="text-gray-600 dark:text-gray-300">
                    Carrer del Valles 55
                    <br />
                    08030 Barcelona
                    <br />
                    Spain
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="grayscale filter">
              <iframe
                title="FilmRaid Office Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2992.9999999999995!2d2.1800000000000004!3d41.390000000000004!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12a4a2f0f0f0f0f%3A0xf0f0f0f0f0f0f!2sCarrer%20del%20Valles%2C%2055%2C%2008030%20Barcelona!5e0!3m2!1sen!2ses!4v1721730000000!5m2!1sen!2ses"
                width="100%"
                height="300"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="rounded-lg shadow-md"
              ></iframe>
            </div>
          </div>
        </div>
      </div>

      <h3 className="text-center text-2xl font-bold text-black dark:text-white">Send a Message</h3>
      <Card className="mx-auto max-w-md dark:bg-gray-800">
        <CardContent className="space-y-6 p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="dark:text-white">
                Your Name
              </Label>
              <Input
                id="name"
                {...register('name', { required: 'Name is required' })}
                placeholder="Your Name"
                className="dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="dark:text-white">
                Your Email
              </Label>
              <Input
                id="email"
                {...register('email', { required: 'Email is required' })}
                type="email"
                placeholder="Your Email"
                className="dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="message" className="dark:text-white">
                Your Message
              </Label>
              <Textarea
                id="message"
                {...register('message', { required: 'Message is required' })}
                placeholder="Your Message"
                className="h-32 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              />
              {errors.message && <p className="text-sm text-red-500">{errors.message.message}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </Button>

            <p className="text-muted-foreground mt-2 text-xs leading-snug">
              This site is protected by reCAPTCHA and the Google{' '}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Privacy Policy
              </a>{' '}
              and{' '}
              <a
                href="https://policies.google.com/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Terms of Service
              </a>{' '}
              apply.
            </p>

            {status && (
              <p className="text-center text-sm text-gray-600 dark:text-gray-300">{status}</p>
            )}
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
