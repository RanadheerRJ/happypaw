import { Flame, Leaf, WheatOff } from 'lucide-react';
import type { Recipe } from '@/data/types';
import { Badge } from '@/components/ui/badge';
import { TiltCard } from '@/components/shared/TiltCard';
import { cn } from '@/lib/utils';
import { titleCase } from '@/lib/utils';

export function RecipeCard({
  recipe,
  className,
  compact = false,
  priority = false,
}: {
  recipe: Recipe;
  className?: string;
  compact?: boolean;
  priority?: boolean;
}) {
  const hasAllergens = recipe.allergens.length > 0;

  return (
    <TiltCard className={className} max={6}>
      <article
        className={cn(
          'group flex h-full flex-col overflow-hidden rounded-3xl border border-forest/10 bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card',
        )}
      >
      <div className="relative aspect-[4/3] overflow-hidden bg-cream-200">
        <img
          src={recipe.photoUrl}
          alt={`${recipe.name} — freshly cooked dog food`}
          width={900}
          height={675}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-500 ease-out-quart group-hover:scale-[1.03]"
        />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
          <Badge variant="default" className="bg-cream/90 text-forest backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-terracotta" aria-hidden="true" />
            {titleCase(recipe.protein)}
          </Badge>
          {hasAllergens ? (
            <Badge variant="warn" className="bg-cream/90 backdrop-blur">
              Contains {recipe.allergens[0]}
            </Badge>
          ) : (
            <Badge variant="success" className="bg-cream/90 backdrop-blur">
              <WheatOff className="h-3 w-3" aria-hidden="true" /> No common allergens
            </Badge>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="eyebrow text-[10px] tracking-[0.14em] text-terracotta-500">{recipe.tagline}</p>
        <h3 className="mt-2 font-display text-lg font-bold leading-snug text-forest">{recipe.name}</h3>
        <p className={cn('mt-2 text-[13.5px] leading-relaxed text-charcoal-600', compact && 'line-clamp-2')}>
          {recipe.description}
        </p>

        <dl className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-forest/10 pt-4 text-[12px] text-charcoal-500">
          <div className="flex items-center gap-1.5">
            <Flame className="h-3.5 w-3.5 text-terracotta" aria-hidden="true" />
            <dt className="sr-only">Calories</dt>
            <dd>{recipe.caloriesPer100g} kcal / 100g</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <Leaf className="h-3.5 w-3.5 text-sage-500" aria-hidden="true" />
            <dt className="sr-only">Ingredients</dt>
            <dd>{recipe.ingredients.length} whole ingredients</dd>
          </div>
        </dl>

        {!compact && (
          <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Ingredients">
            {recipe.ingredients.map((ingredient) => (
              <li
                key={ingredient.item}
                className="rounded-full bg-cream-200/80 px-2.5 py-1 text-[11px] text-charcoal-600"
              >
                {ingredient.item} · {ingredient.quantity}
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
    </TiltCard>
  );
}
