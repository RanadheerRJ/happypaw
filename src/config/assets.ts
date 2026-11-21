/**
 * Imagery is centralised here so the whole site can be re-shot by editing one file.
 *
 * These are locally generated demo photographs (see README > Imagery). To swap in
 * Unsplash photos, replace `src` with the full `https://images.unsplash.com/...` URL
 * and keep the `alt` + intrinsic `width`/`height` (prevents layout shift).
 */
export interface ImageAsset {
  src: string;
  alt: string;
  width: number;
  height: number;
  credit?: string;
}

const local = (file: string): string => `${import.meta.env.BASE_URL}images/${file}`;

export const images = {
  heroDogBowl: {
    src: local('hero-dog-bowl.webp'),
    alt: 'A golden retriever sitting beside a bowl of freshly cooked chicken, pumpkin and spinach',
    width: 768,
    height: 1376,
    credit: 'Happy Paw studio (demo)',
  },
  bowlChickenPumpkin: {
    src: local('bowl-chicken-pumpkin.webp'),
    alt: 'Bowl of gently cooked chicken, pumpkin, spinach and rice',
    width: 900,
    height: 900,
  },
  bowlLambVeg: {
    src: local('bowl-lamb-veg.webp'),
    alt: 'Bowl of minced lamb, sweet potato, green beans and quinoa',
    width: 900,
    height: 900,
  },
  bowlFishRice: {
    src: local('bowl-fish-rice.webp'),
    alt: 'Bowl of flaked white fish, brown rice, carrots and peas',
    width: 900,
    height: 900,
  },
  kitchen: {
    src: local('kitchen-cooking.webp'),
    alt: 'A chef portioning freshly cooked meals in the Happy Paw kitchen',
    width: 1376,
    height: 768,
  },
  vet: {
    src: local('vet-dog.webp'),
    alt: 'A veterinarian gently examining a labrador in a bright clinic',
    width: 1376,
    height: 768,
  },
  dogIndie: {
    src: local('dog-portrait-indie.webp'),
    alt: 'A healthy Indian indie dog sitting in a sunlit Hyderabad apartment',
    width: 768,
    height: 1376,
  },
  dogPuppy: {
    src: local('dog-puppy.webp'),
    alt: 'A beagle puppy beside a small bowl of fresh food on a cream sofa',
    width: 768,
    height: 1376,
  },
} satisfies Record<string, ImageAsset>;

export type ImageKey = keyof typeof images;

/** Gallery used by the "Loved by Hyderabad dogs" marquee. */
export const marqueeImages: ImageAsset[] = [
  images.dogIndie,
  images.dogPuppy,
  images.bowlChickenPumpkin,
  images.heroDogBowl,
  images.bowlLambVeg,
  images.kitchen,
  images.bowlFishRice,
  images.vet,
];
