import { Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, BadgeCheck, ChefHat, MapPin, UtensilsCrossed } from 'lucide-react';
import { brand } from '@/config/brand';
import { images } from '@/config/assets';
import { Button } from '@/components/ui/button';
import { StatCounter } from '@/components/shared/StatCounter';
import { useWeeklyMenu } from '@/hooks/useCatalog';
import { useWebGLAvailable } from '@/lib/webgl';

const HeroScene3D = lazy(() =>
  import('@/components/marketing/HeroScene3D').then((module) => ({
    default: module.HeroScene3D,
  })),
);

const EASE = [0.22, 1, 0.36, 1] as const;

const headline = [
  { word: 'Real', accent: false },
  { word: 'food.', accent: false },
  { word: 'Real', accent: false },
  { word: 'happy', accent: true },
  { word: 'paws.', accent: false },
];

export function HeroSection() {
  const reduce = useReducedMotion();
  const webgl = useWebGLAvailable();
  const { scrollY } = useScroll();
  const imageY = useTransform(scrollY, [0, 700], [0, reduce ? 0 : -38]);
  const cardsY = useTransform(scrollY, [0, 700], [0, reduce ? 0 : -72]);
  const { data: weeklyMenu } = useWeeklyMenu();
  const heroRecipe = weeklyMenu?.recipes[0];

  return (
    <section className="grain relative overflow-hidden">
      {/* Warm ambient shapes */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-32 -top-24 h-[420px] w-[420px] rounded-full bg-sage-200/50 blur-3xl" />
        <div className="absolute -right-24 top-40 h-[360px] w-[360px] rounded-full bg-terracotta-100/70 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-cream" />
        <svg
          className="absolute left-[46%] top-10 hidden h-24 w-24 text-terracotta/20 lg:block"
          viewBox="0 0 100 100"
          fill="currentColor"
        >
          {Array.from({ length: 25 }).map((_, index) => (
            <circle key={index} cx={8 + (index % 5) * 20} cy={8 + Math.floor(index / 5) * 20} r="2.4" />
          ))}
        </svg>
      </div>

      <div className="container-x relative grid gap-12 pb-16 pt-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-10 lg:pb-24 lg:pt-16">
        <div>
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="inline-flex items-center gap-2 rounded-full border border-forest/15 bg-white/70 py-1.5 pl-2.5 pr-3.5 text-[11.5px] font-semibold tracking-wide text-forest shadow-soft backdrop-blur"
          >
            <span className="relative flex h-5 w-5 items-center justify-center">
              <span className="absolute h-2 w-2 animate-ping rounded-full bg-terracotta/40" aria-hidden="true" />
              <span className="h-2 w-2 rounded-full bg-terracotta" aria-hidden="true" />
            </span>
            Cooked fresh in {brand.city} · Delivered Sundays
          </motion.p>

          <motion.h1
            className="display-1 mt-6"
            initial={reduce ? false : 'hidden'}
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.075, delayChildren: 0.08 } },
            }}
          >
            {headline.map((item, index) => (
              <motion.span
                key={`${item.word}-${index}`}
                className={
                  item.accent
                    ? 'mr-[0.22em] inline-block font-serif font-semibold italic text-terracotta'
                    : 'mr-[0.22em] inline-block'
                }
                variants={{
                  hidden: { opacity: 0, y: 24 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
                }}
              >
                {item.word}
                {item.word === 'paws.' && (
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 160 12"
                    className="mt-1 block h-2.5 w-[85%] text-sage-400"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M2 8c34-5 78-6 156-3"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                )}
              </motion.span>
            ))}
          </motion.h1>

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35, ease: EASE }}
            className="lede mt-5 max-w-lg"
          >
            Gently cooked meals, portioned for your dog and delivered every Sunday. Vet-formulated,
            made in small batches in {brand.city} — from{' '}
            <strong className="font-semibold text-forest">₹749/week</strong>.
          </motion.p>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45, ease: EASE }}
            className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <Button asChild size="lg" className="group">
              <Link to="/plans">
                Build my dog's meal plan
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-white/50 backdrop-blur">
              <Link to="/menu">
                <UtensilsCrossed className="h-4 w-4" aria-hidden="true" />
                See this week's menu
              </Link>
            </Button>
          </motion.div>

          <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2.5">
            {[
              { icon: BadgeCheck, label: 'Vet-formulated' },
              { icon: ChefHat, label: 'Cooked fresh weekly' },
              { icon: MapPin, label: `Delivered in ${brand.city}` },
            ].map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-1.5 text-[12.5px] font-medium text-charcoal-600">
                <Icon className="h-4 w-4 text-forest-500" aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>

          <div className="mt-9 flex max-w-md items-center justify-between gap-4 border-t border-forest/10 pt-6">
            <div>
              <p className="font-display text-xl font-extrabold text-forest">
                <StatCounter value={1200} suffix="+" />
              </p>
              <p className="mt-0.5 text-[11.5px] text-charcoal-500">meals served</p>
            </div>
            <span aria-hidden="true" className="h-8 w-px bg-forest/10" />
            <div>
              <p className="font-display text-xl font-extrabold text-forest">
                <StatCounter value={320} suffix="+" />
              </p>
              <p className="mt-0.5 text-[11.5px] text-charcoal-500">Hyderabad dogs</p>
            </div>
            <span aria-hidden="true" className="h-8 w-px bg-forest/10" />
            <div>
              <p className="font-display text-xl font-extrabold text-forest">
                <StatCounter value={10} />
              </p>
              <p className="mt-0.5 text-[11.5px] text-charcoal-500">delivery areas</p>
            </div>
          </div>
          <p className="mt-2 text-[10.5px] text-charcoal-400">Illustrative demo figures.</p>
        </div>

        {/* Image composition */}
        <div className="relative mx-auto w-full max-w-[540px] lg:max-w-none">
          <motion.div
            style={{ y: imageY }}
            initial={reduce ? false : { opacity: 0, scale: 0.97, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="relative"
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-[32px] border border-forest/10 shadow-lift sm:aspect-[5/6]">
              {webgl ? (
                <Suspense fallback={null}>
                  <HeroScene3D />
                </Suspense>
              ) : (
                <img
                  src={images.heroDogBowl.src}
                  alt={images.heroDogBowl.alt}
                  width={images.heroDogBowl.width}
                  height={images.heroDogBowl.height}
                  fetchPriority="high"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              )}
              <div
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-forest-900/55 via-forest-900/10 to-transparent"
              />

              <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-cream/90 px-3 py-1.5 text-[11px] font-semibold text-forest shadow-soft backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                Cooked this week
              </div>

              <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/40 bg-cream/95 p-3.5 shadow-soft backdrop-blur">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-terracotta-600">
                      On the menu this week
                    </p>
                    <p className="mt-1 font-display text-[13.5px] font-bold leading-tight text-forest">
                      {heroRecipe?.name ?? 'Fresh recipe this week'}
                    </p>
                  </div>
                  <div className="shrink-0 rounded-xl bg-sage-100 px-2.5 py-1.5 text-center">
                    <p className="font-display text-[15px] font-extrabold leading-none text-forest">
                      {heroRecipe?.caloriesPer100g ?? '—'}
                    </p>
                    <p className="mt-0.5 text-[9px] font-medium uppercase tracking-wide text-forest-500">
                      kcal/100g
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating price seal */}
            <div className="absolute -left-3 bottom-[32%] hidden rounded-2xl border border-forest/10 bg-white px-3.5 py-2.5 shadow-card sm:block">
              <p className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-charcoal-400">
                From
              </p>
              <p className="font-display text-lg font-extrabold leading-tight text-forest">₹749</p>
              <p className="text-[9.5px] text-charcoal-500">per week</p>
            </div>
          </motion.div>

          {/* Drifting photo cards */}
          <motion.div
            style={{ y: cardsY }}
            className="pointer-events-none absolute -right-4 -top-6 hidden sm:block"
            aria-hidden="true"
          >
            <div className="animate-float rotate-6 overflow-hidden rounded-2xl border border-white/60 shadow-card">
              <img
                src={images.dogPuppy.src}
                alt=""
                width={120}
                height={150}
                loading="lazy"
                className="h-[124px] w-[96px] object-cover"
              />
            </div>
          </motion.div>
          <motion.div
            style={{ y: cardsY }}
            className="pointer-events-none absolute -right-8 bottom-24 hidden sm:block"
            aria-hidden="true"
          >
            <div
              className="animate-float -rotate-3 overflow-hidden rounded-2xl border border-white/60 shadow-card"
              style={{ animationDelay: '1.2s' }}
            >
              <img
                src={images.dogIndie.src}
                alt=""
                width={120}
                height={150}
                loading="lazy"
                className="h-[108px] w-[86px] object-cover"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
