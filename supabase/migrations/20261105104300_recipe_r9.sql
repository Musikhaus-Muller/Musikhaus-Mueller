update public.configurations
set metadata=jsonb_set(coalesce(metadata,'{}'::jsonb),'{discovery_recipe}','{"mode":"components","recipe_version":2,"reference_shop":"mueller","components":[{"key":"main","label":"MAUI 44 G2","quantity":2,"expected":"LD Systems MAUI 44 G2","kind":"main","role":"structural"},{"key":"sat_bag","label":"MAUI 44 G2 SAT BAG","quantity":2,"expected":"LD Systems MAUI 44 G2 SAT BAG","kind":"accessory","role":"secondary"},{"key":"sub_cover","label":"MAUI 44 G2 SUB PC","quantity":2,"expected":"LD Systems MAUI 44 G2 SUB PC","kind":"accessory","role":"secondary"},{"key":"rollboard","label":"MAUI 44 G2 CB","quantity":2,"expected":"LD Systems MAUI 44 G2 CB","kind":"accessory","role":"secondary"}]}'::jsonb,true),
    updated_at=now()
where legacy_id='r9';
