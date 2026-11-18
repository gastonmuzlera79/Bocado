import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  aprobarReceta,
  cambiarRol,
  cambiarSuspension,
  cerrarReporte,
  guardarConfiguracion,
  rechazarReceta,
} from "@/app/admin/acciones";
import { modoDemo } from "@/lib/config";
import { metricasDemo } from "@/lib/datos/demo";
import { esEquipo, sesionActual, type Permiso, type Sesion } from "@/lib/sesion";
import { supabaseServidor } from "@/lib/supabase/servidor";

export const metadata: Metadata = { title: "Panel" };
export const dynamic = "force-dynamic";

const SECCIONES: { id: string; nombre: string; permiso: Permiso }[] = [
  { id: "metricas", nombre: "Métricas", permiso: "ver_metricas" },
  { id: "moderacion", nombre: "Recetas por revisar", permiso: "moderar_recetas" },
  { id: "reportes", nombre: "Reportes", permiso: "moderar_comentarios" },
  { id: "usuarios", nombre: "Usuarios y roles", permiso: "administrar_usuarios" },
  { id: "configuracion", nombre: "Configuración", permiso: "configurar" },
  { id: "auditoria", nombre: "Auditoría", permiso: "ver_auditoria" },
];

const NOMBRES_CONFIG: Record<string, string> = {
  aprobadas_para_publicar_directo: "Recetas aprobadas para publicar sin revisión",
  limite_archivo_mb: "Tamaño máximo de archivo (MB)",
  membresia_precio_ars: "Precio de la membresía (ARS por mes)",
  membresia_cobro_activo: "Cobro de membresías activo",
  claude_tope_porcentaje_ingresos: "Tope de gasto en Claude (% de los ingresos del mes)",
  cotizacion_usd_ars: "Cotización USD → ARS para calcular el tope",
  agentes: "Agentes con Claude",
  limites_diarios: "Límites diarios por usuario",
};

const fecha = (s: string) =>
  new Date(s).toLocaleString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

type Params = Promise<{ seccion?: string }>;

export default async function Panel({ searchParams }: { searchParams: Params }) {
  if (modoDemo) return <PanelDemo />;
  const sesion = await sesionActual();
  if (!sesion) redirect("/ingresar");
  if (!esEquipo(sesion)) {
    return (
      <div className="pila">
        <h1>Panel</h1>
        <p className="apagado">Tu cuenta no tiene permisos de administración.</p>
      </div>
    );
  }
  const visibles = SECCIONES.filter((s) => sesion.permisos.has(s.permiso));
  const { seccion } = await searchParams;
  const actual = visibles.find((s) => s.id === seccion) ?? visibles[0];

  return (
    <div className="pila-grande">
      <header className="pila" style={{ gap: 12 }}>
        <h1>Panel</h1>
        <p className="apagado chico">
          {sesion.nombre} · rol {sesion.rol}
        </p>
        <nav className="secciones-admin" aria-label="Secciones del panel">
          {visibles.map((s) => (
            <Link key={s.id} href={`/admin?seccion=${s.id}`} aria-current={s.id === actual.id ? "page" : undefined}>
              {s.nombre}
            </Link>
          ))}
        </nav>
      </header>
      {actual.id === "metricas" && <Metricas />}
      {actual.id === "moderacion" && <Moderacion />}
      {actual.id === "reportes" && <Reportes />}
      {actual.id === "usuarios" && <Usuarios sesion={sesion} />}
      {actual.id === "configuracion" && <Configuracion />}
      {actual.id === "auditoria" && <Auditoria />}
    </div>
  );
}

function Kpis({ datos }: { datos: [string, string | number][] }) {
  return (
    <dl className="kpis">
      {datos.map(([t, v]) => (
        <div key={t} className="kpi">
          <dt>{t}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  );
}

async function Metricas() {
  const sb = await supabaseServidor();
  const hace7 = new Date(Date.now() - 7 * 864e5).toISOString();
  const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
  const contar = async (tabla: string, filtro: (q: any) => any = (q) => q) => {
    const { count } = await filtro(sb.from(tabla).select("*", { count: "exact", head: true }));
    return count ?? 0;
  };
  const [usuarios, nuevos, publicadas, enRevision, reportes, busquedas, sinResultado, socios, uso, ultimas] =
    await Promise.all([
      contar("perfiles"),
      contar("perfiles", (q) => q.gte("creado_en", hace7)),
      contar("recetas", (q) => q.eq("estado", "publicada")),
      contar("recetas", (q) => q.eq("estado", "en_revision")),
      contar("reportes", (q) => q.eq("estado", "abierto")),
      contar("eventos", (q) => q.eq("tipo", "busqueda").gte("creado_en", hace7)),
      contar("eventos", (q) => q.eq("tipo", "busqueda_sin_resultados").gte("creado_en", hace7)),
      contar("membresias", (q) => q.eq("estado", "activa")),
      sb.from("uso_claude").select("costo_usd").gte("fecha", inicioMes),
      sb
        .from("eventos")
        .select("datos,creado_en")
        .eq("tipo", "busqueda_sin_resultados")
        .order("creado_en", { ascending: false })
        .limit(15),
    ]);
  const gasto = (uso.data ?? []).reduce((s, f) => s + Number(f.costo_usd), 0);
  return (
    <section className="pila-grande">
      <Kpis
        datos={[
          ["Usuarios", usuarios],
          ["Nuevos en 7 días", nuevos],
          ["Socios activos", socios],
          ["Recetas publicadas", publicadas],
          ["Recetas por revisar", enRevision],
          ["Reportes abiertos", reportes],
          ["Búsquedas en 7 días", busquedas],
          ["Búsquedas sin resultado", sinResultado],
          ["Gasto en Claude este mes", `US$ ${gasto.toFixed(2)}`],
        ]}
      />
      <div className="pila">
        <h2>Últimas búsquedas sin resultado</h2>
        <p className="apagado chico">Sirven para saber qué recetas o ingredientes conviene sumar.</p>
        {(ultimas.data ?? []).length === 0 ? (
          <p className="apagado">Todavía no hay búsquedas sin resultado.</p>
        ) : (
          <div className="tabla-envoltura">
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Ingredientes</th>
                </tr>
              </thead>
              <tbody>
                {(ultimas.data ?? []).map((e, n) => (
                  <tr key={n}>
                    <td className="numeros">{fecha(e.creado_en)}</td>
                    <td>{((e.datos as { ingredientes?: string[] })?.ingredientes ?? []).join(", ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

async function Moderacion() {
  const sb = await supabaseServidor();
  const { data } = await sb
    .from("recetas")
    .select("id,slug,titulo,origen,creado_en,perfiles(nombre_usuario)")
    .eq("estado", "en_revision")
    .order("creado_en")
    .limit(50);
  const filas = (data ?? []) as unknown as {
    id: string;
    slug: string;
    titulo: string;
    origen: string;
    creado_en: string;
    perfiles: { nombre_usuario: string } | null;
  }[];
  if (!filas.length) return <p className="apagado">No hay recetas esperando revisión.</p>;
  return (
    <div className="tabla-envoltura">
      <table>
        <thead>
          <tr>
            <th>Receta</th>
            <th>Autor</th>
            <th>Origen</th>
            <th>Enviada</th>
            <th>Decisión</th>
          </tr>
        </thead>
        <tbody>
          {filas.map((r) => (
            <tr key={r.id}>
              <td>
                <Link href={`/recetas/${r.slug}`}>{r.titulo}</Link>
              </td>
              <td>{r.perfiles?.nombre_usuario ?? "—"}</td>
              <td>{r.origen}</td>
              <td className="numeros">{fecha(r.creado_en)}</td>
              <td>
                <div className="pila" style={{ gap: 8 }}>
                  <form action={aprobarReceta}>
                    <input type="hidden" name="id" value={r.id} />
                    <button className="boton chico">Aprobar</button>
                  </form>
                  <form action={rechazarReceta} className="fila" style={{ gap: 6 }}>
                    <input type="hidden" name="id" value={r.id} />
                    <input
                      name="motivo"
                      className="campo"
                      style={{ minHeight: 34, flex: "1 1 160px" }}
                      placeholder="Motivo del rechazo"
                      aria-label={`Motivo del rechazo de ${r.titulo}`}
                    />
                    <button className="boton chico peligro">Rechazar</button>
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

async function Reportes() {
  const sb = await supabaseServidor();
  const { data } = await sb
    .from("reportes")
    .select("id,motivo,creado_en,recetas(slug,titulo),comentario_id")
    .eq("estado", "abierto")
    .order("creado_en")
    .limit(50);
  const filas = (data ?? []) as unknown as {
    id: string;
    motivo: string;
    creado_en: string;
    recetas: { slug: string; titulo: string } | null;
    comentario_id: string | null;
  }[];
  if (!filas.length) return <p className="apagado">No hay reportes abiertos.</p>;
  return (
    <div className="tabla-envoltura">
      <table>
        <thead>
          <tr>
            <th>Sobre</th>
            <th>Motivo</th>
            <th>Fecha</th>
            <th>Cerrar</th>
          </tr>
        </thead>
        <tbody>
          {filas.map((r) => (
            <tr key={r.id}>
              <td>
                {r.recetas ? <Link href={`/recetas/${r.recetas.slug}`}>{r.recetas.titulo}</Link> : "Comentario"}
              </td>
              <td>{r.motivo}</td>
              <td className="numeros">{fecha(r.creado_en)}</td>
              <td>
                <form action={cerrarReporte} className="fila" style={{ gap: 6 }}>
                  <input type="hidden" name="id" value={r.id} />
                  <button className="boton chico" name="estado" value="resuelto">
                    Resuelto
                  </button>
                  <button className="boton chico secundario" name="estado" value="descartado">
                    Descartar
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

async function Usuarios({ sesion }: { sesion: Sesion }) {
  const sb = await supabaseServidor();
  const { data } = await sb
    .from("perfiles")
    .select("id,nombre_usuario,nombre_visible,rol,suspendido,recetas_aprobadas,creado_en")
    .order("creado_en", { ascending: false })
    .limit(100);
  return (
    <div className="pila">
      <p className="apagado chico">
        Moderador: revisa recetas, comentarios y el catálogo. Administrador: además maneja usuarios, permisos,
        configuración y métricas.
      </p>
      <div className="tabla-envoltura">
        <table>
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Alta</th>
              <th className="num">Aprobadas</th>
              <th>Rol</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((u) => {
              const yo = u.id === sesion.id;
              return (
                <tr key={u.id}>
                  <td>
                    {u.nombre_visible || u.nombre_usuario}
                    <div className="apagado chico">@{u.nombre_usuario}</div>
                  </td>
                  <td className="numeros">{fecha(u.creado_en)}</td>
                  <td className="num">{u.recetas_aprobadas}</td>
                  <td>
                    {yo ? (
                      u.rol
                    ) : (
                      <form action={cambiarRol} className="fila" style={{ gap: 6 }}>
                        <input type="hidden" name="id" value={u.id} />
                        <select name="rol" defaultValue={u.rol} className="campo" style={{ minHeight: 34, width: "auto" }} aria-label={`Rol de ${u.nombre_usuario}`}>
                          <option value="usuario">usuario</option>
                          <option value="moderador">moderador</option>
                          <option value="admin">admin</option>
                        </select>
                        <button className="boton chico secundario">Guardar</button>
                      </form>
                    )}
                  </td>
                  <td>
                    {u.suspendido ? <span className="estado alerta">suspendido</span> : <span className="estado">activo</span>}
                    {!yo && (
                      <form action={cambiarSuspension} style={{ marginTop: 6 }}>
                        <input type="hidden" name="id" value={u.id} />
                        <input type="hidden" name="suspender" value={u.suspendido ? "no" : "si"} />
                        <button className={u.suspendido ? "boton chico secundario" : "boton chico peligro"}>
                          {u.suspendido ? "Reactivar" : "Suspender"}
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CampoConfig({ nombre, etiqueta, valor }: { nombre: string; etiqueta: string; valor: unknown }) {
  if (typeof valor === "boolean") {
    return (
      <label className="fila" style={{ gap: 8, alignItems: "center", fontWeight: 400 }}>
        <input type="checkbox" name={nombre} defaultChecked={valor} />
        {etiqueta}
      </label>
    );
  }
  return (
    <div style={{ flex: "1 1 180px" }}>
      <label htmlFor={nombre}>{etiqueta}</label>
      <input id={nombre} name={nombre} className="campo" inputMode="decimal" defaultValue={valor == null ? "" : String(valor)} />
    </div>
  );
}

async function Configuracion() {
  const sb = await supabaseServidor();
  const { data } = await sb.from("configuracion").select("clave,valor,actualizado_en").order("clave");
  return (
    <div className="pila">
      {(data ?? []).map((c) => {
        const objeto = c.valor && typeof c.valor === "object" && !Array.isArray(c.valor);
        return (
          <form key={c.clave} action={guardarConfiguracion} className="panel pila">
            <input type="hidden" name="clave" value={c.clave} />
            <h2 style={{ fontSize: "1rem" }}>{NOMBRES_CONFIG[c.clave] ?? c.clave}</h2>
            <div className="fila">
              {objeto ? (
                Object.entries(c.valor as Record<string, unknown>).map(([k, v]) => (
                  <CampoConfig key={k} nombre={`${c.clave}.${k}`} etiqueta={k.replaceAll("_", " ")} valor={v} />
                ))
              ) : (
                <CampoConfig nombre={c.clave} etiqueta={typeof c.valor === "boolean" ? "Activado" : "Valor"} valor={c.valor} />
              )}
            </div>
            <div className="fila" style={{ justifyContent: "space-between", alignItems: "center" }}>
              <span className="apagado chico">Último cambio: {fecha(c.actualizado_en)}</span>
              <button className="boton chico">Guardar</button>
            </div>
          </form>
        );
      })}
    </div>
  );
}

async function Auditoria() {
  const sb = await supabaseServidor();
  const { data } = await sb
    .from("auditoria")
    .select("id,accion,tabla,registro_id,actor_id,creado_en")
    .order("creado_en", { ascending: false })
    .limit(50);
  if (!(data ?? []).length) return <p className="apagado">Todavía no hay cambios registrados.</p>;
  return (
    <div className="tabla-envoltura">
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Acción</th>
            <th>Tabla</th>
            <th>Registro</th>
            <th>Quién</th>
          </tr>
        </thead>
        <tbody>
          {(data ?? []).map((a) => (
            <tr key={a.id}>
              <td className="numeros">{fecha(a.creado_en)}</td>
              <td>{a.accion}</td>
              <td>{a.tabla}</td>
              <td>
                <code>{a.registro_id?.slice(0, 8)}</code>
              </td>
              <td>
                <code>{a.actor_id?.slice(0, 8) ?? "sistema"}</code>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PanelDemo() {
  const m = metricasDemo();
  return (
    <div className="pila-grande">
      <header className="pila" style={{ gap: 8 }}>
        <h1>Panel</h1>
        <p className="apagado" style={{ maxWidth: "65ch" }}>
          En la versión de prueba el panel muestra el estado del recetario base. Con la base conectada se suman
          métricas de uso, la cola de moderación, los reportes, la gestión de usuarios y roles, la configuración
          (precios, límites, agentes con Claude) y la auditoría.
        </p>
      </header>
      <Kpis
        datos={[
          ["Recetas", m.recetas],
          ["Con nutrición", m.conNutricion],
          ["Nutrición del libro", m.nutricionDelLibro],
          ["Ingredientes en catálogo", m.ingredientes],
        ]}
      />
      <div className="ficha" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
        {[
          ["Por categoría", m.porCategoria],
          ["Por fuente", m.porFuente],
        ].map(([t, filas]) => (
          <section key={t as string} className="pila">
            <h2>{t as string}</h2>
            <div className="tabla-envoltura">
              <table>
                <tbody>
                  {(filas as [string, number][]).map(([k, v]) => (
                    <tr key={k}>
                      <td>{k.replace("Adaptada de: ", "")}</td>
                      <td className="num">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
