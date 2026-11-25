"use client";

import { useActionState } from "react";
import { ingresar } from "@/app/acciones";

export default function FormularioIngreso() {
  const [estado, accion, enviando] = useActionState(ingresar, null);
  return (
    <form action={accion} className="panel pila">
      <div>
        <label htmlFor="email">Mail</label>
        <input id="email" name="email" type="email" className="campo" required autoComplete="email" />
      </div>
      <button type="submit" className="boton" disabled={enviando}>
        {enviando ? "Enviando…" : "Mandame el enlace"}
      </button>
      {estado && (
        <p className={estado.ok ? "mensaje" : "mensaje error"} role="status">
          {estado.mensaje}
        </p>
      )}
    </form>
  );
}
