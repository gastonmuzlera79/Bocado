/** Isotipo de Olleando: una olla de una sola línea con la cuchara adentro. Los colores salen de globals.css. */
export default function Isotipo({ tam = 30 }: { tam?: number }) {
  return (
    <svg className="isotipo" viewBox="0 0 64 64" width={tam} height={tam} aria-hidden="true">
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path className="iso-cuchara" d="M44 8 L33 27" strokeWidth="5" />
        <path className="iso-vapor" d="M22 19c-3-3 3-5 0-9" strokeWidth="3.5" />
        <path className="iso-linea" d="M6 28 H58 M11 28 V41 a13 13 0 0 0 13 13 H40 a13 13 0 0 0 13 -13 V28 M3 34 H9 M55 34 H61" strokeWidth="5" />
      </g>
    </svg>
  );
}
