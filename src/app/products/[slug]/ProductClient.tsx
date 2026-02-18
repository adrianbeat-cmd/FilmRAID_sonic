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
    // ... (your existing onSubmit code remains unchanged)
    try {
      if (!selectedRaid) {
        toast('Select RAID Level', {
          description: 'Please select a RAID configuration to proceed.',
          style: { background: '#ff4d4f', color: '#fff' },
        });
        return;
      }
      // ... rest of your onSubmit code
    } catch (error) {
      // ... rest of your error handling
    }
  };

  return (
    <section className="py-12 md:py-16 lg:py-20">
      <div className="container grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Image column - unchanged */}
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

        {/* Config column */}
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

          <p className="mb-2 text-xl font-semibold">Total: €{totalPrice}</p>

          {/* === NEW CLEAR INSTRUCTION WITH ARROW === */}
          {!selectedRaid && (
            <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300">
              <div className="text-2xl">👇</div>
              <div>
                <strong>First select a RAID Level</strong>
                <br />
                to unlock the purchase options
              </div>
            </div>
          )}

          <div className="mb-4 space-y-2">
            <Label htmlFor="raid">RAID Level</Label>
            <Select onValueChange={setSelectedRaid} value={selectedRaid}>
              <SelectTrigger
                className={`w-full pr-10 ${!selectedRaid ? 'border-blue-500 ring-2 ring-blue-200' : ''}`}
              >
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
              onValueChange={(value) => setQuantity(parseInt(value, 10))}
              value={quantity.toString()}
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
                >
                  Request Wire Transfer
                </Button>
              </DialogTrigger>
              {/* Dialog content unchanged */}
              <DialogContent>{/* ... your existing dialog ... */}</DialogContent>
            </Dialog>

            <Button
              className="snipcart-add-item w-full"
              variant={selectedRaid ? 'default' : 'outline'}
              disabled={!selectedRaid}
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

        {/* Technical Specs - unchanged */}
        <Card className="order-3 md:col-start-1 md:row-start-2">
          <CardContent className="space-y-4 p-6">
            <h2 className="text-2xl font-bold">Technical Specifications</h2>
            {/* ... your existing specs ... */}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default ProductClient;
