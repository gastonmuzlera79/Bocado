import type { Metadata } from "next";
import FormularioIngreso from "@/componentes/FormularioIngreso";
import { modoDemo } from "@/lib/config";

export const metadata: Metadata = { title: "Ingresar" };

type Params = Promise<{ error?: string }>;

export default async function Ingresar({ searchParams }: { searchParams: Params }) {
  const { error } = await searchParams;
  return (
    <div className="pila" style={{ maxWidth: 460 }}>
      <h1>Ingresar</h1>
      <p className="apagado">
        Escribí tu mail y te mandamos un enlace para entrar. No hace falta contraseña. Si es la primera vez, la cuenta
        se crea sola.
      </p>
      {error === "enlace" && (
        <p className="mensaje error" role="alert">
          El enlace venció o ya se usó. Pedí uno nuevo.
        </p>
      )}
      {modoDemo ? (
        <p className="mensaje">La versión de prueba no tiene cuentas. El ingreso se activa al conectar la base.</p>
      ) : (
        <FormularioIngreso />
      )}
    </div>
  );
}
