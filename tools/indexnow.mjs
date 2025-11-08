#!/usr/bin/env node
// Tells Bing, Naver, Yandex and the other IndexNow engines which pages changed,
// so they recrawl within hours instead of waiting for their next visit.
// One POST to api.indexnow.org reaches every participating engine.
//
//   node tools/indexnow.mjs                  pages whose sitemap lastmod is today
//   node tools/indexnow.mjs --since 2026-10-01
//   node tools/indexnow.mjs --all            every URL in sitemap.xml
//   node tools/indexnow.mjs <url> [<url>...] exactly these URLs
//
// Run it after the deploy is live, not before: the engines fetch the key file
// and the pages right away, and a 404 on the key file rejects the whole batch.
// Google does not take part in IndexNow.

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HOST = "snoretimeline.com";
// The key file <KEY>.txt sits in the site root and contains only the key.
const KEY = "bc39b90c41fa3da40501d469590829b5";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);

let urls;
if (args.length && !args[0].startsWith("--")) {
  urls = args;
} else {
  const xml = await readFile(path.join(root, "sitemap.xml"), "utf8");
  const entries = [...xml.matchAll(/<url>[\s\S]*?<loc>([^<]+)<\/loc>(?:[\s\S]*?<lastmod>([^<]+)<\/lastmod>)?[\s\S]*?<\/url>/g)]
    .map(([, loc, lastmod]) => ({ loc, lastmod: lastmod ?? "" }));
  if (args[0] === "--all") {
    urls = entries.map((e) => e.loc);
  } else {
    const since = args[0] === "--since" ? args[1] : new Date().toISOString().slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(since ?? "")) {
      console.error("--since needs a date like 2026-10-01");
      process.exit(1);
    }
    urls = entries.filter((e) => e.lastmod.slice(0, 10) >= since).map((e) => e.loc);
  }
}

if (!urls.length) {
  console.log("indexnow: nothing to submit.");
  process.exit(0);
}

// The protocol caps one request at 10,000 URLs.
for (let i = 0; i < urls.length; i += 10000) {
  const batch = urls.slice(i, i + 10000);
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: `https://${HOST}/${KEY}.txt`,
      urlList: batch,
    }),
  });
  // 200 = accepted, 202 = accepted while the key is still being validated.
  // Anything else means nothing in the batch was taken.
  const detail = res.ok ? "" : ` ${(await res.text().catch(() => "")).slice(0, 200)}`;
  console.log(`indexnow: ${batch.length} URL(s) -> HTTP ${res.status}${detail}`);
  if (!res.ok) process.exitCode = 1;
}
