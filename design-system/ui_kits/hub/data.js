// Shared mock data for the hub UI kit — values grounded in the repo's demo content
window.hubData = {
  lots: [
    { species: 'Salmon', vessel: 'F/V Morning Star', lotId: 'lot-0043', lbs: 1700, discountPct: 30, tempC: 3.2, daysLeft: 5, score: 87 },
    { species: 'Sardine', vessel: 'Monterey Harbor', lotId: 'lot-0044', lbs: 2400, discountPct: 30, tempC: 2.8, daysLeft: 3, score: 74 },
    { species: 'Halibut', vessel: 'F/V Pacific Dawn', lotId: 'lot-0045', lbs: 1200, discountPct: 25, tempC: 4.6, daysLeft: 2, score: 62 },
    { species: 'Rockfish', vessel: 'F/V Sea Verde', lotId: 'lot-0046', lbs: 860, discountPct: 20, tempC: 3.0, daysLeft: 6, score: 69 },
  ],
  activity: [
    { time: '09:14', action: 'Scored lot', detail: 'F/V Morning Star · Salmon', score: 87 },
    { time: '09:11', action: 'Drafted offer', detail: 'Monterey Harbor · Sardine @ 30%' },
    { time: '08:52', action: 'Awaiting approval', detail: 'Lot 3 · Halibut · 1,200 lbs' },
    { time: '08:31', action: 'Delivery planned', detail: 'Oakland Canning Co → ACCFB' },
    { time: '08:10', action: 'Thermal flag', detail: '4.1°C detected on Lot 2' },
  ],
  bins: [
    ['BIN-A1', '540', '2.8', 'L', { chip: 'PASS', tone: 'ok' }, 'within range'],
    ['BIN-A2', '480', '3.4', 'M', { chip: 'PASS', tone: 'ok' }, 'within range'],
    ['BIN-A3', '420', '4.6', 'M', { chip: 'FLAG', tone: 'alert' }, 'drifted >4°C — hold at dock cooler'],
    ['BIN-A4', '260', '3.1', 'S', { chip: 'PASS', tone: 'ok' }, 'within range'],
  ],
  audit: [
    ['2026-07-17 09:41', 'operator:demo', 'APPROVE', 'lot-0043 · dispatch → PROCUREMENT_CONFIRMED', { chip: 'LOGGED', tone: 'ok' }],
    ['2026-07-17 09:22', 'agent:procure', 'DRAFT', 'counter-offer $2.10/lb · salmon 1,700 lbs', { chip: 'PENDING', tone: 'warn' }],
    ['2026-07-17 08:52', 'agent:intake', 'FLAG', 'thermal 4.6°C · bin-07 · hold recommended', { chip: 'LOGGED', tone: 'ok' }],
    ['2026-07-16 17:03', 'operator:demo', 'REJECT', 'lot-0039 · sub-500 lb catch → HOLD path', { chip: 'LOGGED', tone: 'ok' }],
    ['2026-07-16 15:44', 'agent:route', 'DRAFT', 'ACCFB delivery · 1,417 meals · access window 06:00–09:00', { chip: 'APPROVED', tone: 'ok' }],
  ],
};
