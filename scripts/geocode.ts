/**
 * One-time geocoding script — populates lat/lng for tourist sites via Nominatim.
 *
 * Usage:
 *   npx tsx scripts/geocode.ts
 *
 * Nominatim usage policy requires max 1 request/second and a descriptive User-Agent.
 * https://operations.osmfoundation.org/policies/nominatim/
 */

import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const PLACES_PATH = join(process.cwd(), "src/data/places.json");
const DELAY_MS = 1100; // slightly over 1s to respect rate limit

interface Site {
  name: string;
  number: string;
  image: string;
  link: string;
  visited: boolean;
  lat?: number;
  lng?: number;
}

interface CityGroup {
  city: string;
  region: string;
  sites: Site[];
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function geocode(
  query: string
): Promise<{ lat: number; lng: number } | null> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=bg`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": "100-nta-geocoder/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(`Nominatim HTTP ${response.status} for: ${query}`);
  }

  const results = (await response.json()) as NominatimResult[];

  if (results.length === 0) {
    return null;
  }

  return {
    lat: parseFloat(results[0].lat),
    lng: parseFloat(results[0].lon),
  };
}

async function main() {
  const data: CityGroup[] = JSON.parse(readFileSync(PLACES_PATH, "utf-8"));

  const failed: { city: string; name: string; query: string }[] = [];
  let updated = 0;
  let skipped = 0;
  let total = 0;

  for (const group of data) {
    for (const site of group.sites) {
      total++;

      if (site.lat !== undefined && site.lng !== undefined) {
        skipped++;
        continue;
      }

      const query = `${site.name}, ${group.city}, България`;
      process.stdout.write(`[${total}] ${query} ... `);

      await sleep(DELAY_MS);

      try {
        const coords = await geocode(query);

        if (coords) {
          site.lat = coords.lat;
          site.lng = coords.lng;
          updated++;
          console.log(`✓ ${coords.lat}, ${coords.lng}`);
        } else {
          failed.push({ city: group.city, name: site.name, query });
          console.log("✗ not found");
        }
      } catch (err) {
        failed.push({ city: group.city, name: site.name, query });
        console.log(`✗ error: ${err}`);
      }
    }
  }

  writeFileSync(PLACES_PATH, JSON.stringify(data, null, 2) + "\n", "utf-8");

  console.log("\n--- Summary ---");
  console.log(`Total sites : ${total}`);
  console.log(`Updated     : ${updated}`);
  console.log(`Skipped     : ${skipped} (already had coordinates)`);
  console.log(`Failed      : ${failed.length}`);

  if (failed.length > 0) {
    console.log("\nFailed lookups (fix manually):");
    for (const f of failed) {
      console.log(`  - [${f.city}] ${f.name}`);
      console.log(`    Query: ${f.query}`);
    }
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
