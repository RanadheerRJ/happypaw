import { Link } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';
import { SEO } from '@/components/shared/SEO';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';

export default function PortalNotFoundPage() {
  return (
    <>
      <SEO title="Page not found" path="/app" noIndex />
      <EmptyState
        icon={Compass}
        title="That page is not in the portal"
        description="The link may be old, or the record may no longer exist."
        action={
          <Button asChild>
            <Link to="/app">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to dashboard
            </Link>
          </Button>
        }
        className="bg-white"
      />
    </>
  );
}
