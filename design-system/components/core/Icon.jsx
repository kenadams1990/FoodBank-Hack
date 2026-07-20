import React from 'react';
const P = {
  'arrow-right': <><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></>,
  'arrow-down': <><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></>,
  check: <path d="M20 6 9 17l-5-5"/>,
  close: <><path d="M18 6 6 18"/><path d="m6 6 12 12"/></>,
  plus: <><path d="M5 12h14"/><path d="M12 5v14"/></>,
  minus: <path d="M5 12h14"/>,
  search: <><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></>,
  user: <><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
  settings: <><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></>,
  bell: <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></>,
  menu: <><path d="M4 12h16"/><path d="M4 6h16"/><path d="M4 18h16"/></>,
  info: <><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></>,
  thermometer: <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/>,
  clock: <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
};
/** Lucide-style icon: 1.5px stroke, butt caps, 24×24 grid. */
export function Icon({ name, size = 20, color = 'currentColor', style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth="1.5" strokeLinecap="butt" strokeLinejoin="miter" style={style} aria-hidden="true">
      {P[name] || P.info}
    </svg>
  );
}
