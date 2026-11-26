-- =============================================================================
-- Happy Paw — Production Catalog Seed
-- Applied to project pghtjewnyogtbbigjanm (Happypaws) on 2026-11-26.
-- Idempotent: safe to re-run without clobbering customer data.
-- =============================================================================

-- 1. Plans
insert into public.plans (
  id, slug, name, weight_band, duration_days, meals_per_day,
  price_inr, compare_at_inr, description, features, is_active, sort_order, badge, per_day_label
)
values
  (
    'plan-trial',
    'starter-trial-box',
    'Starter Trial Box',
    'small',
    3,
    2,
    299,
    420,
    'Three days of gently cooked meals so your dog can try real food before you commit. One per household.',
    array['3 days of meals', '2 meals per day', 'One per household', 'Intro offer'],
    true,
    1,
    'New here?',
    '~₹100/day'
  ),
  (
    'plan-weekly-small',
    'weekly-fresh-small',
    'Weekly Fresh — Small',
    'small',
    7,
    2,
    749,
    null,
    'For dogs up to 10 kg. Portioned by weight and activity, cooked this week, delivered Sunday.',
    array['Dogs up to 10 kg', '2 meals/day', 'Free delivery in-zone', 'Pause or skip anytime'],
    true,
    2,
    null,
    '~₹107/day'
  ),
  (
    'plan-weekly-medium',
    'weekly-fresh-medium',
    'Weekly Fresh — Medium',
    'medium',
    7,
    2,
    1099,
    null,
    'For dogs between 10 and 25 kg. A full week of portioned, gently cooked meals delivered to your door.',
    array['Dogs 10–25 kg', '2 meals/day', 'Free delivery in-zone', 'Pause or skip anytime'],
    true,
    3,
    'Most popular',
    '~₹157/day'
  ),
  (
    'plan-weekly-large',
    'weekly-fresh-large',
    'Weekly Fresh — Large',
    'large',
    7,
    2,
    1499,
    null,
    'For dogs between 25 and 40 kg. Bigger portions, same weekly freshness, delivered in our Hyderabad zones.',
    array['Dogs 25–40 kg', '2 meals/day', 'Free delivery in-zone', 'Pause or skip anytime'],
    true,
    4,
    null,
    '~₹214/day'
  ),
  (
    'plan-monthly-small',
    'monthly-fresh-small',
    'Monthly Fresh — Small',
    'small',
    28,
    2,
    2696,
    2996,
    'Four weeks prepaid for dogs up to 10 kg — 10% less than paying weekly, with priority delivery slots.',
    array['28 days of meals', '10% savings', 'Priority Sunday slot', 'Free delivery in-zone'],
    true,
    5,
    'Best value',
    '~₹96/day'
  ),
  (
    'plan-monthly-medium',
    'monthly-fresh-medium',
    'Monthly Fresh — Medium',
    'medium',
    28,
    2,
    3956,
    4396,
    'Four weeks prepaid for dogs between 10 and 25 kg. Best value for steadily growing appetites.',
    array['28 days of meals', '10% savings', 'Priority Sunday slot', 'Free delivery in-zone'],
    true,
    6,
    'Best value',
    '~₹141/day'
  ),
  (
    'plan-monthly-large',
    'monthly-fresh-large',
    'Monthly Fresh — Large',
    'large',
    28,
    2,
    5396,
    5996,
    'Four weeks prepaid for dogs between 25 and 40 kg — 10% less than weekly, delivered every Sunday.',
    array['28 days of meals', '10% savings', 'Priority Sunday slot', 'Free delivery in-zone'],
    true,
    7,
    'Best value',
    '~₹193/day'
  ),
  (
    'plan-topper',
    'fresh-topper',
    'Fresh Topper',
    'topper',
    7,
    1,
    349,
    null,
    'A week of fresh topper to mix into your existing food. A gentle upgrade, no full switch required.',
    array['7 days of topper', 'Mix into current food', 'Great for picky eaters', 'Free delivery in-zone'],
    true,
    8,
    null,
    '~₹50/day'
  ),
  (
    'plan-special',
    'special-diet',
    'Special Diet',
    'special',
    7,
    2,
    1299,
    null,
    'Therapeutic-style recipes built with your vet for allergies, kidney support or weight management. Requires a vet consult.',
    array['Custom recipe', 'Vet consult included', 'Weekly review', 'Portion override by your vet'],
    true,
    9,
    'Vet consult',
    'from ₹1,299/week'
  )
on conflict (id) do update
  set slug = excluded.slug,
      name = excluded.name,
      weight_band = excluded.weight_band,
      duration_days = excluded.duration_days,
      meals_per_day = excluded.meals_per_day,
      price_inr = excluded.price_inr,
      compare_at_inr = excluded.compare_at_inr,
      description = excluded.description,
      features = excluded.features,
      is_active = excluded.is_active,
      sort_order = excluded.sort_order,
      badge = excluded.badge,
      per_day_label = excluded.per_day_label;

-- 2. Add-ons
insert into public.addons (id, name, price_inr, description, is_active, sort_order)
values
  (
    'addon-treats',
    'Dehydrated treats',
    199,
    'Single-ingredient chicken or fish treats, dehydrated slowly. 80 g pouch.',
    true,
    1
  ),
  (
    'addon-salmon-oil',
    'Salmon oil',
    299,
    'Cold-pressed salmon oil for skin and coat. 100 ml bottle with pump.',
    true,
    2
  ),
  (
    'addon-birthday',
    'Birthday box',
    499,
    'A dog-safe cake, a bandana and a treat tin. Add it to any delivery week.',
    true,
    3
  ),
  (
    'addon-puppy-kit',
    'Puppy starter kit',
    399,
    'Slow-feeder bowl, transition schedule card and a 3-day trial pack.',
    true,
    4
  )
on conflict (id) do update
  set name = excluded.name,
      price_inr = excluded.price_inr,
      description = excluded.description,
      is_active = excluded.is_active,
      sort_order = excluded.sort_order;

-- 3. Recipes
insert into public.recipes (
  id, slug, name, protein, tagline, description, ingredients,
  calories_per_100g, allergens, photo_url, is_active, sort_order
)
values
  (
    'recipe-chicken-pumpkin',
    'chicken-pumpkin-spinach',
    'Chicken, Pumpkin & Spinach',
    'chicken',
    'The gentle everyday bowl',
    'Shredded chicken breast with pumpkin for fibre and spinach for iron, folded through lightly cooked rice. Our most-loved recipe and the easiest switch for sensitive stomachs.',
    '[
      {"item": "Chicken breast", "quantity": "45%"},
      {"item": "Brown rice", "quantity": "25%"},
      {"item": "Pumpkin", "quantity": "18%"},
      {"item": "Spinach", "quantity": "7%"},
      {"item": "Sunflower oil & bone meal", "quantity": "5%"}
    ]'::jsonb,
    128,
    array['Chicken'],
    'images/bowl-chicken-pumpkin.webp',
    true,
    1
  ),
  (
    'recipe-lamb-sweet-potato',
    'lamb-sweet-potato-beans',
    'Lamb, Sweet Potato & Beans',
    'lamb',
    'Hearty, iron-rich, grain-friendly',
    'Minced lamb lean cuts with sweet potato and green beans, balanced with quinoa. A richer bowl for active dogs and fussy eaters who need a little more persuasion.',
    '[
      {"item": "Lean lamb mince", "quantity": "42%"},
      {"item": "Sweet potato", "quantity": "24%"},
      {"item": "Quinoa", "quantity": "16%"},
      {"item": "Green beans", "quantity": "12%"},
      {"item": "Fish oil & calcium mix", "quantity": "6%"}
    ]'::jsonb,
    142,
    array['Lamb', 'Fish (trace, in oil)'],
    'images/bowl-lamb-veg.webp',
    true,
    2
  ),
  (
    'recipe-fish-rice',
    'fish-brown-rice-carrots',
    'Fish, Brown Rice & Carrots',
    'fish',
    'Light, omega-rich, skin-friendly',
    'Flaked white fish with brown rice, carrots and peas. Gently cooked and easy to digest — often chosen for dogs with chicken sensitivities.',
    '[
      {"item": "White fish", "quantity": "40%"},
      {"item": "Brown rice", "quantity": "28%"},
      {"item": "Carrots", "quantity": "16%"},
      {"item": "Green peas", "quantity": "10%"},
      {"item": "Salmon oil & mineral mix", "quantity": "6%"}
    ]'::jsonb,
    118,
    array['Fish'],
    'images/bowl-fish-rice.webp',
    true,
    3
  ),
  (
    'recipe-chicken-rice-sensitive',
    'chicken-rice-sensitive',
    'Chicken & Rice (Sensitive)',
    'chicken',
    'Five ingredients. Nothing extra.',
    'A minimal-ingredient bowl for dogs in transition or with a history of upset stomachs. Chicken, rice, carrot, kelp and essential calcium minerals.',
    '[
      {"item": "Chicken thigh", "quantity": "48%"},
      {"item": "White rice", "quantity": "32%"},
      {"item": "Carrot", "quantity": "14%"},
      {"item": "Kelp", "quantity": "1%"},
      {"item": "Calcium mineral mix", "quantity": "5%"}
    ]'::jsonb,
    134,
    array['Chicken'],
    'images/bowl-chicken-pumpkin.webp',
    true,
    4
  )
on conflict (id) do update
  set slug = excluded.slug,
      name = excluded.name,
      protein = excluded.protein,
      tagline = excluded.tagline,
      description = excluded.description,
      ingredients = excluded.ingredients,
      calories_per_100g = excluded.calories_per_100g,
      allergens = excluded.allergens,
      photo_url = excluded.photo_url,
      is_active = excluded.is_active,
      sort_order = excluded.sort_order;

-- 4. Delivery Zones (Hyderabad West & Central)
insert into public.delivery_zones (id, area_name, pincode, city, is_active, delivery_days)
values
  ('zone-madhapur', 'Madhapur', '500081', 'Hyderabad', true, array['Sunday']),
  ('zone-gachibowli', 'Gachibowli', '500032', 'Hyderabad', true, array['Sunday']),
  ('zone-kondapur', 'Kondapur', '500084', 'Hyderabad', true, array['Sunday']),
  ('zone-hitec', 'HITEC City', '500081', 'Hyderabad', true, array['Sunday']),
  ('zone-jubilee-hills', 'Jubilee Hills', '500033', 'Hyderabad', true, array['Sunday']),
  ('zone-banjara-hills', 'Banjara Hills', '500034', 'Hyderabad', true, array['Sunday']),
  ('zone-kukatpally', 'Kukatpally', '500072', 'Hyderabad', true, array['Sunday']),
  ('zone-narsingi', 'Narsingi', '500089', 'Hyderabad', true, array['Sunday']),
  ('zone-financial-district', 'Financial District', '500032', 'Hyderabad', true, array['Sunday']),
  ('zone-manikonda', 'Manikonda', '500089', 'Hyderabad', true, array['Sunday'])
on conflict (id) do update
  set area_name = excluded.area_name,
      pincode = excluded.pincode,
      city = excluded.city,
      is_active = excluded.is_active,
      delivery_days = excluded.delivery_days;

-- 5. Published Weekly Menus (current Sunday-start week + next 52 Sundays)
with base_sunday as (
  select (current_date - extract(dow from current_date)::integer) as sun
)
insert into public.weekly_menus (id, week_start, recipe_ids, is_published, published_at)
select
  'menu-' || to_char(base_sunday.sun + (w * 7), 'YYYYMMDD'),
  base_sunday.sun + (w * 7),
  case (w % 4)
    when 0 then array['recipe-chicken-pumpkin', 'recipe-lamb-sweet-potato', 'recipe-fish-rice']
    when 1 then array['recipe-chicken-pumpkin', 'recipe-fish-rice', 'recipe-chicken-rice-sensitive']
    when 2 then array['recipe-lamb-sweet-potato', 'recipe-fish-rice', 'recipe-chicken-pumpkin']
    else array['recipe-chicken-rice-sensitive', 'recipe-lamb-sweet-potato', 'recipe-chicken-pumpkin']
  end,
  true,
  now()
from base_sunday, generate_series(0, 52) as w
on conflict (week_start) do update
  set recipe_ids = excluded.recipe_ids,
      is_published = excluded.is_published,
      published_at = coalesce(public.weekly_menus.published_at, excluded.published_at);

-- 6. Promotional Coupons
insert into public.coupons (
  id, code, type, value, min_order_inr, max_redemptions, times_redeemed, expires_at, is_active
)
values
  ('cpn-firstbox', 'FIRSTBOX', 'percent', 20, 500, 1000, 0, '2027-12-31', true),
  ('cpn-hyderabad150', 'HYDERABAD150', 'flat', 150, 999, 500, 0, '2027-12-31', true)
on conflict (id) do update
  set code = excluded.code,
      type = excluded.type,
      value = excluded.value,
      min_order_inr = excluded.min_order_inr,
      max_redemptions = excluded.max_redemptions,
      expires_at = excluded.expires_at,
      is_active = excluded.is_active;
