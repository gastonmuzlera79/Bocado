#!/usr/bin/env node
/**
 * Arma la versión estática de la web (sin servidor) para GitHub Pages.
 *
 * Copia web/ a una carpeta temporal, cambia las piezas que necesitan servidor por sus versiones de web/estatico,
 * saca el panel y el ingreso, genera las 888 fichas como páginas fijas y exporta con `next build`.
 * El resultado queda en _site/ en la raíz del repositorio.
 *
 * Uso: node tools/sitio_estatico.mjs [prefijo]   (prefijo por defecto: /Olleando)
 */
import { execSync } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const raiz = resolve(import.meta.dirname, "..");
const web = join(raiz, "web");
const prefijo = process.argv[2] ?? "/Olleando";
const tmp = mkdtempSync(join(tmpdir(), "olleando-estatico-"));

cpSync(web, tmp, {
  recursive: true,
  filter: (src) => !/[/\\](node_modules|\.next|out)([/\\]|$)/.test(src.slice(web.length)),
});
symlinkSync(join(web, "node_modules"), join(tmp, "node_modules"), "dir");

// Lo que necesita servidor o cuentas queda afuera.
for (const ruta of ["app/admin", "app/ingresar", "app/auth", "middleware.ts"]) rmSync(join(tmp, ruta), { recursive: true, force: true });

// Versiones sin servidor.
cpSync(join(web, "estatico/acciones.ts"), join(tmp, "app/acciones.ts"));
cpSync(join(web, "estatico/recetas.tsx"), join(tmp, "app/recetas/page.tsx"));

function cambiar(archivo, de, a) {
  const p = join(tmp, archivo);
  const s = readFileSync(p, "utf8");
  if (!s.includes(de)) throw new Error(`No encontré en ${archivo}: ${de}`);
  writeFileSync(p, s.replace(de, a));
}
cambiar("app/page.tsx", 'export const dynamic = "force-dynamic";', "");
cambiar(
  "app/recetas/[slug]/page.tsx",
  'export const dynamic = "force-dynamic";',
  'import { slugs } from "@/lib/datos/demo";\n\nexport const dynamicParams = false;\nexport function generateStaticParams() {\n  return slugs().map((slug) => ({ slug }));\n}',
);

writeFileSync(
  join(tmp, "next.config.ts"),
  `import type { NextConfig } from "next";\n\nconst config: NextConfig = {\n  output: "export",\n  basePath: ${JSON.stringify(prefijo)},\n  trailingSlash: true,\n  images: { unoptimized: true },\n  poweredByHeader: false,\n};\n\nexport default config;\n`,
);

const env = { ...process.env, NEXT_PUBLIC_BASE_PATH: prefijo, NEXT_PUBLIC_ESTATICO: "1", NEXT_TELEMETRY_DISABLED: "1" };
delete env.NEXT_PUBLIC_SUPABASE_URL;
delete env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
execSync("npx next build", { cwd: tmp, env, stdio: "inherit" });

const salida = join(raiz, "_site");
rmSync(salida, { recursive: true, force: true });
cpSync(join(tmp, "out"), salida, { recursive: true });
writeFileSync(join(salida, ".nojekyll"), "");
// Pages sirve la raíz del sitio en /<repo>/: el índice ya está ahí.
if (!existsSync(join(salida, "index.html"))) throw new Error("La exportación no generó index.html");
rmSync(tmp, { recursive: true, force: true });
console.log(`Sitio estático listo en ${salida} (prefijo ${prefijo}).`);
