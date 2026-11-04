-- Music Store also blocks automated browser access; preserve last valid prices without browser retries.
update public.shops
set collector_type='http', updated_at=now()
where slug='musicstore';
