import type { TipoPlato } from "@/lib/tipoPlato";

/**
 * Ilustración genérica por tipo de plato. Las recetas no usan fotos de los libros:
 * hasta que alguien suba una foto propia, se muestra este dibujo.
 * Todas comparten caja (160 x 120), un plato visto de costado y la paleta de la marca.
 */

const FONDO: Record<TipoPlato, string> = {
  pizza: "#fde3cf",
  hamburguesa: "#fde8d6",
  empanadas: "#f8e9d3",
  pastas: "#fdf1cf",
  sopas: "#fbe4d2",
  arroz: "#e0eeee",
  frios: "#e4ebfa",
  pollo: "#fdeccd",
  pescado: "#dcebf4",
  carne: "#f9e0d6",
  huevos: "#fff3c9",
  panqueques: "#fdefd2",
  pan: "#f5e8d5",
  tortas: "#f9e0e7",
  galletitas: "#f3e5d3",
  frutas: "#fde4df",
  papas: "#fcf0cc",
  snacks: "#ece7f6",
  verduras: "#e1f1da",
  general: "#e5eddd",
};

const plato = (
  <g>
    <ellipse cx="80" cy="99" rx="60" ry="11" fill="#000" opacity=".07" />
    <ellipse cx="80" cy="93" rx="60" ry="13" fill="#fff" stroke="#e3ddd1" strokeWidth="2" />
    <ellipse cx="80" cy="92" rx="40" ry="7.5" fill="none" stroke="#efe9de" strokeWidth="2" />
  </g>
);

const hoja = (x: number, y: number, r = 0, c = "#4f9a3c") => (
  <path d={`M${x} ${y} q6 -9 14 -6 q-4 9 -14 6z`} fill={c} transform={`rotate(${r} ${x} ${y})`} />
);

const DIBUJO: Record<TipoPlato, React.ReactNode> = {
  carne: (
    <g>
      {plato}
      <path d="M42 84c-4-14 10-26 32-26 22 0 44 4 44 18 0 13-20 15-38 14-18-1-34 4-38-6z" fill="#f1d3bd" />
      <path d="M46 82c-3-11 9-21 28-21 20 0 39 4 39 15 0 10-18 11-34 10-16-1-30 4-33-4z" fill="#9b4f30" />
      <g stroke="#6a3220" strokeWidth="4" strokeLinecap="round">
        <path d="M62 66l9 17M78 64l9 18M94 66l8 15" />
      </g>
      {hoja(108, 60, -20, "#3f8a37")}
      {hoja(114, 64, 30, "#57a345")}
    </g>
  ),
  pollo: (
    <g>
      {plato}
      <g transform="rotate(-24 76 72)">
        <ellipse cx="62" cy="76" rx="24" ry="17" fill="#d9822f" />
        <ellipse cx="57" cy="71" rx="12" ry="6" fill="#eda75b" />
        <rect x="80" y="72" width="26" height="9" rx="4.5" fill="#f3e6cc" stroke="#d9c4a0" strokeWidth="1.5" />
        <circle cx="107" cy="71" r="6.5" fill="#f3e6cc" stroke="#d9c4a0" strokeWidth="1.5" />
        <circle cx="107" cy="82" r="6.5" fill="#f3e6cc" stroke="#d9c4a0" strokeWidth="1.5" />
      </g>
      <g transform="rotate(14 96 80)">
        <ellipse cx="92" cy="84" rx="20" ry="13" fill="#c9732a" />
        <ellipse cx="88" cy="80" rx="9" ry="4.5" fill="#e59a4d" />
        <rect x="108" y="80" width="18" height="7" rx="3.5" fill="#f3e6cc" stroke="#d9c4a0" strokeWidth="1.5" />
        <circle cx="127" cy="79" r="5" fill="#f3e6cc" stroke="#d9c4a0" strokeWidth="1.5" />
        <circle cx="127" cy="88" r="5" fill="#f3e6cc" stroke="#d9c4a0" strokeWidth="1.5" />
      </g>
    </g>
  ),
  pescado: (
    <g>
      {plato}
      <path d="M104 78l22-15c3 10 3 21 0 30z" fill="#5d8eab" />
      <ellipse cx="76" cy="78" rx="34" ry="15" fill="#7eaac6" />
      <path d="M50 70c10 6 40 6 54 0" fill="none" stroke="#a9c9dd" strokeWidth="3" strokeLinecap="round" />
      <path d="M60 66c-4 7-4 17 0 24" fill="none" stroke="#5d8eab" strokeWidth="3" strokeLinecap="round" />
      <circle cx="50" cy="75" r="4" fill="#fff" />
      <circle cx="50" cy="75" r="2" fill="#23313a" />
      <path d="M36 94a14 14 0 0 1 22-10z" fill="#f5d33c" />
      <path d="M40 92a9 9 0 0 1 14-6" fill="none" stroke="#fbe98b" strokeWidth="2" />
    </g>
  ),
  huevos: (
    <g>
      <ellipse cx="74" cy="99" rx="54" ry="10" fill="#000" opacity=".07" />
      <rect x="118" y="83" width="38" height="8" rx="4" fill="#3a3f44" transform="rotate(-8 118 87)" />
      <ellipse cx="74" cy="90" rx="54" ry="15" fill="#3a3f44" />
      <ellipse cx="74" cy="88" rx="46" ry="11" fill="#555b61" />
      <path d="M44 88c-6-8 8-14 18-12 6-6 22-6 26 2 12-2 22 6 14 12-4 6-20 6-30 4-10 3-26 2-28-6z" fill="#fff" />
      <ellipse cx="72" cy="85" rx="10" ry="6.5" fill="#f7b021" />
      <ellipse cx="69" cy="83" rx="3.5" ry="2" fill="#fbd46a" />
    </g>
  ),
  papas: (
    <g>
      {plato}
      <g fill="#f4c04e" stroke="#e3a632" strokeWidth="1.5">
        <rect x="58" y="34" width="8" height="40" rx="2" transform="rotate(-10 62 54)" />
        <rect x="68" y="28" width="8" height="44" rx="2" transform="rotate(-3 72 50)" />
        <rect x="78" y="31" width="8" height="42" rx="2" transform="rotate(4 82 52)" />
        <rect x="88" y="36" width="8" height="38" rx="2" transform="rotate(12 92 55)" />
        <rect x="73" y="40" width="8" height="34" rx="2" transform="rotate(-18 77 57)" />
      </g>
      <path d="M52 56h56l-8 36H60z" fill="#d94a3a" />
      <path d="M54 64h52" stroke="#fff" strokeWidth="4" />
      <circle cx="80" cy="78" r="6" fill="#fff" opacity=".9" />
    </g>
  ),
  verduras: (
    <g>
      {plato}
      <g transform="rotate(-30 58 76)">
        <path d="M50 60c2 18 6 30 10 36 4-6 8-18 10-36z" fill="#f08a24" />
        <path d="M54 68h12M55 76h10M57 84h6" stroke="#d9711a" strokeWidth="2" strokeLinecap="round" />
        <path d="M60 60c-6-10-2-16 0-18 2 2 6 8 0 18zM60 60c-12-4-12-10-12-12 3 0 10 2 12 12zM60 60c12-4 12-10 12-12-3 0-10 2-12 12z" fill="#4f9a3c" />
      </g>
      <rect x="88" y="66" width="8" height="22" rx="3" fill="#7fb56a" />
      <g fill="#3f8a37">
        <circle cx="84" cy="62" r="10" />
        <circle cx="98" cy="60" r="11" />
        <circle cx="92" cy="52" r="10" />
        <circle cx="104" cy="68" r="8" />
      </g>
      <g fill="#5aa847">
        <circle cx="88" cy="56" r="4" />
        <circle cx="100" cy="58" r="4" />
      </g>
      <circle cx="116" cy="84" r="11" fill="#e04a3b" />
      <circle cx="112" cy="80" r="3" fill="#f08a7e" />
      <path d="M116 73l3 3 4-1-2 4 2 3-4 0-3 3-1-4-4-1 4-2z" fill="#3f8a37" />
    </g>
  ),
  pizza: (
    <g>
      {plato}
      <path d="M44 90L84 36l42 52c-26 10-56 10-82 2z" fill="#f6d264" />
      <path d="M44 90c26 8 56 8 82-2" stroke="#d9963f" strokeWidth="9" strokeLinecap="round" fill="none" />
      <path d="M44 90c26 8 56 8 82-2" stroke="#e8ad55" strokeWidth="4" strokeLinecap="round" fill="none" />
      <g fill="#c8432f">
        <circle cx="80" cy="56" r="6" />
        <circle cx="70" cy="74" r="6.5" />
        <circle cx="96" cy="74" r="6.5" />
      </g>
      {hoja(82, 70, -40, "#3f8a37")}
      {hoja(62, 84, 10, "#4f9a3c")}
    </g>
  ),
  empanadas: (
    <g>
      {plato}
      <path d="M78 86a30 26 0 0 1 56 0z" fill="#d99848" />
      <path d="M80 84a28 23 0 0 1 52 0" fill="none" stroke="#b97a33" strokeWidth="4" strokeDasharray="3 4" strokeLinecap="round" />
      <path d="M30 90a32 28 0 0 1 64 0z" fill="#e6ab58" />
      <path d="M33 88a30 25 0 0 1 58 0" fill="none" stroke="#c98a3e" strokeWidth="5" strokeDasharray="4 5" strokeLinecap="round" />
      <ellipse cx="56" cy="74" rx="12" ry="5" fill="#f1c27e" />
    </g>
  ),
  pastas: (
    <g>
      {plato}
      <ellipse cx="80" cy="82" rx="42" ry="14" fill="#f3cf6a" />
      <g fill="none" stroke="#e5b64a" strokeWidth="3" strokeLinecap="round">
        <path d="M46 82c10-12 24 8 34-4s22 8 32-2" />
        <path d="M50 88c12-8 22 6 32-2s20 6 28-2" />
        <path d="M54 76c10-6 18 4 28-2s16 4 24-2" />
      </g>
      <path d="M62 72c6-10 30-12 38 0 4 8-6 14-18 12-12 2-24-4-20-12z" fill="#d6452f" />
      <circle cx="74" cy="72" r="2.5" fill="#f08a7e" />
      {hoja(84, 66, -20, "#3f8a37")}
      {hoja(88, 70, 40, "#57a345")}
    </g>
  ),
  sopas: (
    <g>
      <ellipse cx="80" cy="100" rx="46" ry="8" fill="#000" opacity=".07" />
      <g fill="none" stroke="#d29a7a" strokeWidth="3" strokeLinecap="round" opacity=".8">
        <path d="M64 50c-6-6 6-10 0-18" />
        <path d="M80 46c-6-6 6-10 0-18" />
        <path d="M96 50c-6-6 6-10 0-18" />
      </g>
      <path d="M38 64h84c0 22-18 34-42 34S38 86 38 64z" fill="#d8693a" />
      <path d="M46 74c4 12 16 18 30 19" fill="none" stroke="#e8875a" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="80" cy="64" rx="42" ry="9" fill="#c55a2e" />
      <ellipse cx="80" cy="64" rx="37" ry="7" fill="#f2b544" />
      <ellipse cx="72" cy="63" rx="12" ry="2.5" fill="#f7cd6f" />
      <g fill="#3f8a37">
        <circle cx="62" cy="65" r="1.8" />
        <circle cx="90" cy="62" r="1.8" />
        <circle cx="98" cy="66" r="1.6" />
        <circle cx="78" cy="67" r="1.6" />
      </g>
      <path d="M100 63l26-26" stroke="#b9b2a5" strokeWidth="5" strokeLinecap="round" />
      <ellipse cx="98" cy="64" rx="8" ry="3.5" fill="#cfc8bb" />
    </g>
  ),
  arroz: (
    <g>
      {plato}
      <path d="M44 90c0-22 16-34 36-34s36 12 36 34c-20 6-52 6-72 0z" fill="#fbf8ef" stroke="#e6dcc5" strokeWidth="2" />
      <g fill="#e9dfc6">
        {[[60, 72, -30], [72, 64, 20], [88, 66, -10], [98, 76, 30], [70, 82, 10], [84, 78, -40], [56, 84, 40], [94, 86, -20], [78, 70, 60], [104, 84, 0]].map(([x, y, r]) => (
          <ellipse key={`${x}-${y}`} cx={x} cy={y} rx="3.2" ry="1.4" transform={`rotate(${r} ${x} ${y})`} />
        ))}
      </g>
      <g fill="#5aa847">
        <circle cx="66" cy="76" r="3" />
        <circle cx="90" cy="72" r="3" />
        <circle cx="80" cy="84" r="3" />
        <circle cx="100" cy="80" r="2.6" />
      </g>
      <g fill="#f08a24">
        <rect x="74" y="74" width="5" height="5" rx="1" />
        <rect x="58" y="80" width="5" height="5" rx="1" />
        <rect x="92" y="80" width="5" height="5" rx="1" />
        <rect x="84" y="64" width="4.5" height="4.5" rx="1" />
      </g>
    </g>
  ),
  frios: (
    <g transform="translate(80 104) scale(1.18) translate(-80 -102)">
      <ellipse cx="80" cy="102" rx="30" ry="5" fill="#000" opacity=".07" />
      <ellipse cx="80" cy="99" rx="22" ry="5" fill="#bfcbd8" />
      <rect x="77" y="78" width="6" height="21" rx="2" fill="#bfcbd8" />
      <path d="M58 66h44c-4 8-12 13-22 13s-18-5-22-13z" fill="#6b3a24" />
      <path d="M53 50h54c0 6-1 11-4 16H57c-3-5-4-10-4-16z" fill="#fbe9c8" />
      <path d="M55 60h50" stroke="#e05a6a" strokeWidth="4" />
      <g fill="#c8324a">
        <circle cx="62" cy="60" r="3" />
        <circle cx="76" cy="61" r="3" />
        <circle cx="90" cy="60" r="3" />
        <circle cx="100" cy="61" r="2.6" />
      </g>
      <path d="M50 46c0-8 10-12 15-7 2-9 22-9 24 0 5-5 15-1 14 7 2 4-2 6-6 6H56c-4 0-8-2-6-6z" fill="#fff" stroke="#e6dccb" strokeWidth="1.5" />
      <path d="M50 44h60c0 24-12 36-30 36S50 68 50 44z" fill="#ffffff" opacity=".18" stroke="#b9c6d4" strokeWidth="2.5" />
      <path d="M56 50c0 10 4 18 10 22" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".8" />
      <circle cx="80" cy="34" r="6" fill="#d8323f" />
      <circle cx="78" cy="32" r="1.8" fill="#f28a92" />
      <path d="M80 28c0-5 3-8 6-9" fill="none" stroke="#3f8a37" strokeWidth="2" strokeLinecap="round" />
      {hoja(84, 38, -30, "#57a345")}
    </g>
  ),
  hamburguesa: (
    <g>
      {plato}
      <rect x="46" y="80" width="68" height="12" rx="6" fill="#df9d4c" />
      <rect x="44" y="70" width="72" height="12" rx="6" fill="#6b3a24" />
      <path d="M44 70h72l-6 10-6-6-8 9-8-8-8 9-8-8-8 9-8-8-6 6z" fill="#f6c445" />
      <path d="M42 66c6-4 10 4 16 0s10 4 16 0 10 4 16 0 10 4 16 0 10 4 14 0v6H42z" fill="#5daa3f" />
      <rect x="48" y="60" width="64" height="6" rx="3" fill="#e04a3b" />
      <path d="M44 60c0-18 16-26 36-26s36 8 36 26z" fill="#e8a957" />
      <g fill="#fff6df">
        <ellipse cx="66" cy="44" rx="2.5" ry="1.5" />
        <ellipse cx="80" cy="40" rx="2.5" ry="1.5" />
        <ellipse cx="94" cy="45" rx="2.5" ry="1.5" />
        <ellipse cx="74" cy="51" rx="2.5" ry="1.5" />
        <ellipse cx="90" cy="52" rx="2.5" ry="1.5" />
      </g>
    </g>
  ),
  pan: (
    <g>
      {plato}
      <path d="M38 90c-2-24 18-36 42-36s44 12 42 36z" fill="#cf8f45" />
      <path d="M46 86c0-16 14-26 34-26" fill="none" stroke="#e2aa62" strokeWidth="4" strokeLinecap="round" />
      <g fill="none" stroke="#f3cd8c" strokeWidth="5" strokeLinecap="round">
        <path d="M60 66c4 6 4 12 2 18" />
        <path d="M80 62c4 7 4 14 2 22" />
        <path d="M100 66c4 6 4 12 2 18" />
      </g>
    </g>
  ),
  tortas: (
    <g>
      {plato}
      <path d="M46 56v30c0 6 15 10 34 10s34-4 34-10V56z" fill="#f2cf8e" />
      <path d="M46 72c0 5 15 9 34 9s34-4 34-9" fill="none" stroke="#fff7ef" strokeWidth="5" />
      <ellipse cx="80" cy="56" rx="34" ry="9" fill="#f4a9bb" />
      <path d="M46 56c0 4 3 10 5 10s3-6 5-6 2 9 5 9 3-7 6-7 3 6 6 6 3-5 6-5 3 8 6 8 3-7 6-7 3 6 6 6 3-8 5-8 2 5 4 5 4-6 4-11z" fill="#f4a9bb" />
      <circle cx="80" cy="47" r="6" fill="#d8323f" />
      <circle cx="78" cy="45" r="1.8" fill="#f28a92" />
      <path d="M80 41c0-5 3-8 6-9" fill="none" stroke="#3f8a37" strokeWidth="2" strokeLinecap="round" />
    </g>
  ),
  galletitas: (
    <g>
      {plato}
      <circle cx="96" cy="64" r="22" fill="#d9a35c" />
      <circle cx="96" cy="64" r="22" fill="none" stroke="#c58c45" strokeWidth="2" />
      <ellipse cx="60" cy="88" rx="20" ry="8" fill="#c58c45" />
      <ellipse cx="60" cy="86" rx="20" ry="8" fill="#dcaa62" />
      <ellipse cx="88" cy="92" rx="17" ry="6.5" fill="#c58c45" />
      <ellipse cx="88" cy="90" rx="17" ry="6.5" fill="#dcaa62" />
      <g fill="#5b3a29">
        <ellipse cx="88" cy="56" rx="3" ry="2.5" />
        <ellipse cx="102" cy="58" rx="3" ry="2.5" />
        <ellipse cx="94" cy="70" rx="3" ry="2.5" />
        <ellipse cx="106" cy="72" rx="2.5" ry="2" />
        <ellipse cx="84" cy="66" rx="2.5" ry="2" />
        <ellipse cx="54" cy="85" rx="2.5" ry="1.4" />
        <ellipse cx="64" cy="88" rx="2.5" ry="1.4" />
        <ellipse cx="68" cy="83" rx="2" ry="1.2" />
        <ellipse cx="84" cy="90" rx="2.5" ry="1.4" />
        <ellipse cx="94" cy="88" rx="2" ry="1.2" />
      </g>
    </g>
  ),
  panqueques: (
    <g>
      {plato}
      {[84, 76, 68, 60].map((y) => (
        <g key={y}>
          <rect x="46" y={y - 4} width="68" height="10" rx="5" fill="#d99a48" />
          <rect x="46" y={y - 5} width="68" height="7" rx="3.5" fill="#ecb764" />
        </g>
      ))}
      <ellipse cx="80" cy="55" rx="34" ry="6" fill="#ecb764" />
      <path d="M54 55c8 4 44 4 52 0 0 6-4 14-6 14s-2-8-4-8-2 12-5 12-3-10-5-10-2 6-4 6-2-8-4-8-4 4-6 4-2-6-4-6-3 4-5 4z" fill="#b9651f" opacity=".85" />
      <rect x="72" y="46" width="16" height="9" rx="2" fill="#fbe7a1" />
    </g>
  ),
  frutas: (
    <g>
      {plato}
      <path d="M40 84c10 8 40 10 58-6 4 4 2 10-4 14-14 8-40 8-54-8z" fill="#f2c94c" />
      <path d="M40 84c10 8 40 10 58-6" fill="none" stroke="#d9a92f" strokeWidth="2" />
      <path d="M98 78l4-4" stroke="#6b4a2a" strokeWidth="3" strokeLinecap="round" />
      <circle cx="74" cy="64" r="17" fill="#d8323f" />
      <circle cx="68" cy="58" r="4" fill="#f07c84" />
      <path d="M74 48c0-5 2-8 4-10" stroke="#6b4a2a" strokeWidth="3" strokeLinecap="round" fill="none" />
      {hoja(76, 44, -10, "#4f9a3c")}
      <path d="M104 92c-12 0-16-8-14-16 2-6 6-8 8-14 2-6 6-8 10-6 4 2 4 8 4 12 2 4 6 8 6 14 0 6-6 10-14 10z" fill="#9bc24a" />
      <path d="M108 56c0-4 1-6 3-8" stroke="#6b4a2a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </g>
  ),
  snacks: (
    <g>
      <ellipse cx="80" cy="100" rx="48" ry="9" fill="#000" opacity=".07" />
      <g fill="#f6e3b0" stroke="#e8c97a" strokeWidth="1.5">
        <circle cx="62" cy="58" r="9" />
        <circle cx="76" cy="52" r="10" />
        <circle cx="92" cy="54" r="9" />
        <circle cx="104" cy="60" r="8" />
        <circle cx="84" cy="62" r="8" />
        <circle cx="68" cy="66" r="8" />
      </g>
      <g fill="#e9a24d">
        <circle cx="96" cy="66" r="7" />
        <circle cx="58" cy="68" r="6" />
      </g>
      <path d="M42 66h76c0 18-16 32-38 32S42 84 42 66z" fill="#0d631b" />
      <ellipse cx="80" cy="66" rx="38" ry="5" fill="#147a26" />
      <path d="M50 74c6 12 18 18 30 18" fill="none" stroke="#2a8d3b" strokeWidth="3" strokeLinecap="round" />
    </g>
  ),
  general: (
    <g transform="translate(26 6) scale(0.9)">
      <g strokeLinecap="round" strokeLinejoin="round">
        <circle cx="44" cy="34" r="6" fill="#fc820c" />
        <circle cx="58" cy="24" r="4.2" fill="#fc820c" />
        <circle cx="47" cy="14" r="2.8" fill="#fc820c" />
        <path d="M101 9 L70 47" stroke="#fc820c" strokeWidth="8" fill="none" />
        <rect x="6" y="60" width="14" height="8" rx="4" fill="#0d631b" />
        <rect x="100" y="60" width="14" height="8" rx="4" fill="#0d631b" />
        <path d="M18 54 H102 V80 A24 24 0 0 1 78 104 H42 A24 24 0 0 1 18 80 Z" fill="#0d631b" />
        <rect x="12" y="45" width="96" height="11" rx="5.5" fill="#0d631b" />
        <path d="M30 70 V80 A12 12 0 0 0 42 92" stroke="#a3f69c" strokeWidth="5" fill="none" />
      </g>
    </g>
  ),
};

export default function Ilustracion({ tipo, className }: { tipo: TipoPlato; className?: string }) {
  return (
    <svg
      className={`ilustracion ${className ?? ""}`}
      viewBox="0 0 160 120"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      style={{ background: FONDO[tipo] }}
    >
      {DIBUJO[tipo]}
    </svg>
  );
}
