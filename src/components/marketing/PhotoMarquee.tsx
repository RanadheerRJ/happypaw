import { useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { marqueeImages } from '@/config/assets';
import { cn } from '@/lib/utils';

export function PhotoMarquee({ className }: { className?: string }) {
  const [paused, setPaused] = useState(false);
  const loop = [...marqueeImages, ...marqueeImages];

  return (
    <div className={cn('relative', className)}>
      <div className="marquee-mask overflow-hidden py-2">
        <div
          className={cn('flex w-max gap-4 animate-marquee', paused && 'animate-pause')}
          role="region"
          aria-label="Photo gallery of happy dogs and fresh meals (decorative, auto-scrolling)"
        >
          {loop.map((image, index) => (
            <figure
              key={`${image.src}-${index}`}
              className={cn(
                'relative h-[190px] w-[150px] shrink-0 overflow-hidden rounded-2xl border border-forest/10 bg-cream-200 sm:h-[230px] sm:w-[185px]',
                index % 3 === 1 && 'mt-5',
              )}
            >
              <img
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                loading="lazy"
                decoding="async"
                aria-hidden={index >= marqueeImages.length}
                className="h-full w-full object-cover"
              />
            </figure>
          ))}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => setPaused((value) => !value)}
          aria-pressed={paused}
          className="inline-flex items-center gap-2 rounded-full border border-forest/15 bg-white/80 px-3.5 py-1.5 text-[12px] font-medium text-forest transition-colors hover:bg-white"
        >
          {paused ? <Play className="h-3 w-3" aria-hidden="true" /> : <Pause className="h-3 w-3" aria-hidden="true" />}
          {paused ? 'Play gallery' : 'Pause gallery'}
        </button>
        <p className="text-[11.5px] text-charcoal-400">Demo photos of dogs on fresh food</p>
      </div>
    </div>
  );
}
