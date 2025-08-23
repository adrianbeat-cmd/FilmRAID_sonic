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
  tb: number;
  raid0: number;
  raid5: number;
  price: number;
  images: string[];
  availableRaids: string[];
}

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

  const configSummary = `Model: ${currentModel.name}, Capacity: ${raid0}TB, RAID: ${selectedRaid || 'Not selected'}`;
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
      .send('service_e70jt19', 'template_bic87oh', data, 'Rbqf0P3F5FR_B-ndQ')
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
    {
      label: 'On-Board Cache',
      value:
        currentModel.name === 'FilmRaid-4A'
          ? '1GB DDR3-800'
          : currentModel.name === 'FilmRaid-6'
            ? '2GB DDR3-1866 SDRAM'
            : '8GB DDR4-2666 SDRAM',
    },
    {
      label: 'Expansion Support',
      value:
        currentModel.name === 'FilmRaid-4A' || currentModel.name === 'FilmRaid-8'
          ? 'N/A'
          : currentModel.name === 'FilmRaid-6'
            ? 'SFF-8644 (2-lanes)'
            : 'SFF-8644 (4-lanes)',
    },
    {
      label: 'Cooling Fan',
      value:
        currentModel.name === 'FilmRaid-4A' || currentModel.name === 'FilmRaid-6'
          ? '1 x 2700rpm'
          : '2 x 2700rpm',
    },
    {
      label: 'Power Supply',
      value:
        currentModel.name === 'FilmRaid-4A'
          ? '135W (inside) / 150W (outside)'
          : currentModel.name === 'FilmRaid-6'
            ? '180W'
            : currentModel.name === 'FilmRaid-8'
              ? '270W'
              : '400W',
    },
    {
      label: 'Physical Dimensions (H x W x D)',
      value:
        currentModel.name === 'FilmRaid-4A'
          ? '4.84 x 6.51 x 9.11 in (123 x 165.6 x 232 mm)'
          : currentModel.name === 'FilmRaid-6'
            ? '4.84 x 8.45 x 9.11 in (146 x 255 x 290 mm)'
            : currentModel.name === 'FilmRaid-8'
              ? '5.7 x 11.8 x 11.4 in (146 x 302 x 290 mm)'
              : '8.1 x 12.2 x 11.4 in (206 x 310 x 290 mm)',
    },
    {
      label: 'Weight (without disks)',
      value:
        currentModel.name === 'FilmRaid-4A'
          ? '3.6 Kg'
          : currentModel.name === 'FilmRaid-6'
            ? '4.8 Kg'
            : currentModel.name === 'FilmRaid-8'
              ? '5.2 Kg'
              : '9.5 Kg',
    },
    { label: 'Warranty', value: '3 years' },
  ];

  const handleButtonClick = () => {
    if (!selectedRaid) {
      toast('Select RAID Level', {
        description: 'Please select a RAID configuration to proceed.',
        style: { background: '#ff4d4f', color: '#fff' },
      });
    }
  };

  return (
    <section className="py-12 md:py-16 lg:py-20">
      <div className="container grid grid-cols-1 gap-8 md:grid-cols-2">
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
                  className={`rounded border p-1 ${
                    selectedImage === idx ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <Image src={img} alt={`Thumbnail ${idx + 1}`} width={80} height={60} />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="order-2 space-y-4 md:sticky md:top-16 md:col-start-2 md:row-start-1 md:self-start">
          <h1 className="text-3xl font-bold">{currentModel.name}</h1>
          <p className="text-muted-foreground">{currentModel.description}</p>

          <div>
            <h3 className="font-bold">Storage</h3>
            <p className="text-sm">{tb}TB HDD</p>
            <p className="text-sm">
              RAID 0: {raid0}TB | RAID 5: {raid5}TB
            </p>
          </div>

          <p className="mb-4 text-xl">Total: €{totalPrice}</p>

          <div className="mb-4 space-y-2">
            <Label htmlFor="raid">RAID Level</Label>
            <Select onValueChange={setSelectedRaid} value={selectedRaid}>
              <SelectTrigger
                className={`w-full pr-10 ${!selectedRaid ? 'bg-[#306fdb] !text-[#ffffff] dark:bg-[#306fdb] dark:!text-[#ffffff]' : ''}`}
              >
                <SelectValue placeholder="First select RAID Level" />
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
              defaultValue="1"
            >
              <SelectTrigger className="w-full pr-10">
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
                  onClick={handleButtonClick}
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
