'use client';

import React, { useState } from 'react';

import { useForm, SubmitHandler } from 'react-hook-form';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
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
        msg: `Message sent. We'll reply shortly.`,
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
    <section className="section-padding container max-w-4xl">
      {/* Header */}
      <div className="mb-16">
        <p className="mb-4 text-xs font-semibold tracking-[0.2em] text-gray-400 uppercase">
          Contact
        </p>
        <h1 className="text-4xl leading-tight font-bold tracking-tight text-black md:text-5xl dark:text-white">
          Get in touch.
        </h1>
      </div>

      <div className="grid gap-16 md:grid-cols-2">
        {/* Left — contact info */}
        <div className="flex flex-col gap-10">
          <div className="border-t border-gray-200 pt-8 dark:border-gray-800">
            <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-gray-400 uppercase">
              General Inquiries
            </p>
            <a
              href="mailto:hello@filmraid.pro"
              className="text-base text-black transition-opacity hover:opacity-50 dark:text-white"
            >
              hello@filmraid.pro
            </a>
          </div>

          <div className="border-t border-gray-200 pt-8 dark:border-gray-800">
            <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-gray-400 uppercase">
              Orders
            </p>
            <a
              href="mailto:orders@filmraid.pro"
              className="text-base text-black transition-opacity hover:opacity-50 dark:text-white"
            >
              orders@filmraid.pro
            </a>
          </div>

          <div className="border-t border-gray-200 pt-8 dark:border-gray-800">
            <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-gray-400 uppercase">
              Address
            </p>
            <p className="text-base text-black dark:text-white">
              The DIT World Company S.L.U.
              <br />
              Carrer del Valles 55, 1-2
              <br />
              08030 Barcelona, Spain
            </p>
          </div>
        </div>

        {/* Right — contact form */}
        <div className="border-t border-gray-200 pt-8 dark:border-gray-800">
          <p className="mb-8 text-xs font-semibold tracking-[0.2em] text-gray-400 uppercase">
            Send a message
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
            <div className="flex flex-col gap-2">
              <Label htmlFor="name" className="text-xs tracking-[0.15em] text-gray-400 uppercase">
                Name
              </Label>
              <Input
                id="name"
                {...register('name', { required: true })}
                placeholder="Your name"
                className="rounded-none border-0 border-b border-gray-200 bg-transparent px-0 focus-visible:ring-0 dark:border-gray-800"
              />
              {errors.name && <p className="text-xs text-red-500">Required</p>}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="email" className="text-xs tracking-[0.15em] text-gray-400 uppercase">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                {...register('email', { required: true })}
                placeholder="you@email.com"
                className="rounded-none border-0 border-b border-gray-200 bg-transparent px-0 focus-visible:ring-0 dark:border-gray-800"
              />
              {errors.email && <p className="text-xs text-red-500">Required</p>}
            </div>

            <div className="flex flex-col gap-2">
              <Label
                htmlFor="message"
                className="text-xs tracking-[0.15em] text-gray-400 uppercase"
              >
                Message
              </Label>
              <Textarea
                id="message"
                {...register('message', { required: true })}
                rows={5}
                placeholder="How can we help?"
                className="rounded-none border-0 border-b border-gray-200 bg-transparent px-0 focus-visible:ring-0 dark:border-gray-800"
              />
              {errors.message && <p className="text-xs text-red-500">Required</p>}
            </div>

            {notice.msg && (
              <p
                className={`text-sm ${notice.type === 'success' ? 'text-green-600' : 'text-red-500'}`}
              >
                {notice.msg}
              </p>
            )}

            <Button type="submit" disabled={isSubmitting} className="w-fit">
              {isSubmitting ? 'Sending…' : 'Send Message'}
            </Button>

            <p className="text-xs text-gray-400">
              Protected by reCAPTCHA.{' '}
              <a href="/privacy-policy" className="underline hover:opacity-60">
                Privacy Policy
              </a>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
