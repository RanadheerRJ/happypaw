import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  ClipboardList,
  Loader2,
  Pencil,
  Plus,
  Scale,
} from 'lucide-react';
import { toast } from 'sonner';
import { SEO } from '@/components/shared/SEO';
import { ErrorState } from '@/components/shared/EmptyState';
import { PortalHeader } from '@/components/app/StatusBadges';
import { WeightChart } from '@/components/app/WeightChart';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label, FieldError } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/features/auth/AuthProvider';
import { useRecipes } from '@/hooks/useCatalog';
import {
  useAddWeight,
  useDietPlan,
  useDog,
  useDogWeights,
  useSubscriptions,
} from '@/hooks/usePortal';
import { formatDate } from '@/lib/format';
import { dailyPortion, dogAgeLabel, weightSeries } from '@/lib/portal';
import type { DietPlanStatus } from '@/data/types';

const dietStatus: Record<DietPlanStatus, { label: string; tone: 'warn' | 'success' | 'neutral' | 'danger' }> = {
  draft: { label: 'Draft', tone: 'neutral' },
  pending: { label: 'Awaiting vet review', tone: 'warn' },
  approved: { label: 'Approved by vet', tone: 'success' },
  rejected: { label: 'Needs changes', tone: 'danger' },
};

export default function DogDetailPage() {
  const { dogId } = useParams<{ dogId: string }>();
  const { user } = useAuth();
  const dogQuery = useDog(dogId);
  const weightsQuery = useDogWeights(dogId);
  const dietQuery = useDietPlan(dogId);
  const subscriptionsQuery = useSubscriptions(user?.id);
  const recipesQuery = useRecipes();
  const addWeight = useAddWeight(dogId);

  const [weightInput, setWeightInput] = useState('');
  const [weightError, setWeightError] = useState<string | null>(null);

  if (dogQuery.isLoading) {
    return (
      <div aria-busy="true" className="space-y-4">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-4 w-80" />
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-64 rounded-3xl lg:col-span-2" />
          <Skeleton className="h-64 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (dogQuery.isError || !dogQuery.data) {
    return (
      <ErrorState
        title="Dog not found"
        description="This profile is not in the demo database."
        onRetry={() => void dogQuery.refetch()}
      />
    );
  }

  const dog = dogQuery.data;
  const weights = weightsQuery.data ?? [];
  const dietPlan = dietQuery.data ?? null;
  const subscriptions = (subscriptionsQuery.data ?? []).filter((item) => item.dogId === dog.id);
  const recipeNames = new Map((recipesQuery.data ?? []).map((recipe) => [recipe.id, recipe.name]));
  const portion = dailyPortion(dog);

  async function handleAddWeight() {
    const value = Number(weightInput);
    if (!weightInput.trim() || Number.isNaN(value)) {
      setWeightError('Enter a weight in kg');
      return;
    }
    if (value < 0.5 || value > 90) {
      setWeightError('Weight must be between 0.5 and 90 kg');
      return;
    }
    setWeightError(null);
    try {
      await addWeight.mutateAsync(value);
      setWeightInput('');
      toast.success('Weigh-in saved — portion updated');
    } catch {
      /* The mutation hook already surfaced the error as a toast. */
    }
  }

  return (
    <>
      <SEO title={dog.name} path={`/app/dogs/${dog.id}`} noIndex />

      <Link
        to="/app/dogs"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-charcoal-500 hover:text-forest"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All dogs
      </Link>

      <PortalHeader
        eyebrow={dog.breed || 'Your dog'}
        title={dog.name}
        description={`${dogAgeLabel(dog.dob)} · ${dog.weightKg} kg · ${portion.totalG} g per day, about ${portion.perMealG} g per meal.`}
        actions={
          <>
            <Button asChild variant="outline">
              <Link to={`/app/dogs/${dog.id}/edit`}>
                <Pencil className="h-4 w-4" aria-hidden="true" /> Edit profile
              </Link>
            </Button>
            <Button asChild variant="accent">
              <Link to={`/app/subscribe?dog=${dog.id}`}>
                <Plus className="h-4 w-4" aria-hidden="true" /> New subscription
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <section aria-labelledby="weight-log" className="card-surface p-5 lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <h2 id="weight-log" className="flex items-center gap-2 font-display text-base font-bold text-forest">
              <Scale className="h-4 w-4" aria-hidden="true" /> Weight log
            </h2>
            <Badge variant="soft" className="normal-case tracking-normal">
              {weights.length} {weights.length === 1 ? 'entry' : 'entries'}
            </Badge>
          </div>

          <div className="mt-4">
            <WeightChart points={weightSeries(weights)} />
          </div>

          <form
            className="mt-4 flex flex-wrap items-end gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              void handleAddWeight();
            }}
          >
            <div>
              <Label htmlFor="new-weight">Today&apos;s weight (kg)</Label>
              <Input
                id="new-weight"
                type="number"
                inputMode="decimal"
                step="0.1"
                min="0.5"
                max="90"
                className="mt-1.5 w-32"
                value={weightInput}
                onChange={(event) => setWeightInput(event.target.value)}
                aria-invalid={Boolean(weightError) || undefined}
                aria-describedby={weightError ? 'weight-error' : undefined}
                placeholder={`${dog.weightKg}`}
              />
              <div id="weight-error">
                <FieldError>{weightError ?? undefined}</FieldError>
              </div>
            </div>
            <Button type="submit" disabled={addWeight.isPending}>
              {addWeight.isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              Add weigh-in
            </Button>
          </form>

          {weights.length > 0 && (
            <ul className="mt-4 divide-y divide-forest/10 text-sm">
              {[...weights].reverse().slice(0, 5).map((entry) => (
                <li key={entry.id} className="flex items-center justify-between py-2">
                  <span className="text-charcoal-600">{formatDate(entry.recordedAt)}</span>
                  <span className="font-medium text-forest">{entry.weightKg} kg</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="diet-plan" className="card-surface p-5">
          <h2 id="diet-plan" className="flex items-center gap-2 font-display text-base font-bold text-forest">
            <ClipboardList className="h-4 w-4" aria-hidden="true" /> Diet plan
          </h2>

          {dietQuery.isLoading ? (
            <Skeleton className="mt-4 h-32 rounded-2xl" />
          ) : dietPlan ? (
            <>
              <div className="mt-3 flex items-center gap-2">
                <Badge variant={dietStatus[dietPlan.status].tone}>
                  {dietStatus[dietPlan.status].label}
                </Badge>
                <span className="text-xs text-charcoal-400">
                  {dietPlan.approvedAt ? formatDate(dietPlan.approvedAt) : formatDate(dietPlan.createdAt)}
                </span>
              </div>
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="text-xs uppercase tracking-[0.12em] text-charcoal-400">Portion</dt>
                  <dd className="mt-0.5 font-medium text-forest">
                    {dietPlan.portionOverrideG
                      ? `${dietPlan.portionOverrideG} g / day (vet override)`
                      : `${portion.totalG} g / day (calculated)`}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.12em] text-charcoal-400">Recipes</dt>
                  <dd className="mt-1 flex flex-wrap gap-1.5">
                    {dietPlan.recipeIds.map((recipeId) => (
                      <span
                        key={recipeId}
                        className="rounded-full bg-sage-100 px-2.5 py-1 text-xs text-forest"
                      >
                        {recipeNames.get(recipeId) ?? 'Recipe'}
                      </span>
                    ))}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.12em] text-charcoal-400">
                    Vet notes
                  </dt>
                  <dd className="mt-1 leading-relaxed text-charcoal-600">{dietPlan.notes}</dd>
                </div>
              </dl>
            </>
          ) : (
            <p className="mt-3 text-sm leading-relaxed text-charcoal-600">
              No diet plan yet. Our veterinary nutritionist creates one after the first profile
              review — usually within a day.
            </p>
          )}
        </section>

        <section aria-labelledby="dog-details" className="card-surface p-5 lg:col-span-2">
          <h2 id="dog-details" className="font-display text-base font-bold text-forest">
            Profile
          </h2>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-xl bg-forest/[0.03] px-3 py-2.5">
              <dt className="text-xs text-charcoal-400">Body condition</dt>
              <dd className="font-medium capitalize text-forest">{dog.bodyCondition}</dd>
            </div>
            <div className="rounded-xl bg-forest/[0.03] px-3 py-2.5">
              <dt className="text-xs text-charcoal-400">Activity level</dt>
              <dd className="font-medium capitalize text-forest">{dog.activityLevel}</dd>
            </div>
            <div className="rounded-xl bg-forest/[0.03] px-3 py-2.5">
              <dt className="text-xs text-charcoal-400">Neutered / spayed</dt>
              <dd className="font-medium text-forest">{dog.neutered ? 'Yes' : 'No'}</dd>
            </div>
            <div className="rounded-xl bg-forest/[0.03] px-3 py-2.5">
              <dt className="text-xs text-charcoal-400">Picky eater</dt>
              <dd className="font-medium text-forest">{dog.picky ? 'Yes' : 'No'}</dd>
            </div>
            <div className="rounded-xl bg-forest/[0.03] px-3 py-2.5 sm:col-span-2">
              <dt className="text-xs text-charcoal-400">Allergies</dt>
              <dd className="font-medium text-forest">
                {dog.allergies.length ? dog.allergies.join(', ') : 'None known'}
              </dd>
            </div>
            {dog.currentFood && (
              <div className="rounded-xl bg-forest/[0.03] px-3 py-2.5 sm:col-span-2">
                <dt className="text-xs text-charcoal-400">Currently eating</dt>
                <dd className="font-medium text-forest">{dog.currentFood}</dd>
              </div>
            )}
            {dog.medicalNotes && (
              <div className="rounded-xl bg-forest/[0.03] px-3 py-2.5 sm:col-span-2">
                <dt className="text-xs text-charcoal-400">Notes for the vet team</dt>
                <dd className="font-medium text-forest">{dog.medicalNotes}</dd>
              </div>
            )}
          </dl>
        </section>

        <section aria-labelledby="dog-subscriptions" className="card-surface p-5">
          <h2 id="dog-subscriptions" className="flex items-center gap-2 font-display text-base font-bold text-forest">
            <CalendarDays className="h-4 w-4" aria-hidden="true" /> Subscriptions
          </h2>
          {subscriptions.length === 0 ? (
            <p className="mt-3 text-sm leading-relaxed text-charcoal-600">
              {dog.name} does not have a subscription yet.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {subscriptions.map((subscription) => (
                <li key={subscription.id}>
                  <Link
                    to={`/app/subscriptions/${subscription.id}`}
                    className="flex items-center justify-between gap-2 rounded-xl bg-forest/[0.03] px-3 py-2.5 text-sm transition-colors hover:bg-forest/[0.06]"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-forest">
                        {subscription.plan.name}
                      </span>
                      <span className="block text-xs capitalize text-charcoal-500">
                        {subscription.status} · next {formatDate(subscription.nextDeliveryDate)}
                      </span>
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-charcoal-400" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
