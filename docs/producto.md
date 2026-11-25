# Producto

## Qué es

Bocado responde "¿qué cocino hoy?" a partir de los ingredientes que la persona ya tiene. Después arma una semana de comidas y la lista de lo que falta comprar.

Supuesto de partida: el nombre y el rubro (cocina) son una decisión mía, no un pedido explícito. Si la idea es otra, hay que rehacer este documento.

## Para quién

Personas que cocinan en casa entre semana, con poco tiempo y sin ganas de tirar comida. Foco inicial: Argentina.

## Alcance de la versión 0.1 (lo que hoy está en el repo)

- Núcleo en JavaScript sin dependencias (`src/core`): normalización de nombres, sugerencias, plan, lista de compras.
- 12 recetas de ejemplo en `src/data/recipes.json`.
- Web mínima (`web/`) que usa ese núcleo en el navegador.
- 8 tests (`npm test`).

## Cómo funciona

- **Normalización:** "Tomates" y "tomate" son lo mismo; se ignoran tildes y plurales simples.
- **Básicos:** sal, pimienta, aceite, agua y azúcar se dan por disponibles y no entran en la cuenta ni en la lista de compras.
- **Sugerencias:** se ordenan por la proporción de ingredientes que ya se tienen. Se muestran las que faltan hasta 3 ingredientes.
- **Plan:** elige de a una receta, prefiriendo las que reutilizan ingredientes ya elegidos. No repite recetas.
- **Lista de compras:** suma cantidades del mismo ingrediente con la misma unidad y resta la despensa.

## Límites conocidos

- No convierte unidades: 1 kg y 500 g de papa quedan como renglones separados.
- El plural se resuelve con reglas simples; palabras irregulares pueden no coincidir.
- No hay sinónimos ("morrón" y "pimiento" son distintos).
- Una receta "vegana" depende de que esté bien etiquetada; no se deduce de los ingredientes.
- Las recetas son de ejemplo y no tienen información nutricional.
- Sin cuentas, sin persistencia: al recargar se pierde la despensa.

## Próximos pasos

1. Guardar la despensa en el navegador (`localStorage`).
2. Tabla de sinónimos de ingredientes argentinos.
3. Conversión de unidades básica (g/kg, ml/l).
4. Ampliar a 100+ recetas con revisión de etiquetas.
5. Empaquetar como PWA para usarla desde el celular.
6. Probar con 5–10 personas antes de agregar cuentas o pagos.

## Cómo se valida

Antes de construir más: darle la web a 5–10 personas que cocinan en casa y ver si (a) las sugerencias les parecen cocinables, (b) usan la lista de compras, (c) vuelven una segunda semana.
