-- Koleksiyonlar için seçilebilir kapak fotoğrafı — belirtilmezse ilk parça kapak olur.

alter table public.collections
  add column cover_item_id uuid references public.collection_items (id) on delete set null;
