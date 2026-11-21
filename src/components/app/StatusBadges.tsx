import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  orderStatusMeta,
  subscriptionStatusMeta,
  ticketStatusMeta,
} from '@/lib/portal';
import type { OrderStatus, SubscriptionStatus, TicketStatus } from '@/data/types';

export function PortalHeader({
  eyebrow,
  title,
  description,
  actions,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="mb-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          {eyebrow && (
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-terracotta-600">
              {eyebrow}
            </p>
          )}
          <h1 className="mt-1 font-display text-3xl font-extrabold leading-tight text-forest sm:text-[2.1rem]">
            {title}
          </h1>
          {description && (
            <p className="mt-2 text-sm leading-relaxed text-charcoal-600">{description}</p>
          )}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {children && <div className="mt-5">{children}</div>}
    </header>
  );
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const meta = orderStatusMeta[status];
  return <Badge variant={meta.tone}>{meta.label}</Badge>;
}

export function SubscriptionStatusBadge({ status }: { status: SubscriptionStatus }) {
  const meta = subscriptionStatusMeta[status];
  return <Badge variant={meta.tone}>{meta.label}</Badge>;
}

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  const meta = ticketStatusMeta[status];
  return <Badge variant={meta.tone}>{meta.label}</Badge>;
}
