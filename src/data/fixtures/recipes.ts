import { images } from '@/config/assets';
import type { Recipe } from '@/data/types';

export const recipeFixtures: Recipe[] = [
  {
    id: 'recipe-chicken-pumpkin',
    slug: 'chicken-pumpkin-spinach',
    name: 'Chicken, Pumpkin & Spinach',
    protein: 'chicken',
    tagline: 'The gentle everyday bowl',
    description:
      'Shredded chicken breast with pumpkin for fibre and spinach for iron, folded through lightly cooked rice. Our most-loved recipe and the easiest switch for sensitive stomachs.',
    ingredients: [
      { item: 'Chicken breast', quantity: '45%' },
      { item: 'Brown rice', quantity: '25%' },
      { item: 'Pumpkin', quantity: '18%' },
      { item: 'Spinach', quantity: '7%' },
      { item: 'Sunflower oil & bone meal', quantity: '5%' },
    ],
    caloriesPer100g: 128,
    allergens: [],
    photoUrl: images.bowlChickenPumpkin.src,
    isActive: true,
  },
  {
    id: 'recipe-lamb-sweet-potato',
    slug: 'lamb-sweet-potato-beans',
    name: 'Lamb, Sweet Potato & Beans',
    protein: 'lamb',
    tagline: 'Hearty, iron-rich, grain-friendly',
    description:
      'Minced lamb lean cuts with sweet potato and green beans, balanced with quinoa. A richer bowl for active dogs and fussy eaters who need a little more persuasion.',
    ingredients: [
      { item: 'Lean lamb mince', quantity: '42%' },
      { item: 'Sweet potato', quantity: '24%' },
      { item: 'Quinoa', quantity: '16%' },
      { item: 'Green beans', quantity: '12%' },
      { item: 'Fish oil & calcium mix', quantity: '6%' },
    ],
    caloriesPer100g: 142,
    allergens: ['Fish (trace, in oil)'],
    photoUrl: images.bowlLambVeg.src,
    isActive: true,
  },
  {
    id: 'recipe-fish-rice',
    slug: 'fish-brown-rice-carrots',
    name: 'Fish, Brown Rice & Carrots',
    protein: 'fish',
    tagline: 'Light, omega-rich, skin-friendly',
    description:
      'Flaked white fish with brown rice, carrots and peas. Gently cooked and easy to digest — often chosen for dogs with chicken sensitivities.',
    ingredients: [
      { item: 'White fish', quantity: '40%' },
      { item: 'Brown rice', quantity: '28%' },
      { item: 'Carrots', quantity: '16%' },
      { item: 'Green peas', quantity: '10%' },
      { item: 'Salmon oil & mineral mix', quantity: '6%' },
    ],
    caloriesPer100g: 118,
    allergens: ['Fish'],
    photoUrl: images.bowlFishRice.src,
    isActive: true,
  },
  {
    id: 'recipe-chicken-rice-sensitive',
    slug: 'chicken-rice-sensitive',
    name: 'Chicken & Rice (Sensitive)',
    protein: 'chicken',
    tagline: 'Five ingredients. Nothing extra.',
    description:
      'A minimal-ingredient bowl for dogs in transition or with a history of upset stomachs. Chicken, rice, carrot, a pinch of kelp and nothing else.',
    ingredients: [
      { item: 'Chicken thigh', quantity: '48%' },
      { item: 'White rice', quantity: '32%' },
      { item: 'Carrot', quantity: '14%' },
      { item: 'Kelp & calcium mix', quantity: '6%' },
    ],
    caloriesPer100g: 134,
    allergens: [],
    photoUrl: images.bowlChickenPumpkin.src,
    isActive: true,
  },
];
