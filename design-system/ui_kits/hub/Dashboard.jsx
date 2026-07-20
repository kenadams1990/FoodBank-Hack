const { SurplusCard, AgentActivityFeed, ImpactNumber, Label, FlowStrip, ExceptionAlert } = window.TideLiftDesignSystem_47f3c8;
function Dashboard({ onOpenLot }) {
  const d = window.hubData;
  const totalLbs = d.lots.reduce((s, l) => s + l.lbs, 0);
  const totalMeals = Math.round(totalLbs / 1.2);
  return (
    <div>
      <div style={{ background: 'var(--ink)', borderBottom: '1px solid var(--line)' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '28px 24px 30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 8 }}>
            <Label color="rgba(232,101,74,.8)">TideLift · cold-chain ops</Label>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(241,247,245,.25)' }}>meals = lbs ÷ 1.2 · Feeding America basis</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, flexWrap: 'wrap', marginBottom: 18 }}>
            <ImpactNumber value={totalLbs.toLocaleString()} unit="lbs" size={56} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 22, color: 'rgba(241,247,245,.25)' }}>→</span>
            <ImpactNumber value={totalMeals.toLocaleString()} unit="meals to ACCFB" size={56} accent />
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginLeft: 8 }}>
              <span style={{ width: 6, height: 6, borderRadius: 99, background: '#7FA98C', animation: 'tlPulse 3s infinite' }} />
              <Label color="#7FA98C">live</Label>
            </span>
          </div>
          <FlowStrip activeIndex={1} />
        </div>
      </div>
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '28px 24px', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        <div>
          <div style={{ marginBottom: 14 }}><Label>Available surplus</Label></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {d.lots.map(l => <SurplusCard key={l.lotId} {...l} onClick={() => onOpenLot && onOpenLot(l)} />)}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <ExceptionAlert title="1 lot expiring within 48 hours with no approved procurement" items={['Halibut — 1,200 lbs — expires in 2d — thermal flag 4.6°C']} />
          <AgentActivityFeed status="Awaiting approval" entries={d.activity} />
          <div style={{ background: 'var(--surface-panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', padding: '16px' }}>
            <div style={{ marginBottom: 12 }}><Label>Impact today</Label></div>
            <ImpactNumber value="1,417" unit="meals · one catch, one click" size={30} accent />
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 10, borderTop: '1px solid var(--line)', paddingTop: 10 }}>$1,008 <span style={{ color: 'var(--text-tertiary)' }}>saved vs market</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
window.HubDashboard = Dashboard;
