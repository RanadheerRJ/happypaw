import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Clock, Mail, MapPin, Phone, Send } from 'lucide-react';
import { toast } from 'sonner';
import { SEO } from '@/components/shared/SEO';
import { PageHero } from '@/components/marketing/PageHero';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Label, FieldError, FieldHint } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { contactSchema, type ContactFormValues } from '@/lib/validators';
import { brand } from '@/config/brand';

const topicOptions = [
  { value: 'general', label: 'General question' },
  { value: 'subscription', label: 'Plans & subscription' },
  { value: 'delivery', label: 'Delivery' },
  { value: 'vet', label: 'Vet partnership' },
  { value: 'partnership', label: 'Other partnership' },
];

export default function ContactPage() {
  const [params] = useSearchParams();
  const initialTopic = topicOptions.some((option) => option.value === params.get('topic'))
    ? (params.get('topic') as ContactFormValues['topic'])
    : 'general';
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', email: '', phone: '', topic: initialTopic, message: '' },
  });

  async function onSubmit(values: ContactFormValues) {
    // Demo build: nothing is sent anywhere. Simulated latency shows the pending state.
    await new Promise((resolve) => setTimeout(resolve, 650));
    setSubmitted(true);
    toast.success('Message queued (demo)', {
      description: `Nothing was sent — this build has no backend for contact messages.`,
    });
    form.reset({ ...values, message: '' });
  }

  return (
    <>
      <SEO
        title="Contact us"
        description={`Talk to the ${brand.name} team in ${brand.city} about plans, deliveries, ingredients or vet partnerships.`}
        path="/contact"
      />

      <PageHero
        eyebrow="Contact"
        title={
          <>
            Real people,
            <span className="font-serif italic text-terracotta"> usually in the kitchen</span>
          </>
        }
        description="Questions about a plan, a delivery or a dog with a delicate stomach — email is the fastest way to reach us."
      />

      <section className="section">
        <div className="container-x grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <div>
            {submitted ? (
              <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-7 text-center">
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                  <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
                </span>
                <h2 className="mt-4 font-display text-xl font-bold text-emerald-900">
                  Thank you — message recorded
                </h2>
                <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-emerald-800">
                  In this demo build nothing is actually sent. In production this would create a
                  support ticket and email our team.
                </p>
                <Button variant="outline" className="mt-5 bg-white" onClick={() => setSubmitted(false)}>
                  Send another message
                </Button>
              </div>
            ) : (
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                noValidate
                className="rounded-3xl border border-forest/10 bg-white p-5 shadow-soft sm:p-7"
              >
                <h2 className="font-display text-xl font-bold text-forest">Send us a message</h2>
                <p className="mt-1 text-[13px] text-charcoal-500">
                  We usually reply within one working day, {brand.hours}.
                </p>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="contact-name">Your name</Label>
                    <Input
                      id="contact-name"
                      className="mt-1.5"
                      autoComplete="name"
                      aria-invalid={Boolean(form.formState.errors.name) || undefined}
                      aria-describedby={form.formState.errors.name ? 'contact-name-error' : undefined}
                      {...form.register('name')}
                    />
                    <FieldError id="contact-name-error">{form.formState.errors.name?.message}</FieldError>
                  </div>
                  <div>
                    <Label htmlFor="contact-email">Email</Label>
                    <Input
                      id="contact-email"
                      type="email"
                      className="mt-1.5"
                      autoComplete="email"
                      aria-invalid={Boolean(form.formState.errors.email) || undefined}
                      aria-describedby={form.formState.errors.email ? 'contact-email-error' : undefined}
                      {...form.register('email')}
                    />
                    <FieldError id="contact-email-error">{form.formState.errors.email?.message}</FieldError>
                  </div>
                  <div>
                    <Label htmlFor="contact-phone">
                      Phone <span className="font-normal text-charcoal-400">(optional)</span>
                    </Label>
                    <Input
                      id="contact-phone"
                      type="tel"
                      inputMode="tel"
                      className="mt-1.5"
                      placeholder="+91 98765 43210"
                      autoComplete="tel"
                      aria-invalid={Boolean(form.formState.errors.phone) || undefined}
                      aria-describedby={form.formState.errors.phone ? 'contact-phone-error' : undefined}
                      {...form.register('phone')}
                    />
                    <FieldError id="contact-phone-error">{form.formState.errors.phone?.message}</FieldError>
                  </div>
                  <div>
                    <Label htmlFor="contact-topic">What is this about?</Label>
                    <Select
                      id="contact-topic"
                      className="mt-1.5"
                      options={topicOptions}
                      aria-invalid={Boolean(form.formState.errors.topic) || undefined}
                      {...form.register('topic')}
                    />
                    <FieldError>{form.formState.errors.topic?.message}</FieldError>
                  </div>
                </div>

                <div className="mt-4">
                  <Label htmlFor="contact-message">Message</Label>
                  <Textarea
                    id="contact-message"
                    className="mt-1.5"
                    placeholder="Tell us about your dog, your order or your question."
                    aria-invalid={Boolean(form.formState.errors.message) || undefined}
                    aria-describedby="contact-message-hint contact-message-error"
                    {...form.register('message')}
                  />
                  <FieldHint id="contact-message-hint">A little context helps us answer properly.</FieldHint>
                  <FieldError id="contact-message-error">{form.formState.errors.message?.message}</FieldError>
                </div>

                <Button type="submit" className="mt-5 w-full" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? (
                    'Sending…'
                  ) : (
                    <>
                      <Send className="h-4 w-4" aria-hidden="true" /> Send message
                    </>
                  )}
                </Button>
                <p className="mt-3 text-center text-[11px] text-charcoal-400">
                  Demo build — messages are not delivered and no data leaves your browser.
                </p>
              </form>
            )}
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-forest/10 bg-forest-800 p-6 text-cream">
              <h2 className="font-display text-lg font-bold text-cream">Reach us directly</h2>
              <ul className="mt-4 space-y-3.5 text-[13px]">
                <li className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-sage-300" aria-hidden="true" />
                  <span>
                    <a href={`mailto:${brand.email}`} className="font-medium text-cream hover:underline">
                      {brand.email}
                    </a>
                    <span className="block text-[11.5px] text-cream/50">Orders &amp; general</span>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-sage-300" aria-hidden="true" />
                  <span>
                    <a href={`mailto:${brand.supportEmail}`} className="font-medium text-cream hover:underline">
                      {brand.supportEmail}
                    </a>
                    <span className="block text-[11.5px] text-cream/50">Delivery &amp; account support</span>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-sage-300" aria-hidden="true" />
                  <a href={`tel:${brand.phoneHref}`} className="font-medium text-cream hover:underline">
                    {brand.phone}
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-sage-300" aria-hidden="true" />
                  <span className="text-cream/80">{brand.hours}</span>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sage-300" aria-hidden="true" />
                  <span className="text-cream/80">
                    {brand.address.line1}
                    <br />
                    {brand.address.city} {brand.address.pincode}
                  </span>
                </li>
              </ul>
            </div>

            <div className="rounded-3xl border border-forest/10 bg-white p-5">
              <h3 className="font-display text-[14px] font-bold text-forest">Looking for a vet partner?</h3>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-charcoal-600">
                Choose “Vet partnership” in the form, or read the programme page first.
              </p>
              <Link
                to="/vets"
                className="mt-3 inline-block text-[12.5px] font-semibold text-forest underline decoration-sage-400 underline-offset-4"
              >
                Vet partner programme →
              </Link>
            </div>

            <div className="rounded-3xl border border-forest/10 bg-cream-100/70 p-5">
              <h3 className="font-display text-[13.5px] font-bold text-forest">Food safety or allergy query?</h3>
              <p className="mt-1.5 text-[12px] leading-relaxed text-charcoal-600">
                {brand.medicalFootnote}
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
