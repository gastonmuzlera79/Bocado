"use client";

import { useEffect, useState } from "react";
import { FRASES_CARGA } from "@/lib/frases";

function mezclar<T>(lista: T[]): T[] {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/**
 * Indicador de carga: una olla con burbujas y una frase de cocina que cambia cada pocos segundos.
 * Arranca con la primera frase de la lista (igual en servidor y navegador) y después mezcla el orden.
 */
export default function Cargando({ frases = FRASES_CARGA, compacto = false }: { frases?: string[]; compacto?: boolean }) {
  const [orden, setOrden] = useState(frases);
  const [i, setI] = useState(0);

  useEffect(() => {
    setOrden([frases[0], ...mezclar(frases.slice(1))]);
    const t = setInterval(() => setI((x) => x + 1), 2200);
    return () => clearInterval(t);
  }, [frases]);

  return (
    <div className={compacto ? "cargando compacto" : "cargando"} role="status" aria-live="polite">
      <svg className="olla" viewBox="0 0 64 56" aria-hidden="true">
        <circle className="burbuja b1" cx="24" cy="20" r="3" />
        <circle className="burbuja b2" cx="33" cy="18" r="2.5" />
        <circle className="burbuja b3" cx="41" cy="21" r="2" />
        <path className="cuerpo" d="M8 26h48v14a10 10 0 0 1-10 10H18A10 10 0 0 1 8 40z" />
        <path className="borde" d="M4 26h56M2 30h6M56 30h6" />
      </svg>
      <span className="frase">{orden[i % orden.length]}</span>
    </div>
  );
}
