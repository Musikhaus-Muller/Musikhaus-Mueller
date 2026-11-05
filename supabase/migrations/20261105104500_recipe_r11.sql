update public.configurations
set metadata=jsonb_set(coalesce(metadata,'{}'::jsonb),'{discovery_recipe}','{"mode":"components","recipe_version":2,"reference_shop":"mueller","components":[{"key":"main","label":"MAUI 28 G3","quantity":2,"expected":"LD Systems MAUI 28 G3","kind":"main","role":"structural"},{"key":"extra_sub","label":"MAUI 28 G3 SUB","quantity":2,"expected":"LD Systems MAUI 28 G3 SUB","kind":"main","role":"structural"},{"key":"xlr_3m","label":"XLR Kabel 3 m","quantity":2,"expected":"XLR Kabel 3 m","kind":"accessory","role":"secondary"}]}'::jsonb,true),
    updated_at=now()
where legacy_id='r11';
