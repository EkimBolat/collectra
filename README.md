# Collectra

Koleksiyonlarını paylaşabildiğin, herkese açık ya da sadece takipçilerine özel gösterebildiğin,
kategori bazlı keşfedilebilir bir koleksiyon paylaşım platformu.

## Stack

- Next.js 16 (App Router, TypeScript, Tailwind CSS 4)
- Supabase (Postgres + Auth + Storage), Row Level Security ile görünürlük kontrolü

## Kurulum

1. [supabase.com](https://supabase.com) üzerinde ücretsiz bir proje oluştur.
2. Proje ayarlarından **Project URL** ve **anon public key** değerlerini al
   (Settings → API).
3. `.env.local.example` dosyasını `.env.local` olarak kopyala ve değerleri doldur:

   ```bash
   cp .env.local.example .env.local
   ```

4. Supabase panelinde **SQL Editor**'ü aç, [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql)
   dosyasının tüm içeriğini yapıştırıp çalıştır. Bu, tabloları, RLS politikalarını,
   storage bucket'larını ve kayıt olunca profil oluşturan trigger'ı kurar.
5. (Önerilir, geliştirme kolaylığı için) Authentication → Providers → Email altında
   **Confirm email**'i kapat, böylece kayıt olur olmaz giriş yapılabilir.
6. Bağımlılıkları kur ve sunucuyu başlat:

   ```bash
   npm install
   npm run dev
   ```

7. [http://localhost:3000](http://localhost:3000) adresini aç.

## Veri modeli

- **profiles** — kullanıcı adı, görünen ad, bio, avatar.
- **collections** — bir koleksiyonun kendisi (başlık, kategori, görünürlük: `public` / `followers` / `private`).
- **collection_items** — koleksiyona ait fotoğraflar; koleksiyon oluşturulduktan sonra da yeni parça eklenebilir.
- **follows**, **likes**, **comments** — sosyal etkileşim.

Görünürlük kuralları veritabanı seviyesinde (RLS) uygulanır: `public` herkese,
`followers` sadece takip edenlere, `private` sadece sahibine görünür.
