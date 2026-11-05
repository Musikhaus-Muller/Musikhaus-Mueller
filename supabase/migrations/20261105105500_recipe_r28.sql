update public.configurations
set metadata=jsonb_set(
  coalesce(metadata,'{}'::jsonb),
  '{discovery_recipe}',
  jsonb_build_object(
    'mode','components',
    'recipe_version',2,
    'reference_shop','mueller',
    'components',jsonb_build_array(
      jsonb_build_object('key','top','label','ICOA PRO 12 A','quantity',2,'expected','LD Systems ICOA PRO 12 A','kind','main','role','structural'),
      jsonb_build_object('key','sub','label','ICOA PRO SUB 21 A','quantity',2,'expected','LD Systems ICOA PRO SUB 21 A','kind','main','role','structural'),
      jsonb_build_object('key','stands','label','Gravity SP 2332 B','quantity',2,'expected','Gravity SP 2332 B','kind','accessory','role','secondary'),
      jsonb_build_object('key','xlr_3m','label','XLR Kabel 3 m','quantity',2,'expected','XLR Kabel 3 m','kind','accessory','role','secondary')
    )
  ),
  true
),
updated_at=now()
where legacy_id='r28';
