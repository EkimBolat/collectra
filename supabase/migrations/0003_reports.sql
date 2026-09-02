-- Reports — kullanıcıların uygunsuz koleksiyon veya yorumları şikayet edebilmesi

create type public.report_target_type as enum ('collection', 'comment');
create type public.report_reason as enum ('inappropriate', 'off_topic', 'harassment', 'other');

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  target_type public.report_target_type not null,
  target_id uuid not null,
  reason public.report_reason not null,
  details text,
  created_at timestamptz not null default now(),
  unique (reporter_id, target_type, target_id)
);

create index reports_target_idx on public.reports (target_type, target_id);

alter table public.reports enable row level security;

create policy "reports_insert_self" on public.reports
  for insert with check (reporter_id = (select auth.uid()));

create policy "reports_select_own" on public.reports
  for select using (reporter_id = (select auth.uid()));
