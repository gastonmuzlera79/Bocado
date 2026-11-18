import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { salir } from "@/app/acciones";
import { modoDemo } from "@/lib/config";
import { esEquipo, sesionActual } from "@/lib/sesion";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Bocado", template: "%s · Bocado" },
  description: "Recetas a partir de lo que tenés en tu cocina.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export default async function Plantilla({ children }: { children: React.ReactNode }) {
  const sesion = await sesionActual();
  return (
    <html lang="es-AR">
      <body>
        <header className="encabezado">
          <div className="contenedor">
            <Link href="/" className="marca">
              Bo<span>cado</span>
            </Link>
            <nav className="nav" aria-label="Principal">
              <Link href="/">¿Qué cocino?</Link>
              <Link href="/recetas">Recetas</Link>
              {(modoDemo || esEquipo(sesion)) && <Link href="/admin">Panel</Link>}
              {sesion ? (
                <form action={salir}>
                  <button type="submit">Salir ({sesion.nombre})</button>
                </form>
              ) : (
                !modoDemo && <Link href="/ingresar">Ingresar</Link>
              )}
            </nav>
          </div>
        </header>
        {modoDemo && (
          <div className="aviso-demo">
            <p className="contenedor">
              Versión de prueba: muestra el recetario base y guarda tu despensa solo en este navegador. Las cuentas,
              comentarios y el panel real se activan al conectar la base.
            </p>
          </div>
        )}
        <main className="contenedor">{children}</main>
        <footer className="pie">
          <div className="contenedor">
            Bocado · Las recetas de recetarios se publican reescritas y con su fuente.
          </div>
        </footer>
      </body>
    </html>
  );
}
