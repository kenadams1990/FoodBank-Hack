Catch-ticket card for a surplus lot — the dashboard's core unit. Recreates the app's SurplusCard in the Tide palette.

```jsx
<SurplusCard species="Salmon" vessel="F/V Morning Star" lotId="lot-0043"
  lbs={1700} discountPct={30} tempC={3.2} daysLeft={5} score={87} />
```

Thermal chip auto-tones (>4°C alert, >3°C warn); urgency from daysLeft (≤2 alert, ≤4 warn).
