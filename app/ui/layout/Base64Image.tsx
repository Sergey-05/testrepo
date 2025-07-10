'use client';

import Image from 'next/image';
import { useState } from 'react';

interface Base64ImageProps {
  src: string; // Base64 string
  alt: string;
  width: number;
  height: number;
  className?: string;
  style?: React.CSSProperties;
  priority?: boolean;
}

const Skeleton: React.FC<{
  className?: string;
  style?: React.CSSProperties;
}> = ({ className, style }) => (
  <div
    className={`animate-pulse rounded-md bg-gray-700/50 ${className}`}
    style={{
      ...style,
      background:
        'linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%)',
      backgroundSize: '200% 100%',
    }}
  />
);

export default function Base64Image({
  src,
  alt,
  width,
  height,
  className,
  style,
  priority = false,
}: Base64ImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <Skeleton className={className} style={{ ...style, width, height }} />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={style}
      priority={priority}
      loading={priority ? undefined : 'lazy'}
      onError={() => setHasError(true)}
    />
  );
}
