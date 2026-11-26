import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, LifeBuoy, Loader2, MessageSquare, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { SEO } from '@/components/shared/SEO';
import { EmptyState, ErrorState } from '@/components/shared/EmptyState';
import { PortalHeader, TicketStatusBadge } from '@/components/app/StatusBadges';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input, Textarea } from '@/components/ui/input';
import { Label, FieldError, FieldHint } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/features/auth/AuthProvider';
import { useCreateTicket, useTickets } from '@/hooks/usePortal';
import { formatDateTime } from '@/lib/format';
import type { TicketPriority } from '@/data/types';

const categories = [
  { value: 'delivery', label: 'Delivery or address' },
  { value: 'billing', label: 'Billing or invoice' },
  { value: 'food', label: 'Food, portion or recipe' },
  { value: 'account', label: 'Account and login' },
  { value: 'other', label: 'Something else' },
];

const priorities: { value: TicketPriority; label: string }[] = [
  { value: 'low', label: 'Low — no rush' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High — affects my next delivery' },
];

export default function SupportPage() {
  const { user } = useAuth();
  const ticketsQuery = useTickets(user?.id);
  const createTicket = useCreateTicket(user?.id);

  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState(categories[0].value);
  const [priority, setPriority] = useState<TicketPriority>('normal');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<{ subject?: string; message?: string; form?: string }>({});

  const tickets = ticketsQuery.data ?? [];

  function reset() {
    setSubject('');
    setCategory(categories[0].value);
    setPriority('normal');
    setMessage('');
    setErrors({});
  }

  async function submit() {
    const nextErrors: typeof errors = {};
    if (subject.trim().length < 5) nextErrors.subject = 'Add a subject of at least 5 characters';
    if (message.trim().length < 20) nextErrors.message = 'Tell us a little more (20+ characters)';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      await createTicket.mutateAsync({
        subject: subject.trim(),
        category,
        priority,
        message: message.trim(),
      });
      toast.success('Ticket raised — we reply by email and here');
      setOpen(false);
      reset();
    } catch (error) {
      setErrors({ form: error instanceof Error ? error.message : 'Could not create the ticket.' });
    }
  }

  return (
    <>
      <SEO title="Support" path="/app/support" noIndex />
      <PortalHeader
        eyebrow="Support"
        title="Talk to a human"
        description="Portions, packaging, a skipped delivery — raise a ticket and follow the thread here."
        actions={
          <Button variant="accent" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" aria-hidden="true" /> New ticket
          </Button>
        }
      />

      {ticketsQuery.isLoading ? (
        <div className="space-y-3" aria-busy="true">
          <span className="sr-only">Loading tickets…</span>
          {[0, 1, 2].map((index) => (
            <Skeleton key={index} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : ticketsQuery.isError ? (
        <ErrorState
          title="Could not load your tickets"
          description="We could not load your tickets. Please try again."
          onRetry={() => void ticketsQuery.refetch()}
        />
      ) : tickets.length === 0 ? (
        <EmptyState
          icon={LifeBuoy}
          title="No conversations yet"
          description="Ask us anything — we usually reply within a few hours during the week."
          action={
            <Button onClick={() => setOpen(true)}>
              <MessageSquare className="h-4 w-4" aria-hidden="true" /> Start a conversation
            </Button>
          }
          className="bg-white"
        />
      ) : (
        <ul className="space-y-2">
          {tickets.map((ticket) => {
            const lastMessage = ticket.messages[ticket.messages.length - 1];
            return (
              <li key={ticket.id}>
                <Link
                  to={`/app/support/${ticket.id}`}
                  className="card-surface flex flex-wrap items-start justify-between gap-3 p-4 transition-colors hover:border-forest/25"
                >
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-display text-sm font-bold text-forest">{ticket.subject}</span>
                      <TicketStatusBadge status={ticket.status} />
                      {ticket.priority === 'high' && (
                        <Badge variant="danger" className="normal-case tracking-normal">
                          High priority
                        </Badge>
                      )}
                    </span>
                    <span className="mt-1 block truncate text-xs text-charcoal-500">
                      {lastMessage ? lastMessage.body : 'No messages yet'}
                    </span>
                    <span className="mt-1 block text-[11px] text-charcoal-400">
                      {ticket.category} · opened {formatDateTime(ticket.createdAt)}
                    </span>
                  </span>
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-charcoal-400" aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-6 rounded-2xl bg-sage-50 px-4 py-3 text-xs leading-relaxed text-forest-700">
        <p className="font-semibold">Health questions</p>
        <p className="mt-1">
          If your dog is unwell, contact your veterinarian first. Happy Paw&apos;s nutrition team can
          explain recipes and portions, but cannot diagnose or treat.
        </p>
      </div>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!createTicket.isPending) {
            setOpen(next);
            if (!next) reset();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Raise a ticket</DialogTitle>
            <DialogDescription>
              Share as much detail as you can — delivery dates and dog names help us answer faster.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div>
              <Label htmlFor="ticket-subject">Subject</Label>
              <Input
                id="ticket-subject"
                className="mt-1.5"
                placeholder="Coco's box arrived late on Sunday"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                aria-invalid={Boolean(errors.subject) || undefined}
              />
              <FieldError>{errors.subject}</FieldError>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="ticket-category">Category</Label>
                <Select
                  id="ticket-category"
                  className="mt-1.5"
                  options={categories}
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="ticket-priority">Priority</Label>
                <Select
                  id="ticket-priority"
                  className="mt-1.5"
                  options={priorities}
                  value={priority}
                  onChange={(event) => setPriority(event.target.value as TicketPriority)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="ticket-message">Message</Label>
              <Textarea
                id="ticket-message"
                className="mt-1.5"
                rows={5}
                placeholder="What happened, and what would you like us to do?"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                aria-invalid={Boolean(errors.message) || undefined}
              />
              <FieldHint>{message.trim().length}/20 characters minimum</FieldHint>
              <FieldError>{errors.message}</FieldError>
            </div>

            {errors.form && (
              <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
                {errors.form}
              </p>
            )}

            <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={() => setOpen(false)} disabled={createTicket.isPending}>
                Cancel
              </Button>
              <Button onClick={() => void submit()} disabled={createTicket.isPending}>
                {createTicket.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                )}
                Send ticket
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
