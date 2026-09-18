# Barıp kel

A high-fidelity, mobile-first prototype of a school bus tracking and child-safety app,
set at School #1 in Nókis (Nukus), Karakalpakstan. The interface is in **Russian and
English**, switchable from any screen.

Three screens share one live state with **no backend at all** — open them in separate
browser windows and they stay in step.

| Route     | Who it is for   | What it does                                                              |
| --------- | --------------- | ------------------------------------------------------------------------- |
| `/`       | Anyone          | Role switcher and a two-window walkthrough of the live sync                |
| `/driver` | The bus driver  | Route roster, one-tap boarding, call a parent, simulated GPS drive         |
| `/parent` | A parent        | Live ETA, map, boarding alerts, "skip the bus today"                       |
| `/admin`  | School dispatch | Fleet KPIs, route progress, live roster with every parent contact          |

## Running it

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>.

To see the whole point of the prototype, open `/driver` in one window and `/parent` in
another, side by side:

1. On **/driver**, press **Start trip**, then **Simulate** — the bus starts moving.
2. Watch the bus move on the parent's map and the ETA count down in both windows.
3. Tap **Boarded (Mindi)** on a child — the parent window raises a toast and flips to
   "On board" immediately.
4. On **/parent**, press **Skip bus today** and pick a reason — that child's card on the
   driver's roster greys out at once.
5. Open **/admin** in a third window; it already reflects everything above.

## How the live sync works

There is no server. Every tab runs the same reducer (`lib/sync.ts`) over the same stream
of events, which travel between tabs on a `BroadcastChannel`:

- `BUS_LOCATION_UPDATE` — the driver's simulator, every 3 seconds
- `STUDENT_STATUS_CHANGE` — boarded, at school, dropped off
- `STUDENT_ABSENT_TOGGLE` — a parent marking a child absent
- `TRIP_STATE_CHANGE` — a run starting or ending
- `STATE_REQUEST` / `STATE_SNAPSHOT` — a tab joining late asks the others for the truth
- `RESET_DEMO` — back to the starting roster

Each change is also written to `localStorage`, which covers page reloads and stands in as
the transport for browsers without `BroadcastChannel`.

## Layout

```
app/          the four screens
components/   map, student card, toasts, skip-trip modal, avatars, language switcher
hooks/        useBusSync — the cross-tab state hook
lib/          sync engine, mock data, geo maths, derived route state
lib/i18n/     the two dictionaries, the translator, and the React context
types/        shared domain types
public/       generated student avatars
```

## Language

Russian is the default; the **RU / EN** control in each screen's header switches, and the
choice is remembered in `localStorage` and picked up by the other open tabs.

Everything lives in `lib/i18n`:

- `en.ts` is the source of truth. `TranslationKey` is derived from its keys, so `t()`
  only accepts a key that exists, and `ru.ts` is typed as `Dictionary` — a missing
  translation fails the build instead of showing a blank label.
- `t('key', { name })` fills `{named}` placeholders. `tn('count.stops', n)` picks the
  plural form via `Intl.PluralRules`, which Russian needs for its one/few/many split
  («1 остановка», «2 остановки», «5 остановок»).
- Children, parents and the driver live in the synced state rather than in the copy, so
  `names.ts` maps their **record id** to a Cyrillic form. The state itself never changes
  shape per language, which is what keeps the cross-tab sync language-agnostic.
- Route stops carry a stable `id` (`stop1` … `school`); screens render
  `t('waypoint.<id>.name')` and treat the Latin name in `mockData.ts` as a fallback.

Two things the Russian copy deliberately avoids, because they cannot be done by
interpolation: past-tense verbs that agree with a child's gender, and names in an oblique
case. Every sentence carrying a name is phrased so the nominative is correct.

Barlow has no Cyrillic, so Roboto and Roboto Condensed sit directly behind it in the font
stack. The browser resolves fonts per glyph, so Latin still renders in Barlow and only
Cyrillic falls through.

## Notes

- The map is Leaflet over OpenStreetMap tiles, loaded client-side only, restyled to a
  night palette in CSS. It needs an internet connection; everything else runs offline.
- All data is mock data in `lib/mockData.ts` — eight children, one bus, six waypoints.
- Arrival chimes use the Web Audio API and start after the first tap on the page, which is
  what browser autoplay rules require. The visual alert always fires either way.
