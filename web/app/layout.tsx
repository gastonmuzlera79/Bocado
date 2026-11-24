import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import Link from "next/link";
import { salir } from "@/app/acciones";
import { modoDemo } from "@/lib/config";
import Isotipo from "@/componentes/Isotipo";
import { LEMA } from "@/lib/frases";
import { esEquipo, sesionActual } from "@/lib/sesion";
import "./globals.css";

const titulos = Fraunces({ subsets: ["latin"], weight: ["600", "700"], variable: "--fuente-titulos", display: "swap" });
const texto = Inter({ subsets: ["latin"], variable: "--fuente-texto", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Olleando", template: "%s · Olleando" },
  description: "Olleando, rascando la olla: recetas a partir de lo que tenés en tu cocina.",
  applicationName: "Olleando",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export default async function Plantilla({ children }: { children: React.ReactNode }) {
  const sesion = await sesionActual();
  return (
    <html lang="es-AR" className={`${titulos.variable} ${texto.variable}`}>
      <body>
        <header className="encabezado">
          <div className="contenedor">
            <Link href="/" className="marca" aria-label="Olleando, inicio">
              <Isotipo />
              Olleando
              <small className="lema">{LEMA}</small>
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
            Olleando · {LEMA}. Las recetas de recetarios se publican reescritas y con su fuente.
          </div>
        </footer>
      </body>
    </html>
  );
}
