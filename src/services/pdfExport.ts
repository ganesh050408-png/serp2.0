import type { Trip, Activity } from './db';
import { computeBalances, simplifyDebts, totalSpent, spentByCategory, formatMoney } from './settlement';

// ============================================================================
// Trip PDF export (feature L).
//
// Renders the trip as a self-contained, editorial HTML document and hands it to
// the browser's print engine ("Save as PDF"). Zero dependencies, pixel-control
// over the layout, and it matches the app's Instrument Serif / mono aesthetic.
// (A @react-pdf/renderer implementation can replace buildTripHTML later without
// touching callers.)
// ============================================================================

const esc = (s: string): string =>
  s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string,
  );

const CATEGORY_LABEL: Record<string, string> = {
  stay: 'Stay',
  transport: 'Transport',
  flight: 'Flights',
  food: 'Food & Dining',
  activity: 'Activities',
  shopping: 'Shopping',
};

const ACT_GLYPH: Record<Activity['type'], string> = {
  activity: '◇',
  stay: '⌂',
  transport: '→',
  food: '◒',
  shopping: '☓',
};

const fmtRange = (start?: string, end?: string): string => {
  const f = (iso?: string) =>
    iso
      ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
      : '';
  if (start && end) return `${f(start)} — ${f(end)}`;
  return f(start) || 'Dates to be confirmed';
};

function buildTripHTML(trip: Trip): string {
  const nameFor = (userId: string) =>
    trip.collaborators.find((c) => c.userId === userId)?.name ?? 'Traveller';

  const spent = totalSpent(trip.expenses);
  const byCat = spentByCategory(trip.expenses);
  const balances = computeBalances(trip.expenses);
  const settlements = simplifyDebts(balances);
  const generatedAt = new Date().toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const daysHTML = trip.days
    .map((day) => {
      const acts = day.activities
        .map(
          (a) => `
          <div class="act">
            <span class="act-time">${esc(a.time ?? '')}</span>
            <span class="act-glyph">${ACT_GLYPH[a.type] ?? '◇'}</span>
            <span class="act-title">${esc(a.title)}</span>
          </div>`,
        )
        .join('');
      return `
      <div class="day">
        <div class="day-head">
          <span class="day-num">Day ${String(day.dayNumber).padStart(2, '0')}</span>
          <span class="day-city">${esc(day.city)}</span>
          ${day.date ? `<span class="day-date">${esc(day.date)}</span>` : ''}
        </div>
        <div class="acts">${acts || '<div class="act muted">No activities planned.</div>'}</div>
      </div>`;
    })
    .join('');

  const catHTML = (Object.keys(byCat) as (keyof typeof byCat)[])
    .filter((c) => byCat[c] > 0)
    .map(
      (c) =>
        `<div class="row"><span>${CATEGORY_LABEL[c] ?? c}</span><span class="mono">${formatMoney(
          byCat[c],
          trip.currency,
        )}</span></div>`,
    )
    .join('');

  const settleHTML = settlements.length
    ? settlements
        .map(
          (s) =>
            `<div class="row"><span>${esc(nameFor(s.fromUserId))} → ${esc(
              nameFor(s.toUserId),
            )}</span><span class="mono">${formatMoney(s.amount, trip.currency)}</span></div>`,
        )
        .join('')
    : '<div class="row muted"><span>All settled — nobody owes anybody.</span></div>';

  const travellersHTML = trip.collaborators
    .map(
      (c) =>
        `<span class="chip">${esc(c.name)}${
          c.role === 'owner' ? ' · organiser' : ''
        }</span>`,
    )
    .join('');

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>${esc(trip.title)} — Itinerary</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
<style>
  @page { size: A4; margin: 18mm 16mm; }
  * { box-sizing: border-box; }
  body {
    font-family: 'Inter', -apple-system, system-ui, sans-serif;
    color: #000; margin: 0; padding: 0; font-size: 12px; line-height: 1.5;
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }
  .mono { font-family: 'JetBrains Mono', ui-monospace, monospace; }
  .serif { font-family: 'Instrument Serif', Georgia, serif; }
  .label { font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: #6F6F6F; }
  .muted { color: #6F6F6F; }

  .cover { padding: 20px 0 28px; border-bottom: 1px solid #E7E5E2; margin-bottom: 28px; }
  .cover h1 { font-family: 'Instrument Serif', Georgia, serif; font-size: 52px; line-height: 0.98; margin: 6px 0 12px; font-weight: 400; }
  .cover .meta { display: flex; gap: 24px; flex-wrap: wrap; margin-top: 14px; }
  .cover .meta div span.v { display: block; font-size: 15px; margin-top: 2px; }

  .accent { color: #000; background: rgba(245,152,242,0.18); padding: 1px 7px; border-radius: 999px; }

  section { margin-bottom: 26px; }
  .sec-title { font-family: 'Instrument Serif', Georgia, serif; font-size: 26px; margin: 0 0 14px; font-weight: 400; }

  .day { border: 1px solid #E7E5E2; border-radius: 12px; padding: 12px 14px; margin-bottom: 10px; page-break-inside: avoid; }
  .day-head { display: flex; align-items: baseline; gap: 10px; border-bottom: 1px solid #F0EEEB; padding-bottom: 8px; margin-bottom: 8px; }
  .day-num { font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: #6F6F6F; }
  .day-city { font-family: 'Instrument Serif', Georgia, serif; font-size: 20px; }
  .day-date { margin-left: auto; font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #6F6F6F; }
  .act { display: flex; align-items: baseline; gap: 10px; padding: 4px 0; }
  .act-time { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #6F6F6F; width: 42px; flex: none; }
  .act-glyph { color: #999; width: 12px; flex: none; text-align: center; }
  .act-title { flex: 1; }

  .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
  .card { border: 1px solid #E7E5E2; border-radius: 12px; padding: 14px 16px; page-break-inside: avoid; }
  .row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #F0EEEB; }
  .row:last-child { border-bottom: 0; }

  .stats { display: flex; gap: 26px; flex-wrap: wrap; }
  .stats .stat .n { font-family: 'Instrument Serif', Georgia, serif; font-size: 30px; display: block; }

  .chip { display: inline-block; border: 1px solid #E7E5E2; border-radius: 999px; padding: 3px 12px; margin: 0 6px 6px 0; font-size: 11px; }

  footer { margin-top: 30px; padding-top: 12px; border-top: 1px solid #E7E5E2; display: flex; justify-content: space-between; }
</style>
</head>
<body>
  <div class="cover">
    <span class="label">Aethera · Trip Itinerary</span>
    <h1>${esc(trip.title)}</h1>
    <span class="label">${esc(trip.cities.join('  ·  '))}</span>
    <div class="meta">
      <div><span class="label">Dates</span><span class="v">${fmtRange(trip.startDate, trip.endDate)}</span></div>
      <div><span class="label">Duration</span><span class="v">${trip.days.length} days</span></div>
      <div><span class="label">Travellers</span><span class="v">${trip.collaborators.length}</span></div>
      <div><span class="label">Status</span><span class="v"><span class="accent">${esc(trip.status)}</span></span></div>
    </div>
  </div>

  <section>
    <div class="stats">
      <div class="stat"><span class="label">Budget target</span><span class="n">${
        trip.budgetTarget ? formatMoney(trip.budgetTarget, trip.currency) : '—'
      }</span></div>
      <div class="stat"><span class="label">Spent so far</span><span class="n">${formatMoney(
        spent,
        trip.currency,
      )}</span></div>
      <div class="stat"><span class="label">Per person</span><span class="n">${formatMoney(
        spent / Math.max(1, trip.collaborators.length),
        trip.currency,
      )}</span></div>
    </div>
  </section>

  <section>
    <h2 class="sec-title">Itinerary</h2>
    ${daysHTML}
  </section>

  <section>
    <div class="grid2">
      <div class="card">
        <span class="label">Where it went</span>
        <div style="margin-top:8px">${catHTML || '<div class="row muted"><span>No expenses recorded.</span></div>'}</div>
      </div>
      <div class="card">
        <span class="label">Settle up</span>
        <div style="margin-top:8px">${settleHTML}</div>
      </div>
    </div>
  </section>

  <section>
    <span class="label">Travelling party</span>
    <div style="margin-top:10px">${travellersHTML}</div>
  </section>

  <footer>
    <span class="label">Generated by Aethera</span>
    <span class="label">${esc(generatedAt)}</span>
  </footer>
</body>
</html>`;
}

/**
 * Open the trip as a print-ready document. The user picks "Save as PDF" (or a
 * printer) in the native dialog. Returns false if a popup blocker prevented it.
 */
export function exportTripToPDF(trip: Trip): boolean {
  const html = buildTripHTML(trip);
  const win = window.open('', '_blank', 'width=900,height=1000');
  if (!win) return false;
  win.document.open();
  win.document.write(html);
  win.document.close();

  const triggerPrint = () => {
    win.focus();
    win.print();
  };
  // Give the linked fonts a beat to load; fall back if onload already passed.
  win.onload = () => setTimeout(triggerPrint, 350);
  setTimeout(() => {
    if (win && !win.closed) triggerPrint();
  }, 900);
  return true;
}
