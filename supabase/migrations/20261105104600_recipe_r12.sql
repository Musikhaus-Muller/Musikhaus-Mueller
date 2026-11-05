update public.configurations
set metadata=jsonb_set(coalesce(metadata,'{}'::jsonb),'{discovery_recipe}','{"mode":"components","recipe_version":2,"reference_shop":"mueller","components":[{"key":"main","label":"MAUI 44 G2","quantity":2,"expected":"LD Systems MAUI 44 G2","kind":"main","role":"structural"},{"key":"extra_sub","label":"MAUI 44 G2 SUB","quantity":2,"expected":"LD Systems MAUI 44 G2 SUB","kind":"main","role":"structural"},{"key":"xlr_3m","label":"XLR Kabel 3 m","quantity":2,"expected":"XLR Kabel 3 m","kind":"accessory","role":"secondary"}]}'::jsonb,true),
    updated_at=now()
where legacy_id='r12';
