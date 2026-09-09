-- Bildirimler — takip, beğeni, yorum ve ortak çalışan eklenmesi olayları.

create type public.notification_type as enum ('follow', 'like', 'comment', 'collaborator_add');

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles (id) on delete cascade,
  actor_id uuid not null references public.profiles (id) on delete cascade,
  type public.notification_type not null,
  collection_id uuid references public.collections (id) on delete cascade,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index notifications_recipient_idx on public.notifications (recipient_id, created_at desc);
create index notifications_recipient_unread_idx on public.notifications (recipient_id) where not read;

alter table public.notifications enable row level security;

create policy "notifications_select_own" on public.notifications
  for select using (recipient_id = (select auth.uid()));

create policy "notifications_insert_as_actor" on public.notifications
  for insert with check (actor_id = (select auth.uid()));

create policy "notifications_update_own" on public.notifications
  for update using (recipient_id = (select auth.uid()))
  with check (recipient_id = (select auth.uid()));

create policy "notifications_delete_own" on public.notifications
  for delete using (recipient_id = (select auth.uid()));
