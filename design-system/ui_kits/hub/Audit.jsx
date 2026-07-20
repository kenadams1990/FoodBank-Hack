const { Label, DeliveryPlanTable, ImpactNumber } = window.TideLiftDesignSystem_47f3c8;
function Audit() {
  const d = window.hubData;
  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: '28px 24px' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28, margin: '0 0 6px', color: 'var(--text-primary)' }}>Audit Trail</h1>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13.5, color: 'var(--text-secondary)', margin: '0 0 22px', maxWidth: 680, lineHeight: 1.6 }}>
        Every agent draft and every operator decision, logged either way. Radical auditability — the record is the product.
      </p>
      <div style={{ display: 'flex', gap: 28, marginBottom: 22 }}>
        <ImpactNumber value="214" unit="events logged" size={30} />
        <ImpactNumber value="41" unit="operator decisions" size={30} />
        <ImpactNumber value="0" unit="auto-executed" size={30} accent />
      </div>
      <div style={{ marginBottom: 12 }}><Label>Event log</Label></div>
      <DeliveryPlanTable
        columns={[{ label: 'Timestamp' }, { label: 'Actor' }, { label: 'Action' }, { label: 'Detail' }, { label: 'Status' }]}
        rows={d.audit} />
    </div>
  );
}
window.HubAudit = Audit;
