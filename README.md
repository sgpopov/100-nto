# 100 NTA

Small Next.js app for tracking two Bulgaria-focused collections:

- The 100+ Bulgarian tourist sites from the Bulgarian Tourist Union list: https://www.btsbg.org/nacionalni-dvizheniya/100-nacionalni-turisticheski-obekta
- A separate collection of souvenir coins found in vending machines around the country

The app is split into two views:

- `/` lists the tourist sites and lets you filter by city/region and visited status.
- `/coins` lists collectible coins and lets you filter by province/location and collected status.

## Data Sources

### Tourist Sites

The main dataset is based on the Bulgarian Tourist Union's 100 National Tourist Sites list:

- https://www.btsbg.org/nacionalni-dvizheniya/100-nacionalni-turisticheski-obekta

The checked-in dataset currently contains:

- 103 city/location groups
- 27 distinct regions
- 234 tourist sites
- 29 marked as visited

Tourist-site data lives in `src/data/places.json`.

### Coins

The coins section tracks commemorative coins sold through vending machines across Bulgaria.
The project is intended to track coins from two vendors:

- Bulgarian Legacy: https://legacy.bg/products?lang=en
- Explore Bulgaria: https://explore-bg.com/?post_type=crb_coin

The current checked-in coin dataset contains:

- 169 coin entries
- 18 marked as collected
- current imported entries are tagged as `bulgarian-legacy`

Coin data lives in `src/data/coins.json`.

## Features

- Tourist-site browsing grouped by city/location
- Filtering tourist sites by region/city and visited state
- Coin browsing in a card grid layout
- Filtering coins by province/location and collected state
- URL query persistence for active filters

## Project Structure

```text
src/
	app/
		page.tsx          # tourist sites page
		coins/page.tsx    # coins page
	components/
		Filter.tsx
		Navigation.tsx
		SiteList.tsx
	data/
		places.json
		coins.json
```

## Development

Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Notes

- Tourist-site progress is stored directly in `src/data/places.json` through each item's `visited` flag.
- Coin progress is stored directly in `src/data/coins.json` through each item's `collected` flag.
