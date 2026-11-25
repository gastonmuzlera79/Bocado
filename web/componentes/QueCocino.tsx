"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { buscarConDespensa, guardarDespensa } from "@/app/acciones";
import Ilustracion from "@/componentes/Ilustracion";
import { tipoPlato } from "@/lib/tipoPlato";
import Cargando from "@/componentes/Cargando";
import { FRASES_BUSQUEDA } from "@/lib/frases";
import { minutosTexto, normalizar, slugCategoria } from "@/lib/texto";
import type { Coincidencia, Ingrediente } from "@/lib/tipos";

const CLAVE_LOCAL = "olleando.despensa";
const RAPIDOS = ["huevo", "papa", "cebolla", "tomate", "pollo", "queso rallado", "arroz", "zanahoria", "harina", "leche"];

type Props = {
  ingredientes: Ingrediente[];
  categorias: string[];
  inicial: string[];
  demo: boolean;
  conCuenta: boolean;
};

export default function QueCocino({ ingredientes, categorias, inicial, demo, conCuenta }: Props) {
  const [elegidos, setElegidos] = useState<string[]>(inicial);
  const [texto, setTexto] = useState("");
  const [activo, setActivo] = useState(0);
  const [maxMinutos, setMaxMinutos] = useState("");
  const [categoria, setCategoria] = useState("");
  const [resultados, setResultados] = useState<Coincidencia[] | null>(null);
  const [mensaje, setMensaje] = useState<{ texto: string; error?: boolean } | null>(null);
  const [buscando, empezarBusqueda] = useTransition();
  const [guardando, empezarGuardado] = useTransition();
  const entrada = useRef<HTMLInputElement>(null);

  // En la demo, la despensa vive en el navegador.
  useEffect(() => {
    if (!demo || inicial.length) return;
    try {
      const guardada = JSON.parse(localStorage.getItem(CLAVE_LOCAL) ?? "[]");
      if (Array.isArray(guardada) && guardada.length) setElegidos(guardada.filter((x) => typeof x === "string"));
    } catch {
      /* sin almacenamiento disponible: se empieza vacío */
    }
  }, [demo, inicial.length]);

  const indice = useMemo(
    () =>
      ingredientes.map((i) => ({
        nombre: i.nombre,
        claves: [normalizar(i.nombre), ...i.sinonimos.map(normalizar)],
        basico: i.basico,
      })),
    [ingredientes],
  );

  const sugerencias = useMemo(() => {
    const q = normalizar(texto);
    if (!q) return [];
    const ya = new Set(elegidos);
    // Primero lo que coincide exacto con el nombre, después el nombre que empieza igual,
    // después un sinónimo que empieza igual y al final lo que solo lo contiene.
    // Así "harina" sugiere harina antes que "fécula de mandioca" (sinónimo: harina de mandioca).
    const puntaje = (i: (typeof indice)[number]) => {
      const nombre = normalizar(i.nombre);
      if (nombre === q) return 0;
      if (i.claves.includes(q)) return 1;
      if (nombre.startsWith(q)) return 2;
      if (i.claves.some((c) => c.startsWith(q))) return 3;
      return 4;
    };
    return indice
      .filter((i) => !ya.has(i.nombre) && i.claves.some((c) => c.includes(q)))
      .sort((a, b) => puntaje(a) - puntaje(b) || a.nombre.length - b.nombre.length || a.nombre.localeCompare(b.nombre, "es"))
      .slice(0, 8);
  }, [texto, indice, elegidos]);

  function agregar(nombre: string) {
    setElegidos((e) => (e.includes(nombre) ? e : [...e, nombre]));
    setTexto("");
    setActivo(0);
    entrada.current?.focus();
  }

  function quitar(nombre: string) {
    setElegidos((e) => e.filter((x) => x !== nombre));
  }

  function alTeclear(ev: React.KeyboardEvent<HTMLInputElement>) {
    if (ev.key === "ArrowDown") {
      ev.preventDefault();
      setActivo((a) => Math.min(a + 1, sugerencias.length - 1));
    } else if (ev.key === "ArrowUp") {
      ev.preventDefault();
      setActivo((a) => Math.max(a - 1, 0));
    } else if (ev.key === "Enter") {
      ev.preventDefault();
      if (sugerencias[activo]) agregar(sugerencias[activo].nombre);
      else if (!texto && elegidos.length) buscar();
    } else if (ev.key === "Backspace" && !texto && elegidos.length) {
      quitar(elegidos[elegidos.length - 1]);
    } else if (ev.key === "Escape") {
      setTexto("");
    }
  }

  function buscar() {
    setMensaje(null);
    empezarBusqueda(async () => {
      try {
        const r = await buscarConDespensa(elegidos, {
          maxMinutos: maxMinutos ? Number(maxMinutos) : null,
          categoria: categoria || null,
        });
        setResultados(r);
      } catch {
        setMensaje({ texto: "No pudimos buscar recetas. Revisá la conexión y probá de nuevo.", error: true });
      }
    });
  }

  function guardar() {
    if (demo) {
      try {
        localStorage.setItem(CLAVE_LOCAL, JSON.stringify(elegidos));
        setMensaje({ texto: "Despensa guardada en este navegador." });
      } catch {
        setMensaje({ texto: "Este navegador no deja guardar datos. La despensa se pierde al cerrar la página.", error: true });
      }
      return;
    }
    empezarGuardado(async () => {
      const r = await guardarDespensa(elegidos);
      setMensaje({ texto: r.mensaje, error: !r.ok });
    });
  }

  const sinElegidos = elegidos.length === 0;

  return (
    <div className="pila-grande">
      <section className="panel pila" aria-labelledby="titulo-despensa">
        <h2 id="titulo-despensa">Lo que tenés</h2>
        {elegidos.length > 0 && (
          <ul className="chips" aria-label="Ingredientes elegidos" style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {elegidos.map((n) => (
              <li key={n} className="chip">
                {n}
                <button type="button" onClick={() => quitar(n)} aria-label={`Quitar ${n}`}>
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="buscador">
          <label htmlFor="ingrediente">Agregá un ingrediente</label>
          <input
            id="ingrediente"
            ref={entrada}
            className="campo"
            value={texto}
            onChange={(e) => {
              setTexto(e.target.value);
              setActivo(0);
            }}
            onKeyDown={alTeclear}
            placeholder="Ej.: zapallo, carne picada, ricota"
            autoComplete="off"
            role="combobox"
            aria-expanded={sugerencias.length > 0}
            aria-controls="lista-sugerencias"
            aria-activedescendant={sugerencias.length ? `sug-${activo}` : undefined}
          />
          {sugerencias.length > 0 && (
            <ul id="lista-sugerencias" className="sugerencias" role="listbox">
              {sugerencias.map((s, i) => (
                <li
                  key={s.nombre}
                  id={`sug-${i}`}
                  role="option"
                  aria-selected={i === activo}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    agregar(s.nombre);
                  }}
                >
                  <span>{s.nombre}</span>
                  {s.basico && <span className="apagado chico">básico</span>}
                </li>
              ))}
            </ul>
          )}
          {texto && sugerencias.length === 0 && (
            <p className="apagado chico" style={{ marginTop: 6 }}>
              No está en el catálogo. Probá con otro nombre (por ejemplo, &quot;zucchini&quot; o &quot;zapallito&quot;).
            </p>
          )}
        </div>
        {sinElegidos && (
          <div className="pila" style={{ gap: 8 }}>
            <p className="apagado chico">Para empezar rápido:</p>
            <div className="chips">
              {RAPIDOS.map((n) => (
                <button key={n} type="button" className="chip sugerido" onClick={() => agregar(n)}>
                  + {n}
                </button>
              ))}
            </div>
          </div>
        )}
        <p className="apagado chico">
          Sal, aceite, agua y especias se dan por hechos: no hace falta agregarlos.
        </p>
        <div className="fila">
          <div style={{ flex: "1 1 160px" }}>
            <label htmlFor="tiempo">Tiempo de cocción</label>
            <select id="tiempo" className="campo" value={maxMinutos} onChange={(e) => setMaxMinutos(e.target.value)}>
              <option value="">Cualquiera</option>
              <option value="10">Hasta 10 min</option>
              <option value="20">Hasta 20 min</option>
              <option value="30">Hasta 30 min</option>
              <option value="45">Hasta 45 min</option>
            </select>
          </div>
        </div>
        <fieldset className="selector-categorias">
          <legend>Tipo de receta</legend>
          <div className="categorias" role="radiogroup" aria-label="Tipo de receta">
            {[{ valor: "", nombre: "Todas", foto: "/platos/general.webp" }, ...categorias.map((c) => ({ valor: c, nombre: c, foto: `/categorias/${slugCategoria(c)}.webp` }))].map((o) => (
              <button
                key={o.nombre}
                type="button"
                role="radio"
                aria-checked={categoria === o.valor}
                onClick={() => setCategoria(o.valor)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={o.foto} alt="" width={720} height={480} loading="lazy" />
                <span>{o.nombre}</span>
              </button>
            ))}
          </div>
        </fieldset>
        <div className="fila">
          <button type="button" className="boton" onClick={buscar} disabled={sinElegidos || buscando}>
            {buscando ? "Buscando…" : "Ver qué puedo cocinar"}
          </button>
          <button type="button" className="boton secundario" onClick={guardar} disabled={sinElegidos || guardando}>
            {guardando ? "Guardando…" : "Guardar como mi despensa"}
          </button>
          {!demo && !conCuenta && (
            <span className="apagado chico">
              <Link href="/ingresar">Ingresá</Link> para guardarla en tu cuenta.
            </span>
          )}
        </div>
        {mensaje && (
          <p className={mensaje.error ? "mensaje error" : "mensaje"} role="status">
            {mensaje.texto}
          </p>
        )}
      </section>

      {buscando && <Cargando frases={FRASES_BUSQUEDA} />}

      {resultados && !buscando && (
        <section className="pila" aria-labelledby="titulo-resultados" aria-live="polite">
          <h2 id="titulo-resultados">
            {resultados.length
              ? `${resultados.length} recetas con lo que tenés`
              : "No encontramos recetas con esos ingredientes"}
          </h2>
          {resultados.length === 0 && (
            <p className="apagado">Sumá algún ingrediente más o sacá los filtros de tiempo y tipo.</p>
          )}
          <div className="grilla">
            {resultados.map((r) => (
              <Link key={r.slug} href={`/recetas/${r.slug}`} className="tarjeta">
                <Ilustracion tipo={tipoPlato(r)} className="tarjeta-img" />
                {r.categoria && <span className="etiqueta">{r.categoria}</span>}
                <h2>{r.titulo}</h2>
                <div className="barra" aria-hidden="true">
                  <span style={{ width: `${r.coincidencia}%` }} />
                </div>
                {r.faltantes.length === 0 ? (
                  <p className="completa">Tenés todo lo necesario</p>
                ) : (
                  <p className="faltan">
                    Te falta: {r.faltantes.slice(0, 3).join(", ")}
                    {r.faltantes.length > 3 ? ` y ${r.faltantes.length - 3} más` : ""}
                  </p>
                )}
                <p className="meta">
                  <span className="numeros">
                    Tenés {r.tengo} de {r.necesito}
                  </span>
                  {minutosTexto(r.minutos) && <span>{minutosTexto(r.minutos)}</span>}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
