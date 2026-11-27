import { Link } from 'react-router-dom';
import { Instagram, Facebook, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { brand } from '@/config/brand';
import { deliveryZoneFixtures, deliverySchedule } from '@/config/pricing';
import { footerNav } from '@/config/nav';
import { Logo } from '@/components/shared/Logo';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-grape-700 text-sand/75">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-sunset-400/10 blur-3xl"
      />
      <div className="container-x relative pb-10 pt-14">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_2.4fr]">
          <div className="max-w-sm">
            <div className="[&_span]:text-sand">
              <Logo />
            </div>
            <p className="mt-5 font-serif text-xl italic text-sand/90">{brand.tagline}</p>
            <p className="mt-3 text-sm leading-relaxed text-sand/60">
              {brand.positioning} Vet-formulated fresh meals for dogs across {brand.city}.
            </p>

            <div className="mt-6 space-y-2.5 text-sm">
              <a
                href={`mailto:${brand.email}`}
                className="flex items-center gap-2.5 text-sand/70 transition-colors hover:text-sand"
              >
                <Mail className="h-4 w-4 text-teal-300" aria-hidden="true" /> {brand.email}
              </a>
              <a
                href={`tel:${brand.phoneHref}`}
                className="flex items-center gap-2.5 text-sand/70 transition-colors hover:text-sand"
              >
                <Phone className="h-4 w-4 text-teal-300" aria-hidden="true" /> {brand.phone}
              </a>
              <p className="flex items-start gap-2.5 text-sand/60">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-teal-300" aria-hidden="true" />
                <span>
                  {brand.address.line1}, {brand.address.city} {brand.address.pincode}
                </span>
              </p>
            </div>

            <div className="mt-6 flex items-center gap-2">
              {[
                { href: brand.socials.instagram, icon: Instagram, label: 'Instagram' },
                { href: brand.socials.facebook, icon: Facebook, label: 'Facebook' },
                { href: brand.socials.youtube, icon: Youtube, label: 'YouTube' },
              ].map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={`${brand.name} on ${label} (demo link)`}
                  className="grid h-9 w-9 place-items-center rounded-full border border-sand/15 text-sand/70 transition-colors hover:border-sand/40 hover:text-sand"
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {footerNav.map((group) => (
              <nav key={group.title} aria-label={group.title}>
                <h2 className="font-display text-[11px] font-bold uppercase tracking-[0.16em] text-sand/60">
                  {group.title}
                </h2>
                <ul className="mt-4 space-y-2.5">
                  {group.items.map((item) => (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        className="text-[13.5px] text-sand/70 transition-colors hover:text-sand"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-12 rounded-2xl border border-sand/10 bg-sand/[0.04] p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-sand/60">
              We deliver to
            </h2>
            {deliveryZoneFixtures.map((zone) => (
              <Link
                key={zone.id}
                to="/delivery-areas"
                className="rounded-full border border-sand/15 px-2.5 py-1 text-[11.5px] text-sand/65 transition-colors hover:border-sand/40 hover:text-sand"
              >
                {zone.areaName}
              </Link>
            ))}
            <Link
              to="/delivery-areas"
              className="text-[11.5px] font-semibold text-teal-300 underline decoration-teal-300/40 underline-offset-4 hover:text-sand"
            >
              Check your pincode →
            </Link>
          </div>
          <p className="mt-3 text-[12px] text-sand/60">{deliverySchedule.summary}</p>
        </div>

        <div className="mt-10 border-t border-sand/10 pt-6">
          <p className="max-w-3xl text-[12px] leading-relaxed text-sand/60">{brand.medicalFootnote}</p>
          <div className="mt-5 flex flex-col gap-3 text-[12px] text-sand/60 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {year} {brand.name} · {brand.address.city}, {brand.address.state} · {brand.fssai}
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <span className="rounded-full border border-sand/15 px-2 py-0.5 text-[10.5px] uppercase tracking-widest text-sand/60">
                Fresh meals · {brand.city}
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
