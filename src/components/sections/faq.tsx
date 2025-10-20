'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqData = [
  {
    question: 'What is RAID and why use it for film production?',
    answer:
      'RAID (Redundant Array of Independent Disks) combines multiple drives for faster performance, larger capacity, or data redundancy. In film production, it ensures secure storage and quick transfers for large video files, preventing data loss during post-production.',
  },
  {
    question: 'What RAID levels do you offer?',
    answer:
      'We offer RAID 0 (speed-focused), RAID 5 (balanced speed and redundancy), RAID 6 (extra protection), and more up to RAID 10. Choose based on your needs for speed, security, or capacity in cinema workflows.',
  },
  {
    question: 'How fast is delivery in the EU?',
    answer:
      'We source and assemble your custom RAID system for delivery across Europe in just 2 days after order confirmation.',
  },
  {
    question: 'Are your RAID systems compatible with film equipment?',
    answer:
      'Yes, our systems support high-speed interfaces like Thunderbolt 3, NVMe, SAS, Fibre, iSCSI, and PCIe, making them ideal for digital cinema cameras, editing software, and post-production setups.',
  },
  {
    question: 'Do you offer a warranty?',
    answer:
      'All FilmRAID systems come with a limited factory warranty covering hardware defects. We provide expert support and assist with warranty claims if needed to ensure a smooth customer experience.',
  },
];

export default function FAQ() {
  return (
    <section className="section-padding container flex flex-col gap-8 md:flex-row md:gap-16">
      <div className="flex max-w-md flex-col gap-6 md:gap-16">
        <h2 className="text-3xl">FilmRAID FAQ</h2>
        <h3 className="text-2xl leading-8 md:text-4xl md:leading-14 lg:text-5xl">
          Common Questions About Our Custom RAID Storage Solutions
        </h3>
      </div>

      <Accordion defaultValue="item-0" type="single" className="space-y-8">
        {faqData.map((item, index) => (
          <AccordionItem key={index} value={`item-${index}`} className="px-4">
            <AccordionTrigger className="cursor-pointer text-xl font-normal hover:no-underline md:pb-6 md:text-3xl">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="text-base md:pb-6">{item.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
