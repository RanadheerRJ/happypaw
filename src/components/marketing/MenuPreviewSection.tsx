import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RecipeCard } from '@/components/marketing/RecipeCard';
import { Reveal } from '@/components/shared/Reveal';
import { useWeeklyMenu } from '@/hooks/useCatalog';
import { formatWeekRange } from '@/lib/format';

export function MenuPreviewSection() {
  const { data: menu, isLoading } = useWeeklyMenu();

  return (
    <section className="relative overflow-hidden bg-grape-700 py-16 text-sand sm:py-20 lg:py-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 10%, #A8C3A0 0, transparent 35%), radial-gradient(circle at 85% 80%, #D96C3F 0, transparent 30%)",
        }}
      />
      <div className="container-x relative">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <Reveal>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-300">
              This week's menu
            </p>
            <h2 className="mt-3 font-display text-[2rem] font-extrabold leading-[1.08] text-sand sm:text-4xl lg:text-[2.9rem]">
              Three bowls.
              <span className="font-serif font-semibold italic text-teal-300"> One fresh week.</span>
            </h2>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-sand/70">
              Recipes rotate weekly and are cooked in small batches. Every bowl lists its full
              ingredients, calories and allergens — nothing hidden.
            </p>
          </Reveal>
          <Reveal delay={0.1} className="flex flex-col items-start gap-3 lg:items-end">
            {menu && (
              <p className="inline-flex items-center gap-2 rounded-full border border-sand/15 bg-sand/5 px-3.5 py-1.5 text-[12px] text-sand/75">
                <CalendarDays className="h-3.5 w-3.5 text-teal-300" aria-hidden="true" />
                Week of {formatWeekRange(menu.weekStart)} · Published
              </p>
            )}
            <Button asChild variant="sage" className="bg-sand text-grape-700 hover:bg-white">
              <Link to="/menu">
                Full menu &amp; ingredients
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </Reveal>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading || !menu
            ? Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-3xl border border-sand/10 bg-sand/[0.04]"
                >
                  <Skeleton className="aspect-[4/3] w-full rounded-none bg-sand/10" />
                  <div className="space-y-3 p-5">
                    <Skeleton className="h-3 w-24 bg-sand/10" />
                    <Skeleton className="h-5 w-3/4 bg-sand/10" />
                    <Skeleton className="h-3 w-full bg-sand/10" />
                    <Skeleton className="h-3 w-2/3 bg-sand/10" />
                  </div>
                </div>
              ))
            : menu.recipes.slice(0, 3).map((recipe, index) => (
                <Reveal key={recipe.id} delay={index * 0.06}>
                  <RecipeCard recipe={recipe} />
                </Reveal>
              ))}
        </div>

        <p className="mt-8 text-[11.5px] text-sand/60">
          Allergens are listed per recipe. Meals are formulated with veterinary nutritionist
          guidance; this is not veterinary advice.
        </p>
      </div>
    </section>
  );
}
