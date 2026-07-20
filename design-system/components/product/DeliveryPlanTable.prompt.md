Mono data table for delivery plans, dockside sort bins, audit rows — hairline dividers, tabular figures.

```jsx
<DeliveryPlanTable
  columns={[{label:'Container'},{label:'Lbs',align:'right'},{label:'Temp (°C)',align:'right'},{label:'QA'}]}
  rows={[['BIN-A1', '540', '2.8', {chip:'PASS',tone:'ok'}],
         ['BIN-A2', '480', '4.6', {chip:'FLAG',tone:'alert'}]]} />
```
