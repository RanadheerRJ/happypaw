import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, Check, Loader2, PawPrint } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Label, FieldError, FieldHint } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/features/auth/AuthProvider';
import { useCreateDog, useUpdateDog } from '@/hooks/usePortal';
import {
  activityLevels,
  allergyOptions,
  bodyConditions,
  dogSchema,
  estimateDailyPortionG,
  type DogFormValues,
} from '@/lib/validators';
import type { Dog } from '@/data/types';

const steps = [
  { id: 'basics', title: 'The basics' },
  { id: 'routine', title: 'Body & routine' },
  { id: 'health', title: 'Health & food' },
  { id: 'review', title: 'Review' },
];

const stepFields: (keyof DogFormValues)[][] = [
  ['name', 'dob', 'weightKg', 'breed'],
  ['bodyCondition', 'activityLevel', 'neutered', 'picky'],
  ['allergies', 'currentFood', 'medicalNotes'],
  [],
];

const conditionLabels: Record<(typeof bodyConditions)[number], string> = {
  underweight: 'A little underweight',
  ideal: 'Ideal weight',
  overweight: 'A little overweight',
};

const activityLabels: Record<(typeof activityLevels)[number], string> = {
  low: 'Mostly indoor / gentle walks',
  moderate: 'Daily walks and play',
  high: 'Very active — runs, agility, long walks',
};

export function DogWizard({
  dog,
  onDone,
}: {
  dog?: Dog;
  onDone: (dog: Dog) => void;
}) {
  const isEdit = Boolean(dog);
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const createDog = useCreateDog(user?.id);
  const updateDog = useUpdateDog(dog?.id);
  const pending = createDog.isPending || updateDog.isPending;

  const form = useForm<DogFormValues>({
    resolver: zodResolver(dogSchema),
    defaultValues: dog
      ? {
          name: dog.name,
          breed: dog.breed,
          dob: dog.dob,
          weightKg: dog.weightKg,
          bodyCondition: dog.bodyCondition,
          activityLevel: dog.activityLevel,
          neutered: dog.neutered,
          allergies: dog.allergies,
          medicalNotes: dog.medicalNotes ?? '',
          currentFood: dog.currentFood ?? '',
          picky: dog.picky,
        }
      : {
          name: '',
          breed: '',
          dob: '',
          weightKg: undefined as unknown as number,
          bodyCondition: 'ideal',
          activityLevel: 'moderate',
          neutered: false,
          allergies: [],
          medicalNotes: '',
          currentFood: '',
          picky: false,
        },
  });

  const { watch, setValue, register, formState, trigger } = form;
  const values = watch();
  const allergies = values.allergies ?? [];
  const portion = useMemo(() => {
    const weight = Number(values.weightKg);
    if (!weight || Number.isNaN(weight)) return null;
    return estimateDailyPortionG(weight, values.activityLevel ?? 'moderate');
  }, [values.weightKg, values.activityLevel]);

  function toggleAllergy(option: string) {
    if (option === 'None known') {
      setValue('allergies', []);
      return;
    }
    const next = allergies.includes(option)
      ? allergies.filter((item) => item !== option)
      : [...allergies, option];
    setValue('allergies', next, { shouldValidate: true, shouldDirty: true });
  }

  async function next() {
    const valid = await trigger(stepFields[step]);
    if (valid) setStep((current) => Math.min(current + 1, steps.length - 1));
  }

  async function submit() {
    const valid = await trigger();
    if (!valid) {
      const firstInvalid = stepFields.findIndex((fields) =>
        fields.some((field) => form.formState.errors[field]),
      );
      if (firstInvalid >= 0) setStep(firstInvalid);
      return;
    }

    const payload = {
      name: values.name,
      breed: values.breed ?? '',
      dob: values.dob,
      weightKg: Number(values.weightKg),
      bodyCondition: values.bodyCondition,
      activityLevel: values.activityLevel,
      neutered: Boolean(values.neutered),
      allergies: values.allergies ?? [],
      medicalNotes: values.medicalNotes?.trim() || null,
      currentFood: values.currentFood?.trim() || null,
      picky: Boolean(values.picky),
      photoUrl: dog?.photoUrl ?? null,
    };

    try {
      if (isEdit && dog) {
        const updated = await updateDog.mutateAsync(payload);
        toast.success(`${updated.name}'s profile updated`);
        onDone(updated);
        return;
      }

      const created = await createDog.mutateAsync(payload);
      toast.success(`${created.name} is in. A diet plan is now with our vet team.`);
      onDone(created);
    } catch {
      /* The mutation hook already surfaced the error as a toast. */
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <ol className="mb-6 flex items-center gap-2" aria-label="Onboarding progress">
        {steps.map((item, index) => {
          const state = index === step ? 'current' : index < step ? 'done' : 'todo';
          return (
            <li key={item.id} className="flex flex-1 flex-col gap-1.5">
              <span
                className={`h-1.5 rounded-full transition-colors ${
                  state === 'todo' ? 'bg-forest/10' : 'bg-forest'
                }`}
              />
              <span
                className={`text-[10.5px] font-semibold uppercase tracking-[0.12em] ${
                  state === 'current' ? 'text-forest' : 'text-charcoal-400'
                }`}
              >
                {index + 1}. {item.title}
              </span>
            </li>
          );
        })}
      </ol>

      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          if (step === steps.length - 1) void submit();
          else void next();
        }}
        className="card-surface p-5 sm:p-7"
      >
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="dog-name">Dog&apos;s name</Label>
              <Input
                id="dog-name"
                className="mt-1.5"
                placeholder="Coco"
                autoComplete="off"
                {...register('name')}
              />
              <FieldError>{formState.errors.name?.message}</FieldError>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="dog-breed">Breed</Label>
                <Input
                  id="dog-breed"
                  className="mt-1.5"
                  placeholder="Indie / Beagle / Lab…"
                  {...register('breed')}
                />
                <FieldHint>Optional — helps us tweak the recipe.</FieldHint>
                <FieldError>{formState.errors.breed?.message}</FieldError>
              </div>
              <div>
                <Label htmlFor="dog-dob">Date of birth</Label>
                <Input id="dog-dob" type="date" className="mt-1.5" {...register('dob')} />
                <FieldError>{formState.errors.dob?.message}</FieldError>
              </div>
            </div>

            <div>
              <Label htmlFor="dog-weight">Current weight (kg)</Label>
              <Input
                id="dog-weight"
                type="number"
                inputMode="decimal"
                step="0.1"
                min="0.5"
                max="90"
                className="mt-1.5 max-w-40"
                placeholder="12.5"
                {...register('weightKg')}
              />
              <FieldHint>Weigh at the same time of day for the cleanest trend.</FieldHint>
              <FieldError>{formState.errors.weightKg?.message}</FieldError>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <fieldset>
              <legend className="text-sm font-medium text-forest">Body condition</legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                {bodyConditions.map((option) => (
                  <label
                    key={option}
                    className={`cursor-pointer rounded-xl border px-3 py-2.5 text-sm transition-colors ${
                      values.bodyCondition === option
                        ? 'border-forest bg-forest/[0.05] text-forest'
                        : 'border-forest/15 text-charcoal-600 hover:border-forest/30'
                    }`}
                  >
                    <input
                      type="radio"
                      value={option}
                      className="sr-only"
                      checked={values.bodyCondition === option}
                      onChange={() => setValue('bodyCondition', option, { shouldValidate: true })}
                    />
                    {conditionLabels[option]}
                  </label>
                ))}
              </div>
              <FieldError>{formState.errors.bodyCondition?.message}</FieldError>
            </fieldset>

            <fieldset>
              <legend className="text-sm font-medium text-forest">Activity level</legend>
              <div className="mt-2 space-y-2">
                {activityLevels.map((option) => (
                  <label
                    key={option}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 text-sm transition-colors ${
                      values.activityLevel === option
                        ? 'border-forest bg-forest/[0.05] text-forest'
                        : 'border-forest/15 text-charcoal-600 hover:border-forest/30'
                    }`}
                  >
                    <input
                      type="radio"
                      value={option}
                      className="mt-0.5"
                      checked={values.activityLevel === option}
                      onChange={() => setValue('activityLevel', option, { shouldValidate: true })}
                    />
                    <span>
                      <span className="block font-medium capitalize">{option}</span>
                      <span className="block text-xs text-charcoal-500">
                        {activityLabels[option]}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
              <FieldError>{formState.errors.activityLevel?.message}</FieldError>
            </fieldset>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex items-start gap-3 rounded-xl border border-forest/15 p-3 text-sm">
                <Checkbox
                  checked={Boolean(values.neutered)}
                  onCheckedChange={(checked) => setValue('neutered', checked === true)}
                  aria-label="Neutered or spayed"
                />
                <span>
                  <span className="block font-medium text-forest">Neutered / spayed</span>
                  <span className="block text-xs text-charcoal-500">
                    Adjusts the calorie estimate.
                  </span>
                </span>
              </label>
              <label className="flex items-start gap-3 rounded-xl border border-forest/15 p-3 text-sm">
                <Checkbox
                  checked={Boolean(values.picky)}
                  onCheckedChange={(checked) => setValue('picky', checked === true)}
                  aria-label="Picky eater"
                />
                <span>
                  <span className="block font-medium text-forest">Picky eater</span>
                  <span className="block text-xs text-charcoal-500">
                    We will suggest gentler recipes first.
                  </span>
                </span>
              </label>
            </div>

            {portion && (
              <p className="rounded-xl bg-sage-50 px-4 py-3 text-sm text-forest-700">
                <PawPrint className="mr-1.5 inline h-4 w-4" aria-hidden="true" />
                Starting portion: <strong>{portion} g per day</strong> — about{' '}
                {Math.round(portion / 2 / 10) * 10} g per meal. A vet-nutritionist confirms this
                before the first box.
              </p>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <fieldset>
              <legend className="text-sm font-medium text-forest">Known allergies</legend>
              <p className="mt-1 text-xs text-charcoal-500">
                Select every ingredient your dog reacts to. We exclude those recipes.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {allergyOptions.map((option) => {
                  const selected =
                    option === 'None known'
                      ? allergies.length === 0
                      : allergies.includes(option);
                  return (
                    <button
                      key={option}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => toggleAllergy(option)}
                      className={`rounded-full border px-3 py-1.5 text-[13px] transition-colors ${
                        selected
                          ? 'border-forest bg-forest text-cream'
                          : 'border-forest/20 text-charcoal-600 hover:border-forest/40'
                      }`}
                    >
                      {selected && <Check className="mr-1 inline h-3 w-3" aria-hidden="true" />}
                      {option}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div>
              <Label htmlFor="dog-current-food">What do they eat today?</Label>
              <Input
                id="dog-current-food"
                className="mt-1.5"
                placeholder="Home-cooked rice and chicken, twice a day"
                {...register('currentFood')}
              />
              <FieldError>{formState.errors.currentFood?.message}</FieldError>
            </div>

            <div>
              <Label htmlFor="dog-notes">Anything else our vet should know?</Label>
              <Textarea
                id="dog-notes"
                className="mt-1.5"
                rows={3}
                placeholder="Sensitive stomach, loves fish, on a joint supplement…"
                {...register('medicalNotes')}
              />
              <FieldHint>Shared only with the Happy Paw vet-nutritionist team.</FieldHint>
              <FieldError>{formState.errors.medicalNotes?.message}</FieldError>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-2xl bg-sage-50 p-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white text-forest">
                <PawPrint className="h-6 w-6" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="font-display text-lg font-bold text-forest">{values.name || 'Your dog'}</p>
                <p className="text-sm text-charcoal-600">
                  {[values.breed, values.weightKg ? `${values.weightKg} kg` : null]
                    .filter(Boolean)
                    .join(' · ') || 'Profile details'}
                </p>
              </div>
            </div>

            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div className="rounded-xl border border-forest/10 p-3">
                <dt className="text-xs uppercase tracking-[0.12em] text-charcoal-400">Activity</dt>
                <dd className="mt-1 font-medium capitalize text-forest">
                  {values.activityLevel} · {values.bodyCondition}
                </dd>
              </div>
              <div className="rounded-xl border border-forest/10 p-3">
                <dt className="text-xs uppercase tracking-[0.12em] text-charcoal-400">
                  Daily portion
                </dt>
                <dd className="mt-1 font-medium text-forest">
                  {portion ? `${portion} g / day` : 'Share a weight'}
                </dd>
              </div>
              <div className="rounded-xl border border-forest/10 p-3">
                <dt className="text-xs uppercase tracking-[0.12em] text-charcoal-400">
                  Allergies
                </dt>
                <dd className="mt-1 font-medium text-forest">
                  {allergies.length ? allergies.join(', ') : 'None known'}
                </dd>
              </div>
              <div className="rounded-xl border border-forest/10 p-3">
                <dt className="text-xs uppercase tracking-[0.12em] text-charcoal-400">
                  Current food
                </dt>
                <dd className="mt-1 font-medium text-forest">
                  {values.currentFood?.trim() || 'Not shared'}
                </dd>
              </div>
            </dl>

            <p className="rounded-xl bg-forest/[0.04] px-4 py-3 text-xs leading-relaxed text-charcoal-600">
              Saving adds a starting diet plan for our veterinary-nutritionist to review. Guidance
              from Happy Paw is nutrition guidance, not veterinary advice.
            </p>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between gap-3 border-t border-forest/10 pt-4">
          <Button
            variant="ghost"
            onClick={() => setStep((current) => Math.max(0, current - 1))}
            disabled={step === 0 || pending}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back
          </Button>
          {step < steps.length - 1 ? (
            <Button onClick={() => void next()}>
              Continue <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          ) : (
            <Button type="submit" variant="accent" disabled={pending}>
              {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              {isEdit ? 'Save changes' : 'Save my dog'}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
