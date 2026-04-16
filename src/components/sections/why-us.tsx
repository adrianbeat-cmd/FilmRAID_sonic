import React from 'react';

import { Check, X } from 'lucide-react';

const rows = [
  {
    feature: 'Drives included in price',
    filmraid: true,
    graid: true,
    synology: false,
  },
  {
    feature: 'Enterprise SAS drives',
    filmraid: true,
    graid: false,
    synology: false,
  },
  {
    feature: 'Pre-configured RAID',
    filmraid: true,
    graid: 'Partial',
    synology: false,
  },
  {
    feature: 'Thunderbolt 3',
    filmraid: true,
    graid: true,
    synology: false,
  },
  {
    feature: 'Up to 2600MB/s',
    filmraid: true,
    graid: false,
    synology: false,
  },
  {
    feature: 'Up to 288TB in one unit',
    filmraid: true,
    graid: false,
    synology: false,
  },
  {
    feature: 'EU delivery in 3 days',
    filmraid: true,
    graid: false,
    synology: false,
  },
  {
    feature: 'Built for film production',
    filmraid: true,
    graid: false,
    synology: false,
  },
  {
    feature: '3yr enclosure + 5yr drive warranty',
    filmraid: true,
    graid: false,
    synology: false,
  },
];

type CellValue = boolean | string;

const Cell = ({ value, highlight = false }: { value: CellValue; highlight?: boolean }) => {
  if (value === true) {
    return (
      <div className="flex justify-center">
        <Check
          size={18}
          className={highlight ? 'text-black dark:text-white' : 'text-gray-400 dark:text-gray-500'}
          strokeWidth={2.5}
        />
      </div>
    );
  }
  if (value === false) {
    return (
      <div className="flex justify-center">
        <X size={18} className="text-gray-400 dark:text-gray-500" strokeWidth={2} />
      </div>
    );
  }
  return (
    <div className="flex justify-center">
      <span className="text-xs text-gray-400">{value}</span>
    </div>
  );
};

export default function WhyUs() {
  return (
    <section className="section-padding container">
      {/* Header */}
      <div className="mb-12 max-w-2xl">
        <p className="mb-4 text-xs font-semibold tracking-[0.2em] text-gray-400 uppercase">
          Why FilmRAID
        </p>
        <h2 className="text-3xl leading-tight font-bold tracking-tight text-black md:text-4xl dark:text-white">
          How we compare.
        </h2>
        <p className="mt-4 text-base text-gray-500 dark:text-gray-400">
          Not all RAID systems are equal. Here's how FilmRAID stacks up against the alternatives.
        </p>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse">
          {/* Column headers */}
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800">
              <th className="w-1/2 pb-4 text-left text-sm font-normal text-gray-400" />
              <th className="w-[16.6%] pb-4 text-center">
                <span className="text-sm font-bold text-black dark:text-white">FilmRAID</span>
              </th>
              <th className="w-[16.6%] pb-4 text-center">
                <span className="text-sm font-normal text-gray-400">G-RAID</span>
              </th>
              <th className="w-[16.6%] pb-4 text-center">
                <span className="text-sm font-normal text-gray-400">Synology</span>
              </th>
            </tr>
          </thead>

          {/* Rows */}
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={index}
                className="border-b border-gray-100 last:border-b-0 dark:border-gray-900"
              >
                <td className="py-4 text-sm text-gray-600 dark:text-gray-400">{row.feature}</td>
                <td className="py-4">
                  <Cell value={row.filmraid} highlight />
                </td>
                <td className="py-4">
                  <Cell value={row.graid} />
                </td>
                <td className="py-4">
                  <Cell value={row.synology} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-6 text-xs text-gray-400">
        * Comparison based on publicly available product specifications. G-RAID and Synology are
        trademarks of their respective owners.
      </p>
    </section>
  );
}
