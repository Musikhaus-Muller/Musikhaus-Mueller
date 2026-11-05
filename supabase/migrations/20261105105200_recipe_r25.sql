update public.configurations
set metadata=jsonb_set(coalesce(metadata,'{}'::jsonb),'{discovery_recipe}','{"mode":"components","recipe_version":2,"reference_shop":"mueller","components":[{"key":"top","label":"ICOA 15 A BT","quantity":2,"expected":"LD Systems ICOA 15 A BT","kind":"main","role":"structural"},{"key":"sub","label":"ICOA SUB 18 A","quantity":2,"expected":"LD Systems ICOA SUB 18 A","kind":"main","role":"structural"},{"key":"stands","label":"Gravity SP 2332 B","quantity":2,"expected":"Gravity SP 2332 B","kind":"accessory","role":"secondary"},{"key":"xlr_3m","label":"XLR Kabel 3 m","quantity":2,"expected":"XLR Kabel 3 m","kind":"accessory","role":"secondary"}]}'::jsonb,true),
updated_at=now()
where legacy_id='r25';
