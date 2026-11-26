-- =============================================================================
-- Happy Paw — helper RPCs used by the live adapter
-- schedule_subscription_delivery: creates the planned order for a paused
-- subscription that is resumed (orders are admin-insertable via RLS, so the
-- server creates them here).
-- create_suggested_diet_plan: provisions the pending diet plan when a dog
-- profile is created (diet plans are vet-insertable via RLS).
-- =============================================================================

create or replace function public.schedule_subscription_delivery(p_subscription_id uuid, p_delivery_date date)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_sub public.subscriptions;
  v_plan public.plans;
  v_coupon public.coupons;
  v_address public.addresses;
  v_addons_total integer := 0;
  v_subtotal integer := 0;
  v_discount integer := 0;
  v_total integer := 0;
  v_order_id uuid;
begin
  if v_uid is null then
    raise exception 'Authentication required.' using errcode = '42501';
  end if;

  select * into v_sub
  from public.subscriptions
  where id = p_subscription_id and customer_id = v_uid;
  if not found then
    raise exception 'Subscription not found.' using errcode = 'P0002';
  end if;
  if v_sub.status not in ('active', 'paused') then
    raise exception 'Only active subscriptions can schedule deliveries.' using errcode = '22023';
  end if;

  select * into v_plan from public.plans where id = v_sub.plan_id;
  if not found then
    raise exception 'That meal plan is no longer available.' using errcode = 'P0002';
  end if;

  select coalesce(sum(a.price_inr), 0)::integer into v_addons_total
  from public.addons a
  where a.is_active = true
    and a.id = any(v_sub.addon_ids);

  v_subtotal := v_plan.price_inr + v_addons_total;

  if v_sub.coupon_id is not null then
    select * into v_coupon from public.coupons where id = v_sub.coupon_id;
    if v_coupon.type = 'percent' then
      v_discount := round((v_subtotal::numeric * v_coupon.value::numeric) / 100.0)::integer;
    else
      v_discount := least(v_coupon.value, v_subtotal);
    end if;
  end if;

  v_total := greatest(0, v_subtotal - v_discount);

  select * into v_address from public.addresses where id = v_sub.address_id;

  insert into public.orders (
    subscription_id,
    customer_id,
    dog_id,
    delivery_date,
    status,
    subtotal_inr,
    discount_inr,
    total_inr,
    address_snapshot
  )
  values (
    v_sub.id,
    v_uid,
    v_sub.dog_id,
    p_delivery_date,
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
    )
  )
  returning id into v_order_id;

  insert into public.order_items (order_id, item_type, item_id, name_snapshot, qty, unit_price_inr)
  values (v_order_id, 'plan', v_plan.id, v_plan.name, 1, v_plan.price_inr);

  insert into public.order_items (order_id, item_type, item_id, name_snapshot, qty, unit_price_inr)
  select v_order_id, 'addon', a.id, a.name, 1, a.price_inr
  from public.addons a
  where a.id = any(v_sub.addon_ids)
  order by a.sort_order, a.id;

  insert into public.audit_logs (actor_id, action, entity, entity_id, meta)
  values (
    v_uid,
    'order.scheduled',
    'order',
    v_order_id::text,
    jsonb_build_object('subscription_id', v_sub.id, 'delivery_date', p_delivery_date)
  );

  return jsonb_build_object('orderId', v_order_id);
end;
$$;

create or replace function public.create_suggested_diet_plan(p_dog_id uuid, p_recipe_ids text[], p_notes text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_dog public.dogs;
  v_plan_id uuid;
begin
  if v_uid is null then
    raise exception 'Authentication required.' using errcode = '42501';
  end if;

  select * into v_dog from public.dogs where id = p_dog_id and owner_id = v_uid;
  if not found then
    raise exception 'Dog not found.' using errcode = 'P0002';
  end if;

  insert into public.diet_plans (
    dog_id,
    vet_id,
    recipe_ids,
    notes,
    status
  )
  values (
    v_dog.id,
    null,
    coalesce(p_recipe_ids, '{}'),
    coalesce(p_notes, 'Suggested plan pending veterinary-nutritionist review.'),
    'pending'
  )
  returning id into v_plan_id;

  return jsonb_build_object('dietPlanId', v_plan_id);
end;
$$;
