'use client';

import React, { useState, useEffect, useRef } from 'react';

import Image from 'next/image';

import emailjs from 'emailjs-com';
import GoogleReCAPTCHA from 'react-google-recaptcha';
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

interface OrderFormData {
  company: string;
  vat: string;
  address: string;
  email: string;
  raid: string;
  [key: string]: string;
}

interface ProductClientProps {
  currentModel: {
    name: string;
    hddCount: number;
    image: string;
    back_image: string;
    description: React.ReactNode;
    specs: { label: string; value: string | string[] }[];
  };
  raid0: number;
  raid5: number;
  price: number;
  images: string[];
  availableRaids: string[];
}

const ProductClient = ({
  currentModel,
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
  const {
    handleSubmit,
    reset,
    register,
    formState: { errors },
  } = useForm<OrderFormData>();
  const [captchaValue, setCaptchaValue] = useState<string | null>(null);
  const captchaRef = useRef<GoogleReCAPTCHA>(null);

  useEffect(() => {
    setTotalPrice(price * quantity);
  }, [price, quantity]);

  const productId = `${currentModel.name.toLowerCase()}-${raid0}tb`;
  const productUrl = `https://www.filmraid.pro/products/${productId}`;
  const productName = `${currentModel.name} ${raid0}TB`;

  const onSubmit: SubmitHandler<OrderFormData> = (data) => {
    if (!captchaValue) {
      alert('Please complete the CAPTCHA verification.');
      return;
    }
    data.model = currentModel.name;
    data.capacity = `${raid0}TB`;
    data.raid0 = `${raid0}TB`;
    data.raid5 = `${raid5}TB`;
    data.raid = selectedRaid;
    data.price = `€${totalPrice}`;
    data.quantity = quantity.toString();

    emailjs
      .send(
        process.env.EMAILJS_SERVICE_ID as string,
        process.env.EMAILJS_TEMPLATE_ID as string,
        data,
        process.env.EMAILJS_USER_ID as string,
      )
      .then(() => {
        alert('Wire transfer request sent successfully! We will send you the bank details soon.');
        reset();
        setIsDialogOpen(false);
        setSelectedRaid('');
        setQuantity(1);
        setTotalPrice(price);
        if (captchaRef.current) captchaRef.current.reset();
      })
      .catch((error: Error) => {
        alert(`Failed to send wire transfer request: ${error.message}. Please try again.`);
      });
  };

  // Define technical specifications based on Areca ARC-8050T3U series
  const technicalSpecs = [
    { label: 'Form Factor', value: `${currentModel.hddCount}-Bay Desktop` },
    { label: 'Connection', value: '2x Thunderbolt 3, 1x DisplayPort 1.4' },
    {
      label: 'Disk Port',
      value:
        currentModel.name === 'FilmRaid-4A'
          ? '4 x 6Gb/s SAS/SATA'
          : `${currentModel.hddCount} x 12Gb/s SAS or 6Gb/s SATA`,
    },
    {
      label: 'I/O Processor',
      value:
        currentModel.name === 'FilmRaid-4A'
          ? 'One Core 800 MHz SAS ROC'
          : currentModel.name === 'FilmRaid-6'
            ? 'Dual Core 1.2 GHz SAS ROC'
            : 'Tri-Mode Dual Core ARM A15 1.6GHz ROC',
    },
    // Add full specs if needed
  ];

  const handleButtonClick = () => {
    toast.success('Added to cart!');
  };

  // Weight in grams
  let weight;
  switch (currentModel.name) {
    case 'FilmRaid-4A':
      weight = 8000;
      break;
    case 'FilmRaid-6':
      weight = 12000;
      break;
    case 'FilmRaid-8':
      weight = 18000;
      break;
    case 'FilmRaid-12E':
      weight = 22000;
      break;
    default:
      weight = 10000;
  }

  return (
    <section className="py-12 md:py-24">
      <div className="container grid gap-12 md:grid-cols-2">
        <div className="order-1 space-y-4 md:sticky md:top-24 md:self-start">
          <div className="relative h-[500px] overflow-hidden rounded-lg">
            <Image
              src={images[selectedImage]}
              alt={`${currentModel.name} ${selectedImage === 0 ? 'front' : 'back'}`}
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="flex gap-4">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`h-24 w-24 overflow-hidden rounded-lg border-2 ${selectedImage === idx ? 'border-primary' : 'border-transparent'}`}
              >
                <Image
                  src={img}
                  alt={`${currentModel.name} thumbnail ${idx + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>
        <div className="order-2 space-y-6">
          <h1 className="text-3xl font-bold">
            {currentModel.name} {raid0}TB
          </h1>
          <p className="text-lg">{currentModel.description}</p>
          <div className="space-y-2">
            <p className="text-2xl font-bold">€{totalPrice.toFixed(2)}</p>
            <p className="text-muted-foreground text-sm">RAID 0 Capacity: {raid0}TB</p>
            <p className="text-muted-foreground text-sm">RAID 5 Capacity: {raid5}TB</p>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="raid">RAID Level</Label>
              <Select value={selectedRaid} onValueChange={setSelectedRaid}>
                <SelectTrigger>
                  <SelectValue placeholder="Select RAID level" />
                </SelectTrigger>
                <SelectContent>
                  {availableRaids.map((raid) => (
                    <SelectItem key={raid} value={raid}>
                      RAID {raid}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  Request Wire Transfer
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Request Wire Transfer</DialogTitle>
                  <DialogDescription>
                    Fill in your details to request wire transfer payment.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="company">Name/Company</Label>
                    <Input
                      id="company"
                      {...register('company', { required: true })}
                      placeholder="Name or Company"
                    />
                    {errors.company && <p className="text-sm text-red-500">Required</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vat">EU VAT Number (Optional for B2C)</Label>
                    <Input id="vat" {...register('vat')} placeholder="e.g., ESB12345678" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Shipping Address</Label>
                    <Textarea
                      id="address"
                      {...register('address', { required: true })}
                      placeholder="Shipping Address"
                    />
                    {errors.address && <p className="text-sm text-red-500">Required</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      {...register('email', { required: true })}
                      type="email"
                      placeholder="Your Email"
                    />
                    {errors.email && <p className="text-sm text-red-500">Required</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>CAPTCHA Verification</Label>
                    <GoogleReCAPTCHA
                      ref={captchaRef}
                      sitekey="6LexUYkrAAAAAKVDlNKttonFcHI_i3wBXQh0PnoV"
                      onChange={setCaptchaValue}
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={!captchaValue}>
                      Send Request
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <Button
              className="snipcart-add-item w-full"
              variant={selectedRaid ? 'default' : 'outline'}
              disabled={!selectedRaid}
              onClick={handleButtonClick}
              data-item-id={productId}
              data-item-price={price}
              data-item-url={productUrl}
              data-item-description={currentModel.description as string}
              data-item-name={productName}
              data-item-image={images[0]}
              data-item-quantity={quantity}
              data-item-custom1-name="RAIDLevel"
              data-item-custom1-options={availableRaids.join('|')}
              data-item-custom1-value={selectedRaid}
              data-item-shippable="true"
              data-item-taxable="true"
              data-item-weight={weight}
            >
              Add to Cart (Pay Online)
            </Button>
          </div>
        </div>
        <Card className="order-3 md:col-start-1 md:row-start-2">
          <CardContent className="space-y-4 p-6">
            <h2 className="text-2xl font-bold">Technical Specifications</h2>
            {technicalSpecs.map((spec, idx) => (
              <div key={idx} className="flex justify-between border-b py-2">
                <span className="font-medium">{spec.label}</span>
                <span className="text-right">
                  {Array.isArray(spec.value) ? spec.value.join(', ') : spec.value}
                </span>
              </div>
            ))}
            {currentModel.specs.map((spec, idx) => (
              <div key={idx} className="flex justify-between border-b py-2">
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
