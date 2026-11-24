/** Isotipo de Olleando: olla con cuchara de madera. Los colores salen de globals.css para respetar el modo oscuro. */
export default function Isotipo({ tam = 32 }: { tam?: number }) {
  return (
    <svg className="isotipo" viewBox="0 0 120 120" width={tam} height={tam} aria-hidden="true">
      <g strokeLinecap="round" strokeLinejoin="round">
        <circle className="iso-acento" cx="44" cy="34" r="6" />
        <circle className="iso-acento" cx="58" cy="24" r="4.2" />
        <circle className="iso-acento" cx="47" cy="14" r="2.8" />
        <path className="iso-cuchara" d="M101 9 L70 47" strokeWidth="8" fill="none" />
        <rect className="iso-olla" x="6" y="60" width="14" height="8" rx="4" />
        <rect className="iso-olla" x="100" y="60" width="14" height="8" rx="4" />
        <path className="iso-olla" d="M18 54 H102 V80 A24 24 0 0 1 78 104 H42 A24 24 0 0 1 18 80 Z" />
        <rect className="iso-olla" x="12" y="45" width="96" height="11" rx="5.5" />
        <path className="iso-brillo" d="M30 70 V80 A12 12 0 0 0 42 92" strokeWidth="5" fill="none" />
      </g>
    </svg>
  );
}
