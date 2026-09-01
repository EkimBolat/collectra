-- Comment likes — beğenilebilir yorumlar

create table public.comment_likes (
  user_id uuid not null references public.profiles (id) on delete cascade,
  comment_id uuid not null references public.comments (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, comment_id)
);

create index comment_likes_comment_idx on public.comment_likes (comment_id);

alter table public.comment_likes enable row level security;

create policy "comment_likes_select_visible" on public.comment_likes
  for select using (
    exists (
      select 1 from public.comments c
      where c.id = comment_likes.comment_id
        and public.can_view_collection(c.collection_id)
    )
  );

create policy "comment_likes_insert_self" on public.comment_likes
  for insert with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.comments c
      where c.id = comment_likes.comment_id
        and public.can_view_collection(c.collection_id)
    )
  );

create policy "comment_likes_delete_self" on public.comment_likes
  for delete using (user_id = (select auth.uid()));
