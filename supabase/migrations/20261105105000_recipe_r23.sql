update public.configurations
set metadata=jsonb_set(coalesce(metadata,'{}'::jsonb),'{discovery_recipe}','{"mode":"components","recipe_version":2,"reference_shop":"mueller","components":[{"key":"top","label":"ICOA 12 A BT","quantity":2,"expected":"LD Systems ICOA 12 A BT","kind":"main","role":"structural"},{"key":"sub","label":"ICOA SUB 15 A","quantity":1,"expected":"LD Systems ICOA SUB 15 A","kind":"main","role":"structural"},{"key":"stands","label":"Stativpaar mit Tasche","quantity":2,"expected":"Speaker Stand Stativ","kind":"accessory","role":"secondary"},{"key":"xlr_6m","label":"XLR Kabel 6 m","quantity":2,"expected":"XLR Kabel 6 m","kind":"accessory","role":"secondary"}]}'::jsonb,true),
updated_at=now()
where legacy_id='r23';
