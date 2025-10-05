// app/returns/page.tsx
import Link from 'next/link';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Returns & Refunds',
  description:
    'FilmRAID returns & refunds policy. Returns accepted within 14 days. Defective items fully covered.',
  alternates: { canonical: '/returns' },
  openGraph: {
    title: 'Returns & Refunds | FilmRAID',
    description:
      'Returns accepted within 14 days. Defective items fully covered. Read full policy.',
    url: 'https://www.filmraid.pro/returns',
    type: 'article',
  },
};

export default function ReturnsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Returns & Refunds</h1>
        <p className="mt-2 text-sm text-gray-600">
          Effective date: {new Date().getFullYear()} – FilmRAID
        </p>
      </header>

      {/* ENGLISH */}
      <section className="prose prose-gray dark:prose-invert max-w-none">
        <h2>Return Policy (English)</h2>
        <p>
          We accept returns within <strong>14 days</strong> of delivery for both defective and
          non-defective products. Returned items must be in their original packaging and condition.
        </p>
        <ul>
          <li>
            For <strong>non-defective</strong> returns, shipping costs are paid by the customer.
          </li>
          <li>
            For <strong>defective or damaged</strong> items, FilmRAID will cover all return costs
            and provide a replacement or a full refund.
          </li>
        </ul>
        <p>
          To request a return, please email us at{' '}
          <a href="mailto:orders@filmraid.pro">orders@filmraid.pro</a> with your order number and a
          brief description.
        </p>
        <p className="text-xs text-gray-500">
          Note: For international shipments outside the EU, import duties and taxes (DAP) may apply
          and are payable at destination unless otherwise stated.
        </p>
      </section>

      <hr className="my-10" />

      {/* ESPAÑOL */}
      <section className="prose prose-gray dark:prose-invert max-w-none">
        <h2>Política de Devoluciones (Español)</h2>
        <p>
          Aceptamos devoluciones dentro de los <strong>14 días</strong> posteriores a la entrega,
          tanto por productos defectuosos como no defectuosos. Los artículos deben devolverse en su
          embalaje y estado original.
        </p>
        <ul>
          <li>
            En <strong>devoluciones no defectuosas</strong>, los costes de envío corren a cargo del
            cliente.
          </li>
          <li>
            En caso de <strong>defecto o daño</strong> durante el transporte, FilmRAID asumirá todos
            los costes y ofrecerá un reemplazo o reembolso completo.
          </li>
        </ul>
        <p>
          Para solicitar una devolución, escríbenos a{' '}
          <a href="mailto:orders@filmraid.pro">orders@filmraid.pro</a> indicando tu número de pedido
          y una breve descripción.
        </p>
        <p className="text-xs text-gray-500">
          Nota: En envíos internacionales fuera de la UE, pueden aplicarse aranceles e impuestos de
          importación (DAP) a pagar en destino, salvo indicación en contrario.
        </p>
      </section>

      <div className="mt-12 flex flex-wrap items-center gap-3">
        <Link
          href="/"
          className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          ← Back to home
        </Link>
        <Link
          href="/contact"
          className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90 dark:bg-white dark:text-black"
        >
          Contact support
        </Link>
      </div>
    </main>
  );
}
