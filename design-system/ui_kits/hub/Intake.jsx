const { Label, Chip, Readout, Button, ImpactNumber, DeliveryPlanTable, ApprovalActions, ExceptionAlert } = window.TideLiftDesignSystem_47f3c8;
const { useState } = React;
function Intake() {
  const d = window.hubData;
  const [phase, setPhase] = useState('idle'); // idle | running | ran | approved | rejected
  const run = () => { setPhase('running'); setTimeout(() => setPhase('ran'), 900); };
  const mono = { fontFamily: 'var(--font-mono)' };
  const panel = { background: 'var(--surface-panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)' };
  const statCell = { ...panel, padding: '12px 14px' };
  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: '28px 24px' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28, margin: '0 0 6px', color: 'var(--text-primary)' }}>Vessel Intake — Dock to Processing</h1>
      <p style={{ ...mono, fontSize: 13.5, color: 'var(--text-secondary)', maxWidth: 720, margin: '0 0 18px', lineHeight: 1.6 }}>
        On-vessel computer vision drives the purchase decision before the truck rolls. Run the intake pipeline on a logged catch, then decide: the agent drafts, you approve. Every decision is written to the audit log.
      </p>
      <div style={{ ...panel, padding: '10px 14px', display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'center', marginBottom: 22 }}>
        <Label>What's real:</Label>
        <span style={{ ...mono, fontSize: 12, color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 7, height: 7, borderRadius: 99, background: '#7FA98C' }} />Scoring · procurement · routing — live agent logic</span>
        <span style={{ ...mono, fontSize: 12, color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 7, height: 7, borderRadius: 99, background: 'var(--warning)' }} />CV counts &amp; thermal readings — simulated (fish-scan model is roadmap)</span>
      </div>
      <div style={{ ...panel, padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 19, color: 'var(--text-primary)' }}>F/V Morning Star</span>
              <Chip tone="neutral">wild-catch</Chip>
            </div>
            <div style={{ ...mono, fontSize: 12.5, color: 'var(--text-tertiary)', marginTop: 3 }}>Salmon · Half Moon Bay · pickup window 06:00–09:00</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ ...mono, fontWeight: 600, fontSize: 15, color: 'var(--text-primary)' }}>1,700 lbs</div>
            <Readout style={{ marginTop: 4 }}>lot-0043</Readout>
          </div>
        </div>
        <div style={{ background: 'rgba(241,247,245,.03)', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: 16, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <Label>On-vessel computer vision</Label><Chip tone="warn">Simulated</Chip>
          <span style={{ ...mono, fontSize: 12.5, color: 'var(--text-secondary)' }}>212 detected · avg 8.0 lbs · grade M · confidence 91%</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Chip tone="ok">DISPATCH RECOMMENDED</Chip>
            <span style={{ ...mono, fontSize: 12.5, color: 'var(--text-secondary)' }}>High-confidence count above 500 lb threshold · cold transport: unit CT-2</span>
          </div>
          {phase === 'idle' && <Button onClick={run}>Run intake pipeline</Button>}
          {phase === 'running' && <Button disabled>Running…</Button>}
          {phase !== 'idle' && phase !== 'running' && <span style={{ ...mono, fontSize: 12, color: '#7FA98C' }}>✓ pipeline run</span>}
        </div>
        {(phase === 'ran' || phase === 'approved' || phase === 'rejected') && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 18 }}>
            <div style={statCell}><Label>Opportunity score</Label><div style={{ marginTop: 8 }}><ImpactNumber value="87" unit="/100" size={26} /></div></div>
            <div style={statCell}><Label>Counter-offer</Label><div style={{ marginTop: 8 }}><ImpactNumber value="$2.10" unit="/lb" size={26} /></div><div style={{ ...mono, fontSize: 11, color: '#7FA98C', marginTop: 4 }}>$1,008 saved vs market</div></div>
            <div style={statCell}><Label>Facility match</Label><div style={{ ...mono, fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', marginTop: 10 }}>Oakland Canning Co</div></div>
            <div style={statCell}><Label>Route → ACCFB</Label><div style={{ marginTop: 8 }}><ImpactNumber value="1,700" unit="lbs" size={26} /></div></div>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <Label>Dockside sort — barcoded bins</Label><Chip tone="warn">Thermal QA simulated</Chip>
        </div>
        <DeliveryPlanTable
          columns={[{ label: 'Container' }, { label: 'Lbs', align: 'right' }, { label: 'Temp (°C)', align: 'right' }, { label: 'Grade' }, { label: 'QA' }, { label: 'Reason' }]}
          rows={d.bins} />
        {phase === 'ran' && (
          <div style={{ marginTop: 16 }}>
            <ExceptionAlert title="BIN-A3 drifted to 4.6°C — excluded from dispatch draft. Confirm before proceeding." style={{ marginBottom: 14 }} />
            <ApprovalActions reason="Pending approval logged · Agent recommends. You decide." onApprove={() => setPhase('approved')} onReject={() => setPhase('rejected')} />
          </div>
        )}
        {phase === 'approved' && <div style={{ marginTop: 16 }}><ApprovalActions state="approved" /><div style={{ ...mono, fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>Lot moved to PROCUREMENT_CONFIRMED · ACCFB shipment scheduled (59 cases). <a>View in audit trail →</a></div></div>}
        {phase === 'rejected' && <div style={{ marginTop: 16 }}><ApprovalActions state="rejected" /></div>}
      </div>
    </div>
  );
}
window.HubIntake = Intake;
