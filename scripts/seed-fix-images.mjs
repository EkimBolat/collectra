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
const SEED_DEMO_PASSWORD = process.env.SEED_DEMO_PASSWORD;
if (!SEED_DEMO_PASSWORD) {
  console.error("Set SEED_DEMO_PASSWORD in .env.local first.");
  process.exit(1);
}
const UA = "CollectraDemoSeed/1.0 (https://github.com/EkimBolat/collectra; ekim.bubu@gmail.com)";

const FIXES = [
  {
    email: "ayseantika@example.com",
    title: "Mineral ve Kristal Koleksiyonum",
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/2/22/Kyanite_4.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/ADL_E6311.jpg/960px-ADL_E6311.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/In_einer_Box_002_2017_08_05.jpg/960px-In_einer_Box_002_2017_08_05.jpg",
    ],
  },
  {
    email: "ayseantika@example.com",
    title: "Vintage Kol Saatleri",
    images: null, // filled from Category:Pocket watches below
    commonsCategory: "Pocket watches",
    count: 3,
  },
  {
    email: "cemvinyl@example.com",
    title: "33'lük Plak Arşivim",
    images: null,
    commonsCategory: "LP records",
    count: 3,
    excludeSubstr: "DSC_0007",
  },
  {
    email: "nazlipostaci@example.com",
    title: "Antika Kitap Rafım",
    images: null,
    commonsCategory: "Old books",
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
  return Object.values(pages)
    .map((p) => p.imageinfo?.[0])
    .filter((info) => info && /^image\/(jpeg|png)$/.test(info.mime))
    .map((info) => info.thumburl || info.url)
    .slice(0, limit);
}

async function downloadImage(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`download failed ${res.status} for ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const ext = url.split("?")[0].split(".").pop().toLowerCase();
  const type = ext === "png" ? "image/png" : "image/jpeg";
  return { buf, ext: ext === "png" ? "png" : "jpg", type };
}

async function main() {
  for (const fix of FIXES) {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: fix.email,
      password: SEED_DEMO_PASSWORD,
    });
    if (authError) throw authError;
    const user = authData.user;

    const { data: collection } = await supabase
      .from("collections")
      .select("id")
      .eq("owner_id", user.id)
      .eq("title", fix.title)
      .single();
    if (!collection) {
      console.error("collection not found:", fix.title);
      continue;
    }

    const { data: oldItems } = await supabase
      .from("collection_items")
      .select("id, image_path")
      .eq("collection_id", collection.id);

    if (oldItems && oldItems.length > 0) {
      await supabase.storage
        .from("collection-images")
        .remove(oldItems.map((i) => i.image_path));
      await supabase.from("collection_items").delete().eq("collection_id", collection.id);
      console.log(fix.title, "- removed", oldItems.length, "old items");
    }

    let images = fix.images;
    if (!images) {
      images = await commonsImages(fix.commonsCategory, fix.count + 2);
      if (fix.excludeSubstr) images = images.filter((u) => !u.includes(fix.excludeSubstr));
      images = images.slice(0, fix.count);
    }

    let position = 0;
    for (const imgUrl of images) {
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
    console.log(fix.title, "- added", position, "new items");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
