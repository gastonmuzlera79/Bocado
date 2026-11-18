-- Verificaciones sobre los datos iniciales ya cargados (catálogo y recetario).
\set ON_ERROR_STOP on
\pset tuples_only on

do $$
declare
  n_rec int; n_sin_ing int; n_nutri int;
begin
  select count(*) into n_rec from public.recetas where estado = 'publicada' and origen = 'recetario';
  if n_rec = 0 then raise exception 'VERIFICACIÓN: no se cargó el recetario'; end if;

  select count(*) into n_sin_ing from public.recetas r
  where not exists (select 1 from public.receta_ingredientes ri where ri.receta_id = r.id and ri.ingrediente_id is not null);
  if n_sin_ing > 0 then raise exception 'VERIFICACIÓN: % recetas sin ningún ingrediente del catálogo', n_sin_ing; end if;

  if exists (select 1 from public.recetas where origen = 'recetario' and coalesce(fuente_visible, '') not like 'Adaptada de:%') then
    raise exception 'VERIFICACIÓN: hay recetas de recetario sin "Adaptada de"'; end if;

  -- Con huevo, leche y banana tienen que aparecer recetas para cocinar.
  if not exists (
    select 1 from public.que_cocino(array[
      public.buscar_ingrediente('huevo'), public.buscar_ingrediente('leche'), public.buscar_ingrediente('banana')])) then
    raise exception 'VERIFICACIÓN: "¿Qué cocino?" no devuelve nada con huevo, leche y banana'; end if;

  select count(*) into n_nutri from public.recetas where kcal_porcion is not null;
  raise notice 'Recetas publicadas: %, con nutrición estimada: %', n_rec, n_nutri;
end $$;

select 'OK: datos iniciales verificados';
