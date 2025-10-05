'use client';

import React from 'react';

import ProductClient from './ProductClient';

export default function Page() {
  // Datos mínimos para que compile. Ajusta cuando conectemos el catálogo real.
  const currentModel = {
    name: 'FilmRaid-6 (Demo)',
    hddCount: 6,
    image: '/images/preview.jpg',
    back_image: '/images/preview.jpg',
    description: (
      <p>Demo del catálogo para asegurar el deploy. Sustituiremos estos datos por los reales.</p>
    ),
    specs: [
      { label: 'Bays', value: '6' },
      { label: 'Form Factor', value: 'Desktop' },
    ],
  };

  return (
    <ProductClient
      currentModel={currentModel}
      tb={120}
      raid0={2000}
      raid5={1200}
      price={2999}
      images={['/images/preview.jpg', '/images/preview.jpg']}
      availableRaids={['RAID0', 'RAID5']}
    />
  );
}
