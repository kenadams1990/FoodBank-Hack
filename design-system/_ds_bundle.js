/* @ds-bundle: {"format":4,"namespace":"TideLiftDesignSystem_47f3c8","components":[{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Chip","sourcePath":"components/core/Chip.jsx"},{"name":"Icon","sourcePath":"components/core/Icon.jsx"},{"name":"ImpactNumber","sourcePath":"components/core/ImpactNumber.jsx"},{"name":"Label","sourcePath":"components/core/Label.jsx"},{"name":"Logo","sourcePath":"components/core/Logo.jsx"},{"name":"Readout","sourcePath":"components/core/Readout.jsx"},{"name":"AgentActivityFeed","sourcePath":"components/product/AgentActivityFeed.jsx"},{"name":"ApprovalActions","sourcePath":"components/product/ApprovalActions.jsx"},{"name":"DeliveryPlanTable","sourcePath":"components/product/DeliveryPlanTable.jsx"},{"name":"ExceptionAlert","sourcePath":"components/product/ExceptionAlert.jsx"},{"name":"FlowStrip","sourcePath":"components/product/FlowStrip.jsx"},{"name":"SurplusCard","sourcePath":"components/product/SurplusCard.jsx"}],"sourceHashes":{"components/core/Button.jsx":"16c1458b24f2","components/core/Chip.jsx":"b06152c4862e","components/core/Icon.jsx":"a32b60591e46","components/core/ImpactNumber.jsx":"ae07ab149dd6","components/core/Label.jsx":"082200f854ff","components/core/Logo.jsx":"27b23422aa01","components/core/Readout.jsx":"7612c12bc944","components/product/AgentActivityFeed.jsx":"99e387cb8547","components/product/ApprovalActions.jsx":"862de28cb3e0","components/product/DeliveryPlanTable.jsx":"362520200f27","components/product/ExceptionAlert.jsx":"eedbe20200cc","components/product/FlowStrip.jsx":"78c54c524744","components/product/SurplusCard.jsx":"ebdba36d170c","ui_kits/hub/Audit.jsx":"07a7b206fd09","ui_kits/hub/Dashboard.jsx":"22afda96f780","ui_kits/hub/Intake.jsx":"1fed4adef91c","ui_kits/hub/Topbar.jsx":"5988e62f9ebf","ui_kits/hub/data.js":"22678e91ea4f"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.TideLiftDesignSystem_47f3c8 = window.TideLiftDesignSystem_47f3c8 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Button.jsx
try { (() => {
const {
  useState
} = React;
/** TideLift button. Salmon primary is the screen's single signal; secondary is a hairline ghost. */
function Button({
  variant = 'primary',
  size = 'md',
  disabled,
  children,
  onClick,
  style
}) {
  const [hover, setHover] = useState(false);
  const [press, setPress] = useState(false);
  const pad = size === 'sm' ? '6px 12px' : size === 'lg' ? '12px 22px' : '9px 16px';
  const fs = size === 'sm' ? 12 : size === 'lg' ? 15 : 13;
  const variants = {
    primary: {
      background: press ? '#D65A41' : hover ? '#EF7D66' : 'var(--salmon)',
      color: 'var(--ink)',
      border: '1px solid transparent'
    },
    secondary: {
      background: hover ? 'rgba(241,247,245,.06)' : 'transparent',
      color: 'var(--foam)',
      border: '1px solid var(--line-strong)'
    },
    danger: {
      background: press ? '#A93A28' : hover ? '#D25540' : 'var(--danger)',
      color: 'var(--foam)',
      border: '1px solid transparent'
    }
  };
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    disabled: disabled,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setPress(false);
    },
    onMouseDown: () => setPress(true),
    onMouseUp: () => setPress(false),
    style: {
      fontFamily: 'var(--font-mono)',
      fontWeight: 600,
      fontSize: fs,
      padding: pad,
      borderRadius: 'var(--radius-sm)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.45 : 1,
      transition: 'background var(--dur-fast) var(--ease-out)',
      ...(variants[variant] || variants.primary),
      ...style
    }
  }, children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Icon.jsx
try { (() => {
const P = {
  'arrow-right': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M5 12h14"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m12 5 7 7-7 7"
  })),
  'arrow-down': /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M12 5v14"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m19 12-7 7-7-7"
  })),
  check: /*#__PURE__*/React.createElement("path", {
    d: "M20 6 9 17l-5-5"
  }),
  close: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M18 6 6 18"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m6 6 12 12"
  })),
  plus: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M5 12h14"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 5v14"
  })),
  minus: /*#__PURE__*/React.createElement("path", {
    d: "M5 12h14"
  }),
  search: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
    cx: "11",
    cy: "11",
    r: "8"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m21 21-4.3-4.3"
  })),
  user: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "7",
    r: "4"
  })),
  settings: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "3"
  })),
  bell: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M10.3 21a1.94 1.94 0 0 0 3.4 0"
  })),
  menu: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M4 12h16"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M4 6h16"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M4 18h16"
  })),
  info: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "10"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 16v-4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 8h.01"
  })),
  thermometer: /*#__PURE__*/React.createElement("path", {
    d: "M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"
  }),
  clock: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "10"
  }), /*#__PURE__*/React.createElement("polyline", {
    points: "12 6 12 12 16 14"
  }))
};
/** Lucide-style icon: 1.5px stroke, butt caps, 24×24 grid. */
function Icon({
  name,
  size = 20,
  color = 'currentColor',
  style
}) {
  return /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: "1.5",
    strokeLinecap: "butt",
    strokeLinejoin: "miter",
    style: style,
    "aria-hidden": "true"
  }, P[name] || P.info);
}
Object.assign(__ds_scope, { Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Icon.jsx", error: String((e && e.message) || e) }); }

// components/core/Chip.jsx
try { (() => {
/** Status chip — mono, hairline border, muted semantic tints. Mirrors the app's chip-ok/warn/alert/neutral. */
function Chip({
  tone = 'neutral',
  icon,
  children,
  style
}) {
  const tones = {
    ok: {
      color: '#7FA98C',
      border: 'rgba(63,107,79,.5)',
      bg: 'rgba(63,107,79,.14)'
    },
    warn: {
      color: 'var(--warning)',
      border: 'rgba(232,163,60,.4)',
      bg: 'rgba(232,163,60,.10)'
    },
    alert: {
      color: '#E4715A',
      border: 'rgba(196,67,46,.5)',
      bg: 'rgba(196,67,46,.14)'
    },
    neutral: {
      color: 'var(--mist)',
      border: 'var(--line-strong)',
      bg: 'rgba(241,247,245,.04)'
    },
    accent: {
      color: 'var(--salmon)',
      border: 'rgba(232,101,74,.4)',
      bg: 'rgba(232,101,74,.10)'
    }
  };
  const t = tones[tone] || tones.neutral;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      padding: '2px 8px',
      borderRadius: 'var(--radius-sm)',
      color: t.color,
      border: `1px solid ${t.border}`,
      background: t.bg,
      whiteSpace: 'nowrap',
      ...style
    }
  }, icon ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 11
  }) : null, children);
}
Object.assign(__ds_scope, { Chip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Chip.jsx", error: String((e && e.message) || e) }); }

// components/core/ImpactNumber.jsx
try { (() => {
/** Big display metric with mono unit label. Numbers lead every screen. */
function ImpactNumber({
  value,
  unit,
  accent = false,
  size = 42,
  style
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'baseline',
      gap: 8,
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: size,
      lineHeight: 1,
      letterSpacing: '-0.01em',
      fontVariantNumeric: 'tabular-nums',
      color: accent ? 'var(--salmon)' : 'var(--text-primary)'
    }
  }, value), unit ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: Math.max(11, size * 0.28),
      color: 'var(--text-tertiary)'
    }
  }, unit) : null);
}
Object.assign(__ds_scope, { ImpactNumber });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/ImpactNumber.jsx", error: String((e && e.message) || e) }); }

// components/core/Label.jsx
try { (() => {
/** ALL-CAPS mono section label at 0.28em tracking. */
function Label({
  children,
  color = 'var(--text-tertiary)',
  style
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontWeight: 500,
      fontSize: 11,
      letterSpacing: '0.28em',
      textTransform: 'uppercase',
      color,
      ...style
    }
  }, children);
}
Object.assign(__ds_scope, { Label });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Label.jsx", error: String((e && e.message) || e) }); }

// components/core/Logo.jsx
try { (() => {
/** TideLift mark + wordmark lockup. Mark: three ascending bars + beacon dot. */
function Logo({
  variant = 'lockup',
  on = 'dark',
  size = 24,
  style
}) {
  const c = on === 'dark' ? {
    mark: '#E8654A',
    text: 'var(--foam)'
  } : {
    mark: '#1C2B2C',
    text: 'var(--slate-ink)'
  };
  const mark = /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "2",
    y: "16",
    width: "4",
    height: "6",
    fill: c.mark
  }), /*#__PURE__*/React.createElement("rect", {
    x: "8",
    y: "12",
    width: "4",
    height: "10",
    fill: c.mark
  }), /*#__PURE__*/React.createElement("rect", {
    x: "14",
    y: "8",
    width: "4",
    height: "14",
    fill: c.mark
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "16",
    cy: "4",
    r: "2",
    fill: c.mark
  }));
  if (variant === 'mark') return /*#__PURE__*/React.createElement("span", {
    style: style
  }, mark);
  if (variant === 'compact') return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: size * 0.5,
      ...style
    }
  }, React.cloneElement(mark, {
    width: size * 0.75,
    height: size * 0.75
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontWeight: 500,
      fontSize: size * 0.55,
      letterSpacing: '0.28em',
      color: c.text
    }
  }, "TIDELIFT"));
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: size * 0.4,
      ...style
    }
  }, mark, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: size * 0.95,
      letterSpacing: '-0.01em',
      color: c.text,
      lineHeight: 1
    }
  }, "TideLift"));
}
Object.assign(__ds_scope, { Logo });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Logo.jsx", error: String((e && e.message) || e) }); }

// components/core/Readout.jsx
try { (() => {
/** Mono readout chip for verified data: lot codes, lbs, °C, %. Mirrors the app's .readout utility. */
function Readout({
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      letterSpacing: '-0.01em',
      fontVariantNumeric: 'tabular-nums',
      background: 'rgba(241,247,245,.05)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--radius-sm)',
      padding: '2px 6px',
      color: 'var(--text-secondary)',
      ...style
    }
  }, children);
}
Object.assign(__ds_scope, { Readout });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Readout.jsx", error: String((e && e.message) || e) }); }

// components/product/AgentActivityFeed.jsx
try { (() => {
/** Agent activity feed panel — timestamped log of drafts, flags, and approvals. */
function AgentActivityFeed({
  entries = [],
  status = 'Scanning feed',
  style
}) {
  const statusColor = {
    'Idle': 'var(--text-tertiary)',
    'Scanning feed': '#7FA98C',
    'Negotiating': 'var(--warning)',
    'Awaiting approval': 'var(--salmon)',
    'Delivery planned': '#7FA98C'
  }[status] || 'var(--mist)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-panel)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--radius-sm)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px',
      borderBottom: '1px solid var(--line)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Label, null, "Agent activity"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 7,
      height: 7,
      borderRadius: 99,
      background: statusColor,
      animation: 'tlPulse 3s cubic-bezier(.4,0,.6,1) infinite'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      color: 'var(--text-secondary)'
    }
  }, status)), /*#__PURE__*/React.createElement("style", null, '@keyframes tlPulse{0%,100%{opacity:1}50%{opacity:.35}}')), /*#__PURE__*/React.createElement("div", null, entries.map((e, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      gap: 10,
      padding: '10px 16px',
      borderBottom: i < entries.length - 1 ? '1px solid var(--line)' : 'none'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      marginTop: 6,
      width: 6,
      height: 6,
      borderRadius: 99,
      background: 'rgba(232,101,74,.55)',
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      color: 'var(--text-tertiary)'
    }
  }, e.time), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontWeight: 500,
      fontSize: 13.5,
      color: 'var(--text-primary)',
      lineHeight: 1.3
    }
  }, e.action), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11.5,
      color: 'var(--text-secondary)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, e.detail), e.score != null && /*#__PURE__*/React.createElement(__ds_scope.Chip, {
    tone: "accent",
    style: {
      marginTop: 4
    }
  }, "score ", e.score, "/100")))), entries.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '22px 16px',
      textAlign: 'center',
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      color: 'var(--text-tertiary)'
    }
  }, "No activity yet \u2014 the agent will log decisions here")));
}
Object.assign(__ds_scope, { AgentActivityFeed });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/product/AgentActivityFeed.jsx", error: String((e && e.message) || e) }); }

// components/product/ApprovalActions.jsx
try { (() => {
/** Approve/Reject decision row — the human-in-the-loop moment. Reason leads; decision is logged. */
function ApprovalActions({
  reason,
  approveLabel = 'Approve dispatch',
  rejectLabel = 'Reject',
  state = 'pending',
  onApprove,
  onReject,
  style
}) {
  const mono = {
    fontFamily: 'var(--font-mono)'
  };
  if (state === 'approved') return /*#__PURE__*/React.createElement("div", {
    style: {
      ...mono,
      fontSize: 13,
      padding: '12px 16px',
      background: 'rgba(63,107,79,.14)',
      border: '1px solid rgba(63,107,79,.5)',
      borderRadius: 'var(--radius-sm)',
      color: '#7FA98C',
      ...style
    }
  }, "\u2713 Approved \u2014 logged to audit trail.");
  if (state === 'rejected') return /*#__PURE__*/React.createElement("div", {
    style: {
      ...mono,
      fontSize: 13,
      padding: '12px 16px',
      background: 'rgba(241,247,245,.04)',
      border: '1px solid var(--line-strong)',
      borderRadius: 'var(--radius-sm)',
      color: 'var(--text-secondary)',
      ...style
    }
  }, "Rejected \u2014 logged to audit trail.");
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      flexWrap: 'wrap',
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      ...mono,
      fontSize: 11.5,
      color: 'var(--text-tertiary)',
      marginRight: 'auto'
    }
  }, reason || 'Agent recommends. You decide.'), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "secondary",
    onClick: onReject
  }, rejectLabel), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "primary",
    onClick: onApprove
  }, approveLabel));
}
Object.assign(__ds_scope, { ApprovalActions });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/product/ApprovalActions.jsx", error: String((e && e.message) || e) }); }

// components/product/DeliveryPlanTable.jsx
try { (() => {
/** Data table for delivery plans / dockside sort — mono cells, hairline rows, chip statuses. */
function DeliveryPlanTable({
  columns = [],
  rows = [],
  style
}) {
  const th = {
    textAlign: 'left',
    fontFamily: 'var(--font-mono)',
    fontWeight: 500,
    fontSize: 10.5,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: 'var(--text-tertiary)',
    padding: '8px 12px',
    borderBottom: '1px solid var(--line-strong)'
  };
  const td = {
    fontFamily: 'var(--font-mono)',
    fontSize: 13,
    color: 'var(--text-secondary)',
    padding: '9px 12px',
    borderBottom: '1px solid var(--line)',
    fontVariantNumeric: 'tabular-nums'
  };
  const renderCell = cell => {
    if (cell && typeof cell === 'object' && cell.chip) return /*#__PURE__*/React.createElement(__ds_scope.Chip, {
      tone: cell.tone || 'neutral'
    }, cell.chip);
    return cell;
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-panel)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--radius-sm)',
      overflow: 'hidden',
      ...style
    }
  }, /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      borderCollapse: 'collapse'
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, columns.map((c, i) => /*#__PURE__*/React.createElement("th", {
    key: i,
    style: {
      ...th,
      textAlign: c.align || 'left'
    }
  }, c.label)))), /*#__PURE__*/React.createElement("tbody", null, rows.map((r, ri) => /*#__PURE__*/React.createElement("tr", {
    key: ri
  }, r.map((cell, ci) => /*#__PURE__*/React.createElement("td", {
    key: ci,
    style: {
      ...td,
      textAlign: columns[ci]?.align || 'left',
      ...(ri === rows.length - 1 ? {
        borderBottom: 'none'
      } : null)
    }
  }, renderCell(cell))))))), rows.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px',
      textAlign: 'center',
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      color: 'var(--text-tertiary)'
    }
  }, "No deliveries planned yet."));
}
Object.assign(__ds_scope, { DeliveryPlanTable });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/product/DeliveryPlanTable.jsx", error: String((e && e.message) || e) }); }

// components/product/ExceptionAlert.jsx
try { (() => {
/** Exception alert panel — warm dark surface, salmon text. Facts + next action, never alarm. */
function ExceptionAlert({
  title,
  items = [],
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-error)',
      border: '1px solid rgba(232,101,74,.35)',
      borderRadius: 'var(--radius-sm)',
      padding: '14px 16px',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontWeight: 600,
      fontSize: 13,
      color: 'var(--salmon)'
    }
  }, title), items.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8,
      display: 'flex',
      flexDirection: 'column',
      gap: 4
    }
  }, items.map((it, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 12.5,
      color: '#E4A796',
      lineHeight: 1.5
    }
  }, it))));
}
Object.assign(__ds_scope, { ExceptionAlert });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/product/ExceptionAlert.jsx", error: String((e && e.message) || e) }); }

// components/product/FlowStrip.jsx
try { (() => {
/** Cold-chain flow strip: Vessel ──●── Pickup ─── Processing ─── Food Bank. Mono, unicode connectors. */
function FlowStrip({
  stages = ['Vessel', 'Pickup', 'Processing', 'Food Bank'],
  activeIndex = 0,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 0,
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      ...style
    }
  }, stages.map((s, i) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: s
  }, i > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      margin: '0 8px',
      color: 'var(--text-tertiary)',
      opacity: .6
    }
  }, i === activeIndex ? '──●──' : '───'), /*#__PURE__*/React.createElement("span", {
    style: {
      color: i <= activeIndex ? 'var(--salmon)' : 'var(--text-tertiary)',
      fontWeight: i <= activeIndex ? 500 : 400
    }
  }, s))));
}
Object.assign(__ds_scope, { FlowStrip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/product/FlowStrip.jsx", error: String((e && e.message) || e) }); }

// components/product/SurplusCard.jsx
try { (() => {
const {
  useState
} = React;
/** Catch-ticket card for a surplus lot — species, vessel, lbs, discount, thermal + urgency chips. */
function SurplusCard({
  species,
  vessel,
  lotId,
  lbs,
  discountPct,
  tempC,
  daysLeft,
  score,
  onClick,
  style
}) {
  const [hover, setHover] = useState(false);
  const tempTone = tempC > 4 ? 'alert' : tempC > 3 ? 'warn' : 'ok';
  const urgTone = daysLeft <= 2 ? 'alert' : daysLeft <= 4 ? 'warn' : 'neutral';
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      background: 'var(--surface-panel)',
      border: `1px solid ${hover ? 'rgba(232,101,74,.45)' : 'var(--line)'}`,
      borderRadius: 'var(--radius-sm)',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'border-color var(--dur-base) var(--ease-out)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 16px 12px',
      borderBottom: '1px solid var(--line)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 17,
      color: 'var(--text-primary)',
      lineHeight: 1.2
    }
  }, species), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      color: 'var(--text-tertiary)',
      marginTop: 2
    }
  }, vessel)), score != null && /*#__PURE__*/React.createElement(__ds_scope.Chip, {
    tone: "accent"
  }, score, "/100")), lotId && /*#__PURE__*/React.createElement(__ds_scope.Readout, {
    style: {
      marginTop: 8,
      display: 'inline-block'
    }
  }, lotId)), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 16px 14px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 10,
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 24,
      color: 'var(--text-primary)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, Number(lbs).toLocaleString()), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      color: 'var(--text-tertiary)'
    }
  }, "lbs"), discountPct != null && /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 'auto',
      fontFamily: 'var(--font-mono)',
      fontSize: 14,
      color: 'var(--text-secondary)'
    }
  }, discountPct, "% ", /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: 'var(--text-tertiary)'
    }
  }, "disc"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap'
    }
  }, tempC != null && /*#__PURE__*/React.createElement(__ds_scope.Chip, {
    tone: tempTone,
    icon: "thermometer"
  }, Number(tempC).toFixed(1), "\xB0C"), daysLeft != null && /*#__PURE__*/React.createElement(__ds_scope.Chip, {
    tone: urgTone,
    icon: "clock"
  }, daysLeft, "d left"))));
}
Object.assign(__ds_scope, { SurplusCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/product/SurplusCard.jsx", error: String((e && e.message) || e) }); }

// ui_kits/hub/Audit.jsx
try { (() => {
const {
  Label,
  DeliveryPlanTable,
  ImpactNumber
} = window.TideLiftDesignSystem_47f3c8;
function Audit() {
  const d = window.hubData;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1180,
      margin: '0 auto',
      padding: '28px 24px'
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 28,
      margin: '0 0 6px',
      color: 'var(--text-primary)'
    }
  }, "Audit Trail"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 13.5,
      color: 'var(--text-secondary)',
      margin: '0 0 22px',
      maxWidth: 680,
      lineHeight: 1.6
    }
  }, "Every agent draft and every operator decision, logged either way. Radical auditability \u2014 the record is the product."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 28,
      marginBottom: 22
    }
  }, /*#__PURE__*/React.createElement(ImpactNumber, {
    value: "214",
    unit: "events logged",
    size: 30
  }), /*#__PURE__*/React.createElement(ImpactNumber, {
    value: "41",
    unit: "operator decisions",
    size: 30
  }), /*#__PURE__*/React.createElement(ImpactNumber, {
    value: "0",
    unit: "auto-executed",
    size: 30,
    accent: true
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement(Label, null, "Event log")), /*#__PURE__*/React.createElement(DeliveryPlanTable, {
    columns: [{
      label: 'Timestamp'
    }, {
      label: 'Actor'
    }, {
      label: 'Action'
    }, {
      label: 'Detail'
    }, {
      label: 'Status'
    }],
    rows: d.audit
  }));
}
window.HubAudit = Audit;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/hub/Audit.jsx", error: String((e && e.message) || e) }); }

// ui_kits/hub/Dashboard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  SurplusCard,
  AgentActivityFeed,
  ImpactNumber,
  Label,
  FlowStrip,
  ExceptionAlert
} = window.TideLiftDesignSystem_47f3c8;
function Dashboard({
  onOpenLot
}) {
  const d = window.hubData;
  const totalLbs = d.lots.reduce((s, l) => s + l.lbs, 0);
  const totalMeals = Math.round(totalLbs / 1.2);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--ink)',
      borderBottom: '1px solid var(--line)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1180,
      margin: '0 auto',
      padding: '28px 24px 30px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: 20,
      flexWrap: 'wrap',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Label, {
    color: "rgba(232,101,74,.8)"
  }, "TideLift \xB7 cold-chain ops"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      color: 'rgba(241,247,245,.25)'
    }
  }, "meals = lbs \xF7 1.2 \xB7 Feeding America basis")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 16,
      flexWrap: 'wrap',
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement(ImpactNumber, {
    value: totalLbs.toLocaleString(),
    unit: "lbs",
    size: 56
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 22,
      color: 'rgba(241,247,245,.25)'
    }
  }, "\u2192"), /*#__PURE__*/React.createElement(ImpactNumber, {
    value: totalMeals.toLocaleString(),
    unit: "meals to ACCFB",
    size: 56,
    accent: true
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      marginLeft: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: 99,
      background: '#7FA98C',
      animation: 'tlPulse 3s infinite'
    }
  }), /*#__PURE__*/React.createElement(Label, {
    color: "#7FA98C"
  }, "live"))), /*#__PURE__*/React.createElement(FlowStrip, {
    activeIndex: 1
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1180,
      margin: '0 auto',
      padding: '28px 24px',
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      gap: 24
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement(Label, null, "Available surplus")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 14
    }
  }, d.lots.map(l => /*#__PURE__*/React.createElement(SurplusCard, _extends({
    key: l.lotId
  }, l, {
    onClick: () => onOpenLot && onOpenLot(l)
  }))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(ExceptionAlert, {
    title: "1 lot expiring within 48 hours with no approved procurement",
    items: ['Halibut — 1,200 lbs — expires in 2d — thermal flag 4.6°C']
  }), /*#__PURE__*/React.createElement(AgentActivityFeed, {
    status: "Awaiting approval",
    entries: d.activity
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-panel)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--radius-sm)',
      padding: '16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement(Label, null, "Impact today")), /*#__PURE__*/React.createElement(ImpactNumber, {
    value: "1,417",
    unit: "meals \xB7 one catch, one click",
    size: 30,
    accent: true
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 12.5,
      color: 'var(--text-secondary)',
      marginTop: 10,
      borderTop: '1px solid var(--line)',
      paddingTop: 10
    }
  }, "$1,008 ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-tertiary)'
    }
  }, "saved vs market"))))));
}
window.HubDashboard = Dashboard;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/hub/Dashboard.jsx", error: String((e && e.message) || e) }); }

// ui_kits/hub/Intake.jsx
try { (() => {
const {
  Label,
  Chip,
  Readout,
  Button,
  ImpactNumber,
  DeliveryPlanTable,
  ApprovalActions,
  ExceptionAlert
} = window.TideLiftDesignSystem_47f3c8;
const {
  useState
} = React;
function Intake() {
  const d = window.hubData;
  const [phase, setPhase] = useState('idle'); // idle | running | ran | approved | rejected
  const run = () => {
    setPhase('running');
    setTimeout(() => setPhase('ran'), 900);
  };
  const mono = {
    fontFamily: 'var(--font-mono)'
  };
  const panel = {
    background: 'var(--surface-panel)',
    border: '1px solid var(--line)',
    borderRadius: 'var(--radius-sm)'
  };
  const statCell = {
    ...panel,
    padding: '12px 14px'
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1180,
      margin: '0 auto',
      padding: '28px 24px'
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 28,
      margin: '0 0 6px',
      color: 'var(--text-primary)'
    }
  }, "Vessel Intake \u2014 Dock to Processing"), /*#__PURE__*/React.createElement("p", {
    style: {
      ...mono,
      fontSize: 13.5,
      color: 'var(--text-secondary)',
      maxWidth: 720,
      margin: '0 0 18px',
      lineHeight: 1.6
    }
  }, "On-vessel computer vision drives the purchase decision before the truck rolls. Run the intake pipeline on a logged catch, then decide: the agent drafts, you approve. Every decision is written to the audit log."), /*#__PURE__*/React.createElement("div", {
    style: {
      ...panel,
      padding: '10px 14px',
      display: 'flex',
      gap: 18,
      flexWrap: 'wrap',
      alignItems: 'center',
      marginBottom: 22
    }
  }, /*#__PURE__*/React.createElement(Label, null, "What's real:"), /*#__PURE__*/React.createElement("span", {
    style: {
      ...mono,
      fontSize: 12,
      color: 'var(--text-secondary)',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 7,
      height: 7,
      borderRadius: 99,
      background: '#7FA98C'
    }
  }), "Scoring \xB7 procurement \xB7 routing \u2014 live agent logic"), /*#__PURE__*/React.createElement("span", {
    style: {
      ...mono,
      fontSize: 12,
      color: 'var(--text-secondary)',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 7,
      height: 7,
      borderRadius: 99,
      background: 'var(--warning)'
    }
  }), "CV counts & thermal readings \u2014 simulated (fish-scan model is roadmap)")), /*#__PURE__*/React.createElement("div", {
    style: {
      ...panel,
      padding: '20px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      flexWrap: 'wrap',
      gap: 12,
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 19,
      color: 'var(--text-primary)'
    }
  }, "F/V Morning Star"), /*#__PURE__*/React.createElement(Chip, {
    tone: "neutral"
  }, "wild-catch")), /*#__PURE__*/React.createElement("div", {
    style: {
      ...mono,
      fontSize: 12.5,
      color: 'var(--text-tertiary)',
      marginTop: 3
    }
  }, "Salmon \xB7 Half Moon Bay \xB7 pickup window 06:00\u201309:00")), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'right'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...mono,
      fontWeight: 600,
      fontSize: 15,
      color: 'var(--text-primary)'
    }
  }, "1,700 lbs"), /*#__PURE__*/React.createElement(Readout, {
    style: {
      marginTop: 4
    }
  }, "lot-0043"))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'rgba(241,247,245,.03)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--radius-sm)',
      padding: '10px 14px',
      marginBottom: 16,
      display: 'flex',
      gap: 10,
      alignItems: 'center',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(Label, null, "On-vessel computer vision"), /*#__PURE__*/React.createElement(Chip, {
    tone: "warn"
  }, "Simulated"), /*#__PURE__*/React.createElement("span", {
    style: {
      ...mono,
      fontSize: 12.5,
      color: 'var(--text-secondary)'
    }
  }, "212 detected \xB7 avg 8.0 lbs \xB7 grade M \xB7 confidence 91%")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 12,
      flexWrap: 'wrap',
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(Chip, {
    tone: "ok"
  }, "DISPATCH RECOMMENDED"), /*#__PURE__*/React.createElement("span", {
    style: {
      ...mono,
      fontSize: 12.5,
      color: 'var(--text-secondary)'
    }
  }, "High-confidence count above 500 lb threshold \xB7 cold transport: unit CT-2")), phase === 'idle' && /*#__PURE__*/React.createElement(Button, {
    onClick: run
  }, "Run intake pipeline"), phase === 'running' && /*#__PURE__*/React.createElement(Button, {
    disabled: true
  }, "Running\u2026"), phase !== 'idle' && phase !== 'running' && /*#__PURE__*/React.createElement("span", {
    style: {
      ...mono,
      fontSize: 12,
      color: '#7FA98C'
    }
  }, "\u2713 pipeline run")), (phase === 'ran' || phase === 'approved' || phase === 'rejected') && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4,1fr)',
      gap: 12,
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: statCell
  }, /*#__PURE__*/React.createElement(Label, null, "Opportunity score"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement(ImpactNumber, {
    value: "87",
    unit: "/100",
    size: 26
  }))), /*#__PURE__*/React.createElement("div", {
    style: statCell
  }, /*#__PURE__*/React.createElement(Label, null, "Counter-offer"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement(ImpactNumber, {
    value: "$2.10",
    unit: "/lb",
    size: 26
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      ...mono,
      fontSize: 11,
      color: '#7FA98C',
      marginTop: 4
    }
  }, "$1,008 saved vs market")), /*#__PURE__*/React.createElement("div", {
    style: statCell
  }, /*#__PURE__*/React.createElement(Label, null, "Facility match"), /*#__PURE__*/React.createElement("div", {
    style: {
      ...mono,
      fontWeight: 600,
      fontSize: 14,
      color: 'var(--text-primary)',
      marginTop: 10
    }
  }, "Oakland Canning Co")), /*#__PURE__*/React.createElement("div", {
    style: statCell
  }, /*#__PURE__*/React.createElement(Label, null, "Route \u2192 ACCFB"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement(ImpactNumber, {
    value: "1,700",
    unit: "lbs",
    size: 26
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement(Label, null, "Dockside sort \u2014 barcoded bins"), /*#__PURE__*/React.createElement(Chip, {
    tone: "warn"
  }, "Thermal QA simulated")), /*#__PURE__*/React.createElement(DeliveryPlanTable, {
    columns: [{
      label: 'Container'
    }, {
      label: 'Lbs',
      align: 'right'
    }, {
      label: 'Temp (°C)',
      align: 'right'
    }, {
      label: 'Grade'
    }, {
      label: 'QA'
    }, {
      label: 'Reason'
    }],
    rows: d.bins
  }), phase === 'ran' && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16
    }
  }, /*#__PURE__*/React.createElement(ExceptionAlert, {
    title: "BIN-A3 drifted to 4.6\xB0C \u2014 excluded from dispatch draft. Confirm before proceeding.",
    style: {
      marginBottom: 14
    }
  }), /*#__PURE__*/React.createElement(ApprovalActions, {
    reason: "Pending approval logged \xB7 Agent recommends. You decide.",
    onApprove: () => setPhase('approved'),
    onReject: () => setPhase('rejected')
  })), phase === 'approved' && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16
    }
  }, /*#__PURE__*/React.createElement(ApprovalActions, {
    state: "approved"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      ...mono,
      fontSize: 12,
      color: 'var(--text-secondary)',
      marginTop: 8
    }
  }, "Lot moved to PROCUREMENT_CONFIRMED \xB7 ACCFB shipment scheduled (59 cases). ", /*#__PURE__*/React.createElement("a", null, "View in audit trail \u2192"))), phase === 'rejected' && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16
    }
  }, /*#__PURE__*/React.createElement(ApprovalActions, {
    state: "rejected"
  }))));
}
window.HubIntake = Intake;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/hub/Intake.jsx", error: String((e && e.message) || e) }); }

// ui_kits/hub/Topbar.jsx
try { (() => {
const {
  Logo,
  Label
} = window.TideLiftDesignSystem_47f3c8;
function Topbar({
  active,
  onNav
}) {
  const items = ['Dashboard', 'Intake', 'Audit'];
  return /*#__PURE__*/React.createElement("header", {
    style: {
      background: 'var(--ink)',
      borderBottom: '1px solid var(--line)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1180,
      margin: '0 auto',
      padding: '0 24px',
      height: 56,
      display: 'flex',
      alignItems: 'center',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement(Logo, {
    variant: "compact",
    size: 24
  }), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: 'flex',
      gap: 2,
      marginLeft: 12
    }
  }, items.map(it => /*#__PURE__*/React.createElement("a", {
    key: it,
    onClick: () => onNav(it),
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 13,
      padding: '6px 12px',
      cursor: 'pointer',
      borderRadius: 'var(--radius-sm)',
      color: active === it ? 'var(--ink)' : 'rgba(241,247,245,.55)',
      background: active === it ? 'var(--salmon)' : 'transparent',
      fontWeight: active === it ? 600 : 400
    }
  }, it))), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 'auto',
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      color: 'rgba(241,247,245,.35)'
    }
  }, "Agent recommends. You decide.")));
}
window.HubTopbar = Topbar;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/hub/Topbar.jsx", error: String((e && e.message) || e) }); }

// ui_kits/hub/data.js
try { (() => {
// Shared mock data for the hub UI kit — values grounded in the repo's demo content
window.hubData = {
  lots: [{
    species: 'Salmon',
    vessel: 'F/V Morning Star',
    lotId: 'lot-0043',
    lbs: 1700,
    discountPct: 30,
    tempC: 3.2,
    daysLeft: 5,
    score: 87
  }, {
    species: 'Sardine',
    vessel: 'Monterey Harbor',
    lotId: 'lot-0044',
    lbs: 2400,
    discountPct: 30,
    tempC: 2.8,
    daysLeft: 3,
    score: 74
  }, {
    species: 'Halibut',
    vessel: 'F/V Pacific Dawn',
    lotId: 'lot-0045',
    lbs: 1200,
    discountPct: 25,
    tempC: 4.6,
    daysLeft: 2,
    score: 62
  }, {
    species: 'Rockfish',
    vessel: 'F/V Sea Verde',
    lotId: 'lot-0046',
    lbs: 860,
    discountPct: 20,
    tempC: 3.0,
    daysLeft: 6,
    score: 69
  }],
  activity: [{
    time: '09:14',
    action: 'Scored lot',
    detail: 'F/V Morning Star · Salmon',
    score: 87
  }, {
    time: '09:11',
    action: 'Drafted offer',
    detail: 'Monterey Harbor · Sardine @ 30%'
  }, {
    time: '08:52',
    action: 'Awaiting approval',
    detail: 'Lot 3 · Halibut · 1,200 lbs'
  }, {
    time: '08:31',
    action: 'Delivery planned',
    detail: 'Oakland Canning Co → ACCFB'
  }, {
    time: '08:10',
    action: 'Thermal flag',
    detail: '4.1°C detected on Lot 2'
  }],
  bins: [['BIN-A1', '540', '2.8', 'L', {
    chip: 'PASS',
    tone: 'ok'
  }, 'within range'], ['BIN-A2', '480', '3.4', 'M', {
    chip: 'PASS',
    tone: 'ok'
  }, 'within range'], ['BIN-A3', '420', '4.6', 'M', {
    chip: 'FLAG',
    tone: 'alert'
  }, 'drifted >4°C — hold at dock cooler'], ['BIN-A4', '260', '3.1', 'S', {
    chip: 'PASS',
    tone: 'ok'
  }, 'within range']],
  audit: [['2026-07-17 09:41', 'operator:demo', 'APPROVE', 'lot-0043 · dispatch → PROCUREMENT_CONFIRMED', {
    chip: 'LOGGED',
    tone: 'ok'
  }], ['2026-07-17 09:22', 'agent:procure', 'DRAFT', 'counter-offer $2.10/lb · salmon 1,700 lbs', {
    chip: 'PENDING',
    tone: 'warn'
  }], ['2026-07-17 08:52', 'agent:intake', 'FLAG', 'thermal 4.6°C · bin-07 · hold recommended', {
    chip: 'LOGGED',
    tone: 'ok'
  }], ['2026-07-16 17:03', 'operator:demo', 'REJECT', 'lot-0039 · sub-500 lb catch → HOLD path', {
    chip: 'LOGGED',
    tone: 'ok'
  }], ['2026-07-16 15:44', 'agent:route', 'DRAFT', 'ACCFB delivery · 1,417 meals · access window 06:00–09:00', {
    chip: 'APPROVED',
    tone: 'ok'
  }]]
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/hub/data.js", error: String((e && e.message) || e) }); }

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Chip = __ds_scope.Chip;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.ImpactNumber = __ds_scope.ImpactNumber;

__ds_ns.Label = __ds_scope.Label;

__ds_ns.Logo = __ds_scope.Logo;

__ds_ns.Readout = __ds_scope.Readout;

__ds_ns.AgentActivityFeed = __ds_scope.AgentActivityFeed;

__ds_ns.ApprovalActions = __ds_scope.ApprovalActions;

__ds_ns.DeliveryPlanTable = __ds_scope.DeliveryPlanTable;

__ds_ns.ExceptionAlert = __ds_scope.ExceptionAlert;

__ds_ns.FlowStrip = __ds_scope.FlowStrip;

__ds_ns.SurplusCard = __ds_scope.SurplusCard;

})();
