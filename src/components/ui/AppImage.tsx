/**
 * AppImage — wrapper around Next.js <Image /> with Apple-style defaults.
 *
 * Rules enforced (PRD §4.6 + §18.2):
 * - Never use <img> directly — always this component
 * - Serves WebP/AVIF automatically via next/image
 * - priority={true} ONLY for hero/LCP images
 * - placeholder="blur" for product images (blurDataURL required or defaults provided)
 * - Always requires a descriptive `alt` attribute
 */

import Image, { type ImageProps } from 'next/image';
import { clsx } from 'clsx';

// 1×1 grey blur placeholder (base64 encoded)
const DEFAULT_BLUR_DATA =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

interface AppImageProps extends Omit<ImageProps, 'alt'> {
  alt: string;   // required — never optional
  /**
   * 'product' — white/light grey bg, no extra border
   * 'card'    — rounded-ios, shadow-card, overflow-hidden wrapper
   * 'avatar'  — circular crop
   * 'blog'    — full-width, aspect-video, rounded-base
   */
  preset?: 'product' | 'card' | 'avatar' | 'blog' | 'none';
  wrapperClassName?: string;
}

const PRESET_WRAPPER: Record<string, string> = {
  product: 'bg-bg-secondary rounded-ios overflow-hidden',
  card:    'rounded-ios shadow-card overflow-hidden',
  avatar:  'rounded-full overflow-hidden',
  blog:    'rounded-base overflow-hidden aspect-video',
  none:    '',
};

export function AppImage({
  alt,
  preset = 'none',
  wrapperClassName,
  className,
  priority,
  blurDataURL,
  ...props
}: AppImageProps) {
  const usePlaceholder = !priority; // hero images don't need blur placeholder
  const wrapperClass = PRESET_WRAPPER[preset];

  const img = (
    <Image
      {...props}
      alt={alt}
      priority={priority}
      placeholder={usePlaceholder ? 'blur' : undefined}
      blurDataURL={usePlaceholder ? (blurDataURL ?? DEFAULT_BLUR_DATA) : undefined}
      className={clsx(
        'object-cover',
        preset === 'product' && 'mix-blend-multiply',
        className
      )}
    />
  );

  if (!wrapperClass && !wrapperClassName) return img;

  return (
    <div className={clsx(wrapperClass, wrapperClassName)}>
      {img}
    </div>
  );
}
