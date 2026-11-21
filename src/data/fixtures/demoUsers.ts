import type { Profile, Vet } from '@/data/types';

export const DEMO_PASSWORD = 'Demo@1234';

/** Seeded accounts. These are demo credentials only and are documented in the README. */
export const demoAccounts = {
  customer: { email: 'priya@happypaw.in', password: DEMO_PASSWORD, label: 'Customer' },
  customerAlt: { email: 'arjun@happypaw.in', password: DEMO_PASSWORD, label: 'Customer (alt)' },
  vet: { email: 'meera@happypaw.in', password: DEMO_PASSWORD, label: 'Veterinarian' },
  admin: { email: 'admin@happypaw.in', password: DEMO_PASSWORD, label: 'Owner / Admin' },
} as const;

export const demoProfiles: Profile[] = [
  {
    id: 'user-customer',
    role: 'customer',
    fullName: 'Priya Reddy',
    email: demoAccounts.customer.email,
    phone: '+919876543210',
    avatarUrl: null,
    createdAt: '2025-02-11T08:30:00.000Z',
  },
  {
    id: 'user-customer-alt',
    role: 'customer',
    fullName: 'Arjun Menon',
    email: demoAccounts.customerAlt.email,
    phone: '+919812345678',
    avatarUrl: null,
    createdAt: '2025-03-02T10:00:00.000Z',
  },
  {
    id: 'user-vet',
    role: 'vet',
    fullName: 'Dr. Meera Iyer',
    email: demoAccounts.vet.email,
    phone: '+919701234567',
    avatarUrl: null,
    createdAt: '2025-01-19T06:15:00.000Z',
  },
  {
    id: 'user-vet-kapoor',
    role: 'vet',
    fullName: 'Dr. Sameer Kapoor',
    email: 'sameer@jubileepets.in',
    phone: '+919701112233',
    avatarUrl: null,
    createdAt: '2025-02-02T09:20:00.000Z',
  },
  {
    id: 'user-vet-rao',
    role: 'vet',
    fullName: 'Dr. Lakshmi Rao',
    email: 'lakshmi@kondapuranimalcare.in',
    phone: '+919701119988',
    avatarUrl: null,
    createdAt: '2025-04-14T10:10:00.000Z',
  },
  {
    id: 'user-admin',
    role: 'admin',
    fullName: 'Rohan Varma',
    email: demoAccounts.admin.email,
    phone: '+919900112233',
    avatarUrl: null,
    createdAt: '2025-01-04T05:00:00.000Z',
  },
];

export const demoVets: Vet[] = [
  {
    id: 'vet-meera',
    profileId: 'user-vet',
    clinicName: 'Paws & Wellness Clinic',
    city: 'Hyderabad',
    licenseNo: 'TSVC-2019-04412',
    status: 'approved',
    referralCode: 'DRMEERA10',
    fullName: 'Dr. Meera Iyer',
    email: demoAccounts.vet.email,
  },
  {
    id: 'vet-kapoor',
    profileId: 'user-vet-kapoor',
    clinicName: 'Jubilee Pet Hospital',
    city: 'Hyderabad',
    licenseNo: 'TSVC-2016-00871',
    status: 'approved',
    referralCode: 'DRKAPOOR',
    fullName: 'Dr. Sameer Kapoor',
    email: 'sameer@jubileepets.in',
  },
  {
    id: 'vet-rao',
    profileId: 'user-vet-rao',
    clinicName: 'Kondapur Animal Care',
    city: 'Hyderabad',
    licenseNo: 'TSVC-2021-03310',
    status: 'pending',
    referralCode: 'DRRAO',
    fullName: 'Dr. Lakshmi Rao',
    email: 'lakshmi@kondapuranimalcare.in',
  },
];
