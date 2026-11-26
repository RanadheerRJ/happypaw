import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BellRing,
  KeyRound,
  Loader2,
  MapPin,
  Plus,
  ShieldAlert,
  UserRound,
} from 'lucide-react';
import { toast } from 'sonner';
import { SEO } from '@/components/shared/SEO';
import { ErrorState } from '@/components/shared/EmptyState';
import { PortalHeader } from '@/components/app/StatusBadges';
import { AddressFormDialog } from '@/components/app/AddressFormDialog';
import { ConfirmDialog } from '@/components/app/ConfirmDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label, FieldError, FieldHint } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/features/auth/AuthProvider';
import {
  useAddresses,
  useChangePassword,
  useDeleteAccount,
  useNotificationPrefs,
  useNotificationPrefsMutation,
  useProfile,
  useSetDefaultAddress,
  useUpdateProfile,
} from '@/hooks/usePortal';
import { nameSchema, passwordSchema, phoneSchema } from '@/lib/validators';
import type { Address, NotificationPrefs } from '@/data/types';

const prefCopy: { key: keyof Omit<NotificationPrefs, 'profileId'>; title: string; body: string }[] = [
  {
    key: 'orderUpdates',
    title: 'Order updates',
    body: 'Confirmation when a box is booked, moved or delivered.',
  },
  {
    key: 'deliveryReminders',
    title: 'Delivery reminders',
    body: 'A heads-up on Saturday so someone is home on Sunday morning.',
  },
  {
    key: 'offers',
    title: 'Offers and new recipes',
    body: 'Occasional seasonal menus and trial offers.',
  },
  {
    key: 'whatsapp',
    title: 'WhatsApp messages',
    body: 'Delivery updates on WhatsApp instead of email.',
  },
];

export default function SettingsPage() {
  const { user, refresh, signOut } = useAuth();
  const navigate = useNavigate();
  const profileQuery = useProfile(user?.id);
  const prefsQuery = useNotificationPrefs(user?.id);
  const addressesQuery = useAddresses(user?.id);
  const updateProfile = useUpdateProfile(user?.id);
  const prefsMutation = useNotificationPrefsMutation(user?.id);
  const setDefault = useSetDefaultAddress(user?.id);
  const changePassword = useChangePassword(user?.id);
  const deleteAccount = useDeleteAccount(user?.id);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [profileErrors, setProfileErrors] = useState<{ fullName?: string; phone?: string }>({});
  const [currentPassword, setCurrentPassword] = useState('');
  const [nextPassword, setNextPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<{
    current?: string;
    next?: string;
    confirm?: string;
  }>({});
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | undefined>(undefined);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');

  const profile = profileQuery.data;

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName);
      setPhone(profile.phone ?? '');
    }
  }, [profile]);

  async function saveProfile() {
    const errors: typeof profileErrors = {};
    const nameResult = nameSchema.safeParse(fullName);
    if (!nameResult.success) errors.fullName = nameResult.error.issues[0].message;
    const trimmedPhone = phone.trim();
    if (trimmedPhone) {
      const phoneResult = phoneSchema.safeParse(trimmedPhone);
      if (!phoneResult.success) errors.phone = phoneResult.error.issues[0].message;
    }
    setProfileErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      await updateProfile.mutateAsync({ fullName: fullName.trim(), phone: trimmedPhone || null });
      await refresh();
      toast.success('Profile saved');
    } catch {
      /* The mutation hook already surfaced the error as a toast. */
    }
  }

  async function savePassword() {
    const errors: typeof passwordErrors = {};
    if (!currentPassword) errors.current = 'Enter your current password';
    const nextResult = passwordSchema.safeParse(nextPassword);
    if (!nextResult.success) errors.next = nextResult.error.issues[0].message;
    if (nextPassword !== confirmPassword) errors.confirm = 'Passwords do not match';
    setPasswordErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      await changePassword.mutateAsync({ currentPassword, nextPassword });
      toast.success('Password changed');
      setCurrentPassword('');
      setNextPassword('');
      setConfirmPassword('');
    } catch (error) {
      setPasswordErrors({
        current: error instanceof Error ? error.message : 'Could not change your password.',
      });
    }
  }

  async function handleDelete() {
    if (deleteConfirm !== 'DELETE') return;
    await deleteAccount.mutateAsync();
    await signOut();
    toast.success('Account deleted. Sign up again any time.');
    navigate('/', { replace: true });
  }

  // Wait for the profile query to settle — a disabled query (no session yet)
  // reports isLoading: false with no data, so gate on the data itself.
  if (profileQuery.isLoading || (!profileQuery.data && !profileQuery.isError)) {
    return (
      <div aria-busy="true" className="space-y-4">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-4 w-80" />
        <Skeleton className="h-96 rounded-3xl" />
      </div>
    );
  }

  if (profileQuery.isError && !profileQuery.data) {
    return (
      <ErrorState
        title="Could not load settings"
        description="We could not load your settings. Please try again."
        onRetry={() => void profileQuery.refetch()}
      />
    );
  }

  const prefs = prefsQuery.data;
  const addresses = addressesQuery.data ?? [];

  return (
    <>
      <SEO title="Settings" path="/app/settings" noIndex />
      <PortalHeader
        eyebrow="Settings"
        title="Your account"
        description="Profile, notification preferences and security. Changes save to your live account."
      />

      <Tabs defaultValue="profile" className="max-w-3xl">
        <TabsList className="flex-wrap">
          <TabsTrigger value="profile">
            <UserRound className="h-4 w-4" aria-hidden="true" /> Profile
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <BellRing className="h-4 w-4" aria-hidden="true" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="security">
            <KeyRound className="h-4 w-4" aria-hidden="true" /> Security
          </TabsTrigger>
          <TabsTrigger value="danger">
            <ShieldAlert className="h-4 w-4" aria-hidden="true" /> Danger zone
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="space-y-4">
            <section className="card-surface p-5">
              <h2 className="font-display text-base font-bold text-forest">Account details</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="profile-name">Full name</Label>
                  <Input
                    id="profile-name"
                    className="mt-1.5"
                    autoComplete="name"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    aria-invalid={Boolean(profileErrors.fullName) || undefined}
                  />
                  <FieldError>{profileErrors.fullName}</FieldError>
                </div>
                <div>
                  <Label htmlFor="profile-phone">Phone</Label>
                  <Input
                    id="profile-phone"
                    className="mt-1.5"
                    type="tel"
                    autoComplete="tel"
                    placeholder="+919000000000"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    aria-invalid={Boolean(profileErrors.phone) || undefined}
                  />
                  <FieldHint>Indian format, e.g. +919876543210</FieldHint>
                  <FieldError>{profileErrors.phone}</FieldError>
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="profile-email">Email</Label>
                  <Input
                    id="profile-email"
                    className="mt-1.5"
                    value={profile?.email ?? user?.email ?? ''}
                    readOnly
                    disabled
                  />
                  <FieldHint>
                    Email changes need identity verification — contact support to update it.
                  </FieldHint>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button onClick={() => void saveProfile()} disabled={updateProfile.isPending}>
                  {updateProfile.isPending && (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  )}
                  Save profile
                </Button>
              </div>
            </section>

            <section className="card-surface p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-base font-bold text-forest">Delivery addresses</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingAddress(undefined);
                    setAddressDialogOpen(true);
                  }}
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" /> Add
                </Button>
              </div>

              {addressesQuery.isLoading ? (
                <Skeleton className="mt-4 h-24 rounded-2xl" />
              ) : addresses.length === 0 ? (
                <p className="mt-3 rounded-xl border border-dashed border-forest/20 px-4 py-6 text-center text-sm text-charcoal-500">
                  No addresses saved yet.
                </p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {addresses.map((address) => (
                    <li
                      key={address.id}
                      className="flex flex-wrap items-start justify-between gap-2 rounded-xl border border-forest/10 p-3"
                    >
                      <div className="min-w-0">
                        <p className="flex items-center gap-2 text-sm font-medium text-forest">
                          <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                          {address.label}
                          {address.isDefault && (
                            <Badge variant="sage" className="normal-case tracking-normal">
                              Default
                            </Badge>
                          )}
                        </p>
                        <p className="mt-0.5 text-xs leading-relaxed text-charcoal-500">
                          {[address.line1, address.line2, address.area, address.city, address.pincode]
                            .filter(Boolean)
                            .join(', ')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {!address.isDefault && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDefault.mutate(address.id)}
                            disabled={setDefault.isPending}
                          >
                            Make default
                          </Button>
                        )}
                        <Button
                          variant="soft"
                          size="sm"
                          onClick={() => {
                            setEditingAddress(address);
                            setAddressDialogOpen(true);
                          }}
                        >
                          Edit
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <section className="card-surface p-5">
            <h2 className="font-display text-base font-bold text-forest">What we send you</h2>
            <p className="mt-1 text-sm text-charcoal-600">
              Transactional messages about deliveries are separate from marketing emails.
            </p>

            {prefsQuery.isLoading || !prefs ? (
              <div className="mt-4 space-y-3">
                <Skeleton className="h-14 rounded-xl" />
                <Skeleton className="h-14 rounded-xl" />
                <Skeleton className="h-14 rounded-xl" />
              </div>
            ) : (
              <ul className="mt-4 divide-y divide-forest/10">
                {prefCopy.map((pref) => (
                  <li key={pref.key} className="flex items-start justify-between gap-4 py-3.5">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-forest">{pref.title}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-charcoal-500">{pref.body}</p>
                    </div>
                    <Switch
                      checked={prefs[pref.key]}
                      onCheckedChange={(checked) => prefsMutation.mutate({ [pref.key]: checked })}
                      aria-label={pref.title}
                    />
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-2 text-[11px] text-charcoal-400">
              Toggles save immediately — no Save button needed.
            </p>
          </section>
        </TabsContent>

        <TabsContent value="security">
          <section className="card-surface p-5">
            <h2 className="font-display text-base font-bold text-forest">Change password</h2>
            <p className="mt-1 text-sm text-charcoal-600">
              At least 8 characters, with a letter and a number.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="current-password">Current password</Label>
                <Input
                  id="current-password"
                  type="password"
                  autoComplete="current-password"
                  className="mt-1.5"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  aria-invalid={Boolean(passwordErrors.current) || undefined}
                />
                <FieldError>{passwordErrors.current}</FieldError>
              </div>
              <div>
                <Label htmlFor="next-password">New password</Label>
                <Input
                  id="next-password"
                  type="password"
                  autoComplete="new-password"
                  className="mt-1.5"
                  value={nextPassword}
                  onChange={(event) => setNextPassword(event.target.value)}
                  aria-invalid={Boolean(passwordErrors.next) || undefined}
                />
                <FieldError>{passwordErrors.next}</FieldError>
              </div>
              <div>
                <Label htmlFor="confirm-password">Confirm new password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  className="mt-1.5"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  aria-invalid={Boolean(passwordErrors.confirm) || undefined}
                />
                <FieldError>{passwordErrors.confirm}</FieldError>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <FieldHint>
                Your current password is required to make this change.
              </FieldHint>
              <Button onClick={() => void savePassword()} disabled={changePassword.isPending}>
                {changePassword.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                )}
                Update password
              </Button>
            </div>
          </section>
        </TabsContent>

        <TabsContent value="danger">
          <section className="rounded-3xl border border-red-200 bg-red-50/60 p-5">
            <h2 className="font-display text-base font-bold text-red-800">Delete my account</h2>
            <p className="mt-2 text-sm leading-relaxed text-red-800/90">
              This marks your account as deleted and signs you out. Active subscriptions stop,
              but order records stay for accounting. You cannot undo this from the UI.
            </p>
            <Button
              variant="destructive"
              className="mt-4"
              onClick={() => {
                setDeleteConfirm('');
                setDeleteOpen(true);
              }}
            >
              Delete account
            </Button>
          </section>
        </TabsContent>
      </Tabs>

      <AddressFormDialog
        open={addressDialogOpen}
        onOpenChange={setAddressDialogOpen}
        profileId={user?.id}
        address={editingAddress}
        onSaved={() => setEditingAddress(undefined)}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) setDeleteConfirm('');
        }}
        title="Delete this account?"
        description="Type DELETE to confirm. Your profile will be marked deleted and you will be signed out."
        confirmLabel="Delete my account"
        tone="danger"
        pending={deleteAccount.isPending}
        onConfirm={() => void handleDelete()}
      >
        <div>
          <Label htmlFor="delete-confirm">Type DELETE</Label>
          <Input
            id="delete-confirm"
            className="mt-1.5"
            value={deleteConfirm}
            onChange={(event) => setDeleteConfirm(event.target.value)}
            autoComplete="off"
          />
        </div>
      </ConfirmDialog>
    </>
  );
}
