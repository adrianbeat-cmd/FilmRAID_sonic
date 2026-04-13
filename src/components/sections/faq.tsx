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
      'All FilmRAID systems support RAID 0 (maximum speed, full capacity), RAID 5 (speed + redundancy, loses one drive worth of space), RAID 6 (extra protection, survives two simultaneous drive failures), RAID 10, and JBOD. The 6, 8, and 12E models also support RAID 30, 50, and 60. You choose your RAID level at checkout — the system arrives pre-configured and ready to use.',
  },
  {
    question: 'How fast is the delivery in the EU?',
    answer:
      'We ship via FedEx from Barcelona, Spain. Delivery across Europe typically takes 3–5 business days after order confirmation. Spain and nearby countries are usually 2–3 days.',
  },
  {
    question: 'Are your RAID systems compatible with film equipment?',
    answer:
      'Yes. All FilmRAID systems connect via dual Thunderbolt 3 (up to 40Gb/s), which is fully compatible with Mac Studio, Mac Pro, MacBook Pro, and any Thunderbolt 3 or 4 workstation. They also include DisplayPort 1.4, USB-C, USB-A, and RJ45 Ethernet. Compatible with DaVinci Resolve, Avid Media Composer, Final Cut Pro, and all major NLE and colour grading tools.',
  },
  {
    question: 'What storage capacities are available?',
    answer:
      'We offer four models in four capacities each. The FilmRaid-4A ranges from 72TB to 96TB. The FilmRaid-6 from 108TB to 144TB. The FilmRaid-8 from 144TB to 192TB. And the flagship FilmRaid-12E from 216TB to 288TB. All prices include the drives — nothing extra to buy.',
  },
  {
    question: 'Do you offer a warranty?',
    answer:
      'Yes. The Areca RAID enclosure comes with a 3-year warranty. The enterprise SAS drives (Toshiba MG series and Seagate Exos) come with a 5-year manufacturer warranty. All warranty claims are handled by FilmRAID — you contact us directly and we manage the process.',
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
