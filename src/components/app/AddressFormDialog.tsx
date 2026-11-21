import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label, FieldError, FieldHint } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { useDeliveryZones } from '@/hooks/useCatalog';
import { useCreateAddress, useUpdateAddress } from '@/hooks/usePortal';
import { pincodeSchema } from '@/lib/validators';
import type { Address } from '@/data/types';

const addressSchema = z.object({
  label: z.string().trim().min(1, 'Give this address a name').max(30, 'Keep it short'),
  line1: z.string().trim().min(5, 'Enter the flat / building and street'),
  line2: z.string().trim().max(120).optional(),
  area: z.string().min(1, 'Pick your delivery area'),
  city: z.string().trim().min(1, 'City is required'),
  pincode: pincodeSchema,
  isDefault: z.boolean().optional(),
});

type AddressFormValues = z.infer<typeof addressSchema>;

export function AddressFormDialog({
  open,
  onOpenChange,
  profileId,
  address,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profileId: string | undefined;
  address?: Address;
  onSaved?: (address: Address) => void;
}) {
  const zonesQuery = useDeliveryZones();
  const createAddress = useCreateAddress(profileId);
  const updateAddress = useUpdateAddress(profileId);
  const pending = createAddress.isPending || updateAddress.isPending;
  const zones = (zonesQuery.data ?? []).filter((zone) => zone.isActive);

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      label: address?.label ?? 'Home',
      line1: address?.line1 ?? '',
      line2: address?.line2 ?? '',
      area: address?.area ?? '',
      city: address?.city ?? 'Hyderabad',
      pincode: address?.pincode ?? '',
      isDefault: address?.isDefault ?? false,
    },
  });

  const { formState, setValue, watch, register, reset } = form;
  const area = watch('area');

  useEffect(() => {
    if (!open) return;
    reset({
      label: address?.label ?? 'Home',
      line1: address?.line1 ?? '',
      line2: address?.line2 ?? '',
      area: address?.area ?? '',
      city: address?.city ?? 'Hyderabad',
      pincode: address?.pincode ?? '',
      isDefault: address?.isDefault ?? false,
    });
  }, [open, address, reset]);

  async function submit(values: AddressFormValues) {
    const payload = {
      label: values.label,
      line1: values.line1,
      line2: values.line2?.trim() || null,
      area: values.area,
      city: values.city.trim(),
      pincode: values.pincode,
      isDefault: values.isDefault ?? false,
    };

    if (address) {
      const updated = await updateAddress.mutateAsync({ addressId: address.id, patch: payload });
      toast.success('Address updated');
      onSaved?.(updated);
    } else {
      const created = await createAddress.mutateAsync(payload);
      toast.success('Address saved');
      onSaved?.(created);
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !pending && onOpenChange(next)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{address ? 'Edit address' : 'Add a delivery address'}</DialogTitle>
          <DialogDescription>
            We deliver across 10 Hyderabad neighbourhoods every Sunday.
          </DialogDescription>
        </DialogHeader>

        <form noValidate onSubmit={form.handleSubmit(submit)} className="space-y-3.5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="address-label">Label</Label>
              <Input
                id="address-label"
                className="mt-1.5"
                placeholder="Home / Work / Parents"
                {...register('label')}
              />
              <FieldError>{formState.errors.label?.message}</FieldError>
            </div>
            <div>
              <Label htmlFor="address-area">Delivery area</Label>
              <Select
                id="address-area"
                className="mt-1.5"
                placeholder="Select area"
                options={zones.map((zone) => ({ value: zone.areaName, label: zone.areaName }))}
                value={area}
                {...register('area', {
                  onChange: (event) => {
                    const next = zones.find((zone) => zone.areaName === event.target.value);
                    if (next) setValue('pincode', next.pincode);
                    if (next) setValue('city', next.city);
                  },
                })}
              />
              <FieldError>{formState.errors.area?.message}</FieldError>
            </div>
          </div>

          <div>
            <Label htmlFor="address-line1">Flat, building and street</Label>
            <Input
              id="address-line1"
              className="mt-1.5"
              placeholder="Flat 402, Aparna Sarovar, Nallagandla"
              {...register('line1')}
            />
            <FieldError>{formState.errors.line1?.message}</FieldError>
          </div>

          <div>
            <Label htmlFor="address-line2">Landmark (optional)</Label>
            <Input id="address-line2" className="mt-1.5" {...register('line2')} />
            <FieldError>{formState.errors.line2?.message}</FieldError>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="address-pincode">Pincode</Label>
              <Input
                id="address-pincode"
                className="mt-1.5"
                inputMode="numeric"
                maxLength={6}
                placeholder="500081"
                {...register('pincode')}
              />
              <FieldError>{formState.errors.pincode?.message}</FieldError>
            </div>
            <div>
              <Label htmlFor="address-city">City</Label>
              <Input id="address-city" className="mt-1.5" readOnly {...register('city')} />
              <FieldHint>We only deliver in Hyderabad today.</FieldHint>
              <FieldError>{formState.errors.city?.message}</FieldError>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              {address ? 'Save address' : 'Save address'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
