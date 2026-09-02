-- Otomatik moderasyon: bir yorum şikayet edildiğinde içeriğinde küfür varsa
-- yorum otomatik silinir. Admin paneli yok — tamamen sistem tarafından yapılır.

create table public.profanity_words (
  word text primary key
);

-- RLS açık ve hiçbir policy tanımlı değil: bu tabloya normal kullanıcılar
-- (anon/authenticated) hiçbir şekilde erişemez. Sadece aşağıdaki security
-- definer fonksiyon (postgres sahipliğiyle, RLS'i bypass ederek) okuyabilir.
alter table public.profanity_words enable row level security;

insert into public.profanity_words (word) values
  ('amk'), ('aq'), ('oc'), ('oç'), ('orospu'), ('piç'), ('pic'),
  ('siktir'), ('sikeyim'), ('sikerim'), ('sikik'), ('yarrak'), ('yarak'),
  ('got herif'), ('göt'), ('ibne'), ('pezevenk'), ('kaltak'), ('kancık'), ('kancik'),
  ('yavşak'), ('yavsak'), ('şerefsiz'), ('serefsiz'), ('dallama'), ('gerizekalı'), ('gerizekali'),
  ('ananı'), ('anani'), ('bacını'), ('bacini'), ('avradını'), ('avradini'),
  ('kahpe'), ('puşt'), ('pust'), ('sürtük'), ('surtuk'), ('taşşak'), ('tasak')
on conflict do nothing;

create or replace function public.contains_profanity(input text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profanity_words w
    where lower(input) ~ ('(^|[^a-zçğıöşü])' || w.word)
  );
$$;

create or replace function public.auto_moderate_report()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.target_type = 'comment' then
    delete from public.comments c
    where c.id = new.target_id
      and public.contains_profanity(c.body);
  end if;
  return new;
end;
$$;

create trigger reports_auto_moderate
  after insert on public.reports
  for each row execute function public.auto_moderate_report();
