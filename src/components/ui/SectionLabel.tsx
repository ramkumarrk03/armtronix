/** Quiet section marker: reference designator + label, one line of mono. */
export function SectionLabel({ refDes, text }: { refDes: string; text: string }) {
  return (
    <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-ink-dim">
      <span className="text-copper">{refDes}</span>
      <span className="mx-2 opacity-50">/</span>
      {text}
    </p>
  );
}
