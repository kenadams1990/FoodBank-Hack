const { Logo, Label } = window.TideLiftDesignSystem_47f3c8;
function Topbar({ active, onNav }) {
  const items = ['Dashboard', 'Intake', 'Audit'];
  return (
    <header style={{ background: 'var(--ink)', borderBottom: '1px solid var(--line)', position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', gap: 20 }}>
        <Logo variant="compact" size={24} />
        <nav style={{ display: 'flex', gap: 2, marginLeft: 12 }}>
          {items.map(it => (
            <a key={it} onClick={() => onNav(it)} style={{ fontFamily: 'var(--font-mono)', fontSize: 13, padding: '6px 12px', cursor: 'pointer', borderRadius: 'var(--radius-sm)', color: active === it ? 'var(--ink)' : 'rgba(241,247,245,.55)', background: active === it ? 'var(--salmon)' : 'transparent', fontWeight: active === it ? 600 : 400 }}>{it}</a>
          ))}
        </nav>
        <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(241,247,245,.35)' }}>Agent recommends. You decide.</span>
      </div>
    </header>
  );
}
window.HubTopbar = Topbar;
