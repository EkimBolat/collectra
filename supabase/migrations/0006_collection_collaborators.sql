-- Ortak koleksiyonlar — sahip, takip ettiği/takipçisi olan kişileri ortak
-- çalışan olarak ekleyebilir; onlar da fotoğraf ekleyip silebilir.

create table public.collection_collaborators (
  collection_id uuid not null references public.collections (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (collection_id, user_id)
);

create index collection_collaborators_user_idx on public.collection_collaborators (user_id);

alter table public.collection_collaborators enable row level security;

create or replace function public.can_edit_collection(cid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.collections c
    where c.id = cid
      and (
        c.owner_id = (select auth.uid())
        or exists (
          select 1 from public.collection_collaborators cc
          where cc.collection_id = c.id
            and cc.user_id = (select auth.uid())
        )
      )
  );
$$;

create policy "collaborators_select_visible" on public.collection_collaborators
  for select using (public.can_view_collection(collection_id));

create policy "collaborators_insert_owner" on public.collection_collaborators
  for insert with check (
    exists (
      select 1 from public.collections c
      where c.id = collection_id and c.owner_id = (select auth.uid())
    )
  );

create policy "collaborators_delete_owner" on public.collection_collaborators
  for delete using (
    exists (
      select 1 from public.collections c
      where c.id = collection_id and c.owner_id = (select auth.uid())
    )
  );

-- collection_items: sahip veya ortak çalışan düzenleyebilir (view politikası aynı kalır)
drop policy if exists "items_write_own" on public.collection_items;
create policy "items_write_own" on public.collection_items
  for all using (public.can_edit_collection(collection_id))
  with check (public.can_edit_collection(collection_id));

-- storage: klasör yapısı hâlâ {yükleyenin id'si}/{collection_id}/dosya, ama izin
-- artık ilk segmentteki id'ye değil, ikinci segmentteki koleksiyona bakıyor.
drop policy if exists "collection_images_write" on storage.objects;
create policy "collection_images_write" on storage.objects
  for insert with check (
    bucket_id = 'collection-images'
    and public.can_edit_collection(((storage.foldername(name))[2])::uuid)
  );

drop policy if exists "collection_images_delete" on storage.objects;
create policy "collection_images_delete" on storage.objects
  for delete using (
    bucket_id = 'collection-images'
    and public.can_edit_collection(((storage.foldername(name))[2])::uuid)
  );
