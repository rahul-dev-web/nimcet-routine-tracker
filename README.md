# NIMCET Routine Tracker

Personal daily routine app for NIMCET prep — college vs home day, study blocks, and progress tracking.

## Routine rules (v3)

- **Wake:** 7:00 AM (no jogging / exercise block).
- **Every morning:** Dashboard par puchha jata hai — *Aaj college jaa rahe ho?* Jawab **9:00 AM tak** valid; uske baad jawab na ho to **ghar wala routine** auto-default.
- **College day:** 7–9 breakfast / fresh / ghar ke kaam → 9–9:30 college travel → 9:30 AM–9 PM detailed college/study routine → 9–9:30 dinner → 9:30 PM–12:15 AM coding, projects, games → sleep.
- **Ghar day:** 7–9:30 morning prep → padhai ke blocks **25% chhote** + afternoon *rest, games, projects* block → dinner tak routine → 9:30 PM–12:15 AM coding, projects, games → sleep.
- **Dashboard:** college prompt yahin dikhta hai; prompt 9 AM ke baad hide ho jata hai aur unanswered plan automatically ghar wale routine par save hota hai. Baaki dashboard routine normal tarah se dikhta hai.
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
