-- Correct Hot Sound STINGER offer to the exact product page.
update public.offers o
set
  product_url = 'https://www.hotsound-store.com/ld-systems-stinger-g3-power-set-a-aktivsystem-9639',
  source_url = 'https://www.hotsound-store.com/ld-systems-stinger-g3-power-set-a-aktivsystem-9639',
  evidence = 'Ficha de producto indexada públicamente; precio 4.169 € y composición del set verificados el 04.11.2026.',
  note = 'Ficha exacta localizada. El acceso automatizado directo sigue protegido por CAPTCHA; conservar último precio válido si el collector queda bloqueado.',
  updated_at = now()
from public.configurations c, public.shops s
where o.configuration_id = c.id
  and o.shop_id = s.id
  and c.legacy_id = 'r20'
  and s.slug = 'hotsound';
