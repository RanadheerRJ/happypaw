export interface NavItem {
  label: string;
  to: string;
}

export const mainNav: NavItem[] = [
  { label: "This week's menu", to: '/menu' },
  { label: 'How it works', to: '/how-it-works' },
  { label: 'Plans', to: '/plans' },
  { label: 'For vets', to: '/vets' },
  { label: 'Our kitchen', to: '/about' },
];

export const footerNav: { title: string; items: NavItem[] }[] = [
  {
    title: 'Fresh food',
    items: [
      { label: "This week's menu", to: '/menu' },
      { label: 'Plans & pricing', to: '/plans' },
      { label: 'How it works', to: '/how-it-works' },
      { label: 'Delivery areas', to: '/delivery-areas' },
    ],
  },
  {
    title: 'Happy Paw',
    items: [
      { label: 'Our story', to: '/about' },
      { label: 'For vets', to: '/vets' },
      { label: 'FAQ', to: '/faq' },
      { label: 'Contact us', to: '/contact' },
    ],
  },
  {
    title: 'Legal',
    items: [
      { label: 'Terms of service', to: '/legal/terms' },
      { label: 'Privacy policy', to: '/legal/privacy' },
      { label: 'Refund policy', to: '/legal/refunds' },
      { label: 'Food safety', to: '/legal/food-safety' },
    ],
  },
  {
    title: 'Account',
    items: [
      { label: 'Log in', to: '/login' },
      { label: 'Create account', to: '/signup' },
      { label: 'Customer portal', to: '/app' },
      { label: 'Vet portal', to: '/vet' },
    ],
  },
];

/** Footer legal line required by Section 16 of the brief. */
export const legalFootnoteKey = 'medical';
