// An 8-point nautical/north-star mark: four long spikes (N/E/S/W) and four
// short spikes (NE/SE/SW/NW), each a simple kite from the center — mirrors a
// classic compass-star pendant.
const STAR_PATH =
  "M16,16 L18.8,12 L16,2 L13.2,12 Z " +
  "M16,16 L19.18,15.5 L22.01,9.99 L16.5,12.82 Z " +
  "M16,16 L20,18.8 L30,16 L20,13.2 Z " +
  "M16,16 L16.5,19.18 L22.01,22.01 L19.18,16.5 Z " +
  "M16,16 L13.2,20 L16,30 L18.8,20 Z " +
  "M16,16 L12.82,16.5 L9.99,22.01 L15.5,19.18 Z " +
  "M16,16 L12,13.2 L2,16 L12,18.8 Z " +
  "M16,16 L15.5,12.82 L9.99,9.99 L12.82,15.5 Z";

export default function StarMark({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="#ffffff" aria-hidden="true">
      <path d={STAR_PATH} />
    </svg>
  );
}
