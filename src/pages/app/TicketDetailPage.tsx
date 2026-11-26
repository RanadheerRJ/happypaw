import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';
import { SEO } from '@/components/shared/SEO';
import { ErrorState } from '@/components/shared/EmptyState';
import { PortalHeader, TicketStatusBadge } from '@/components/app/StatusBadges';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';
import { Label, FieldError } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/features/auth/AuthProvider';
import { useReplyTicket, useTicket } from '@/hooks/usePortal';
import { formatDateTime } from '@/lib/format';
import { cn } from '@/lib/utils';

export default function TicketDetailPage() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const { user } = useAuth();
  const ticketQuery = useTicket(ticketId);
  const reply = useReplyTicket(user?.id, user?.id);
  const [body, setBody] = useState('');
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const ticket = ticketQuery.data;

  useEffect(() => {
    if (ticket && bottomRef.current) {
      bottomRef.current.scrollIntoView({ block: 'nearest' });
    }
  }, [ticket?.messages.length, ticket]);

  if (ticketQuery.isLoading) {
    return (
      <div aria-busy="true" className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-80" />
        <Skeleton className="h-72 rounded-3xl" />
      </div>
    );
  }

  if (ticketQuery.isError || !ticket) {
    return (
      <ErrorState
        title="Ticket not found"
        description="We could not find this conversation."
        onRetry={() => void ticketQuery.refetch()}
      />
    );
  }

  async function send() {
    if (body.trim().length < 2) {
      setError('Write a message before sending');
      return;
    }
    setError(null);
    try {
      await reply.mutateAsync({ ticketId: ticketId as string, body: body.trim() });
      setBody('');
      toast.success('Reply sent');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not send your reply.');
    }
  }

  return (
    <>
      <SEO title={ticket.subject} path={`/app/support/${ticket.id}`} noIndex />

      <Link
        to="/app/support"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-charcoal-500 hover:text-forest"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All conversations
      </Link>

      <div className="mx-auto max-w-3xl">
        <PortalHeader
          eyebrow={`${ticket.category} · opened ${formatDateTime(ticket.createdAt)}`}
          title={ticket.subject}
          actions={
            <>
              <TicketStatusBadge status={ticket.status} />
              {ticket.priority === 'high' && (
                <Badge variant="danger" className="normal-case tracking-normal">
                  High priority
                </Badge>
              )}
            </>
          }
        />

        <section aria-label="Conversation" className="card-surface p-5">
          <ol className="space-y-4">
            {ticket.messages.map((message) => {
              const mine = message.senderId === user?.id;
              return (
                <li key={message.id} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
                  <div
                    className={cn(
                      'max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                      mine
                        ? 'rounded-br-md bg-forest text-cream'
                        : 'rounded-bl-md bg-sage-50 text-charcoal-700',
                    )}
                  >
                    <p className={cn('mb-1 text-[10px] font-semibold uppercase tracking-[0.14em]', mine ? 'text-cream/60' : 'text-charcoal-400')}>
                      {mine ? 'You' : 'Happy Paw team'} · {formatDateTime(message.createdAt)}
                    </p>
                    <p className="whitespace-pre-line">{message.body}</p>
                  </div>
                </li>
              );
            })}
          </ol>
          <div ref={bottomRef} />

          <div className="mt-5 border-t border-forest/10 pt-4">
            {(ticket.status === 'resolved' || ticket.status === 'closed') && (
              <p className="mb-2 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-900">
                Replying will reopen this ticket.
              </p>
            )}
            <Label htmlFor="ticket-reply">Reply</Label>
            <Textarea
              id="ticket-reply"
              className="mt-1.5"
              rows={3}
              placeholder="Add more detail or answer a question…"
              value={body}
              onChange={(event) => {
                setBody(event.target.value);
                setError(null);
              }}
              aria-invalid={Boolean(error) || undefined}
            />
            <div className="mt-2 flex items-center justify-between gap-3">
              <FieldError>{error ?? undefined}</FieldError>
              <Button onClick={() => void send()} disabled={reply.isPending} className="ml-auto">
                {reply.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Send className="h-4 w-4" aria-hidden="true" />
                )}
                Send reply
              </Button>
            </div>
          </div>
        </section>

        <p className="mt-4 text-center text-[11px] leading-relaxed text-charcoal-400">
          Nutrition questions are answered by our veterinary-nutritionist team. For a medical
          concern, contact your veterinarian.
        </p>
      </div>
    </>
  );
}
