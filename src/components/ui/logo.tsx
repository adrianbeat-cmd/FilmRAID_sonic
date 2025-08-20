import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
interface LogoProps {
  className?: string;
  wrapperClassName?: string;
}

const Logo: React.FC<LogoProps> = ({ className = '', wrapperClassName = '' }) => {
  return (
    <div className={cn(``, wrapperClassName)}>
      <Link href="/" className={cn(`relative block h-6 w-25`, className)}>
        <Image src="/layout/logo.svg" alt="Sonic Logo" fill priority className="object-contain" />
      </Link>
    </div>
  );
};

export default Logo;
