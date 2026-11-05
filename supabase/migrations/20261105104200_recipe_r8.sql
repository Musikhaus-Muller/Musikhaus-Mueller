update public.configurations
set metadata=jsonb_set(coalesce(metadata,'{}'::jsonb),'{discovery_recipe}','{"mode":"components","recipe_version":2,"reference_shop":"mueller","components":[{"key":"main","label":"MAUI 44 G2","quantity":2,"expected":"LD Systems MAUI 44 G2","kind":"main","role":"structural"}]}'::jsonb,true),
    updated_at=now()
where legacy_id='r8';
