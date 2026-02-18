'use client';

import React, { useEffect, useState } from 'react';

import Image from 'next/image';

import { useForm, SubmitHandler } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { SITE_KEY, grecaptchaReady, getEnterpriseToken } from '@/lib/recaptcha';

interface OrderFormData {
  company: string;
  vat: string;
  address: string;
  email: string;
  raid?: string;
  model?: string;
  capacity?: string;
  raid0?: string;
  raid5?: string;
  price?: string;
  quantity?: string;
  [key: string]: string | undefined;
}

interface ProductClientProps {
  currentModel: {
    name: string;
    hddCount: number;
    image: string;
    back_image: string;
    description: string;
    specs: { label: string; value: string | string[] }[];
  };
  tb: number;
  raid0: number;
  raid5: number;
  price: number;
  images: string[];
  availableRaids: string[];
}

const ACTION = 'QUOTE_FORM';

const ProductClient = ({
  currentModel,
  tb,
  raid0,
  raid5,
  price,
  images,
  availableRaids,
}: ProductClientProps) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedRaid, setSelectedRaid] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [totalPrice, setTotalPrice] = useState(price);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitNotice, setSubmitNotice] = useState<{ type: '' | 'success' | 'error'; msg: string }>(
    {
      type: '',
      msg: '',
    },
  );

  const {
    handleSubmit,
    reset,
    register,
    formState: { errors },
  } = useForm<OrderFormData>();

  useEffect(() => {
    setTotalPrice(price * quantity);
  }, [price, quantity]);

  const configSummary = `Model: ${currentModel.name}, Capacity: ${raid0}TB, RAID: ${selectedRaid || 'Not selected'}`;
  const productId = `${currentModel.name.toLowerCase()}-${raid0}tb`;
  const productUrl = `https://www.filmraid.pro/products/${productId}`;
  const productName = `${currentModel.name} ${raid0}TB`;

  const onSubmit: SubmitHandler<OrderFormData> = async (data) => {
    try {
      if (!selectedRaid) {
        toast('Select RAID Level', {
          description: 'Please select a RAID configuration to proceed.',
          style: { background: '#ff4d4f', color: '#fff' },
        });
        return;
      }

      setIsSubmitting(true);

      await grecaptchaReady();
      const token = await getEnterpriseToken(ACTION);

      const templateParams = {
        ...data,
        model: currentModel.name,
        capacity: `${raid0}TB`,
        raid0: `${raid0}TB`,
        raid5: `${raid5}TB`,
        raid: selectedRaid,
        price: `€${totalPrice}`,
        quantity: quantity.toString(),
        time: new Date().toISOString(),
      };

      const res = await fetch('/.netlify/functions/submit-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          siteKey: SITE_KEY,
          expectedAction: ACTION,
          templateId: 'template_bic87oh',
          templateParams,
        }),
      });

      const dataResp = await res.json();
      if (!res.ok) throw new Error(dataResp?.error || 'Send failed');

      toast('Wire transfer request sent!', {
        description: `We’ll email you bank details shortly.`,
        style: { background: '#16a34a', color: '#fff' },
      });

      reset();
      setIsDialogOpen(false);
      setSelectedRaid('');
      setQuantity(1);
      setTotalPrice(price);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to send request.';
      toast('Error', { description: msg, style: { background: '#ff4d4f', color: '#fff' } });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-12 md:py-16 lg:py-20">
      <div className="container grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Images */}
        <div className="order-1">
          <div className="relative">
            <Image
              src={images[selectedImage]}
              alt={currentModel.name}
              width={800}
              height={600}
              className="h-auto w-full rounded-lg shadow-md"
            />
            <div className="mt-4 flex justify-center gap-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`rounded border p-1 ${selectedImage === idx ? 'border-primary' : 'border-transparent'}`}
                >
                  <Image src={img} alt={`Thumbnail ${idx + 1}`} width={80} height={60} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Config & Buy */}
        <div className="order-2 space-y-4 md:sticky md:top-16 md:col-start-2 md:row-start-1 md:self-start">
          <h1 className="text-3xl font-bold">{currentModel.name}</h1>
          <p className="text-muted-foreground">{currentModel.description}</p>

          <div>
            <h3 className="font-bold">Storage</h3>
            <p className="text-sm">
              {currentModel.hddCount} × {tb}TB HDD
            </p>
            <p className="text-sm">
              RAID 0: {raid0}TB | RAID 5: {raid5}TB
            </p>
          </div>

          <p className="mb-2 text-xl font-semibold">Total: €{totalPrice}</p>

          <div className="mb-4 space-y-2">
            <Label htmlFor="raid">RAID Level</Label>
            <Select onValueChange={setSelectedRaid} value={selectedRaid}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select RAID Level" />
              </SelectTrigger>
              <SelectContent>
                {availableRaids.map((raid) => (
                  <SelectItem key={raid} value={raid}>
                    {raid}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mt-4 space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Select
              onValueChange={(value) => setQuantity(parseInt(value))}
              value={quantity.toString()}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="1" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mt-4 flex flex-col space-y-4">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  className="w-full"
                  variant={selectedRaid ? 'default' : 'outline'}
                  disabled={!selectedRaid}
                >
                  Request Wire Transfer
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Request Wire Transfer</DialogTitle>
                  <DialogDescription>{configSummary}</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="company">Name/Company</Label>
                    <Input
                      id="company"
                      {...register('company', { required: true })}
                      placeholder="Name or Company"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vat">EU VAT Number (Optional)</Label>
                    <Input id="vat" {...register('vat')} placeholder="e.g. ESB10680478" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Shipping Address</Label>
                    <Textarea
                      id="address"
                      {...register('address', { required: true })}
                      placeholder="Full shipping address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register('email', { required: true })}
                      placeholder="your@email.com"
                    />
                  </div>

                  <p className="text-muted-foreground mt-2 text-xs leading-snug">
                    This site is protected by reCAPTCHA. See our{' '}
                    <a href="/privacy-policy" className="hover:text-primary underline">
                      Privacy Policy
                    </a>{' '}
                    for details.
                  </p>

                  <DialogFooter>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Sending…' : 'Send Request'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Button
              className="snipcart-add-item w-full"
              variant={selectedRaid ? 'default' : 'outline'}
              disabled={!selectedRaid}
              data-item-id={productId}
              data-item-price={price}
              data-item-url={productUrl}
              data-item-description={currentModel.description}
              data-item-name={productName}
              data-item-image={images[0]}
              data-item-quantity={quantity}
              data-item-custom1-name="RAID-Level"
              data-item-custom1-options={availableRaids.join('|')}
              data-item-custom1-value={selectedRaid}
              data-item-shippable="true"
              data-item-taxable="true"
            >
              Add to Cart (Pay Online)
            </Button>
          </div>
        </div>

        {/* Specs */}
        <Card className="order-3 md:col-start-1 md:row-start-2">
          <CardContent className="space-y-4 p-6">
            <h2 className="text-2xl font-bold">Technical Specifications</h2>
            {currentModel.specs.map((spec, idx) => (
              <div key={idx} className="flex justify-between border-b py-2 last:border-0">
                <span className="font-medium">{spec.label}</span>
                <span className="text-right">
                  {Array.isArray(spec.value) ? spec.value.join(', ') : spec.value}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default ProductClient;
