<p align="center">
  <img src="src/app/icon.svg" alt="Collectra logo" width="72" height="72" />
</p>

<h1 align="center">Collectra</h1>

<p align="center">
  Koleksiyonlarını paylaş, herkese açık ya da sadece takipçilerine özel göster,
  kategori bazlı keşfet — Instagram'ın mantığında, odağı koleksiyonlar olan bir platform.
</p>

<p align="center">
  <a href="https://collectra-one.vercel.app/"><strong>Canlı demo →</strong></a>
</p>

## Stack

- Next.js 16 (App Router, TypeScript, Tailwind CSS 4)
- Supabase (Postgres + Auth + Storage), Row Level Security ile görünürlük kontrolü

## Kurulum

1. [supabase.com](https://supabase.com) üzerinde ücretsiz bir proje oluştur, **Project URL** ve
   **anon public key**'i al (Settings → API).
2. `.env.local.example` dosyasını `.env.local` olarak kopyala ve değerleri doldur.
3. Supabase **SQL Editor**'ünde [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql)
   dosyasını çalıştır (tablolar, RLS, storage bucket'ları).
4. Authentication → Providers → Email altında **Confirm email**'i kapat.
5. `npm install && npm run dev` ile başlat.

## Veri modeli

- **profiles** — kullanıcı adı, görünen ad, bio, avatar.
- **collections** — başlık, kategori, görünürlük (`public` / `followers` / `private`).
- **collection_items** — koleksiyona ait fotoğraflar; sonradan da parça eklenebilir.
- **follows**, **likes**, **comments** — sosyal etkileşim.

Görünürlük kuralları veritabanı seviyesinde (RLS) uygulanır.
