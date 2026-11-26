-- =============================================================================
-- Happy Paw — Initial Schema
-- Applied to project pghtjewnyogtbbigjanm (Happypaws) on 2026-11-26.
-- 25 public tables (strict RLS), private helpers, auth trigger, 7 RPCs, storage.
-- =============================================================================

-- =============================================================================
-- private: shared helpers (security definer)
-- =============================================================================
create schema if not exists private;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
      and deleted_at is null
  );
$$;

create or replace function private.guard_profile_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is not null and not private.is_admin() then
    if new.id is distinct from old.id then
      raise exception 'Cannot change profile id';
    end if;
    if new.role is distinct from old.role then
      raise exception 'Cannot change profile role';
    end if;
    if lower(new.email) is distinct from lower(old.email) then
      raise exception 'Cannot change profile email directly';
    end if;
    if new.created_at is distinct from old.created_at then
      raise exception 'Cannot change created_at';
    end if;
  end if;
  return new;
end;
$$;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, role, full_name, email, phone)
  values (
    new.id,
    'customer',
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
      split_part(coalesce(new.email, 'Customer'), '@', 1)
    ),
    lower(coalesce(new.email, '')),
    nullif(trim(new.raw_user_meta_data ->> 'phone'), '')
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(nullif(public.profiles.full_name, ''), excluded.full_name),
        phone = coalesce(public.profiles.phone, excluded.phone);

  insert into public.notification_prefs (profile_id)
  values (new.id)
  on conflict (profile_id) do nothing;

  return new;
end;
$$;

create or replace function private.is_vet_for_dog(p_dog_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.dogs d
    join public.vets v on v.id = d.referred_vet_id
    where d.id = p_dog_id
      and v.profile_id = (select auth.uid())
      and v.status = 'approved'
  );
$$;

-- =============================================================================
-- public: profiles & account
-- =============================================================================
create table if not exists public.profiles (
  id uuid primary key,
  role text not null default 'customer',
  full_name text,
  email text,
  phone text,
  avatar_url text,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notification_prefs (
  profile_id uuid primary key,
  order_updates boolean not null default true,
  delivery_reminders boolean not null default true,
  offers boolean not null default false,
  whatsapp boolean not null default true,
  updated_at timestamptz not null default now()
);

-- =============================================================================
-- public: catalog
-- =============================================================================
create table if not exists public.plans (
  id text primary key,
  slug text not null,
  name text not null,
  weight_band text not null,
  duration_days integer not null,
  meals_per_day integer not null,
  price_inr integer not null,
  compare_at_inr integer,
  description text,
  features text[] not null default '{}',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  badge text,
  per_day_label text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.addons (
  id text primary key,
  name text not null,
  price_inr integer not null,
  description text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.recipes (
  id text primary key,
  slug text not null,
  name text not null,
  protein text not null,
  tagline text,
  description text,
  ingredients jsonb not null default '[]'::jsonb,
  calories_per_100g integer,
  allergens text[] not null default '{}',
  photo_url text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.weekly_menus (
  id text primary key,
  week_start date not null,
  recipe_ids text[] not null default '{}',
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.delivery_zones (
  id text primary key,
  area_name text not null,
  pincode text not null,
  city text not null default 'Hyderabad',
  is_active boolean not null default true,
  delivery_days text[] not null default array['Sunday'],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.waitlist_entries (
  id uuid primary key default gen_random_uuid(),
  email text,
  pincode text,
  created_at timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid,
  full_name text,
  email text,
  phone text,
  topic text,
  message text,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

create table if not exists public.coupons (
  id text primary key,
  code text not null,
  type text not null,
  value integer not null,
  min_order_inr integer not null default 0,
  max_redemptions integer not null default 1000,
  times_redeemed integer not null default 0,
  expires_at date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================================================
-- public: vets & dogs
-- =============================================================================
create table if not exists public.vets (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid,
  clinic_name text,
  city text not null default 'Hyderabad',
  license_no text,
  status text not null default 'pending',
  referral_code text,
  created_at timestamptz not null default now()
);

create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid,
  label text not null default 'Home',
  line1 text,
  line2 text,
  area text,
  city text not null default 'Hyderabad',
  pincode text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.dogs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid,
  referred_vet_id uuid,
  name text not null,
  photo_url text,
  breed text,
  dob date,
  weight_kg numeric,
  body_condition text,
  activity_level text,
  neutered boolean not null default false,
  allergies text[],
  medical_notes text,
  current_food text,
  picky boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.dog_weights (
  id uuid primary key default gen_random_uuid(),
  dog_id uuid,
  weight_kg numeric,
  recorded_at date not null default CURRENT_DATE,
  created_at timestamptz not null default now()
);

create table if not exists public.diet_plans (
  id uuid primary key default gen_random_uuid(),
  dog_id uuid,
  vet_id uuid,
  recipe_ids text[] not null default '{}',
  portion_override_g integer,
  notes text,
  status text not null default 'pending',
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================================================
-- public: subscriptions, orders & payments
-- =============================================================================
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid,
  dog_id uuid,
  plan_id text,
  status text not null default 'active',
  start_date date,
  next_delivery_date date,
  address_id uuid,
  price_snapshot_inr integer,
  coupon_id text,
  paused_until date,
  addon_ids text[] not null default '{}',
  cancellation_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid,
  customer_id uuid,
  dog_id uuid,
  delivery_date date,
  status text not null default 'planned',
  subtotal_inr integer,
  discount_inr integer,
  total_inr integer,
  address_snapshot jsonb,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid,
  item_type text,
  item_id text,
  name_snapshot text,
  qty integer not null default 1,
  unit_price_inr integer,
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid,
  customer_id uuid,
  amount_inr integer,
  status text not null default 'pending',
  method text,
  gateway_ref text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================================================
-- public: support, routing, audit
-- =============================================================================
create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid,
  subject text,
  category text,
  priority text,
  status text,
  assigned_to uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid,
  sender_id uuid,
  body text,
  is_internal boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.route_runs (
  id uuid primary key default gen_random_uuid(),
  route_date date,
  driver_name text,
  status text not null default 'draft',
  notes text,
  area_label text not null default 'Hyderabad West',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.route_stops (
  id uuid primary key default gen_random_uuid(),
  route_run_id uuid,
  order_id uuid,
  sequence integer,
  status text not null default 'pending',
  delivered_at timestamptz,
  proof_note text,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_notes (
  profile_id uuid primary key,
  note text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  action text,
  entity text,
  entity_id text,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- =============================================================================
-- updated_at triggers on every table that carries the column
-- =============================================================================
do $$
declare
  t text;
begin
  foreach t in array array[
    'public.profiles', 'public.plans', 'public.addons', 'public.recipes',
    'public.weekly_menus', 'public.delivery_zones', 'public.coupons',
    'public.addresses', 'public.dogs', 'public.diet_plans',
    'public.subscriptions', 'public.orders', 'public.payments',
    'public.support_tickets', 'public.route_runs'
  ]
  loop
    execute format('create trigger if not exists trg_%s_updated_at before update on %s
      for each row execute function private.set_updated_at()',
      replace(t, 'public.', ''), t);
  end loop;
end;
$$;

-- =============================================================================
-- auth.users trigger: provision a profile on signup
-- =============================================================================
create or replace trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();

-- =============================================================================
-- RPCs (security definer)
-- =============================================================================
create or replace function public.join_waitlist(p_email text, p_pincode text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_clean_email text := lower(trim(coalesce(p_email, '')));
  v_clean_pin text := trim(coalesce(p_pincode, ''));
  v_entry public.waitlist_entries;
begin
  if v_clean_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'Enter a valid email address.' using errcode = '22023';
  end if;
  if v_clean_pin !~ '^[0-9]{6}$' then
    raise exception 'Enter a 6-digit Indian pincode.' using errcode = '22023';
  end if;

  insert into public.waitlist_entries (email, pincode)
  values (v_clean_email, v_clean_pin)
  on conflict (email, pincode)
  do update set email = excluded.email
  returning * into v_entry;

  return jsonb_build_object(
    'id', v_entry.id,
    'email', v_entry.email,
    'pincode', v_entry.pincode,
    'createdAt', v_entry.created_at
  );
end;
$$;

create or replace function public.submit_contact_message(p_full_name text, p_email text, p_phone text, p_topic text, p_message text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
  v_uid uuid := (select auth.uid());
begin
  if char_length(trim(coalesce(p_full_name, ''))) < 2 then
    raise exception 'Please enter your name.' using errcode = '22023';
  end if;
  if trim(coalesce(p_email, '')) !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'Please enter a valid email address.' using errcode = '22023';
  end if;
  if char_length(trim(coalesce(p_message, ''))) < 10 then
    raise exception 'Please tell us a little more (at least 10 characters).' using errcode = '22023';
  end if;

  insert into public.contact_messages (profile_id, full_name, email, phone, topic, message)
  values (
    v_uid,
    trim(p_full_name),
    lower(trim(p_email)),
    nullif(trim(coalesce(p_phone, '')), ''),
    coalesce(nullif(trim(p_topic), ''), 'Meal plans & portions'),
    trim(p_message)
  )
  returning id into v_id;

  return v_id;
end;
$$;

create or replace function public.validate_coupon(p_code text, p_order_value_inr integer)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_clean text := upper(trim(coalesce(p_code, '')));
  v_coupon public.coupons;
  v_discount integer := 0;
begin
  if v_clean = '' then
    return jsonb_build_object(
      'valid', false,
      'discountInr', 0,
      'message', 'Enter a coupon code to apply it.',
      'coupon', null
    );
  end if;

  select *
  into v_coupon
  from public.coupons
  where upper(code) = v_clean
  limit 1;

  if not found or not v_coupon.is_active then
    return jsonb_build_object(
      'valid', false,
      'discountInr', 0,
      'message', 'We couldn''t find an active coupon with that code.',
      'coupon', null
    );
  end if;

  if v_coupon.expires_at < current_date then
    return jsonb_build_object(
      'valid', false,
      'discountInr', 0,
      'message', 'This coupon has expired.',
      'coupon', null
    );
  end if;

  if v_coupon.times_redeemed >= v_coupon.max_redemptions then
    return jsonb_build_object(
      'valid', false,
      'discountInr', 0,
      'message', 'This coupon has reached its redemption limit.',
      'coupon', null
    );
  end if;

  if coalesce(p_order_value_inr, 0) < v_coupon.min_order_inr then
    return jsonb_build_object(
      'valid', false,
      'discountInr', 0,
      'message', format('Minimum order of ₹%s required for %s.', v_coupon.min_order_inr, v_coupon.code),
      'coupon', null
    );
  end if;

  if v_coupon.type = 'percent' then
    v_discount := round((p_order_value_inr::numeric * v_coupon.value::numeric) / 100.0)::integer;
  else
    v_discount := least(v_coupon.value, p_order_value_inr);
  end if;

  return jsonb_build_object(
    'valid', true,
    'discountInr', v_discount,
    'message', format('%s applied — ₹%s off your first box.', v_coupon.code, v_discount),
    'coupon', jsonb_build_object(
      'id', v_coupon.id,
      'code', v_coupon.code,
      'type', v_coupon.type,
      'value', v_coupon.value,
      'minOrderInr', v_coupon.min_order_inr,
      'maxRedemptions', v_coupon.max_redemptions,
      'timesRedeemed', v_coupon.times_redeemed,
      'expiresAt', v_coupon.expires_at,
      'isActive', v_coupon.is_active
    )
  );
end;
$$;

create or replace function public.set_default_address(p_address_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
begin
  if v_uid is null then
    raise exception 'Authentication required.' using errcode = '42501';
  end if;

  if not exists (
    select 1 from public.addresses
    where id = p_address_id and profile_id = v_uid
  ) then
    raise exception 'Address not found.' using errcode = 'P0002';
  end if;

  update public.addresses
  set is_default = (id = p_address_id)
  where profile_id = v_uid;
end;
$$;

create or replace function public.create_support_ticket(p_subject text, p_category text, p_priority text, p_message text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_ticket_id uuid;
begin
  if v_uid is null then
    raise exception 'Authentication required.' using errcode = '42501';
  end if;

  if char_length(trim(coalesce(p_subject, ''))) < 3 then
    raise exception 'Subject must be at least 3 characters.' using errcode = '22023';
  end if;
  if char_length(trim(coalesce(p_message, ''))) < 1 then
    raise exception 'Message cannot be empty.' using errcode = '22023';
  end if;

  insert into public.support_tickets (customer_id, subject, category, priority, status)
  values (
    v_uid,
    trim(p_subject),
    coalesce(nullif(trim(p_category), ''), 'General'),
    case when p_priority in ('low', 'normal', 'high') then p_priority else 'normal' end,
    'open'
  )
  returning id into v_ticket_id;

  insert into public.support_messages (ticket_id, sender_id, body, is_internal)
  values (v_ticket_id, v_uid, trim(p_message), false);

  return v_ticket_id;
end;
$$;

create or replace function public.create_subscription_checkout(
  p_dog_id uuid,
  p_plan_id text,
  p_addon_ids text[] DEFAULT '{}'::text[],
  p_address_id uuid DEFAULT NULL::uuid,
  p_coupon_code text DEFAULT NULL::text,
  p_notes text DEFAULT NULL::text,
  p_payment_method text DEFAULT 'UPI'::text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_dog public.dogs;
  v_plan public.plans;
  v_address public.addresses;
  v_coupon public.coupons;
  v_addon_ids text[] := coalesce(p_addon_ids, '{}');
  v_addons_total integer := 0;
  v_subtotal integer := 0;
  v_discount integer := 0;
  v_total integer := 0;
  v_dow integer;
  v_next_sunday date;
  v_subscription_id uuid;
  v_order_id uuid;
  v_payment_id uuid;
begin
  if v_uid is null then
    raise exception 'Please sign in to start a subscription.' using errcode = '42501';
  end if;

  if exists (
    select 1 from public.profiles
    where id = v_uid and deleted_at is not null
  ) then
    raise exception 'This account has been deactivated.' using errcode = '42501';
  end if;

  select * into v_dog
  from public.dogs
  where id = p_dog_id and owner_id = v_uid;
  if not found then
    raise exception 'We couldn''t find that dog on your account.' using errcode = 'P0002';
  end if;

  select * into v_plan
  from public.plans
  where id = p_plan_id and is_active = true;
  if not found then
    raise exception 'That meal plan is no longer available.' using errcode = 'P0002';
  end if;

  select * into v_address
  from public.addresses
  where id = p_address_id and profile_id = v_uid;
  if not found then
    raise exception 'Please pick a valid delivery address.' using errcode = 'P0002';
  end if;

  -- Enforce Hyderabad delivery zone coverage on the chosen address pincode
  if not exists (
    select 1 from public.delivery_zones
    where pincode = v_address.pincode and is_active = true
  ) then
    raise exception 'We do not deliver to pincode % yet.', v_address.pincode using errcode = '22023';
  end if;

  -- Enforce one Starter Trial Box per household/account
  if v_plan.slug = 'starter-trial-box' then
    if exists (
      select 1 from public.subscriptions
      where customer_id = v_uid and plan_id = v_plan.id
    ) then
      raise exception 'The Starter Trial Box is limited to one per household.' using errcode = '22023';
    end if;
  end if;

  -- Deduplicate and validate active add-ons, computing server-side price
  select
    coalesce(array_agg(a.id order by a.sort_order, a.id), '{}'),
    coalesce(sum(a.price_inr), 0)::integer
  into v_addon_ids, v_addons_total
  from public.addons a
  where a.is_active = true
    and a.id = any(v_addon_ids);

  v_subtotal := v_plan.price_inr + v_addons_total;

  -- Optional coupon validation with row lock
  if nullif(trim(coalesce(p_coupon_code, '')), '') is not null then
    select * into v_coupon
    from public.coupons
    where upper(code) = upper(trim(p_coupon_code))
    for update;

    if not found or not v_coupon.is_active then
      raise exception 'We couldn''t find an active coupon with that code.' using errcode = '22023';
    end if;
    if v_coupon.expires_at < current_date then
      raise exception 'This coupon has expired.' using errcode = '22023';
    end if;
    if v_coupon.times_redeemed >= v_coupon.max_redemptions then
      raise exception 'This coupon has reached its redemption limit.' using errcode = '22023';
    end if;
    if v_subtotal < v_coupon.min_order_inr then
      raise exception 'Minimum order of ₹% required for %.', v_coupon.min_order_inr, v_coupon.code using errcode = '22023';
    end if;

    if v_coupon.type = 'percent' then
      v_discount := round((v_subtotal::numeric * v_coupon.value::numeric) / 100.0)::integer;
    else
      v_discount := least(v_coupon.value, v_subtotal);
    end if;

    update public.coupons
    set times_redeemed = times_redeemed + 1
    where id = v_coupon.id;
  end if;

  v_total := greatest(0, v_subtotal - v_discount);

  -- Compute next Sunday delivery date respecting Thursday 11:59 PM IST cutoff:
  -- Mon(1)..Thu(4) -> upcoming Sunday; Fri(5), Sat(6), Sun(0) -> Sunday of next week if past Thu cutoff
  v_dow := extract(dow from (now() at time zone 'Asia/Kolkata'))::integer;
  if v_dow between 1 and 4 then
    v_next_sunday := (now() at time zone 'Asia/Kolkata')::date + (7 - v_dow);
  elsif v_dow = 0 then
    v_next_sunday := (now() at time zone 'Asia/Kolkata')::date + 7;
  else
    -- Friday (5) or Saturday (6): Thursday 11:59 PM cutoff has passed, schedule for following Sunday
    v_next_sunday := (now() at time zone 'Asia/Kolkata')::date + (7 - v_dow) + 7;
  end if;

  insert into public.subscriptions (
    customer_id,
    dog_id,
    plan_id,
    status,
    start_date,
    next_delivery_date,
    address_id,
    price_snapshot_inr,
    coupon_id,
    addon_ids
  )
  values (
    v_uid,
    v_dog.id,
    v_plan.id,
    'active',
    current_date,
    v_next_sunday,
    v_address.id,
    v_plan.price_inr,
    v_coupon.id,
    v_addon_ids
  )
  returning id into v_subscription_id;

  insert into public.orders (
    subscription_id,
    customer_id,
    dog_id,
    delivery_date,
    status,
    subtotal_inr,
    discount_inr,
    total_inr,
    address_snapshot,
    notes
  )
  values (
    v_subscription_id,
    v_uid,
    v_dog.id,
    v_next_sunday,
    'planned',
    v_subtotal,
    v_discount,
    v_total,
    jsonb_build_object(
      'label', v_address.label,
      'line1', v_address.line1,
      'line2', v_address.line2,
      'area', v_address.area,
      'city', v_address.city,
      'pincode', v_address.pincode
    ),
    nullif(trim(coalesce(p_notes, '')), '')
  )
  returning id into v_order_id;

  -- Order line item: meal plan
  insert into public.order_items (order_id, item_type, item_id, name_snapshot, qty, unit_price_inr)
  values (v_order_id, 'plan', v_plan.id, v_plan.name, 1, v_plan.price_inr);

  -- Order line items: selected add-ons
  insert into public.order_items (order_id, item_type, item_id, name_snapshot, qty, unit_price_inr)
  select v_order_id, 'addon', a.id, a.name, 1, a.price_inr
  from public.addons a
  where a.id = any(v_addon_ids)
  order by a.sort_order, a.id;

  -- Record payment row (pending gateway capture until Razorpay webhook settles it)
  insert into public.payments (
    order_id,
    customer_id,
    amount_inr,
    status,
    method,
    gateway_ref
  )
  values (
    v_order_id,
    v_uid,
    v_total,
    'pending',
    coalesce(nullif(trim(p_payment_method), ''), 'UPI'),
    'hp_ord_' || replace(left(v_order_id::text, 8), '-', '')
  )
  returning id into v_payment_id;

  insert into public.audit_logs (actor_id, action, entity, entity_id, meta)
  values (
    v_uid,
    'subscription.created',
    'subscription',
    v_subscription_id::text,
    jsonb_build_object('order_id', v_order_id, 'plan_id', v_plan.id, 'total_inr', v_total)
  );

  return jsonb_build_object(
    'subscriptionId', v_subscription_id,
    'orderId', v_order_id,
    'paymentId', v_payment_id
  );
end;
$$;

create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
begin
  if v_uid is null then
    raise exception 'Authentication required.' using errcode = '42501';
  end if;

  update public.subscriptions
  set status = 'cancelled',
      paused_until = null,
      cancellation_reason = 'Account deleted by customer'
  where customer_id = v_uid
    and status in ('active', 'paused', 'past_due');

  update public.orders
  set status = 'cancelled'
  where customer_id = v_uid
    and status = 'planned';

  update public.profiles
  set deleted_at = now()
  where id = v_uid;

  insert into public.audit_logs (actor_id, action, entity, entity_id, meta)
  values (v_uid, 'account.deleted', 'profile', v_uid::text, '{}'::jsonb);
end;
$$;

-- =============================================================================
-- Row Level Security
-- =============================================================================
alter table public.profiles enable row level security;
alter table public.notification_prefs enable row level security;
alter table public.plans enable row level security;
alter table public.addons enable row level security;
alter table public.recipes enable row level security;
alter table public.weekly_menus enable row level security;
alter table public.delivery_zones enable row level security;
alter table public.waitlist_entries enable row level security;
alter table public.contact_messages enable row level security;
alter table public.coupons enable row level security;
alter table public.vets enable row level security;
alter table public.addresses enable row level security;
alter table public.dogs enable row level security;
alter table public.dog_weights enable row level security;
alter table public.diet_plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.support_tickets enable row level security;
alter table public.support_messages enable row level security;
alter table public.route_runs enable row level security;
alter table public.route_stops enable row level security;
alter table public.admin_notes enable row level security;
alter table public.audit_logs enable row level security;

-- Catalog
create policy "Public can read active plans"
  on public.plans for select using ((is_active = true) OR private.is_admin());
create policy "Admins manage plans"
  on public.plans for all using private.is_admin() with check private.is_admin();

create policy "Public can read active addons"
  on public.addons for select using ((is_active = true) OR private.is_admin());
create policy "Admins manage addons"
  on public.addons for all using private.is_admin() with check private.is_admin();

create policy "Public can read active recipes"
  on public.recipes for select using ((is_active = true) OR private.is_admin());
create policy "Admins manage recipes"
  on public.recipes for all using private.is_admin() with check private.is_admin();

create policy "Public can read published weekly menus"
  on public.weekly_menus for select using ((is_published = true) OR private.is_admin());
create policy "Admins manage weekly menus"
  on public.weekly_menus for all using private.is_admin() with check private.is_admin();

create policy "Public can read delivery zones"
  on public.delivery_zones for select using ((is_active = true) OR private.is_admin());
create policy "Admins manage delivery zones"
  on public.delivery_zones for all using private.is_admin() with check private.is_admin();

create policy "Admins manage coupons"
  on public.coupons for all using private.is_admin() with check private.is_admin();

create policy "Admins manage waitlist entries"
  on public.waitlist_entries for all using private.is_admin() with check private.is_admin();

create policy "Admins manage contact messages"
  on public.contact_messages for all using private.is_admin() with check private.is_admin();

-- Profiles & prefs
create policy "Users can view own profile or admin all"
  on public.profiles for select using (((select auth.uid()) = id) OR private.is_admin());
create policy "Users can insert own customer profile"
  on public.profiles for insert with check (((select auth.uid()) = id) AND (role = 'customer'::text));
create policy "Users can update own profile or admin all"
  on public.profiles for update
  using ((((select auth.uid()) = id) AND (deleted_at IS NULL)) OR private.is_admin())
  with check (((select auth.uid()) = id) OR private.is_admin());

create policy "Users can view own notification prefs"
  on public.notification_prefs for select using (((select auth.uid()) = profile_id) OR private.is_admin());
create policy "Users can insert own notification prefs"
  on public.notification_prefs for insert with check (((select auth.uid()) = profile_id) OR private.is_admin());
create policy "Users can update own notification prefs"
  on public.notification_prefs for update
  using (((select auth.uid()) = profile_id) OR private.is_admin())
  with check (((select auth.uid()) = profile_id) OR private.is_admin());

-- Vets
create policy "Authenticated users can view approved vets or own vet profile"
  on public.vets for select using ((status = 'approved'::text) OR ((select auth.uid()) = profile_id) OR private.is_admin());
create policy "Users can apply as vet for own profile"
  on public.vets for insert with check (((select auth.uid()) = profile_id) AND (status = 'pending'::text));
create policy "Admins manage vets"
  on public.vets for all using private.is_admin() with check private.is_admin();

-- Addresses
create policy "Users can view own addresses or admin all"
  on public.addresses for select using (((select auth.uid()) = profile_id) OR private.is_admin());
create policy "Users can insert own addresses"
  on public.addresses for insert with check (((select auth.uid()) = profile_id) OR private.is_admin());
create policy "Users can update own addresses"
  on public.addresses for update
  using (((select auth.uid()) = profile_id) OR private.is_admin())
  with check (((select auth.uid()) = profile_id) OR private.is_admin());
create policy "Users can delete own addresses"
  on public.addresses for delete using (((select auth.uid()) = profile_id) OR private.is_admin());

-- Dogs & weights
create policy "Owners, assigned vets and admins can view dogs"
  on public.dogs for select using (((select auth.uid()) = owner_id) OR private.is_vet_for_dog(id) OR private.is_admin());
create policy "Owners can insert own dogs"
  on public.dogs for insert with check (((select auth.uid()) = owner_id) OR private.is_admin());
create policy "Owners can update own dogs"
  on public.dogs for update
  using (((select auth.uid()) = owner_id) OR private.is_admin())
  with check (((select auth.uid()) = owner_id) OR private.is_admin());
create policy "Owners can delete own dogs"
  on public.dogs for delete using (((select auth.uid()) = owner_id) OR private.is_admin());

create policy "Owners, assigned vets and admins can view dog weights"
  on public.dog_weights for select
  using (
    (EXISTS (
      SELECT 1 FROM dogs d
      WHERE (d.id = dog_weights.dog_id)
        AND ((d.owner_id = (select auth.uid())) OR private.is_vet_for_dog(d.id))
    )) OR private.is_admin()
  );
create policy "Owners can insert dog weights"
  on public.dog_weights for insert with check (
    (EXISTS (
      SELECT 1 FROM dogs d
      WHERE (d.id = dog_weights.dog_id) AND (d.owner_id = (select auth.uid()))
    )) OR private.is_admin()
  );

-- Diet plans
create policy "Owners, vets and admins can view diet plans"
  on public.diet_plans for select
  using (
    (EXISTS (
      SELECT 1 FROM dogs d
      WHERE (d.id = diet_plans.dog_id) AND (d.owner_id = (select auth.uid()))
    ))
    OR (EXISTS (
      SELECT 1 FROM vets v
      WHERE (v.id = diet_plans.vet_id) AND (v.profile_id = (select auth.uid()))
    ))
    OR private.is_admin()
  );
create policy "Approved vets can create and update own diet plans"
  on public.diet_plans for all
  using (
    (EXISTS (
      SELECT 1 FROM vets v
      WHERE (v.id = diet_plans.vet_id)
        AND (v.profile_id = (select auth.uid()))
        AND (v.status = 'approved'::text)
    )) OR private.is_admin()
  )
  with check (
    (EXISTS (
      SELECT 1 FROM vets v
      WHERE (v.id = diet_plans.vet_id)
        AND (v.profile_id = (select auth.uid()))
        AND (v.status = 'approved'::text)
    )) OR private.is_admin()
  );

-- Subscriptions
create policy "Customers and admins can view subscriptions"
  on public.subscriptions for select using (((select auth.uid()) = customer_id) OR private.is_admin());
create policy "Customers can update own subscriptions"
  on public.subscriptions for update
  using (((select auth.uid()) = customer_id) OR private.is_admin())
  with check (
    ((((select auth.uid()) = customer_id)
      AND (EXISTS (SELECT 1 FROM dogs d WHERE (d.id = subscriptions.dog_id) AND (d.owner_id = (select auth.uid()))))
      AND (EXISTS (SELECT 1 FROM addresses a WHERE (a.id = subscriptions.address_id) AND (a.profile_id = (select auth.uid())))))
    ) OR private.is_admin()
  );
create policy "Admins can insert and delete subscriptions"
  on public.subscriptions for all using private.is_admin() with check private.is_admin();

-- Orders & payments
create policy "Customers and admins can view orders"
  on public.orders for select using (((select auth.uid()) = customer_id) OR private.is_admin());
create policy "Admins manage orders"
  on public.orders for all using private.is_admin() with check private.is_admin();

create policy "Customers and admins can view order items"
  on public.order_items for select
  using (
    (EXISTS (
      SELECT 1 FROM orders o
      WHERE (o.id = order_items.order_id) AND (o.customer_id = (select auth.uid()))
    )) OR private.is_admin()
  );
create policy "Admins manage order items"
  on public.order_items for all using private.is_admin() with check private.is_admin();

create policy "Customers and admins can view payments"
  on public.payments for select using (((select auth.uid()) = customer_id) OR private.is_admin());
create policy "Admins manage payments"
  on public.payments for all using private.is_admin() with check private.is_admin();

-- Support
create policy "Customers and admins can view support tickets"
  on public.support_tickets for select using (((select auth.uid()) = customer_id) OR private.is_admin());
create policy "Customers can create own support tickets"
  on public.support_tickets for insert with check (((select auth.uid()) = customer_id) OR private.is_admin());
create policy "Customers can update own tickets or admin all"
  on public.support_tickets for update
  using (((select auth.uid()) = customer_id) OR private.is_admin())
  with check (((select auth.uid()) = customer_id) OR private.is_admin());

create policy "Customers view non-internal messages on own tickets; admins view all"
  on public.support_messages for select
  using (
    ((is_internal = false)
      AND (EXISTS (
        SELECT 1 FROM support_tickets t
        WHERE (t.id = support_messages.ticket_id) AND (t.customer_id = (select auth.uid()))
      )))
    OR private.is_admin()
  );
create policy "Customers post non-internal replies to own tickets; admins post"
  on public.support_messages for insert with check (
    (((sender_id = (select auth.uid()))
      AND (is_internal = false)
      AND (EXISTS (
        SELECT 1 FROM support_tickets t
        WHERE (t.id = support_messages.ticket_id) AND (t.customer_id = (select auth.uid()))
      )))
    ) OR private.is_admin()
  );

-- Routing & admin
create policy "Admins manage route runs"
  on public.route_runs for all using private.is_admin() with check private.is_admin();
create policy "Admins manage route stops"
  on public.route_stops for all using private.is_admin() with check private.is_admin();
create policy "Admins manage admin notes"
  on public.admin_notes for all using private.is_admin() with check private.is_admin();
create policy "Admins view audit logs"
  on public.audit_logs for select using private.is_admin();
create policy "Admins insert audit logs"
  on public.audit_logs for insert with check private.is_admin();

-- =============================================================================
-- Storage: dog-photos, recipe-photos
-- =============================================================================
insert into storage.buckets (id, name, public)
values ('dog-photos', 'dog-photos', true),
       ('recipe-photos', 'recipe-photos', true)
on conflict (id) do update set name = excluded.name, public = excluded.public;

create policy "Dog photos: owners manage own folder"
  on storage.objects for all
  using (
    bucket_id = 'dog-photos'
    and (
      auth.role() = 'service_role'
      or storage.foldername(name)[1] = auth.uid()::text
    )
  )
  with check (
    bucket_id = 'dog-photos'
    and (
      auth.role() = 'service_role'
      or storage.foldername(name)[1] = auth.uid()::text
    )
  );

create policy "Recipe photos readable by all"
  on storage.objects for select using (bucket_id = 'recipe-photos');

create policy "Recipe photos admin write"
  on storage.objects for all
  using ((bucket_id = 'recipe-photos' and auth.role() = 'service_role') or private.is_admin())
  with check ((bucket_id = 'recipe-photos' and auth.role() = 'service_role') or private.is_admin());
