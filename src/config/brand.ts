/**
 * Single source of truth for brand identity and contact details.
 * Nothing in the UI should hardcode the business name — import from here.
 */
export const brand = {
  name: 'Happy Paw',
  shortName: 'Happy Paw',
  tagline: 'Real food. Real happy paws.',
  positioning: 'Cooked fresh every week. Portioned for your dog. Delivered to your door.',
  description:
    'Gently cooked, vet-formulated fresh dog meals — portioned for your dog and delivered weekly across Hyderabad.',
  city: 'Hyderabad',
  region: 'Telangana',
  country: 'India',
  currency: 'INR',
  locale: 'en-IN',
  timezone: 'Asia/Kolkata',
  email: 'hello@happypaw.in',
  supportEmail: 'care@happypaw.in',
  phone: '+91 90000 00000',
  phoneHref: '+919000000000',
  whatsapp: '+91 90000 00000',
  address: {
    line1: 'Happy Paw Kitchen, Plot 42, Kondapur Main Road',
    line2: 'Kondapur',
    area: 'Kondapur',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500084',
    country: 'India',
  },
  hours: 'Mon–Sat, 9 AM – 7 PM',
  socials: {
    instagram: 'https://instagram.com/happypaw',
    facebook: 'https://facebook.com/happypaw',
    youtube: 'https://youtube.com/@happypaw',
  },
  fssai: 'FSSAI Lic. 12345678901234 (demo)',
  founded: 2025,
  /** Mandatory footnote shown site-wide (Section 16). */
  medicalFootnote:
    "Happy Paw meals are formulated with veterinary nutritionist guidance. This is not veterinary advice. Consult your vet before changing your dog's diet, especially for medical conditions.",
  demoContentNote: 'Demo content — not a live business.',
  domain: 'https://happypaw.example',
  ogImagePath: 'images/hero-dog-bowl.webp',
} as const;

export type Brand = typeof brand;
