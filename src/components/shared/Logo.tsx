import { Link } from 'react-router-dom';
import { brand } from '@/config/brand';
import { cn } from '@/lib/utils';

export function PawMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      role="img"
      aria-label={`${brand.name} logo`}
      className={cn('h-9 w-9', className)}
    >
      <rect width="40" height="40" rx="12" fill="#1F3D2B" />
      <g fill="#FBF7F0">
        <ellipse cx="13" cy="15.5" rx="3.1" ry="4" transform="rotate(-18 13 15.5)" />
        <ellipse cx="20" cy="12.4" rx="3.1" ry="4.2" />
        <ellipse cx="27" cy="15.5" rx="3.1" ry="4" transform="rotate(18 27 15.5)" />
        <ellipse cx="31.4" cy="21.6" rx="2.6" ry="3.3" transform="rotate(34 31.4 21.6)" />
      </g>
      <path
        d="M20 19.4c4.9 0 8.6 3.6 8.6 7.3 0 3.2-2.4 5.2-5.3 4.6-1.4-.3-2.3-.5-3.3-.5s-1.9.2-3.3.5c-2.9.6-5.3-1.4-5.3-4.6 0-3.7 3.7-7.3 8.6-7.3Z"
        fill="#D96C3F"
      />
    </svg>
  );
}

export function Logo({
  className,
  compact = false,
  markClassName,
}: {
  className?: string;
  compact?: boolean;
  markClassName?: string;
}) {
  return (
    <Link
      to="/"
      className={cn(
        'group inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 focus-visible:ring-offset-4 focus-visible:ring-offset-cream',
        className,
      )}
      aria-label={`${brand.name} — home`}
    >
      <PawMark className={cn('transition-transform duration-300 group-hover:-rotate-6', markClassName)} />
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-[19px] font-extrabold tracking-[-0.03em] text-forest">
            {brand.name}
          </span>
          <span className="mt-1 text-[9.5px] font-semibold uppercase tracking-[0.18em] text-charcoal-500">
            Fresh dog food
          </span>
        </span>
      )}
    </Link>
  );
}
