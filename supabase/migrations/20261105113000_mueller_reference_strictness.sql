-- Tighten Mueller reference color expectations after first component discovery review.
-- Only configurations whose Mueller reference explicitly states schwarz are changed.

update public.configurations
set metadata = jsonb_set(metadata, '{discovery_recipe,components,0,expected}', to_jsonb(
  case legacy_id
    when 'r2' then 'LD Systems MAUI 11 G3 schwarz'
    when 'r8' then 'LD Systems MAUI 44 G2 schwarz'
    when 'r9' then 'LD Systems MAUI 44 G2 schwarz'
    when 'r10' then 'LD Systems MAUI 11 G3 schwarz'
    when 'r11' then 'LD Systems MAUI 28 G3 schwarz'
    when 'r12' then 'LD Systems MAUI 44 G2 schwarz'
  end
), false),
updated_at = now()
where legacy_id in ('r2','r8','r9','r10','r11','r12');

update public.configurations
set metadata = jsonb_set(metadata, '{discovery_recipe,components,1,expected}', to_jsonb(
  case legacy_id
    when 'r10' then 'LD Systems MAUI 11 G3 SUB schwarz'
    when 'r11' then 'LD Systems MAUI 28 G3 SUB schwarz'
    when 'r12' then 'LD Systems MAUI 44 G2 SUB schwarz'
  end
), false),
updated_at = now()
where legacy_id in ('r10','r11','r12');
