-- Collectra — initial schema
-- Koleksiyon paylaşım platformu: profiller, koleksiyonlar, parçalar, takip, beğeni, yorum.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type public.collection_visibility as enum ('public', 'followers', 'private');

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique
    check (username ~ '^[a-z0-9_]{3,24}$'),
  display_name text not null check (char_length(display_name) between 1 and 50),
  bio text check (char_length(bio) <= 300),
  avatar_path text,
  created_at timestamptz not null default now()
);

create index profiles_username_idx on public.profiles (username);

-- signUp() sırasında options.data içinde gönderilen username/display_name ile
-- profili otomatik oluşturur (e-posta onayı açık olsa da kapalı olsa da çalışır).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', 'user_' || substr(new.id::text, 1, 8)),
    coalesce(new.raw_user_meta_data ->> 'display_name', 'Yeni Koleksiyoncu')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Categories
-- ---------------------------------------------------------------------------

create table public.categories (
  id serial primary key,
  slug text not null unique,
  name text not null,
  emoji text not null default '📦',
  sort_order int not null default 100
);

insert into public.categories (slug, name, emoji, sort_order) values
  ('lego',            'Lego & Yapı Setleri',   '🧱', 10),
  ('trading-cards',   'Kartlar',               '🃏', 20),
  ('stamps',          'Pullar',                '📮', 30),
  ('coins',           'Paralar & Madeni Para', '🪙', 40),
  ('vinyl',           'Plak & Müzik',          '🎵', 50),
  ('books',           'Kitaplar',              '📚', 60),
  ('figures',         'Figürler & Oyuncaklar', '🎎', 70),
  ('watches',         'Saatler',               '⌚', 80),
  ('sneakers',        'Sneaker & Ayakkabı',    '👟', 90),
  ('antiques',        'Antika',                '🏺', 100),
  ('ephemera',        'Kağıt & Efemera',       '📄', 110),
  ('minerals',        'Taş & Mineral',         '💎', 120),
  ('video-games',     'Video Oyunları',        '🎮', 130),
  ('art',             'Sanat & Baskı',         '🖼️', 140),
  ('other',           'Diğer',                 '📦', 999);

-- ---------------------------------------------------------------------------
-- Collections
-- ---------------------------------------------------------------------------

create table public.collections (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 80),
  description text check (char_length(description) <= 1000),
  category_id int not null references public.categories (id),
  visibility public.collection_visibility not null default 'public',
  item_count int not null default 0,
  like_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index collections_owner_idx on public.collections (owner_id, created_at desc);
create index collections_category_idx on public.collections (category_id, created_at desc);
create index collections_public_feed_idx on public.collections (created_at desc)
  where visibility = 'public';

-- ---------------------------------------------------------------------------
-- Collection items (koleksiyona sonradan eklenebilen fotoğraflar)
-- ---------------------------------------------------------------------------

create table public.collection_items (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references public.collections (id) on delete cascade,
  image_path text not null,
  caption text check (char_length(caption) <= 300),
  position int not null default 0,
  created_at timestamptz not null default now()
);

create index collection_items_collection_idx
  on public.collection_items (collection_id, position, created_at);

-- ---------------------------------------------------------------------------
-- Follows
-- ---------------------------------------------------------------------------

create table public.follows (
  follower_id uuid not null references public.profiles (id) on delete cascade,
  following_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

create index follows_following_idx on public.follows (following_id);

-- ---------------------------------------------------------------------------
-- Likes & comments
-- ---------------------------------------------------------------------------

create table public.likes (
  user_id uuid not null references public.profiles (id) on delete cascade,
  collection_id uuid not null references public.collections (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, collection_id)
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references public.collections (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 500),
  created_at timestamptz not null default now()
);

create index comments_collection_idx on public.comments (collection_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Visibility helper
-- ---------------------------------------------------------------------------

-- security definer: RLS özyinelemesine girmeden görünürlük kararını tek yerde toplar.
create or replace function public.can_view_collection(cid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.collections c
    where c.id = cid
      and (
        c.visibility = 'public'
        or c.owner_id = (select auth.uid())
        or (
          c.visibility = 'followers'
          and exists (
            select 1 from public.follows f
            where f.following_id = c.owner_id
              and f.follower_id = (select auth.uid())
          )
        )
      )
  );
$$;

-- ---------------------------------------------------------------------------
-- Counter triggers
-- ---------------------------------------------------------------------------

create or replace function public.sync_item_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target uuid := coalesce(new.collection_id, old.collection_id);
begin
  update public.collections c
  set item_count = (
        select count(*) from public.collection_items i where i.collection_id = target
      ),
      updated_at = now()
  where c.id = target;
  return null;
end;
$$;

create trigger collection_items_count
  after insert or delete on public.collection_items
  for each row execute function public.sync_item_count();

create or replace function public.sync_like_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target uuid := coalesce(new.collection_id, old.collection_id);
begin
  update public.collections c
  set like_count = (
        select count(*) from public.likes l where l.collection_id = target
      )
  where c.id = target;
  return null;
end;
$$;

create trigger likes_count
  after insert or delete on public.likes
  for each row execute function public.sync_like_count();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles         enable row level security;
alter table public.categories       enable row level security;
alter table public.collections      enable row level security;
alter table public.collection_items enable row level security;
alter table public.follows          enable row level security;
alter table public.likes            enable row level security;
alter table public.comments         enable row level security;

-- profiles: herkes görebilir, sadece sahibi düzenler
create policy "profiles_select_all" on public.profiles
  for select using (true);
create policy "profiles_insert_self" on public.profiles
  for insert with check (id = (select auth.uid()));
create policy "profiles_update_self" on public.profiles
  for update using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- categories: salt okunur referans verisi
create policy "categories_select_all" on public.categories
  for select using (true);

-- collections
create policy "collections_select_visible" on public.collections
  for select using (
    visibility = 'public'
    or owner_id = (select auth.uid())
    or (
      visibility = 'followers'
      and exists (
        select 1 from public.follows f
        where f.following_id = collections.owner_id
          and f.follower_id = (select auth.uid())
      )
    )
  );
create policy "collections_insert_own" on public.collections
  for insert with check (owner_id = (select auth.uid()));
create policy "collections_update_own" on public.collections
  for update using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));
create policy "collections_delete_own" on public.collections
  for delete using (owner_id = (select auth.uid()));

-- collection_items: üst koleksiyonun görünürlüğünü miras alır
create policy "items_select_visible" on public.collection_items
  for select using (public.can_view_collection(collection_id));
create policy "items_write_own" on public.collection_items
  for all using (
    exists (
      select 1 from public.collections c
      where c.id = collection_items.collection_id
        and c.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.collections c
      where c.id = collection_items.collection_id
        and c.owner_id = (select auth.uid())
    )
  );

-- follows
create policy "follows_select_all" on public.follows
  for select using (true);
create policy "follows_insert_self" on public.follows
  for insert with check (follower_id = (select auth.uid()));
create policy "follows_delete_self" on public.follows
  for delete using (follower_id = (select auth.uid()));

-- likes
create policy "likes_select_visible" on public.likes
  for select using (public.can_view_collection(collection_id));
create policy "likes_insert_self" on public.likes
  for insert with check (
    user_id = (select auth.uid()) and public.can_view_collection(collection_id)
  );
create policy "likes_delete_self" on public.likes
  for delete using (user_id = (select auth.uid()));

-- comments
create policy "comments_select_visible" on public.comments
  for select using (public.can_view_collection(collection_id));
create policy "comments_insert_self" on public.comments
  for insert with check (
    user_id = (select auth.uid()) and public.can_view_collection(collection_id)
  );
create policy "comments_delete_own" on public.comments
  for delete using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- Storage
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('collection-images', 'collection-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Dosyalar <user_id>/... şeklinde saklanır; yazma hakkı klasör sahibine ait.
create policy "collection_images_read" on storage.objects
  for select using (bucket_id = 'collection-images');
create policy "collection_images_write" on storage.objects
  for insert with check (
    bucket_id = 'collection-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
create policy "collection_images_delete" on storage.objects
  for delete using (
    bucket_id = 'collection-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "avatars_read" on storage.objects
  for select using (bucket_id = 'avatars');
create policy "avatars_write" on storage.objects
  for insert with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
create policy "avatars_delete" on storage.objects
  for delete using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
