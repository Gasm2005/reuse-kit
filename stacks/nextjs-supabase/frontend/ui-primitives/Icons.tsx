// Line icons at a consistent 24px grid, 1.5 stroke, inheriting currentColor.
// These replace the emoji that were being used as iconography — emoji render
// differently on every OS and undercut the rest of the type work.

type IconProps = { className?: string };

function Svg({ className, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {children}
    </svg>
  );
}

export function IconBuilding(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4 21V6a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v15" />
      <path d="M12 21V10a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v11" />
      <path d="M2 21h20M7 9h2M7 13h2M7 17h2M15 13h2M15 17h2" />
    </Svg>
  );
}

export function IconHouse(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.8V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.8" />
      <path d="M10 21v-6h4v6" />
    </Svg>
  );
}

export function IconPlot(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M3 6h4M11 6h2M17 6h4M3 18h4M11 18h2M17 18h4" />
      <path d="M3 6v4M3 14v4M21 6v4M21 14v4" />
      <path d="m9 14 3-4 3 4" />
    </Svg>
  );
}

export function IconKey(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="8" cy="15" r="4" />
      <path d="m10.8 12.2 8.2-8.2M17 6l2 2M14 9l2 2" />
    </Svg>
  );
}

export function IconSofa(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4 12V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" />
      <path d="M2 14a2 2 0 0 1 2-2 2 2 0 0 1 2 2v3h12v-3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v5H2Z" />
      <path d="M6 12h12" />
    </Svg>
  );
}

export function IconPhone(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M6.5 3h3l1.5 4-2 1.5a12 12 0 0 0 5.5 5.5L16 12l4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 3.5 5.2 2 2 0 0 1 5.5 3Z" />
    </Svg>
  );
}

export function IconWhatsApp(p: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={p.className}>
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.1-.2 0-.4.1-.5l.4-.5c.1-.2.2-.3.2-.5v-.4l-.7-1.7c-.2-.4-.4-.4-.5-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.6 4 5.3 5.3 0 0 0 3.2.7 2.6 2.6 0 0 0 1.7-1.2 2.1 2.1 0 0 0 .1-1.2c0-.1-.2-.2-.4-.3Z" />
    </svg>
  );
}

export function IconMail(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </Svg>
  );
}

export function IconPin(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 21s7-5.3 7-11a7 7 0 1 0-14 0c0 5.7 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </Svg>
  );
}

export function IconHandshake(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="m11 17-2.2 2.2a1.6 1.6 0 0 1-2.3-2.3l.6-.6" />
      <path d="M7.1 16.3 4.8 14a1.6 1.6 0 0 1 0-2.3l4.4-4.4a2 2 0 0 1 1.4-.6h2l3.4-1.2" />
      <path d="m13 8 3.6 3.6a1.6 1.6 0 0 1-2.3 2.3L13 12.6" />
      <path d="m19.2 14 .8-.8a1.6 1.6 0 0 0 0-2.3l-4-4" />
      <path d="m11 12.6 2.6 2.6M9 14.6l2 2" />
    </Svg>
  );
}

export function IconEye(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z" />
      <circle cx="12" cy="12" r="2.75" />
    </Svg>
  );
}

export function IconDoc(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" />
      <path d="M14 3v5h5M9 13h6M9 17h4" />
    </Svg>
  );
}

// ---- Property spec icons, used on the stat bar on the property page. ----

export function IconBed(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M3 19v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7" />
      <path d="M3 19h18M5 10V6a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v4" />
      <path d="M12 10V8a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v2" />
    </Svg>
  );
}

export function IconBath(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4 12h16v3a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5Z" />
      <path d="M4 12V7a2 2 0 0 1 3.6-1.2M8 12V6a2 2 0 0 1 2-2h.5" />
      <path d="M8 20v1.5M15 20v1.5" />
    </Svg>
  );
}

export function IconRuler(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M3 16.5 16.5 3l4.5 4.5L7.5 21Z" />
      <path d="m8.5 12.5 1.5 1.5M11.5 9.5 13 11M14.5 6.5 16 8" />
    </Svg>
  );
}

export function IconLayers(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="m12 3 9 5-9 5-9-5Z" />
      <path d="m3 13 9 5 9-5" />
    </Svg>
  );
}

export function IconCompass(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="m15 9-2 5-5 2 2-5Z" />
    </Svg>
  );
}
