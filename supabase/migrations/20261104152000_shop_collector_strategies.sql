-- Align persisted collector_type with the runtime shop strategies.
update public.shops set collector_type='http', updated_at=now()
where slug in ('mueller','prolighting','thomann','kirstein','hotsound');

update public.shops set collector_type='hybrid', updated_at=now()
where slug='musicstore';
