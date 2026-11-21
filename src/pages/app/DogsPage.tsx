import { Link } from 'react-router-dom';
import { ArrowRight, Dog as DogIcon, PawPrint, Plus } from 'lucide-react';
import { SEO } from '@/components/shared/SEO';
import { EmptyState, ErrorState } from '@/components/shared/EmptyState';
import { PortalHeader } from '@/components/app/StatusBadges';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/features/auth/AuthProvider';
import { useDogs, useSubscriptions } from '@/hooks/usePortal';
import { dailyPortion, dogAgeLabel, recommendedBand } from '@/lib/portal';

const bandLabels = {
  small: 'Small (up to 10 kg)',
  medium: 'Medium (10–25 kg)',
  large: 'Large (25 kg+)',
  special: 'Special diet',
} as const;

export default function DogsPage() {
  const { user } = useAuth();
  const dogsQuery = useDogs(user?.id);
  const subscriptionsQuery = useSubscriptions(user?.id);

  const dogs = dogsQuery.data ?? [];
  const subscriptions = subscriptionsQuery.data ?? [];

  return (
    <>
      <SEO title="My dogs" path="/app/dogs" noIndex />
      <PortalHeader
        eyebrow="My dogs"
        title="Every dog gets their own plan"
        description="Weights, allergies and portions live here. Keep the weight current and the portion follows."
        actions={
          <Button asChild variant="accent">
            <Link to="/app/dogs/new">
              <Plus className="h-4 w-4" aria-hidden="true" /> Add a dog
            </Link>
          </Button>
        }
      />

      {dogsQuery.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true">
          <span className="sr-only">Loading your dogs…</span>
          {[0, 1, 2].map((index) => (
            <Skeleton key={index} className="h-56 rounded-3xl" />
          ))}
        </div>
      ) : dogsQuery.isError ? (
        <ErrorState
          title="Could not load your dogs"
          description="The demo database did not respond."
          onRetry={() => void dogsQuery.refetch()}
        />
      ) : dogs.length === 0 ? (
        <EmptyState
          icon={DogIcon}
          title="No dogs yet"
          description="Add your dog's weight, activity and allergies so we can build their first portion card."
          action={
            <Button asChild>
              <Link to="/app/dogs/new">Add your first dog</Link>
            </Button>
          }
          className="bg-white"
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {dogs.map((dog) => {
            const portion = dailyPortion(dog);
            const subscription = subscriptions.find(
              (item) => item.dogId === dog.id && item.status !== 'cancelled',
            );
            return (
              <li key={dog.id} className="card-surface flex flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-sage-100 text-forest">
                      <PawPrint className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <h2 className="truncate font-display text-lg font-bold text-forest">
                        {dog.name}
                      </h2>
                      <p className="truncate text-xs text-charcoal-500">
                        {dog.breed || 'Mixed breed'} · {dogAgeLabel(dog.dob)}
                      </p>
                    </div>
                  </div>
                  <Badge variant="soft" className="shrink-0 normal-case tracking-normal">
                    {portion.totalG} g/day
                  </Badge>
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl bg-forest/[0.03] px-3 py-2">
                    <dt className="text-charcoal-400">Weight</dt>
                    <dd className="font-medium text-forest">{dog.weightKg} kg</dd>
                  </div>
                  <div className="rounded-xl bg-forest/[0.03] px-3 py-2">
                    <dt className="text-charcoal-400">Band</dt>
                    <dd className="font-medium text-forest">
                      {bandLabels[recommendedBand(dog)].split(' (')[0]}
                    </dd>
                  </div>
                </dl>

                <p className="mt-3 line-clamp-2 min-h-9 text-xs leading-relaxed text-charcoal-500">
                  {dog.allergies.length
                    ? `Avoids: ${dog.allergies.join(', ')}`
                    : 'No known allergies recorded.'}
                </p>

                <div className="mt-4 flex items-center justify-between gap-2 border-t border-forest/10 pt-3">
                  <span className="text-xs text-charcoal-500">
                    {subscription ? subscription.plan.name : 'No subscription'}
                  </span>
                  <Link
                    to={`/app/dogs/${dog.id}`}
                    className="flex items-center gap-1 text-xs font-semibold text-forest underline decoration-sage-400 underline-offset-4"
                  >
                    Open profile <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
