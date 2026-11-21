export type LegalSlug = 'terms' | 'privacy' | 'refunds' | 'food-safety';

export interface LegalSection {
  id: string;
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
}

export interface LegalDoc {
  slug: LegalSlug;
  title: string;
  summary: string;
  updated: string;
  sections: LegalSection[];
}

const updated = '18 November 2026';

export const legalDocs: Record<LegalSlug, LegalDoc> = {
  terms: {
    slug: 'terms',
    title: 'Terms of service',
    summary:
      'The basic rules of using Happy Paw — accounts, subscriptions, delivery, cancellations and the limits of what we promise.',
    updated,
    sections: [
      {
        id: 'about',
        heading: '1. About these terms',
        paragraphs: [
          'These terms govern your use of the Happy Paw website and subscription service. Happy Paw is a demo build created for internal partner review; the business, prices and policies shown are illustrative and are not an offer for sale.',
          'By creating an account you confirm that you are at least 18 years old and are authorised to place orders on behalf of the household.',
        ],
      },
      {
        id: 'subscriptions',
        heading: '2. Subscriptions and billing',
        paragraphs: [
          'Weekly plans are billed per delivery week. Monthly plans are billed once for four weeks of meals. Prices are shown in Indian Rupees and include delivery within our published service areas.',
          'In this demo build, no payment is collected. Checkout simulates a Razorpay payment and records a payment with the status “simulated”.',
        ],
        bullets: [
          'Order changes must be made before the Thursday 11:59 PM cut-off for the following Sunday.',
          'Prepaid weeks that are paused or skipped remain as account credit.',
          'Prices may change with 14 days’ notice for future delivery weeks.',
        ],
      },
      {
        id: 'delivery',
        heading: '3. Delivery',
        paragraphs: [
          'We deliver on Sundays between 7 AM and 12 PM within our service areas in Hyderabad. Someone aged 18 or over must be available to receive the delivery, or you may nominate a safe handover point in your delivery notes.',
          'If delivery is attempted and fails because no one is available, we will contact you to reattempt. Repeated failed deliveries may result in the order being cancelled without refund.',
        ],
      },
      {
        id: 'acceptable-use',
        heading: '4. Acceptable use',
        bullets: [
          'Do not submit false information about your dog that could affect portioning or allergen safety.',
          'Do not attempt to access another customer’s account or data.',
          'Do not resell or redistribute meals commercially without a written agreement.',
        ],
      },
      {
        id: 'liability',
        heading: '5. Limitations',
        paragraphs: [
          'Our food is formulated with veterinary nutritionist guidance, but it is not veterinary advice and is not a treatment for any medical condition. You should consult your veterinarian before changing your dog’s diet, particularly where a medical condition exists.',
          'To the extent permitted by law, our liability is limited to the value of the affected order. Nothing in these terms limits liability that cannot be excluded under Indian law.',
        ],
      },
      {
        id: 'contact',
        heading: '6. Contact',
        paragraphs: [
          'Questions about these terms can be sent to hello@happypaw.in. This document is a draft pending legal review and does not constitute legal advice.',
        ],
      },
    ],
  },
  privacy: {
    slug: 'privacy',
    title: 'Privacy policy',
    summary:
      'What we collect, why we collect it, how long we keep it and the choices you have — written with India’s DPDP Act in mind.',
    updated,
    sections: [
      {
        id: 'scope',
        heading: '1. Scope',
        paragraphs: [
          'This policy describes how Happy Paw handles personal data when you use this website or subscribe to our service. This is a demo build: the data you enter in demo mode is stored only in your browser and is not transmitted to any server.',
        ],
      },
      {
        id: 'what-we-collect',
        heading: '2. What we collect',
        bullets: [
          'Account data: name, email address, mobile number and a hashed password.',
          'Dog data: name, breed, date of birth, weight, body condition, activity level, allergies, medical notes and a photograph if you upload one.',
          'Order data: delivery address, pincode, order contents and delivery notes.',
          'Support data: the messages you send to our team.',
          'Technical data: basic device and browser information needed to keep the site secure.',
        ],
      },
      {
        id: 'why',
        heading: '3. Why we use it',
        bullets: [
          'To portion meals safely, including allergen and medical notes.',
          'To deliver orders and contact you about deliveries.',
          'To provide support and respond to queries.',
          'To meet tax, accounting and food-safety record-keeping obligations.',
          'To send service messages; marketing messages only with your consent.',
        ],
      },
      {
        id: 'vet-sharing',
        heading: '4. Sharing with veterinarians',
        paragraphs: [
          'If you join through a partner veterinarian or ask for a diet review, your dog’s health profile and weight history are visible to that veterinarian. Clinical notes written by the vet are visible to our clinical team and to the vet, and are not shown to other customers.',
        ],
      },
      {
        id: 'retention',
        heading: '5. Retention and security',
        paragraphs: [
          'Order and payment records are retained for the period required by Indian tax law. Dog profiles are retained while your account is active and deleted or anonymised when you close your account, unless we are required to keep them.',
          'We use encrypted connections, access controls and row-level security in our database so that customers can only reach their own records.',
        ],
      },
      {
        id: 'rights',
        heading: '6. Your choices',
        bullets: [
          'Access, correct or delete your data from account settings or by emailing us.',
          'Withdraw marketing consent at any time; service messages will continue.',
          'Ask us to explain how a decision about your subscription was made.',
          'Complain to the Data Protection Board of India if you believe your rights were violated.',
        ],
      },
      {
        id: 'contact',
        heading: '7. Contact',
        paragraphs: [
          'Email hello@happypaw.in for privacy requests. This is draft text pending legal review and is not legal advice.',
        ],
      },
    ],
  },
  refunds: {
    slug: 'refunds',
    title: 'Refund & cancellation policy',
    summary:
      'How pauses, skips, cancellations and refunds work for weekly and monthly subscriptions.',
    updated,
    sections: [
      {
        id: 'cutoff',
        heading: '1. The cut-off',
        paragraphs: [
          'We cook to the week’s order sheet. Any change to an upcoming delivery — skip, pause, address change or cancellation — must be made before Thursday 11:59 PM for that Sunday’s delivery.',
          'After the cut-off, the order is already in the kitchen and cannot be changed.',
        ],
      },
      {
        id: 'pause',
        heading: '2. Pausing and skipping',
        bullets: [
          'Skip a single Sunday from your account; the following week continues as normal.',
          'Pause for up to 8 weeks; your next delivery is scheduled when you resume.',
          'Prepaid weeks not delivered remain as account credit and do not expire.',
        ],
      },
      {
        id: 'cancel',
        heading: '3. Cancelling',
        paragraphs: [
          'You can cancel at any time. Cancellation stops future deliveries; it does not automatically refund meals already delivered.',
          'For monthly prepaid plans, any undelivered full weeks are refunded to the original payment method within 7–10 working days, less any discount applied for the prepaid period.',
        ],
      },
      {
        id: 'quality',
        heading: '4. If something is wrong',
        paragraphs: [
          'If a delivery arrives damaged, warm or incorrect, contact us within 24 hours with a photograph. We will replace the affected meals in the next delivery or refund them in full — your choice.',
          'Because fresh food cannot be resold, we cannot accept returns of delivered meals.',
        ],
      },
      {
        id: 'demo',
        heading: '5. This demo build',
        paragraphs: [
          'No payments are collected in this build. Any “refund” action in the admin portal only changes the simulated payment status.',
        ],
      },
    ],
  },
  'food-safety': {
    slug: 'food-safety',
    title: 'Food safety & feeding guide',
    summary:
      'Cold chain, storage, transition guidance and the limits of what food alone can do.',
    updated,
    sections: [
      {
        id: 'cold-chain',
        heading: '1. Our cold chain',
        paragraphs: [
          'Meals are cooked on Saturday morning, blast-chilled to below 5°C, sealed and packed with ice packs in insulated bags. Deliveries are handed over cold and should go straight into the fridge.',
          'If a pack arrives warm to the touch, do not feed it. Contact us and we will replace it.',
        ],
      },
      {
        id: 'storage',
        heading: '2. Storing at home',
        bullets: [
          'Fridge: up to 4 days from the delivery date, in a sealed container below 5°C.',
          'Freezer: up to 30 days. Defrost overnight in the fridge, never on the counter.',
          'Do not refreeze a pack that has already been defrosted.',
          'Warm gently to room temperature before serving. Do not microwave in the pack.',
        ],
      },
      {
        id: 'transition',
        heading: '3. Transitioning',
        paragraphs: [
          'Switch over 5–7 days: 25% fresh with 75% of the old food for two days, then 50/50, then 75/25, then fully fresh. Some dogs need longer.',
          'Stop and speak to your veterinarian if you see repeated vomiting, diarrhoea, itching or lethargy.',
        ],
      },
      {
        id: 'not-vet-advice',
        heading: '4. Not veterinary advice',
        paragraphs: [
          'Happy Paw meals are formulated with veterinary nutritionist guidance, but they are not a treatment for any disease and this page is not veterinary advice. If your dog is pregnant, nursing, growing, on medication or has a diagnosed condition, consult your veterinarian before changing their diet.',
          'Our kitchen handles chicken, lamb, fish and dairy, so trace amounts of allergens are possible even in recipes that do not list them.',
        ],
      },
      {
        id: 'reporting',
        heading: '5. Reporting a problem',
        paragraphs: [
          'Email care@happypaw.in with your order number and a photo. Food safety concerns are reviewed the same day by our kitchen lead.',
        ],
      },
    ],
  },
};

export const legalSlugs = Object.keys(legalDocs) as LegalSlug[];

export function isLegalSlug(value: string | undefined): value is LegalSlug {
  return Boolean(value && legalSlugs.includes(value as LegalSlug));
}
