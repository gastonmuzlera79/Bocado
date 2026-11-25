import Link from "next/link";

export default function RecetaNoEncontrada() {
  return (
    <div className="pila">
      <h1>No encontramos esa receta</h1>
      <p className="apagado">Puede que la hayan quitado o que el enlace esté mal escrito.</p>
      <p>
        <Link href="/recetas">Ver todas las recetas</Link>
      </p>
    </div>
  );
}
