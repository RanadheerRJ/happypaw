import { useMutation, useQuery } from '@tanstack/react-query';
import { dataClient } from '@/data';

export const queryKeys = {
  plans: ['plans'] as const,
  plan: (slug: string) => ['plan', slug] as const,
  addons: ['addons'] as const,
  recipes: ['recipes'] as const,
  weeklyMenu: (weekStart?: string) => ['weekly-menu', weekStart ?? 'current'] as const,
  deliveryZones: ['delivery-zones'] as const,
  session: ['session'] as const,
};

export function usePlans() {
  return useQuery({
    queryKey: queryKeys.plans,
    queryFn: () => dataClient.catalog.listPlans(),
    staleTime: 60_000,
  });
}

export function usePlan(slug: string | undefined) {
  return useQuery({
    queryKey: queryKeys.plan(slug ?? ''),
    queryFn: () => dataClient.catalog.getPlanBySlug(slug ?? ''),
    enabled: Boolean(slug),
  });
}

export function useAddons() {
  return useQuery({
    queryKey: queryKeys.addons,
    queryFn: () => dataClient.catalog.listAddons(),
    staleTime: 60_000,
  });
}

export function useRecipes() {
  return useQuery({
    queryKey: queryKeys.recipes,
    queryFn: () => dataClient.catalog.listRecipes(),
    staleTime: 60_000,
  });
}

export function useWeeklyMenu(weekStart?: string) {
  return useQuery({
    queryKey: queryKeys.weeklyMenu(weekStart),
    queryFn: () => dataClient.catalog.getWeeklyMenu({ weekStart }),
    staleTime: 60_000,
  });
}

export function useDeliveryZones() {
  return useQuery({
    queryKey: queryKeys.deliveryZones,
    queryFn: () => dataClient.catalog.listDeliveryZones(),
    staleTime: 5 * 60_000,
  });
}

export function useCheckPincode() {
  return useMutation({
    mutationFn: (pincode: string) => dataClient.catalog.checkPincode(pincode),
  });
}

export function useJoinWaitlist() {
  return useMutation({
    mutationFn: (input: { email: string; pincode: string }) => dataClient.waitlist.join(input),
  });
}
