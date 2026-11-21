export interface FaqItem {
  question: string;
  answer: string;
  category: 'Food' | 'Delivery' | 'Plans' | 'Health';
}

export const faqItems: FaqItem[] = [
  {
    category: 'Food',
    question: 'Is Happy Paw raw food?',
    answer:
      'No. Every meal is gently cooked in our Hyderabad kitchen at low heat, then blast-chilled. You get the freshness of a home-cooked bowl without handling raw meat at home.',
  },
  {
    category: 'Food',
    question: 'How is this different from kibble?',
    answer:
      'Kibble is cooked at very high temperatures and shelf-stable for months, which usually means preservatives and low moisture. Our meals are cooked weekly, have visible whole ingredients, and are portioned rather than scooped from a bag.',
  },
  {
    category: 'Food',
    question: 'Is it complete and balanced?',
    answer:
      "Recipes are formulated with veterinary nutritionist guidance and include a mineral and calcium mix to keep them balanced for everyday feeding. It is not a substitute for veterinary advice — if your dog has a medical condition, talk to your vet first.",
  },
  {
    category: 'Plans',
    question: 'How much does it cost?',
    answer:
      'Weekly plans start at ₹749/week for dogs up to 10 kg, ₹1,099/week for 10–25 kg and ₹1,499/week for 25–40 kg. Monthly prepaid plans save 10%, and a 3-day trial box is ₹299 (one per household).',
  },
  {
    category: 'Plans',
    question: 'How do you decide my dog’s portion?',
    answer:
      'Weight, age, activity level and body condition decide the daily grams. You can see the estimate while adding your dog, and a partner vet can review or override it for dogs on special diets.',
  },
  {
    category: 'Delivery',
    question: 'When do you deliver?',
    answer:
      'Every Sunday between 7 AM and 12 PM, chilled in insulated bags. Order by Thursday 11:59 PM for that Sunday’s delivery. We currently deliver across 10 areas in Hyderabad.',
  },
  {
    category: 'Plans',
    question: 'Can I pause, skip or cancel?',
    answer:
      'Yes. Pause for a holiday, skip a single Sunday, or cancel — all from your account, before the Thursday cut-off. Prepaid weeks that are not delivered stay on your account as credit.',
  },
  {
    category: 'Health',
    question: 'My dog has allergies. Can you help?',
    answer:
      'Every recipe page lists its full ingredient and allergen profile, and you can record allergies on your dog’s profile. For multiple or severe allergies we recommend the Special Diet plan, which starts with a vet consult.',
  },
  {
    category: 'Health',
    question: 'How do I switch my dog over?',
    answer:
      'Slowly. Over 5–7 days, mix 25% fresh with 75% of the old food, then shift the ratio every two days. Some dogs need longer. Stop and speak to your vet if you see vomiting, loose stools or itching.',
  },
  {
    category: 'Food',
    question: 'How should I store the meals?',
    answer:
      'Keep the sealed packs in the fridge for up to 4 days, or freeze portions for up to 30 days. Warm gently to room temperature before serving — never microwave in the pack.',
  },
  {
    category: 'Delivery',
    question: 'Do you deliver outside Hyderabad?',
    answer:
      'Not yet. We are starting with 10 areas across the city and expanding as our kitchen grows. Join the waitlist on the delivery areas page and we will email you when we reach you.',
  },
];
