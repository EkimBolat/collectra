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

async function commonsImages(categoryName, limit) {
  const url =
    "https://commons.wikimedia.org/w/api.php?action=query&generator=categorymembers" +
    `&gcmtitle=${encodeURIComponent("Category:" + categoryName)}&gcmtype=file&gcmlimit=${limit * 4}` +
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
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: "nazlipostaci@example.com",
    password: "Demo12345!",
  });
  if (authError) throw authError;
  const user = authData.user;

  const { data: collection } = await supabase
    .from("collections")
    .select("id")
    .eq("owner_id", user.id)
    .eq("title", "Eski Kartpostallar")
    .single();

  let images = [];
  for (const cat of ["Postcard collections", "Postcard albums", "Postcard"]) {
    if (images.length >= 3) break;
    const found = await commonsImages(cat, 3 - images.length);
    images.push(...found);
  }
  console.log("found", images.length, "images");

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
  console.log("done, added", position, "images");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
