import Image from 'next/image';

interface SiteLogoProps {
  size?: number;
  priority?: boolean;
  className?: string;
  framed?: boolean;
}

export default function SiteLogo({
  size = 48,
  priority = false,
  className = '',
  framed = false,
}: SiteLogoProps) {
  const frameClass = framed ? 'rounded-full bg-white/95 p-1.5 shadow-md shadow-saffron/20' : '';

  return (
    <div className={`relative shrink-0 ${frameClass} ${className}`.trim()} style={{ width: size, height: size }}>
      <Image
        src="/logo.webp"
        alt="Hindu Shuraksha Seva Sangh logo"
        fill
        priority={priority}
        sizes={`${size}px`}
        className="object-contain"
      />
    </div>
  );
}
