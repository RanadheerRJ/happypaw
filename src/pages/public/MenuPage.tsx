import { CalendarDays, ChefHat, ShieldCheck, Snowflake } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEO } from '@/components/shared/SEO';
import { PageHero } from '@/components/marketing/PageHero';
import { RecipeCard } from '@/components/marketing/RecipeCard';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { Reveal, RevealGroup, RevealItem } from '@/components/shared/Reveal';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRecipes, useWeeklyMenu } from '@/hooks/useCatalog';
import { images } from '@/config/assets';
import { formatWeekRange } from '@/lib/format';
import { brand } from '@/config/brand';

const cookingSteps = [
  {
    icon: ChefHat,
    title: 'Cooked gently, in small batches',
    body: 'Low heat, short cook times and no pressure cooking — so the food keeps its texture and moisture.',
  },
  {
    icon: Snowflake,
    title: 'Blast-chilled the same morning',
    body: 'Cooked Saturday, chilled quickly through the safe temperature range, then packed in sealed portions.',
  },
  {
    icon: ShieldCheck,
    title: 'Batch records, every week',
    body: 'Each batch has a cook log and is tagged with recipe, date and portion size. Allergens are tracked separately.',
  },
];

export default function MenuPage() {
  const { data: menu, isLoading: menuLoading } = useWeeklyMenu();
  const { data: recipes, isLoading: recipesLoading } = useRecipes();

  const loading = menuLoading || recipesLoading;

  return (
    <>
      <SEO
        title="This week's menu"
        description="Gently cooked fresh dog meals on the menu this week in Hyderabad — full ingredients, calories and allergens for every recipe."
        path="/menu"
      />

      <PageHero
        eyebrow="Kitchen diary"
        title={
          <>
            This week in
            <span className="font-serif italic text-sunset-600"> the kitchen</span>
          </>
        }
        description="Three rotating recipes, cooked in small batches and portioned for each dog. Every bowl lists exactly what is in it."
      >
        <div className="flex flex-wrap items-center gap-3">
          {menu && (
            <Badge variant="default" className="gap-2 py-1.5 pl-2.5 pr-3.5 normal-case tracking-normal">
              <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
              Week of {formatWeekRange(menu.weekStart)}
            </Badge>
          )}
          <Badge variant="sage">Published menu</Badge>
          <Badge variant="soft">Recipes rotate weekly</Badge>
        </div>
      </PageHero>

      <section className="section">
        <div className="container-x">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {loading
              ? Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="overflow-hidden rounded-3xl border border-grape/10 bg-white">
                    <Skeleton className="aspect-[4/3] w-full rounded-none" />
                    <div className="space-y-3 p-5">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-5/6" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                  </div>
                ))
              : menu?.recipes.map((recipe, index) => (
                  <Reveal key={recipe.id} delay={index * 0.06}>
                    <RecipeCard recipe={recipe} priority={index === 0} />
                  </Reveal>
                ))}
          </div>

          <Reveal className="mt-8 rounded-3xl border border-amber-200 bg-amber-50/80 p-5">
            <h2 className="font-display text-[15px] font-bold text-amber-900">
              Allergens, in plain language
            </h2>
            <p className="mt-2 max-w-3xl text-[13px] leading-relaxed text-amber-900/80">
              Recipes that contain fish are labelled. Our kitchen handles chicken, lamb, fish and
              dairy on shared equipment, so we cannot guarantee a trace-free bowl. If your dog has a
              severe allergy, please speak to your vet before ordering and choose the Special Diet
              plan so a vet can review your dog's profile.
            </p>
          </Reveal>

          <div className="mt-10 flex justify-center">
            <Button asChild size="lg">
              <Link to="/plans">Choose a plan</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="border-y border-grape/10 bg-white py-16">
        <div className="container-x">
          <SectionHeading
            eyebrow="How we cook"
            title="Low heat. Short cook. Nothing added."
            description="The kitchen process is deliberately boring — we would rather be consistent than clever."
          />
          <RevealGroup className="mt-10 grid gap-5 sm:grid-cols-3">
            {cookingSteps.map(({ icon: Icon, title, body }) => (
              <RevealItem key={title}>
                <div className="h-full rounded-3xl border border-grape/10 bg-sand-50 p-6">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-teal-100 text-grape-700">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 font-display text-[15px] font-bold text-grape-700">{title}</h3>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-grape-800-600">{body}</p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <section className="section">
        <div className="container-x grid items-center gap-10 lg:grid-cols-2">
          <Reveal className="order-2 lg:order-1">
            <div className="overflow-hidden rounded-[32px] border border-grape/10 shadow-card">
              <img
                src={images.kitchen.src}
                alt={images.kitchen.alt}
                width={images.kitchen.width}
                height={images.kitchen.height}
                loading="lazy"
                decoding="async"
                className="aspect-[16/10] w-full object-cover"
              />
            </div>
          </Reveal>
          <div className="order-1 lg:order-2">
            <SectionHeading
              eyebrow="Ingredient standards"
              title="Whole ingredients, short lists"
              description={`We buy seasonal vegetables and human-grade proteins from suppliers we visit. If an ingredient would not go into a family meal, it does not go into a ${brand.name} bowl.`}
            />
            <ul className="mt-6 space-y-3 text-[13.5px] leading-relaxed text-grape-800-600">
              {[
                'Proteins: chicken breast and thigh, lean lamb, white fish — no mechanically separated meat.',
                'Carbohydrates: brown rice, white rice, quinoa and sweet potato, cooked soft.',
                'Vegetables: pumpkin, spinach, carrot, green beans and peas, chopped small.',
                'Supplements: calcium and mineral mix, fish oil. Nothing else — no colours, no preservatives.',
              ].map((item) => (
                <li key={item} className="flex gap-2.5">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sunset-500" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-6 rounded-2xl border border-grape/10 bg-white p-4 text-[12px] leading-relaxed text-grape-800-500">
              Every recipe is formulated with veterinary nutritionist guidance. This is not
              veterinary advice — consult your vet before changing your dog's diet.
            </div>
          </div>
        </div>
      </section>

      {recipes && recipes.length > 0 && (
        <section className="border-t border-grape/10 bg-sand-100/60 py-16">
          <div className="container-x">
            <SectionHeading
              eyebrow="Recipe library"
              title="The full rotation"
              description="Our core recipes, rotated through the weekly menu so meals stay interesting (and digestion stays settled)."
            />
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {recipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className="rounded-2xl border border-grape/10 bg-white p-4 shadow-soft"
                >
                  <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-sunset-600">
                    {recipe.protein}
                  </p>
                  <h3 className="mt-1.5 font-display text-[14px] font-bold leading-snug text-grape-700">
                    {recipe.name}
                  </h3>
                  <p className="mt-2 text-[12px] text-grape-800-500">
                    {recipe.caloriesPer100g} kcal / 100 g ·{' '}
                    {recipe.allergens.length ? recipe.allergens.join(', ') : 'no common allergens'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
