// src/app/catalog/page.tsx
import dynamic from 'next/dynamic';

// 👇 Carga el catálogo sólo en el navegador, no durante el build
const CatalogClient = dynamic(() => import('./ProductClient'), {
  ssr: false,
  loading: () => (
    <main style={{ padding: 40 }}>
      <h1>Catalog</h1>
      <p>Loading products…</p>
    </main>
  ),
});

export default function Page() {
  return <CatalogClient />;
}
