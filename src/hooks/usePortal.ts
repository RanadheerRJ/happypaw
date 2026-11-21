import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { dataClient } from '@/data';
import { DataError } from '@/data/client';
import type {
  AddressInput,
  CreateSubscriptionInput,
  DogInput,
  NotificationPrefs,
  NewTicketInput,
  SubscriptionWithDetails,
} from '@/data/types';
import { addDays, toIsoDate } from '@/lib/dates';

export function errorMessage(error: unknown): string {
  if (error instanceof DataError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return 'Something went wrong. Please try again.';
}

export const portalKeys = {
  dogs: (customerId: string | undefined) => ['portal-dogs', customerId ?? ''] as const,
  dog: (dogId: string | undefined) => ['portal-dog', dogId ?? ''] as const,
  weights: (dogId: string | undefined) => ['portal-weights', dogId ?? ''] as const,
  dietPlan: (dogId: string | undefined) => ['portal-diet-plan', dogId ?? ''] as const,
  addresses: (profileId: string | undefined) => ['portal-addresses', profileId ?? ''] as const,
  subscriptions: (customerId: string | undefined) =>
    ['portal-subscriptions', customerId ?? ''] as const,
  subscription: (subscriptionId: string | undefined) =>
    ['portal-subscription', subscriptionId ?? ''] as const,
  orders: (customerId: string | undefined) => ['portal-orders', customerId ?? ''] as const,
  order: (orderId: string | undefined) => ['portal-order', orderId ?? ''] as const,
  tickets: (customerId: string | undefined) => ['portal-tickets', customerId ?? ''] as const,
  ticket: (ticketId: string | undefined) => ['portal-ticket', ticketId ?? ''] as const,
  prefs: (profileId: string | undefined) => ['portal-prefs', profileId ?? ''] as const,
  profile: (profileId: string | undefined) => ['portal-profile', profileId ?? ''] as const,
};

/* ------------------------------------------------------------------ reads */

export function useDogs(customerId: string | undefined) {
  return useQuery({
    queryKey: portalKeys.dogs(customerId),
    queryFn: () => dataClient.dogs.list(customerId as string),
    enabled: Boolean(customerId),
  });
}

export function useDog(dogId: string | undefined) {
  return useQuery({
    queryKey: portalKeys.dog(dogId),
    queryFn: () => dataClient.dogs.get(dogId as string),
    enabled: Boolean(dogId),
  });
}

export function useDogWeights(dogId: string | undefined) {
  return useQuery({
    queryKey: portalKeys.weights(dogId),
    queryFn: () => dataClient.dogs.listWeights(dogId as string),
    enabled: Boolean(dogId),
  });
}

export function useDietPlan(dogId: string | undefined) {
  return useQuery({
    queryKey: portalKeys.dietPlan(dogId),
    queryFn: () => dataClient.dogs.getDietPlan(dogId as string),
    enabled: Boolean(dogId),
  });
}

export function useAddresses(profileId: string | undefined) {
  return useQuery({
    queryKey: portalKeys.addresses(profileId),
    queryFn: () => dataClient.addresses.list(profileId as string),
    enabled: Boolean(profileId),
  });
}

export function useSubscriptions(customerId: string | undefined) {
  return useQuery({
    queryKey: portalKeys.subscriptions(customerId),
    queryFn: () => dataClient.subscriptions.list(customerId as string),
    enabled: Boolean(customerId),
  });
}

export function useSubscription(subscriptionId: string | undefined) {
  return useQuery({
    queryKey: portalKeys.subscription(subscriptionId),
    queryFn: () => dataClient.subscriptions.get(subscriptionId as string),
    enabled: Boolean(subscriptionId),
  });
}

export function useOrders(customerId: string | undefined) {
  return useQuery({
    queryKey: portalKeys.orders(customerId),
    queryFn: () => dataClient.orders.list(customerId as string),
    enabled: Boolean(customerId),
  });
}

export function useOrder(orderId: string | undefined) {
  return useQuery({
    queryKey: portalKeys.order(orderId),
    queryFn: () => dataClient.orders.get(orderId as string),
    enabled: Boolean(orderId),
  });
}

export function useTickets(customerId: string | undefined) {
  return useQuery({
    queryKey: portalKeys.tickets(customerId),
    queryFn: () => dataClient.support.list(customerId as string),
    enabled: Boolean(customerId),
  });
}

export function useTicket(ticketId: string | undefined) {
  return useQuery({
    queryKey: portalKeys.ticket(ticketId),
    queryFn: () => dataClient.support.get(ticketId as string),
    enabled: Boolean(ticketId),
  });
}

export function useNotificationPrefs(profileId: string | undefined) {
  return useQuery({
    queryKey: portalKeys.prefs(profileId),
    queryFn: () => dataClient.settings.getNotificationPrefs(profileId as string),
    enabled: Boolean(profileId),
  });
}

export function useProfile(profileId: string | undefined) {
  return useQuery({
    queryKey: portalKeys.profile(profileId),
    queryFn: () => dataClient.profiles.get(profileId as string),
    enabled: Boolean(profileId),
  });
}

/* -------------------------------------------------------------- mutations */

export function useCreateDog(customerId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: DogInput) =>
      dataClient.dogs.create({ ...input, ownerId: customerId as string }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: portalKeys.dogs(customerId) });
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
}

export function useUpdateDog(dogId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<DogInput>) => dataClient.dogs.update(dogId as string, patch),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: portalKeys.dog(dogId) });
      void queryClient.invalidateQueries({ queryKey: portalKeys.dietPlan(dogId) });
      void queryClient.invalidateQueries({ queryKey: ['portal-dogs'] });
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
}

export function useAddWeight(dogId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (weightKg: number) => dataClient.dogs.addWeight(dogId as string, weightKg),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: portalKeys.weights(dogId) });
      void queryClient.invalidateQueries({ queryKey: portalKeys.dog(dogId) });
      void queryClient.invalidateQueries({ queryKey: portalKeys.dietPlan(dogId) });
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
}

export function useCreateAddress(profileId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<AddressInput, 'profileId'>) =>
      dataClient.addresses.create({ ...input, profileId: profileId as string }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: portalKeys.addresses(profileId) });
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
}

export function useUpdateAddress(profileId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: {
      addressId: string;
      patch: Partial<Omit<AddressInput, 'profileId'>>;
    }) => dataClient.addresses.update(vars.addressId, vars.patch),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: portalKeys.addresses(profileId) });
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
}

export function useSetDefaultAddress(profileId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (addressId: string) =>
      dataClient.addresses.setDefault(profileId as string, addressId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: portalKeys.addresses(profileId) });
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
}

interface SubscriptionVars {
  id: string;
}

/**
 * Shared optimistic plumbing for the subscription state machine. The list is
 * rewritten immediately, rolled back on failure, and reconciled with the server
 * once the request settles.
 */
function useSubscriptionMutation<TVars extends SubscriptionVars>(
  customerId: string | undefined,
  mutationFn: (vars: TVars) => Promise<SubscriptionWithDetails>,
  applyOptimistic?: (
    subscription: SubscriptionWithDetails,
    vars: TVars,
  ) => SubscriptionWithDetails,
  successMessage?: string | ((vars: TVars) => string),
) {
  const queryClient = useQueryClient();
  const listKey = portalKeys.subscriptions(customerId);

  return useMutation({
    mutationFn,
    onMutate: async (vars: TVars) => {
      if (!applyOptimistic) return { previous: undefined };
      await queryClient.cancelQueries({ queryKey: listKey });
      const previous = queryClient.getQueryData<SubscriptionWithDetails[]>(listKey);
      if (previous) {
        queryClient.setQueryData<SubscriptionWithDetails[]>(
          listKey,
          previous.map((subscription) =>
            subscription.id === vars.id ? applyOptimistic(subscription, vars) : subscription,
          ),
        );
      }
      return { previous };
    },
    onError: (error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(listKey, context.previous);
      toast.error(errorMessage(error));
    },
    onSuccess: (subscription, vars) => {
      queryClient.setQueryData(portalKeys.subscription(vars.id), subscription);
      if (successMessage) {
        toast.success(
          typeof successMessage === 'function' ? successMessage(vars) : successMessage,
        );
      }
    },
    onSettled: (_data, _error, vars) => {
      void queryClient.invalidateQueries({ queryKey: listKey });
      void queryClient.invalidateQueries({ queryKey: portalKeys.subscription(vars.id) });
      void queryClient.invalidateQueries({ queryKey: portalKeys.orders(customerId) });
    },
  });
}

export function usePauseSubscription(customerId: string | undefined) {
  return useSubscriptionMutation<{ id: string; untilIso: string }>(
    customerId,
    (vars) => dataClient.subscriptions.pause(vars.id, vars.untilIso),
    (subscription, vars) => ({
      ...subscription,
      status: 'paused',
      pausedUntil: vars.untilIso,
    }),
    'Subscription paused. We will resume automatically.',
  );
}

export function useResumeSubscription(customerId: string | undefined) {
  return useSubscriptionMutation<{ id: string }>(
    customerId,
    (vars) => dataClient.subscriptions.resume(vars.id),
    (subscription) => ({ ...subscription, status: 'active', pausedUntil: null }),
    'Subscription resumed. Your next box is back on the calendar.',
  );
}

export function useSkipNextDelivery(customerId: string | undefined) {
  return useSubscriptionMutation<{ id: string; nextDeliveryDate: string }>(
    customerId,
    (vars) => dataClient.subscriptions.skipNext(vars.id),
    (subscription) => ({
      ...subscription,
      nextDeliveryDate: toIsoDate(addDays(new Date(`${subscription.nextDeliveryDate}T00:00:00`), 7)),
    }),
    'Next delivery skipped — we have pushed your box out by one week.',
  );
}

export function useCancelSubscription(customerId: string | undefined) {
  return useSubscriptionMutation<{ id: string; reason?: string }>(
    customerId,
    (vars) => dataClient.subscriptions.cancel(vars.id, vars.reason),
    (subscription) => ({ ...subscription, status: 'cancelled', pausedUntil: null }),
    'Subscription cancelled. You can restart any time.',
  );
}

export function useChangePlan(customerId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; planId: string }) =>
      dataClient.subscriptions.changePlan(vars.id, vars.planId),
    onSuccess: (subscription) => {
      toast.success('Plan updated. Your next box reflects the new plan.');
      queryClient.setQueryData(portalKeys.subscription(subscription.id), subscription);
      void queryClient.invalidateQueries({
        queryKey: portalKeys.subscriptions(customerId),
      });
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
}

export function useUpdateAddons(customerId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; addonIds: string[] }) =>
      dataClient.subscriptions.updateAddons(vars.id, vars.addonIds),
    onSuccess: (subscription) => {
      toast.success('Add-ons updated.');
      queryClient.setQueryData(portalKeys.subscription(subscription.id), subscription);
      void queryClient.invalidateQueries({
        queryKey: portalKeys.subscriptions(customerId),
      });
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
}

export function useUpdateSubscriptionAddress(customerId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; addressId: string }) =>
      dataClient.subscriptions.updateAddress(vars.id, vars.addressId),
    onSuccess: (subscription) => {
      toast.success('Delivery address updated.');
      queryClient.setQueryData(portalKeys.subscription(subscription.id), subscription);
      void queryClient.invalidateQueries({
        queryKey: portalKeys.subscriptions(customerId),
      });
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
}

export function useCheckout(customerId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSubscriptionInput) => dataClient.subscriptions.create(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: portalKeys.subscriptions(customerId) });
      void queryClient.invalidateQueries({ queryKey: portalKeys.orders(customerId) });
    },
  });
}

export function useValidateCoupon() {
  return useMutation({
    mutationFn: (vars: { code: string; orderValueInr: number }) =>
      dataClient.coupons.validate(vars.code, vars.orderValueInr),
  });
}

export function useCreateTicket(customerId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<NewTicketInput, 'customerId'>) =>
      dataClient.support.create({ ...input, customerId: customerId as string }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: portalKeys.tickets(customerId) });
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
}

export function useReplyTicket(customerId: string | undefined, profileId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { ticketId: string; body: string }) =>
      dataClient.support.reply(vars.ticketId, profileId as string, vars.body),
    onSuccess: (ticket) => {
      queryClient.setQueryData(portalKeys.ticket(ticket.id), ticket);
      void queryClient.invalidateQueries({ queryKey: portalKeys.tickets(customerId) });
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
}

export function useUpdateProfile(profileId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patch: { fullName?: string; phone?: string | null }) =>
      dataClient.profiles.update(profileId as string, patch),
    onSuccess: (profile) => {
      queryClient.setQueryData(portalKeys.profile(profileId), profile);
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
}

export function useNotificationPrefsMutation(profileId: string | undefined) {
  const queryClient = useQueryClient();
  const key = portalKeys.prefs(profileId);
  return useMutation({
    mutationFn: (patch: Partial<Omit<NotificationPrefs, 'profileId'>>) =>
      dataClient.settings.updateNotificationPrefs(profileId as string, patch),
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<NotificationPrefs>(key);
      if (previous) queryClient.setQueryData<NotificationPrefs>(key, { ...previous, ...patch });
      return { previous };
    },
    onError: (error, _patch, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
      toast.error(errorMessage(error));
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: key });
    },
  });
}

export function useChangePassword(profileId: string | undefined) {
  return useMutation({
    mutationFn: (vars: { currentPassword: string; nextPassword: string }) =>
      dataClient.settings.changePassword(profileId as string, vars.currentPassword, vars.nextPassword),
    onError: (error) => toast.error(errorMessage(error)),
  });
}

export function useDeleteAccount(profileId: string | undefined) {
  return useMutation({
    mutationFn: () => dataClient.settings.deleteAccount(profileId as string),
    onError: (error) => toast.error(errorMessage(error)),
  });
}
