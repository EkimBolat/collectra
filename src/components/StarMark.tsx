// An 8-point nautical/north-star mark: four long spikes (N/E/S/W) and four
// short spikes (NE/SE/SW/NW). Each spike is split into two triangular facets
// (a bright and a dim half) to give the faceted, diamond-cut look of a
// compass-star pendant.
const BRIGHT_FACETS =
  "M16,16 L18.2,12.5 L16,1 Z " +
  "M16,16 L18.62,15.5 L22.36,9.64 Z " +
  "M16,16 L19.5,18.2 L31,16 Z " +
  "M16,16 L16.5,18.62 L22.36,22.36 Z " +
  "M16,16 L13.8,19.5 L16,31 Z " +
  "M16,16 L13.38,16.5 L9.64,22.36 Z " +
  "M16,16 L12.5,13.8 L1,16 Z " +
  "M16,16 L15.5,13.38 L9.64,9.64 Z";

const DIM_FACETS =
  "M16,16 L16,1 L13.8,12.5 Z " +
  "M16,16 L22.36,9.64 L16.5,13.38 Z " +
  "M16,16 L31,16 L19.5,13.8 Z " +
  "M16,16 L22.36,22.36 L18.62,16.5 Z " +
  "M16,16 L16,31 L18.2,19.5 Z " +
  "M16,16 L9.64,22.36 L15.5,18.62 Z " +
  "M16,16 L1,16 L12.5,18.2 Z " +
  "M16,16 L9.64,9.64 L13.38,15.5 Z";

export default function StarMark({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path d={BRIGHT_FACETS} fill="#ffffff" />
      <path d={DIM_FACETS} fill="#d7d0f2" />
    </svg>
  );
}
