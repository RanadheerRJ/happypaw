import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { SEO } from '@/components/shared/SEO';
import { ErrorState } from '@/components/shared/EmptyState';
import { PortalHeader } from '@/components/app/StatusBadges';
import { Skeleton } from '@/components/ui/skeleton';
import { DogWizard } from '@/features/portal/DogWizard';
import { useDog } from '@/hooks/usePortal';

export function NewDogPage() {
  const navigate = useNavigate();
  return (
    <>
      <SEO title="Add a dog" path="/app/dogs/new" noIndex />
      <PortalHeader
        eyebrow="New profile"
        title="Tell us about your dog"
        description="Four short steps. We use this to work out the portion, avoid allergens and brief the vet team."
        actions={
          <Link
            to="/app/dogs"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-forest underline decoration-sage-400 underline-offset-4"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All dogs
          </Link>
        }
      />
      <DogWizard onDone={(dog) => navigate(`/app/dogs/${dog.id}`, { replace: true })} />
    </>
  );
}

export function EditDogPage() {
  const { dogId } = useParams<{ dogId: string }>();
  const navigate = useNavigate();
  const dogQuery = useDog(dogId);

  if (dogQuery.isLoading) {
    return (
      <div aria-busy="true" className="mx-auto max-w-2xl">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="mt-3 h-4 w-72" />
        <Skeleton className="mt-6 h-[420px] rounded-3xl" />
      </div>
    );
  }

  if (dogQuery.isError || !dogQuery.data) {
    return (
      <ErrorState
        title="We could not find that dog"
        description="The profile may have been removed from the demo database."
        onRetry={() => void dogQuery.refetch()}
      />
    );
  }

  const dog = dogQuery.data;

  return (
    <>
      <SEO title={`Edit ${dog.name}`} path={`/app/dogs/${dog.id}/edit`} noIndex />
      <PortalHeader
        eyebrow="Edit profile"
        title={`Update ${dog.name}`}
        description="Changes to weight or activity re-price the next planned box."
        actions={
          <Link
            to={`/app/dogs/${dog.id}`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-forest underline decoration-sage-400 underline-offset-4"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to profile
          </Link>
        }
      />
      <DogWizard dog={dog} onDone={(updated) => navigate(`/app/dogs/${updated.id}`)} />
    </>
  );
}
