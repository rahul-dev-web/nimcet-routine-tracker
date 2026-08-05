# NIMCET Routine Tracker

Personal daily routine app for NIMCET prep — college vs home day, study blocks, and progress tracking.

## Routine rules (v2)

- **Wake:** 7:00 AM (no jogging / exercise block).
- **Every morning:** Dashboard par puchha jata hai — *Aaj college jaa rahe ho?* Jawab **9:00 AM tak** valid; uske baad jawab na ho to **ghar wala routine** auto-default.
- **College day:** 7–9 breakfast / fresh / ghar ke kaam → 9–9:30 college → 9:30–12:15 coding, projects, games → 12:15–7:00 rest/sleep → dinner ke baad wahi evening blocks.
- **Ghar day:** 7–9:30 morning prep → padhai ke blocks **25% chhote** + extra *Rest + games + projects* → dinner tak same evening.
- **Sat / Sun (ghar):** naye concepts ki jagah **question solving** focus task titles.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
npm start
```

Data `localStorage` mein save hota hai (`routineStore` key).
