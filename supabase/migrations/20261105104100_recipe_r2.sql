update public.configurations
set metadata = jsonb_set(
  coalesce(metadata,'{}'::jsonb),
  '{discovery_recipe}',
  '{"mode":"components","recipe_version":2,"reference_shop":"mueller","components":[{"key":"main","label":"MAUI 11 G3","quantity":2,"expected":"LD Systems MAUI 11 G3","kind":"main","role":"structural"},{"key":"sat_bag","label":"MAUI 11 G3 SAT BAG","quantity":2,"expected":"LD Systems MAUI 11 G3 SAT BAG","kind":"accessory","role":"secondary"},{"key":"sub_cover","label":"MAUI 11 G3 SUB PC","quantity":2,"expected":"LD Systems MAUI 11 G3 SUB PC","kind":"accessory","role":"secondary"}]}'::jsonb,
  true
),
updated_at=now()
where legacy_id='r2';
