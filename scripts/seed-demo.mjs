// One-off script to seed demo collections with real, openly-licensed photos
// from Wikimedia Commons so the explore feed feels alive. Run with:
//   node scripts/seed-demo.mjs
// Requires NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY (reads .env.local).

import fs from "node:fs";
import path from "node:path";
import WebSocket from "ws";
import { createClient } from "@supabase/supabase-js";

if (!globalThis.WebSocket) globalThis.WebSocket = WebSocket;

const envPath = path.join(process.cwd(), ".env.local");
for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
  const m = line.match(/^([A-Z_0-9]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2].trim();
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const UA = "CollectraDemoSeed/1.0 (https://github.com/EkimBolat/collectra; ekim.bubu@gmail.com)";

const USERS = {
  kemalkoleksiyon: { display_name: "Kemal", password: "Demo12345!" },
  nazlipostaci: { display_name: "Nazlı", password: "Demo12345!" },
  ayseantika: { display_name: "Ayşe", password: "Demo12345!" },
  cemvinyl: { display_name: "Cem", password: "Demo12345!" },
  mustafapara: { display_name: "Mustafa", password: "Demo12345!" },
};

// category_id from supabase/migrations/0001_init.sql insertion order
const COLLECTIONS = [
  {
    user: "kemalkoleksiyon",
    category_id: 1,
    title: "Uzay Serisi Lego Setlerim",
    description: "Çocukluğumdan beri topladığım klasik Lego uzay ve şehir setleri.",
    commonsCategories: ["Lego space sets", "Lego City", "Lego"],
    count: 4,
  },
  {
    user: "kemalkoleksiyon",
    category_id: 13,
    title: "Retro Konsol Kartuşlarım",
    description: "90'lardan kalma retro oyun konsolu ve kartuş koleksiyonum.",
    commonsCategories: ["Video game cartridges", "Nintendo Entertainment System", "Retrogaming"],
    count: 3,
  },
  {
    user: "kemalkoleksiyon",
    category_id: 7,
    title: "Aksiyon Figürü Rafım",
    description: "Yıllar içinde topladığım aksiyon figürleri ve oyuncaklar.",
    commonsCategories: ["Action figures", "Toy figures"],
    count: 3,
  },
  {
    user: "nazlipostaci",
    category_id: 3,
    title: "Dünya Pulları Albümüm",
    description: "Farklı ülkelerden topladığım nadide pullar.",
    commonsCategories: ["Postage stamps", "Stamp collecting"],
    count: 4,
  },
  {
    user: "nazlipostaci",
    category_id: 11,
    title: "Eski Kartpostallar",
    description: "Yüzyıl başından kalma kartpostal koleksiyonum.",
    commonsCategories: ["Postcards", "Vintage postcards"],
    count: 3,
  },
  {
    user: "nazlipostaci",
    category_id: 6,
    title: "Antika Kitap Rafım",
    description: "Sahaflardan topladığım eski baskı kitaplar.",
    commonsCategories: ["Antiquarian books", "Old books"],
    count: 3,
  },
  {
    user: "ayseantika",
    category_id: 10,
    title: "Antika Eşya Köşem",
    description: "Yıllar içinde biriktirdiğim antika ev eşyaları.",
    commonsCategories: ["Antiques", "Antique shops"],
    count: 3,
  },
  {
    user: "ayseantika",
    category_id: 12,
    title: "Mineral ve Kristal Koleksiyonum",
    description: "Doğa gezilerinden topladığım taş ve mineraller.",
    commonsCategories: ["Minerals", "Crystals"],
    count: 4,
  },
  {
    user: "ayseantika",
    category_id: 8,
    title: "Vintage Kol Saatleri",
    description: "Mekanik vintage kol saati koleksiyonum.",
    commonsCategories: ["Wristwatches", "Pocket watches"],
    count: 3,
  },
  {
    user: "cemvinyl",
    category_id: 5,
    title: "33'lük Plak Arşivim",
    description: "Yıllar içinde topladığım vinil plaklar.",
    commonsCategories: ["Vinyl records", "Gramophone records"],
    count: 4,
  },
  {
    user: "cemvinyl",
    category_id: 2,
    title: "Trading Card Koleksiyonum",
    description: "Farklı serilerden topladığım kartlar.",
    commonsCategories: ["Trading cards", "Pokémon Trading Card Game"],
    count: 3,
  },
  {
    user: "cemvinyl",
    category_id: 9,
    title: "Sneaker Dolabım",
    description: "Sınırlı sayıda üretilen sneaker koleksiyonum.",
    commonsCategories: ["Sneakers", "Athletic shoes"],
    count: 3,
  },
  {
    user: "mustafapara",
    category_id: 4,
    title: "Eski Madeni Paralar",
    description: "Farklı ülke ve dönemlerden madeni para koleksiyonum.",
    commonsCategories: ["Coins", "Ancient coins"],
    count: 4,
  },
  {
    user: "mustafapara",
    category_id: 14,
    title: "Vintage Poster Koleksiyonum",
    description: "Topladığım eski sanat baskıları ve posterler.",
    commonsCategories: ["Posters", "Prints (visual works)"],
    count: 3,
  },
  {
    user: "mustafapara",
    category_id: 15,
    title: "Deniz Kabuğu Koleksiyonum",
    description: "Kıyı gezilerinden topladığım deniz kabukları.",
    commonsCategories: ["Seashells", "Shells"],
    count: 3,
  },
];

async function commonsImages(categoryName, limit) {
  const url =
    "https://commons.wikimedia.org/w/api.php?action=query&generator=categorymembers" +
    `&gcmtitle=${encodeURIComponent("Category:" + categoryName)}&gcmtype=file&gcmlimit=${limit * 3}` +
    "&prop=imageinfo&iiprop=url|mime&iiurlwidth=1000&format=json";
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  const json = await res.json();
  const pages = json?.query?.pages;
  if (!pages) return [];
  const files = Object.values(pages)
    .map((p) => p.imageinfo?.[0])
    .filter((info) => info && /^image\/(jpeg|png)$/.test(info.mime))
    .map((info) => info.thumburl || info.url);
  return files.slice(0, limit);
}

async function pickImages(categoryNames, count) {
  const found = [];
  for (const name of categoryNames) {
    if (found.length >= count) break;
    try {
      const imgs = await commonsImages(name, count - found.length);
      found.push(...imgs);
    } catch (e) {
      console.warn("commons fetch failed for", name, e.message);
    }
  }
  return found.slice(0, count);
}

async function downloadImage(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`download failed ${res.status} for ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const ext = url.split("?")[0].split(".").pop().toLowerCase();
  const type = ext === "png" ? "image/png" : "image/jpeg";
  return { buf, ext: ext === "png" ? "png" : "jpg", type };
}

async function ensureUser(supabase, username) {
  const email = `${username}@example.com`;
  const password = USERS[username].password;

  let { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    const signUpRes = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username, display_name: USERS[username].display_name } },
    });
    if (signUpRes.error) throw signUpRes.error;
    data = signUpRes.data;
  }
  return data.user;
}

async function main() {
  const results = [];

  for (const item of COLLECTIONS) {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const user = await ensureUser(supabase, item.user);

    const { data: existing } = await supabase
      .from("collections")
      .select("id")
      .eq("owner_id", user.id)
      .eq("title", item.title)
      .maybeSingle();
    if (existing) {
      console.log("skip (exists):", item.title);
      continue;
    }

    const { data: collection, error: insertError } = await supabase
      .from("collections")
      .insert({
        owner_id: user.id,
        title: item.title,
        description: item.description,
        category_id: item.category_id,
        visibility: "public",
      })
      .select("id")
      .single();

    if (insertError || !collection) {
      console.error("collection insert failed:", item.title, insertError?.message);
      continue;
    }

    const imageUrls = await pickImages(item.commonsCategories, item.count);
    console.log(item.title, "->", imageUrls.length, "images found");

    let position = 0;
    for (const imgUrl of imageUrls) {
      try {
        const { buf, ext, type } = await downloadImage(imgUrl);
        const storagePath = `${user.id}/${collection.id}/${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("collection-images")
          .upload(storagePath, buf, { contentType: type, upsert: false });
        if (uploadError) {
          console.error("upload failed:", uploadError.message);
          continue;
        }
        await supabase
          .from("collection_items")
          .insert({ collection_id: collection.id, image_path: storagePath, position });
        position++;
      } catch (e) {
        console.error("image failed:", imgUrl, e.message);
      }
    }

    results.push({ title: item.title, items: position });
  }

  console.log("\nDone:");
  for (const r of results) console.log(" -", r.title, `(${r.items} foto)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
